import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../constants';

export interface TempActivationTokenPayload {
  personId: string;
  accessCodeId: string;
  type: 'activation';
  iat?: number;
  exp?: number;
}

@Injectable()
export class TempActivationTokenService {
  private readonly usedTokens = new Set<string>();

  constructor(private readonly jwtService: JwtService) {}

  generateToken(personId: string, accessCodeId: string): string {
    const payload: TempActivationTokenPayload = {
      personId,
      accessCodeId,
      type: 'activation',
    };

    // Token válido por 24 horas
    return this.jwtService.sign(payload, {
      expiresIn: '24h',
      secret: jwtConstants.secret,
    });
  }

  validateToken(token: string): TempActivationTokenPayload {
    // Verificar se o token já foi usado
    if (this.usedTokens.has(token)) {
      throw new UnauthorizedException('Token já foi utilizado');
    }

    try {
      const payload = this.jwtService.verify<TempActivationTokenPayload>(token, {
        secret: jwtConstants.secret,
      });

      // Verificar se é um token de ativação
      if (payload.type !== 'activation') {
        throw new UnauthorizedException('Token inválido');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  markTokenAsUsed(token: string): void {
    this.usedTokens.add(token);

    // Limpar tokens antigos periodicamente (após 24h + 1h de buffer)
    // Em produção, considere usar Redis ou banco de dados para persistência
    setTimeout(
      () => {
        this.usedTokens.delete(token);
      },
      25 * 60 * 60 * 1000,
    ); // 25 horas
  }

  clearUsedToken(token: string): void {
    this.usedTokens.delete(token);
  }
}
