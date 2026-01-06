import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizeIndexes1700000000002 implements MigrationInterface {
  name = 'OptimizeIndexes1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Composite indexes for schedules table - optimize date range queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_schedules_service_date_deleted 
      ON schedules(service_id, date, deleted_at) 
      WHERE deleted_at IS NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_schedules_date_deleted 
      ON schedules(date, deleted_at) 
      WHERE deleted_at IS NULL;
    `);

    // Composite index for services - optimize ordering and filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_services_church_day_time_deleted 
      ON services(church_id, day_of_week, time, deleted_at) 
      WHERE deleted_at IS NULL;
    `);

    // Composite indexes for attendances - optimize ordering by checked_in_at
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_attendances_schedule_checked_in 
      ON attendances(schedule_id, checked_in_at DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_attendances_person_checked_in 
      ON attendances(person_id, checked_in_at DESC);
    `);

    // Composite index for refresh_tokens - optimize validation queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_revoked_expires 
      ON refresh_tokens(user_id, is_revoked, expires_at) 
      WHERE is_revoked = false;
    `);

    // Composite index for password_reset_tokens - optimize validation queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_user_used_expires 
      ON password_reset_tokens(user_id, used_at, expires_at) 
      WHERE used_at IS NULL;
    `);

    // Index for deleted_at in all soft-delete tables (for IS NULL queries)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_churches_deleted_at 
      ON churches(deleted_at) 
      WHERE deleted_at IS NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ministries_deleted_at 
      ON ministries(deleted_at) 
      WHERE deleted_at IS NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_persons_deleted_at 
      ON persons(deleted_at) 
      WHERE deleted_at IS NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_deleted_at 
      ON users(deleted_at) 
      WHERE deleted_at IS NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_teams_deleted_at 
      ON teams(deleted_at) 
      WHERE deleted_at IS NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_services_deleted_at 
      ON services(deleted_at) 
      WHERE deleted_at IS NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_schedules_deleted_at 
      ON schedules(deleted_at) 
      WHERE deleted_at IS NULL;
    `);

    // Indexes for schedule planning tables (only if tables exist)
    const hasSchedulePlanningConfigs = await queryRunner.hasTable('schedule_planning_configs');
    if (hasSchedulePlanningConfigs) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_schedule_planning_configs_church_deleted 
        ON schedule_planning_configs(church_id, deleted_at) 
        WHERE deleted_at IS NULL;
      `);
    }

    const hasTeamPlanningConfigs = await queryRunner.hasTable('team_planning_configs');
    if (hasTeamPlanningConfigs) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_team_planning_configs_team_deleted 
        ON team_planning_configs(team_id, deleted_at) 
        WHERE deleted_at IS NULL;
      `);
    }

    const hasSchedulePlanningTemplates = await queryRunner.hasTable('schedule_planning_templates');
    if (hasSchedulePlanningTemplates) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_schedule_planning_templates_church_system_deleted 
        ON schedule_planning_templates(created_by_church_id, is_system_template, deleted_at) 
        WHERE deleted_at IS NULL;
      `);
    }

    // Composite index for users - optimize email lookups with soft delete
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email_deleted 
      ON users(email, deleted_at) 
      WHERE deleted_at IS NULL;
    `);

    // Composite index for teams - optimize ministry and active status queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_teams_ministry_active_deleted 
      ON teams(ministry_id, is_active, deleted_at) 
      WHERE deleted_at IS NULL;
    `);

    // Composite index for ministries - optimize church and active status queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ministries_church_active_deleted 
      ON ministries(church_id, is_active, deleted_at) 
      WHERE deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop composite indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_schedules_service_date_deleted;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_schedules_date_deleted;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_services_church_day_time_deleted;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_attendances_schedule_checked_in;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_attendances_person_checked_in;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_refresh_tokens_user_revoked_expires;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_password_reset_user_used_expires;`);

    // Drop deleted_at indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_churches_deleted_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ministries_deleted_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_persons_deleted_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_deleted_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_teams_deleted_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_services_deleted_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_schedules_deleted_at;`);

    // Drop schedule planning indexes (only if tables exist)
    const hasSchedulePlanningConfigs = await queryRunner.hasTable('schedule_planning_configs');
    if (hasSchedulePlanningConfigs) {
      await queryRunner.query(`DROP INDEX IF EXISTS idx_schedule_planning_configs_church_deleted;`);
    }

    const hasTeamPlanningConfigs = await queryRunner.hasTable('team_planning_configs');
    if (hasTeamPlanningConfigs) {
      await queryRunner.query(`DROP INDEX IF EXISTS idx_team_planning_configs_team_deleted;`);
    }

    const hasSchedulePlanningTemplates = await queryRunner.hasTable('schedule_planning_templates');
    if (hasSchedulePlanningTemplates) {
      await queryRunner.query(
        `DROP INDEX IF EXISTS idx_schedule_planning_templates_church_system_deleted;`,
      );
    }

    // Drop other composite indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email_deleted;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_teams_ministry_active_deleted;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ministries_church_active_deleted;`);
  }
}
