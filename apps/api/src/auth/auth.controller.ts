import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
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

function getEndpoint(req: Request, fallback: string): string {
  return req.route?.path ?? req.url ?? fallback;
}
import { GetUser } from '../common/decorators/get-user.decorator';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAccessCodeDto } from './dto/create-access-code.dto';
import { CheckActivationDto } from './dto/check-activation.dto';
import { CompleteActivationDto } from './dto/complete-activation.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';
import { logSecurityEvent } from '../common/utils/security-logger.util';
import { ActivationService } from './services/activation.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly activationService: ActivationService,
  ) {}

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
    const endpoint = getEndpoint(req, '/auth/login');

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
    const endpoint = getEndpoint(req, '/auth/refresh-token');

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
    const endpoint = getEndpoint(req, '/auth/logout');

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
    const endpoint = getEndpoint(req, '/auth/forgot-password');

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
    const endpoint = getEndpoint(req, '/auth/reset-password');

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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        personId: user.personId,
        avatar: user.avatar,
        canCheckIn: user.canCheckIn,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  @Post('change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Change password',
    description: 'Changes the authenticated user password. Requires current password.',
  })
  @ApiBody({
    description: 'Payload to change password',
    type: ChangePasswordDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully.',
    schema: { example: { message: 'Password changed successfully' } },
  })
  @ApiResponse({ status: 401, description: 'Current password is incorrect.' })
  async changePassword(
    @GetUser() user: UserEntity,
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const ip = req?.ip || (req?.headers['x-forwarded-for'] as string) || '-';
    const endpoint = getEndpoint(req, '/auth/change-password');

    try {
      const result = await this.authService.changePassword(user, changePasswordDto);
      logSecurityEvent('change_password_success', {
        userId: user.id,
        email: user.email,
        ip,
        status: 'success',
        endpoint,
      });
      return result;
    } catch (error) {
      logSecurityEvent('change_password_failed', {
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

  @Post('activate/check')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Valida telefone e código de acesso',
    description:
      'Valida se o telefone existe na base e se o código de acesso é válido. Retorna token temporário para completar ativação.',
  })
  @ApiBody({
    description: 'Telefone e código de acesso',
    type: CheckActivationDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Validação bem-sucedida. Retorna token temporário.',
    schema: {
      example: {
        tempToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        personName: 'João Silva',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Código inválido, expirado ou desativado' })
  @ApiResponse({ status: 404, description: 'Telefone não encontrado' })
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas. Tente novamente mais tarde.',
  })
  async checkActivation(@Body() dto: CheckActivationDto, @Req() req: Request) {
    const ip = req?.ip || (req?.headers['x-forwarded-for'] as string) || '-';
    const endpoint = getEndpoint(req, '/auth/activate/check');

    try {
      const result = await this.activationService.validateAccessCode(dto);
      return result;
    } catch (error) {
      logSecurityEvent('activation_check_failed', {
        phone: dto.phone,
        code: dto.accessCode,
        ip,
        endpoint,
        reason: error instanceof Error ? error.message : 'unknown_error',
      });
      throw error;
    }
  }

  @Post('activate/complete')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Completa ativação da conta',
    description:
      'Cria usuário vinculado à pessoa usando token temporário. Retorna token de autenticação.',
  })
  @ApiBody({
    description: 'Token temporário, email e senha',
    type: CompleteActivationDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Conta ativada com sucesso. Retorna usuário e token de autenticação.',
    schema: {
      example: {
        user: {
          id: 'b1f2c3d4-5678-1234-9abc-def012345678',
          name: 'João Silva',
          email: 'joao@example.com',
          role: 'servo',
          isActive: true,
          personId: 'a1b2c3d4-5678-1234-9abc-def012345678',
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Token inválido ou expirado' })
  @ApiResponse({ status: 409, description: 'Email já está em uso ou pessoa já possui conta' })
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas. Tente novamente mais tarde.',
  })
  async completeActivation(
    @Body() dto: CompleteActivationDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req?.ip || (req?.headers['x-forwarded-for'] as string) || '-';
    const endpoint = getEndpoint(req, '/auth/activate/complete');

    try {
      const result = await this.activationService.completeActivation(dto);

      // Fazer login automático
      const loginResult = await this.authService.login(result.user);
      this.setAuthCookies(res, loginResult);

      return {
        user: loginResult.user,
        token: loginResult.token,
      };
    } catch (error) {
      logSecurityEvent('activation_complete_failed', {
        ip,
        endpoint,
        reason: error instanceof Error ? error.message : 'unknown_error',
      });
      throw error;
    }
  }

  @Post('access-codes')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Cria código de acesso',
    description:
      'Cria um novo código de acesso para ativação em massa. Requer autenticação e permissões adequadas.',
  })
  @ApiBody({
    description: 'Dados do código de acesso',
    type: CreateAccessCodeDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Código criado com sucesso',
    type: Object,
  })
  @ApiUnauthorizedResponse({ description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para criar código neste escopo' })
  @ApiResponse({ status: 409, description: 'Código já existe' })
  async createAccessCode(@GetUser() user: UserEntity, @Body() dto: CreateAccessCodeDto) {
    return this.activationService.createAccessCode(user, dto);
  }

  @Get('access-codes')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Lista códigos de acesso do usuário',
    description: 'Retorna lista de códigos criados pelo usuário autenticado.',
  })
  @ApiOkResponse({
    description: 'Lista de códigos de acesso',
    type: [Object],
  })
  @ApiUnauthorizedResponse({ description: 'Não autorizado' })
  async getAccessCodes(@GetUser() user: UserEntity) {
    return this.activationService.getAccessCodes(user);
  }

  @Patch('access-codes/:id/deactivate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Desativa código de acesso',
    description: 'Desativa um código de acesso criado pelo usuário.',
  })
  @ApiResponse({
    status: 200,
    description: 'Código desativado com sucesso',
    schema: { example: { message: 'Código desativado com sucesso' } },
  })
  @ApiUnauthorizedResponse({ description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para desativar este código' })
  @ApiResponse({ status: 404, description: 'Código não encontrado' })
  async deactivateAccessCode(@GetUser() user: UserEntity, @Param('id') id: string) {
    await this.activationService.deactivateAccessCode(user, id);
    return { message: 'Código desativado com sucesso' };
  }

  @Get('access-codes/:id/stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Estatísticas de ativações do código',
    description: 'Retorna estatísticas de ativações de um código de acesso.',
  })
  @ApiOkResponse({
    description: 'Estatísticas do código',
    type: Object,
  })
  @ApiUnauthorizedResponse({ description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para ver estatísticas deste código' })
  @ApiResponse({ status: 404, description: 'Código não encontrado' })
  async getActivationStats(@GetUser() user: UserEntity, @Param('id') id: string) {
    return this.activationService.getActivationStats(user, id);
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
