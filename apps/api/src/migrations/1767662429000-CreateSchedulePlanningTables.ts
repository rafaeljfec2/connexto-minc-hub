import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSchedulePlanningTables1767662429000 implements MigrationInterface {
  name = 'CreateSchedulePlanningTables1767662429000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if schedule_planning_configs table exists
    const schedulePlanningConfigsExists = await queryRunner.hasTable('schedule_planning_configs');

    if (!schedulePlanningConfigsExists) {
      // Create schedule_planning_configs table
      await queryRunner.query(`
        CREATE TABLE schedule_planning_configs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
          max_team_members INTEGER NOT NULL DEFAULT 10,
          services_per_sunday INTEGER NOT NULL DEFAULT 4,
          teams_serve_once_per_month BOOLEAN NOT NULL DEFAULT true,
          enable_lottery_for_extra_services BOOLEAN NOT NULL DEFAULT true,
          enable_time_rotation BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMP
        );
      `);
    }

    // Create unique partial index for church_id (only when not deleted)
    const uniqueIndexExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'uk_schedule_planning_config_church'
      );
    `);

    if (!uniqueIndexExists[0].exists) {
      await queryRunner.query(`
        CREATE UNIQUE INDEX uk_schedule_planning_config_church 
        ON schedule_planning_configs(church_id) 
        WHERE deleted_at IS NULL;
      `);
    }

    const indexExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_schedule_planning_configs_church_id'
      );
    `);

    if (!indexExists[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_schedule_planning_configs_church_id 
        ON schedule_planning_configs(church_id) 
        WHERE deleted_at IS NULL;
      `);
    }

    // Check if team_planning_configs table exists
    const teamPlanningConfigsExists = await queryRunner.hasTable('team_planning_configs');

    if (!teamPlanningConfigsExists) {
      // Create team_planning_configs table
      await queryRunner.query(`
        CREATE TABLE team_planning_configs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
          max_team_members INTEGER,
          teams_serve_once_per_month BOOLEAN,
          enable_lottery_for_extra_services BOOLEAN,
          enable_time_rotation BOOLEAN,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMP
        );
      `);
    }

    // Create unique partial index for team_id (only when not deleted)
    const teamUniqueIndexExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'uk_team_planning_config_team'
      );
    `);

    if (!teamUniqueIndexExists[0].exists) {
      await queryRunner.query(`
        CREATE UNIQUE INDEX uk_team_planning_config_team 
        ON team_planning_configs(team_id) 
        WHERE deleted_at IS NULL;
      `);
    }

    const teamIndexExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_team_planning_configs_team_id'
      );
    `);

    if (!teamIndexExists[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_team_planning_configs_team_id 
        ON team_planning_configs(team_id) 
        WHERE deleted_at IS NULL;
      `);
    }

    // Check if schedule_planning_templates table exists
    const schedulePlanningTemplatesExists = await queryRunner.hasTable(
      'schedule_planning_templates',
    );

    if (!schedulePlanningTemplatesExists) {
      // Create schedule_planning_templates table
      await queryRunner.query(`
        CREATE TABLE schedule_planning_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          is_system_template BOOLEAN NOT NULL DEFAULT false,
          created_by_church_id UUID REFERENCES churches(id) ON DELETE SET NULL,
          max_team_members INTEGER NOT NULL,
          services_per_sunday INTEGER NOT NULL,
          teams_serve_once_per_month BOOLEAN NOT NULL,
          enable_lottery_for_extra_services BOOLEAN NOT NULL,
          enable_time_rotation BOOLEAN NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMP
        );
      `);
    }

    const templateSystemIndexExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_schedule_planning_templates_is_system_template'
      );
    `);

    if (!templateSystemIndexExists[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_schedule_planning_templates_is_system_template 
        ON schedule_planning_templates(is_system_template) 
        WHERE deleted_at IS NULL;
      `);
    }

    const templateChurchIndexExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_schedule_planning_templates_created_by_church_id'
      );
    `);

    if (!templateChurchIndexExists[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_schedule_planning_templates_created_by_church_id 
        ON schedule_planning_templates(created_by_church_id) 
        WHERE deleted_at IS NULL;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_schedule_planning_templates_created_by_church_id;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_schedule_planning_templates_is_system_template;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS schedule_planning_templates;`);
    await queryRunner.query(`DROP INDEX IF EXISTS uk_team_planning_config_team;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_team_planning_configs_team_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS team_planning_configs;`);
    await queryRunner.query(`DROP INDEX IF EXISTS uk_schedule_planning_config_church;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_schedule_planning_configs_church_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS schedule_planning_configs;`);
  }
}
