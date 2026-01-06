import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    const databaseSsl = this.configService.get<string>('DATABASE_SSL') === 'true';
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const requiresSsl =
      isProduction || databaseSsl || (databaseUrl?.includes('sslmode=require') ?? false);

    // Se DATABASE_URL estiver definida, usar ela (Supabase)
    if (databaseUrl) {
      // Parse URL to extract connection parameters
      const url = new URL(databaseUrl);
      const hostname = url.hostname;
      const port = Number.parseInt(url.port || '5432', 10);
      const username = url.username || 'postgres';
      const password = url.password || '';
      const database = url.pathname.slice(1) || 'postgres';

      // Use host/port instead of URL to have better control over IPv4/IPv6
      return {
        type: 'postgres',
        host: hostname,
        port,
        username,
        password,
        database,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrationsTableName: 'migrations',
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        synchronize: false, // Always false - use migrations instead
        logging: this.configService.get<string>('NODE_ENV') === 'development',
        ssl: requiresSsl ? { rejectUnauthorized: false } : false,
        extra: {
          ...(requiresSsl
            ? {
                ssl: {
                  rejectUnauthorized: false,
                },
              }
            : {}),
          // Force IPv4 to avoid ENETUNREACH errors with IPv6
          family: 4,
          connectionTimeoutMillis: 10000,
        },
      };
    }

    // Caso contrário, usar variáveis individuais
    return {
      type: 'postgres',
      host: this.configService.get<string>('DATABASE_HOST', 'localhost'),
      port: this.configService.get<number>('DATABASE_PORT', 5432),
      username: this.configService.get<string>('DATABASE_USER', 'minc_teams'),
      password: this.configService.get<string>('DATABASE_PASSWORD', 'password'),
      database: this.configService.get<string>('DATABASE_NAME', 'minc_teams'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrationsTableName: 'migrations',
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      synchronize: false, // Always false - use migrations instead
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      ssl: requiresSsl ? { rejectUnauthorized: false } : false,
      extra: {
        ...(requiresSsl
          ? {
              ssl: {
                rejectUnauthorized: false,
              },
            }
          : {}),
        // Force IPv4 to avoid ENETUNREACH errors with IPv6
        family: 4,
      },
    };
  }
}
