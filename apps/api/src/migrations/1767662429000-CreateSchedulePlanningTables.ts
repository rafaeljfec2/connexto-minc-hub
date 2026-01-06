import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSchedulePlanningTables1767662429000 implements MigrationInterface {
  name = 'CreateSchedulePlanningTables1767662429000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
        deleted_at TIMESTAMP,
        CONSTRAINT uk_schedule_planning_config_church UNIQUE (church_id) WHERE deleted_at IS NULL
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_schedule_planning_configs_church_id ON schedule_planning_configs(church_id) WHERE deleted_at IS NULL;
    `);

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
        deleted_at TIMESTAMP,
        CONSTRAINT uk_team_planning_config_team UNIQUE (team_id) WHERE deleted_at IS NULL
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_team_planning_configs_team_id ON team_planning_configs(team_id) WHERE deleted_at IS NULL;
    `);

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

    await queryRunner.query(`
      CREATE INDEX idx_schedule_planning_templates_is_system_template ON schedule_planning_templates(is_system_template) WHERE deleted_at IS NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX idx_schedule_planning_templates_created_by_church_id ON schedule_planning_templates(created_by_church_id) WHERE deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_schedule_planning_templates_created_by_church_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_schedule_planning_templates_is_system_template;`);
    await queryRunner.query(`DROP TABLE IF EXISTS schedule_planning_templates;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_team_planning_configs_team_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS team_planning_configs;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_schedule_planning_configs_church_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS schedule_planning_configs;`);
  }
}
