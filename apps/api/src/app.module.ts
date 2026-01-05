import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConfig } from './config/database.config';
import { getLoggerConfig } from './common/config/logger.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { LogPayloadInterceptor } from './common/interceptors/log-payload.interceptor';
import { ChurchesModule } from './churches/churches.module';
import { MinistriesModule } from './ministries/ministries.module';
import { TeamsModule } from './teams/teams.module';
import { PersonsModule } from './persons/persons.module';
import { ServicesModule } from './services/services.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AttendancesModule } from './attendances/attendances.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule.forRoot(getLoggerConfig()),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    AuthModule,
    UsersModule,
    ChurchesModule,
    MinistriesModule,
    TeamsModule,
    PersonsModule,
    ServicesModule,
    SchedulesModule,
    AttendancesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LogPayloadInterceptor,
    },
  ],
})
export class AppModule {}
