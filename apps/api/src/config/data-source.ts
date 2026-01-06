import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import {
  parseDatabaseUrl,
  shouldUseSsl,
  getBasePath,
  getDefaultDatabaseConfig,
  buildDataSourceOptions,
} from './database.utils';

// Load environment variables
config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

// Get base path for entities and migrations
const basePath = getBasePath();

// Get database connection parameters
const databaseUrl = process.env.DATABASE_URL;
const requiresSsl = shouldUseSsl(
  databaseUrl,
  process.env.DATABASE_SSL,
  process.env.NODE_ENV,
);

const connectionParams = databaseUrl
  ? parseDatabaseUrl(databaseUrl)
  : getDefaultDatabaseConfig();

// Build DataSource options
export const dataSourceOptions = buildDataSourceOptions(
  connectionParams,
  requiresSsl,
  basePath,
);

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
