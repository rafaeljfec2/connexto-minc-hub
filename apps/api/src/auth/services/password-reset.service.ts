import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetTokenEntity } from '../entities/password-reset-token.entity';
import { UsersService } from '../../users/users.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(PasswordResetTokenEntity)
    private passwordResetTokenRepository: Repository<PasswordResetTokenEntity>,
    private usersService: UsersService,
  ) {}

  async generateResetToken(email: string): Promise<string | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    const expirationMinutes = parseInt(
      process.env.RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES ?? '60',
      10,
    );
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

    await this.passwordResetTokenRepository.save({
      userId: user.id,
      token,
      expiresAt,
      usedAt: null,
    });

    return token;
  }

  async validateResetToken(token: string): Promise<boolean> {
    const resetToken = await this.passwordResetTokenRepository
      .createQueryBuilder('resetToken')
      .select(['resetToken.id', 'resetToken.usedAt', 'resetToken.expiresAt'])
      .where('resetToken.token = :token', { token })
      .andWhere('resetToken.usedAt IS NULL')
      .andWhere('resetToken.expiresAt > :now', { now: new Date() })
      .getOne();

    return resetToken !== null;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const resetToken = await this.passwordResetTokenRepository
      .createQueryBuilder('resetToken')
      .select([
        'resetToken.id',
        'resetToken.userId',
        'resetToken.token',
        'resetToken.usedAt',
        'resetToken.expiresAt',
        'user.id',
        'user.email',
      ])
      .leftJoin('resetToken.user', 'user')
      .where('resetToken.token = :token', { token })
      .andWhere('resetToken.usedAt IS NULL')
      .andWhere('resetToken.expiresAt > :now', { now: new Date() })
      .getOne();

    if (!resetToken) {
      return false;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(resetToken.userId, passwordHash);

    await this.passwordResetTokenRepository.update(
      { id: resetToken.id },
      { usedAt: new Date() },
    );

    await this.usersService.updateLastLogin(resetToken.userId);

    return true;
  }
}
