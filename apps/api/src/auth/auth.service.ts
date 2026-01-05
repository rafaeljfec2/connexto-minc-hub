import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordResetService } from './services/password-reset.service';
import { RefreshTokenService } from './services/refresh-token.service';

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    personId: string | null;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.usersService.findAuthUser(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    return user;
  }

  async login(user: UserEntity): Promise<LoginResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(user.id);

    await this.usersService.updateLastLogin(user.id);

    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      personId: user.personId,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return {
      user: userObj,
      token,
      refreshToken,
      expiresIn: 86400,
    };
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const isValid = await this.refreshTokenService.validateRefreshToken(refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const refreshTokenDoc = await this.refreshTokenService.getRefreshToken(refreshToken);
    if (!refreshTokenDoc) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const user = await this.usersService.findOne(refreshTokenDoc.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.refreshTokenService.revokeRefreshToken(refreshToken);
    return this.login(user);
  }

  async logout(user: UserEntity): Promise<{ message: string }> {
    await this.refreshTokenService.revokeAllUserTokens(user.id);
    return { message: 'Logout successful' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    await this.passwordResetService.generateResetToken(email);
    return { message: 'Password reset email sent successfully' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const isValid = await this.passwordResetService.validateResetToken(
      resetPasswordDto.token,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const success = await this.passwordResetService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );

    if (!success) {
      throw new UnauthorizedException('Failed to reset password');
    }

    return { message: 'Password reset successfully' };
  }
}
