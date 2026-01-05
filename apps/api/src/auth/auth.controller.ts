import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService, LoginResponse } from './auth.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';
import { logSecurityEvent } from '../common/utils/security-logger.util';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    description: 'User credentials',
    type: LoginDto,
  })
  @ApiOkResponse({
    description: 'Login successful. Returns user. Tokens are set as HttpOnly cookies.',
    schema: {
      example: {
        user: {
          id: 'b1f2c3d4-5678-1234-9abc-def012345678',
          name: 'Rafael Silva',
          email: 'user@email.com',
          role: 'admin',
          isActive: true,
          personId: null,
          createdAt: '2024-06-01T12:34:56.789Z',
          updatedAt: '2024-06-01T12:34:56.789Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiTooManyRequestsResponse({
    description: 'Too many login attempts. Please try again later.',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req?.ip || (req?.headers['x-forwarded-for'] as string) || '-';
    const endpoint = (req as any)?.route?.path || req?.url || '/auth/login';

    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      logSecurityEvent('login_failed', {
        email: loginDto.email,
        ip,
        status: 'fail',
        reason: 'invalid_credentials',
        endpoint,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    logSecurityEvent('login_success', {
      userId: user.id,
      email: user.email,
      ip,
      status: 'success',
      endpoint,
    });

    const result = await this.authService.login(user);
    this.setAuthCookies(res, result);

    const shouldReturnToken = req.headers['x-request-token-body'] === 'true';

    return {
      user: result.user,
      ...(shouldReturnToken && { token: result.token, refreshToken: result.refreshToken }),
    };
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiBody({
    description: 'Payload to refresh JWT token (optional, can also use cookie)',
    schema: {
      example: { refreshToken: 'refresh.token.here' },
    },
    required: false,
  })
  @ApiOkResponse({
    description: 'Returns new access and refresh tokens as HttpOnly cookies.',
    schema: {
      example: {
        message: 'Tokens refreshed successfully',
      },
    },
  })
  async refreshToken(
    @Body('refreshToken') refreshTokenBody: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req?.ip || (req?.headers['x-forwarded-for'] as string) || '-';
    const endpoint = (req as any)?.route?.path || req?.url || '/auth/refresh-token';

    const refreshToken = req.cookies?.refresh_token ?? refreshTokenBody;

    if (!refreshToken) {
      logSecurityEvent('refresh_token_failed', {
        ip,
        status: 'fail',
        reason: 'token_missing',
        endpoint,
      });
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const result = await this.authService.refreshToken(refreshToken);
      this.setAuthCookies(res, result);

      logSecurityEvent('refresh_token_success', {
        ip,
        status: 'success',
        endpoint,
      });

      return {
        message: 'Tokens refreshed successfully',
      };
    } catch (error) {
      logSecurityEvent('refresh_token_failed', {
        ip,
        status: 'fail',
        reason: error instanceof Error ? error.message : 'unknown_error',
        endpoint,
      });
      throw error;
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'User logged out successfully. Cookies are cleared.',
    schema: { example: { message: 'Logout successful' } },
  })
  async logout(
    @GetUser() user: UserEntity,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req?.ip || (req?.headers['x-forwarded-for'] as string) || '-';
    const endpoint = (req as any)?.route?.path || req?.url || '/auth/logout';

    try {
      const result = await this.authService.logout(user);

      res.clearCookie('access_token', { path: '/' });
      res.clearCookie('refresh_token', { path: '/' });

      logSecurityEvent('logout_success', {
        userId: user.id,
        email: user.email,
        ip,
        status: 'success',
        endpoint,
      });

      return result;
    } catch (error) {
      logSecurityEvent('logout_failed', {
        userId: user.id,
        email: user.email,
        ip,
        status: 'fail',
        reason: error instanceof Error ? error.message : 'unknown_error',
        endpoint,
      });
      throw error;
    }
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @ApiOperation({
    summary: 'Request password recovery',
    description:
      'Sends an email with a password reset link. The token expires according to configuration (default: 60 minutes). Always returns success, even if the email does not exist.',
  })
  @ApiBody({
    description: 'Payload to request password recovery',
    schema: {
      example: { email: 'user@email.com' },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Recovery email sent successfully (if the email exists in the database).',
    schema: { example: { message: 'Recovery email sent successfully' } },
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many recovery attempts. Please try again later.',
  })
  async forgotPassword(@Body('email') email: string, @Req() req: Request) {
    const ip = req?.ip || (req?.headers['x-forwarded-for'] as string) || '-';
    const endpoint = (req as any)?.route?.path || req?.url || '/auth/forgot-password';

    try {
      const result = await this.authService.forgotPassword(email);
      logSecurityEvent('forgot_password_success', {
        email,
        ip,
        status: 'success',
        endpoint,
      });
      return result;
    } catch (error) {
      logSecurityEvent('forgot_password_failed', {
        email,
        ip,
        status: 'fail',
        reason: error instanceof Error ? error.message : 'unknown_error',
        endpoint,
      });
      throw error;
    }
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @ApiOperation({
    summary: 'Reset password',
    description:
      'Resets the user password using the token sent by email. The token expires according to configuration.',
  })
  @ApiBody({
    description: 'Payload to reset password',
    type: ResetPasswordDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully.',
    schema: { example: { message: 'Password reset successfully' } },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  @ApiTooManyRequestsResponse({
    description: 'Too many reset attempts. Please try again later.',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Req() req: Request) {
    const ip = req?.ip || (req?.headers['x-forwarded-for'] as string) || '-';
    const endpoint = (req as any)?.route?.path || req?.url || '/auth/reset-password';

    try {
      const result = await this.authService.resetPassword(resetPasswordDto);
      logSecurityEvent('reset_password_success', {
        email: resetPasswordDto.email,
        ip,
        status: 'success',
        endpoint,
      });
      return result;
    } catch (error) {
      logSecurityEvent('reset_password_failed', {
        email: resetPasswordDto.email,
        ip,
        status: 'fail',
        reason: error instanceof Error ? error.message : 'unknown_error',
        endpoint,
      });
      throw error;
    }
  }

  @ApiOkResponse({ description: 'Current user information' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@GetUser() user: UserEntity) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      personId: user.personId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private setAuthCookies(res: Response, result: LoginResponse) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    if (result.refreshToken) {
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    }
  }
}
