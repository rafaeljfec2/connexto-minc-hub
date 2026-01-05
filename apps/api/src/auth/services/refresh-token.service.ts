import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    const expirationDays = parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DAYS ?? '7', 10);
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    await this.refreshTokenRepository.save({
      userId,
      token,
      expiresAt,
      isRevoked: false,
    });

    return token;
  }

  async validateRefreshToken(token: string): Promise<boolean> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: {
        token,
        isRevoked: false,
      },
    });

    if (!refreshToken) {
      return false;
    }

    if (refreshToken.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  async getRefreshToken(token: string): Promise<RefreshTokenEntity | null> {
    return this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token },
      { isRevoked: true },
    );
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }
}
