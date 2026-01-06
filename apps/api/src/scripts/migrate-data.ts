import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'node:path';
import {
  parseDatabaseUrl,
  shouldUseSsl,
  getBasePath,
  getDefaultDatabaseConfig,
  buildDataSourceOptions,
} from '../config/database.utils';

// Load environment variables - try multiple paths
const cwd = process.cwd();
const isInApiDir = cwd.endsWith('apps/api') || cwd.includes('apps/api');

const envPaths = [
  path.resolve(cwd, isInApiDir ? '.env' : 'apps/api/.env'),
  path.resolve(cwd, '.env'),
  path.resolve(cwd, 'apps/api/.env'),
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    const result = config({ path: envPath });
    if (!result.error && result.parsed) {
      envLoaded = true;
      console.log(`📄 Loaded .env from: ${envPath}`);
      break;
    }
  } catch (error) {
    // Continue to next path
    continue;
  }
}

// Also try loading from current directory without specific path
if (!envLoaded) {
  const result = config();
  if (!result.error && result.parsed) {
    envLoaded = true;
    console.log(`📄 Loaded .env from default location`);
  }
}

if (!envLoaded) {
  console.warn('⚠️  No .env file found, using system environment variables');
}

// Debug: Show if DATABASE_URL is loaded
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`✅ DATABASE_URL found: ${url.hostname}:${url.port}/${url.pathname.slice(1)}`);
  } catch (error) {
    console.log(`✅ DATABASE_URL found (invalid URL format)`);
  }
} else {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.error('   Make sure DATABASE_URL is set in apps/api/.env');
}

/**
 * Tables that have deleted_at column (soft delete)
 */
const TABLES_WITH_SOFT_DELETE = new Set([
  'churches',
  'ministries',
  'persons',
  'users',
  'teams',
  'services',
  'schedules',
  'schedule_planning_configs',
  'team_planning_configs',
  'schedule_planning_templates',
]);

/**
 * Order of tables for data migration (respecting foreign key dependencies)
 * Note: persons must come after teams because of fk_person_team
 */
const MIGRATION_ORDER = [
  'churches',
  'ministries',
  'teams', // Move teams before persons
  'persons', // Now persons can reference teams
  'users',
  'team_members',
  'services',
  'schedules',
  'schedule_teams',
  'attendances',
  'refresh_tokens',
  'password_reset_tokens',
  'schedule_planning_configs',
  'team_planning_configs',
  'schedule_planning_templates',
];

/**
 * Create DataSource for local database
 */
function createLocalDataSource(): DataSource {
  const basePath = getBasePath();
  const connectionParams = getDefaultDatabaseConfig();
  // Local database never uses SSL
  const requiresSsl = false;

  const options = buildDataSourceOptions(connectionParams, requiresSsl, basePath, false);
  return new DataSource(options);
}

/**
 * Create DataSource for Supabase
 */
function createSupabaseDataSource(): DataSource {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for Supabase connection');
  }

  const basePath = getBasePath();
  const connectionParams = parseDatabaseUrl(databaseUrl);
  const requiresSsl = shouldUseSsl(databaseUrl, process.env.DATABASE_SSL, process.env.NODE_ENV);

  const options = buildDataSourceOptions(connectionParams, requiresSsl, basePath, false);
  return new DataSource(options);
}

/**
 * Get all data from a table
 */
async function getTableData(
  source: DataSource,
  tableName: string,
): Promise<Record<string, unknown>[]> {
  const queryRunner = source.createQueryRunner();
  try {
    // Only filter by deleted_at if the table has that column
    const hasSoftDelete = TABLES_WITH_SOFT_DELETE.has(tableName);
    const query = hasSoftDelete
      ? `SELECT * FROM "${tableName}" WHERE deleted_at IS NULL`
      : `SELECT * FROM "${tableName}"`;

    const data = await queryRunner.query(query);
    return data;
  } finally {
    await queryRunner.release();
  }
}

/**
 * Insert data into target table with conflict handling
 */
