import { DataSourceOptions } from 'typeorm';
import * as path from 'node:path';

/**
 * Parsed database connection parameters from a URL
 */
export interface ParsedDatabaseUrl {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

/**
 * Parse a database URL into individual connection parameters
 */
export function parseDatabaseUrl(databaseUrl: string): ParsedDatabaseUrl {
  const url = new URL(databaseUrl);
  const hostname = url.hostname;
  const port = Number.parseInt(url.port || '5432', 10);
  // Decode username and password (they may be URL-encoded)
  const username = url.username ? decodeURIComponent(url.username) : 'postgres';
  const password = url.password ? decodeURIComponent(url.password) : '';
  const database = url.pathname.slice(1) || 'postgres';

  return { host: hostname, port, username, password, database };
}

/**
 * Determine if SSL should be used based on environment variables
 */
export function shouldUseSsl(
  databaseUrl?: string,
  databaseSsl?: string,
  nodeEnv?: string,
): boolean {
  const isProduction = nodeEnv === 'production';
  const requireSsl = databaseSsl === 'true';
  const urlRequiresSsl = databaseUrl?.includes('sslmode=require') ?? false;

  return isProduction || requireSsl || urlRequiresSsl;
}

/**
 * Get SSL configuration for TypeORM
 */
export function getSslConfig(requiresSsl: boolean): boolean | { rejectUnauthorized: boolean } {
  return requiresSsl ? { rejectUnauthorized: false } : false;
}

/**
 * Get extra connection options for TypeORM
 */
export function getExtraConnectionOptions(requiresSsl: boolean): DataSourceOptions['extra'] {
  return {
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
  };
}

/**
 * Get base path for entities and migrations
 */
export function getBasePath(): string {
  const isInApiDir = process.cwd().endsWith('apps/api') || process.cwd().includes('apps/api');
  return isInApiDir
    ? path.resolve(process.cwd(), 'src')
    : path.resolve(process.cwd(), 'apps/api/src');
}

/**
 * Get default database configuration (when DATABASE_URL is not provided)
 */
export function getDefaultDatabaseConfig(): Omit<ParsedDatabaseUrl, 'host'> & {
  host: string;
} {
  return {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number.parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USER ?? 'minc_teams',
    password: process.env.DATABASE_PASSWORD ?? 'password',
    database: process.env.DATABASE_NAME ?? 'minc_teams',
  };
}

/**
 * Build TypeORM DataSource options from connection parameters
 */
export function buildDataSourceOptions(
  connectionParams: ParsedDatabaseUrl,
  requiresSsl: boolean,
  basePath: string,
  logging?: boolean,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: connectionParams.host,
    port: connectionParams.port,
    username: connectionParams.username,
    password: connectionParams.password,
    database: connectionParams.database,
    entities: [path.join(basePath, '**/*.entity{.ts,.js}')],
    migrations: [path.join(basePath, 'migrations/*{.ts,.js}')],
    migrationsTableName: 'migrations',
    synchronize: false,
    logging: logging ?? process.env.NODE_ENV === 'development',
    ssl: getSslConfig(requiresSsl),
    extra: getExtraConnectionOptions(requiresSsl),
  };
}
