import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * Run database migrations before starting the application
 */
export async function runMigrations(dataSource: DataSource, logger: Logger): Promise<void> {
  // Initialize connection if not already initialized
  if (!dataSource.isInitialized) {
    logger.log('📦 Initializing database connection...');
    await dataSource.initialize();
    logger.log('✅ Database connection initialized');
  }

  logger.log('🔄 Running database migrations...');

  try {
    const hasPendingMigrations = await dataSource.showMigrations();

    if (hasPendingMigrations) {
      logger.log('Found pending migrations, executing...');
      const executedMigrations = await dataSource.runMigrations();

      if (executedMigrations.length > 0) {
        logger.log(`✅ Executed ${executedMigrations.length} migration(s):`);
        executedMigrations.forEach((migration) => {
          logger.log(`   - ${migration.name}`);
        });
      } else {
        logger.log('✅ No migrations to execute');
      }
    } else {
      logger.log('✅ Database is up to date (no pending migrations)');
    }
  } catch (migrationError) {
    logger.error('❌ Error running migrations:', migrationError);
    throw migrationError;
  }
}