async function insertTableData(
  target: DataSource,
  tableName: string,
  data: Record<string, unknown>[],
  onConflict: 'skip' | 'update' | 'error' = 'skip',
): Promise<number> {
  if (data.length === 0) {
    return 0;
  }

  const queryRunner = target.createQueryRunner();
  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let inserted = 0;
    let skipped = 0;

    // Insert each row individually to handle errors gracefully
    for (const row of data) {
      try {
        // Get column names and values, filtering out null values that shouldn't be inserted
        const columns = Object.keys(row).filter((col) => row[col] !== undefined);
        const values = columns.map((col) => row[col]);

        // Build INSERT query with parameters
        const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
        const columnNames = columns.map((col) => `"${col}"`).join(', ');

        let query = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders})`;

        // Add ON CONFLICT clause
        if (onConflict === 'skip') {
          if (tableName === 'users') {
            query += ` ON CONFLICT (email) DO NOTHING`;
          } else if (tableName === 'refresh_tokens') {
            query += ` ON CONFLICT (token) DO NOTHING`;
          } else if (tableName === 'password_reset_tokens') {
            query += ` ON CONFLICT (token) DO NOTHING`;
          } else if (tableName === 'team_members') {
            query += ` ON CONFLICT (team_id, person_id) DO NOTHING`;
          } else if (tableName === 'schedule_teams') {
            query += ` ON CONFLICT (schedule_id, team_id) DO NOTHING`;
          } else if (tableName === 'attendances') {
            query += ` ON CONFLICT (schedule_id, person_id) DO NOTHING`;
          } else {
            query += ` ON CONFLICT (id) DO NOTHING`;
          }
        }

        const result = await queryRunner.query(query, values);
        // Check if row was actually inserted (ON CONFLICT DO NOTHING returns empty result)
        if (result && (result.rowCount === undefined || result.rowCount > 0)) {
          inserted++;
        } else {
          skipped++;
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (onConflict === 'error') {
          await queryRunner.rollbackTransaction();
          throw error;
        }
        // Skip on conflict or other errors if not in error mode
        if (
          errorMessage.includes('duplicate key') ||
          errorMessage.includes('unique constraint') ||
          errorMessage.includes('violates unique constraint') ||
          errorMessage.includes('violates foreign key constraint') ||
          errorMessage.includes('violates check constraint')
        ) {
          skipped++;
          // Only log non-constraint errors
        } else if (!errorMessage.includes('current transaction is aborted')) {
          console.log(`  ⚠️  Error inserting row in ${tableName}: ${errorMessage}`);
          skipped++;
        } else {
          // Transaction was aborted, rollback and start new transaction
          await queryRunner.rollbackTransaction();
          await queryRunner.startTransaction();
          skipped++;
        }
      }
    }

    await queryRunner.commitTransaction();
    if (skipped > 0 && inserted > 0) {
      console.log(`  ⚠️  ${skipped} records skipped (duplicates/constraints)`);
    }
    return inserted;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

/**
 * Main migration function
 */
async function migrateData() {
  const localSource = createLocalDataSource();
  const supabaseTarget = createSupabaseDataSource();

  console.log('🚀 Starting data migration from local database to Supabase...\n');

  try {
    // Initialize connections
    console.log('📦 Connecting to local database...');
    await localSource.initialize();
    console.log('✅ Connected to local database\n');

    console.log('📦 Connecting to Supabase...');
    await supabaseTarget.initialize();
    console.log('✅ Connected to Supabase\n');

    let totalMigrated = 0;

    // Migrate data in order
    for (const tableName of MIGRATION_ORDER) {
      try {
        console.log(`📊 Migrating ${tableName}...`);

        // Check if table exists in source
        const sourceQueryRunner = localSource.createQueryRunner();
        const tableExists = await sourceQueryRunner.hasTable(tableName);
        await sourceQueryRunner.release();

        if (!tableExists) {
          console.log(`  ⏭️  Table ${tableName} does not exist in source, skipping\n`);
          continue;
        }

        // Get data from source
        const data = await getTableData(localSource, tableName);
        console.log(`  📥 Found ${data.length} records`);

        if (data.length === 0) {
          console.log(`  ✅ No data to migrate\n`);
          continue;
        }

        // Insert into target
        const inserted = await insertTableData(supabaseTarget, tableName, data, 'skip');
        console.log(`  ✅ Migrated ${inserted} records`);
        totalMigrated += inserted;

        if (inserted < data.length) {
          console.log(`  ⚠️  ${data.length - inserted} records skipped (duplicates)`);
        }

        console.log('');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`  ❌ Error migrating ${tableName}:`, errorMessage);
        console.error('');
        // Continue with next table
      }
    }

    console.log(`\n✅ Migration completed! Total records migrated: ${totalMigrated}`);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close connections
    if (localSource.isInitialized) {
      await localSource.destroy();
    }
    if (supabaseTarget.isInitialized) {
      await supabaseTarget.destroy();
    }
  }
}

// Run migration
migrateData().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
