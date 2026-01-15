import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { jwtConstants } from './constants';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { PasswordResetTokenEntity } from './entities/password-reset-token.entity';
import { AccessCodeEntity } from './entities/access-code.entity';
import { RefreshTokenService } from './services/refresh-token.service';
import { PasswordResetService } from './services/password-reset.service';
import { TempActivationTokenService } from './services/temp-activation-token.service';
import { ActivationService } from './services/activation.service';
import { PersonEntity } from '../persons/entities/person.entity';
import { TeamEntity } from '../teams/entities/team.entity';
import { MinistryEntity } from '../ministries/entities/ministry.entity';
import { ChurchEntity } from '../churches/entities/church.entity';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '24h' },
    }),
    TypeOrmModule.forFeature([
      RefreshTokenEntity,
      PasswordResetTokenEntity,
      AccessCodeEntity,
      PersonEntity,
      TeamEntity,
      MinistryEntity,
      ChurchEntity,
    ]),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshTokenService,
    PasswordResetService,
    TempActivationTokenService,
    ActivationService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
