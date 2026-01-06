import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente
config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

// Resolver caminhos - quando executado via ts-node, __dirname pode não estar definido
// Usar caminho absoluto baseado em process.cwd() se estiver em apps/api
const isInApiDir = process.cwd().endsWith('apps/api') || process.cwd().includes('apps/api');
const basePath = isInApiDir
  ? path.resolve(process.cwd(), 'src')
  : path.resolve(process.cwd(), 'apps/api/src');

// Verificar se DATABASE_URL está definida (Supabase)
const databaseUrl = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';
const requireSsl = process.env.DATABASE_SSL === 'true';
const urlRequiresSsl = databaseUrl?.includes('sslmode=require') ?? false;
const shouldUseSsl = isProduction || requireSsl || urlRequiresSsl;

export const dataSourceOptions: DataSourceOptions = databaseUrl
  ? {
      type: 'postgres',
      url: databaseUrl,
      entities: [path.join(basePath, '**/*.entity{.ts,.js}')],
      migrations: [path.join(basePath, 'migrations/*{.ts,.js}')],
      migrationsTableName: 'migrations',
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
      extra: {
        ...(shouldUseSsl
          ? {
              ssl: {
                rejectUnauthorized: false,
              },
            }
          : {}),
        // Force IPv4 to avoid ENETUNREACH errors with IPv6
        family: 4,
      },
    }
  : {
      type: 'postgres',
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: Number.parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      username: process.env.DATABASE_USER ?? 'minc_teams',
      password: process.env.DATABASE_PASSWORD ?? 'password',
      database: process.env.DATABASE_NAME ?? 'minc_teams',
      entities: [path.join(basePath, '**/*.entity{.ts,.js}')],
      migrations: [path.join(basePath, 'migrations/*{.ts,.js}')],
      migrationsTableName: 'migrations',
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
      extra: {
        ...(shouldUseSsl
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

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
