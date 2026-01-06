import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  parseDatabaseUrl,
  shouldUseSsl,
  getSslConfig,
  getExtraConnectionOptions,
  getDefaultDatabaseConfig,
} from './database.utils';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    const databaseSsl = this.configService.get<string>('DATABASE_SSL');
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const requiresSsl = shouldUseSsl(databaseUrl, databaseSsl, nodeEnv);

    // Get connection parameters from URL or environment variables
    const connectionParams = databaseUrl
      ? parseDatabaseUrl(databaseUrl)
      : {
          host: this.configService.get<string>('DATABASE_HOST', 'localhost'),
          port: this.configService.get<number>('DATABASE_PORT', 5432),
          username: this.configService.get<string>('DATABASE_USER', 'minc_teams'),
          password: this.configService.get<string>('DATABASE_PASSWORD', 'password'),
          database: this.configService.get<string>('DATABASE_NAME', 'minc_teams'),
        };

    return {
      type: 'postgres',
      host: connectionParams.host,
      port: connectionParams.port,
      username: connectionParams.username,
      password: connectionParams.password,
      database: connectionParams.database,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrationsTableName: 'migrations',
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      synchronize: false, // Always false - use migrations instead
      logging: nodeEnv === 'development',
      ssl: getSslConfig(requiresSsl),
      extra: getExtraConnectionOptions(requiresSsl),
    };
  }
}
