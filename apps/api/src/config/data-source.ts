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

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER ?? 'minc_teams',
  password: process.env.DATABASE_PASSWORD ?? 'password',
  database: process.env.DATABASE_NAME ?? 'minc_teams',
  entities: [path.join(basePath, '**/*.entity{.ts,.js}')],
  migrations: [path.join(basePath, 'migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
