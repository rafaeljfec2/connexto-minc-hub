import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM types (only if they don't exist)
    const serviceTypeExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'service_type'
      );
    `);
    if (!serviceTypeExists[0].exists) {
      await queryRunner.query(`
        CREATE TYPE service_type AS ENUM (
          'sunday_morning',
          'sunday_evening',
          'wednesday',
          'friday',
          'special'
        );
      `);
    }

    const attendanceMethodExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'attendance_method'
      );
    `);
    if (!attendanceMethodExists[0].exists) {
      await queryRunner.query(`
        CREATE TYPE attendance_method AS ENUM ('qr_code', 'manual');
      `);
    }

    // 1. Create churches table
    const hasChurchesTable = await queryRunner.hasTable('churches');
    if (!hasChurchesTable) {
      await queryRunner.query(`
        CREATE TABLE churches (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          address TEXT,
          phone VARCHAR(20),
          email VARCHAR(255),
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMP
        );
      `);
    }

    const hasChurchesNameIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_churches_name'
      );
    `);
    if (!hasChurchesNameIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_churches_name ON churches(name) WHERE deleted_at IS NULL;
      `);
    }

    // 2. Create ministries table
    const hasMinistriesTable = await queryRunner.hasTable('ministries');
    if (!hasMinistriesTable) {
      await queryRunner.query(`
        CREATE TABLE ministries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMP
        );
      `);
    }

    const hasMinistriesChurchIdIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_ministries_church_id'
      );
    `);
    if (!hasMinistriesChurchIdIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_ministries_church_id ON ministries(church_id) WHERE deleted_at IS NULL;
      `);
    }
    const hasMinistriesNameIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_ministries_name'
      );
    `);
    if (!hasMinistriesNameIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_ministries_name ON ministries(name) WHERE deleted_at IS NULL;
      `);
    }
    const hasMinistriesIsActiveIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_ministries_is_active'
      );
    `);
    if (!hasMinistriesIsActiveIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_ministries_is_active ON ministries(is_active) WHERE deleted_at IS NULL;
      `);
    }

    // 3. Create persons table (before users, as users reference persons)
    const hasPersonsTable = await queryRunner.hasTable('persons');
    if (!hasPersonsTable) {
      await queryRunner.query(`
        CREATE TABLE persons (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          ministry_id UUID REFERENCES ministries(id) ON DELETE SET NULL,
          team_id UUID,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(20),
          birth_date DATE,
          address TEXT,
          notes TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMP
        );
      `);
    }

    const hasPersonsMinistryIdIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_persons_ministry_id'
      );
    `);
    if (!hasPersonsMinistryIdIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_persons_ministry_id ON persons(ministry_id) WHERE deleted_at IS NULL;
      `);
    }
    const hasPersonsTeamIdIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_persons_team_id'
      );
    `);
    if (!hasPersonsTeamIdIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_persons_team_id ON persons(team_id) WHERE deleted_at IS NULL;
      `);
    }
    const hasPersonsNameIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_persons_name'
      );
    `);
    if (!hasPersonsNameIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_persons_name ON persons(name) WHERE deleted_at IS NULL;
      `);
    }
    const hasPersonsEmailIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_persons_email'
      );
    `);
    if (!hasPersonsEmailIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_persons_email ON persons(email) WHERE deleted_at IS NULL;
      `);
    }

    // 4. Create users table
    const hasUsersTable = await queryRunner.hasTable('users');
    if (!hasUsersTable) {
      await queryRunner.query(`
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          person_id UUID REFERENCES persons(id) ON DELETE SET NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'coordinator', 'leader', 'member')),
          is_active BOOLEAN NOT NULL DEFAULT true,
          last_login_at TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMP
        );
      `);
    }

    const hasUsersEmailIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_users_email'
      );
    `);
    if (!hasUsersEmailIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
      `);
    }
    const hasUsersPersonIdIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_users_person_id'
      );
    `);
    if (!hasUsersPersonIdIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_users_person_id ON users(person_id) WHERE deleted_at IS NULL;
      `);
    }
    const hasUsersRoleIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_users_role'
      );
    `);
    if (!hasUsersRoleIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
      `);
    }

    // 5. Create teams table (now that users exists)
    const hasTeamsTable = await queryRunner.hasTable('teams');
    if (!hasTeamsTable) {
      await queryRunner.query(`
        CREATE TABLE teams (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
          leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMP
        );
      `);
    }

    const hasTeamsMinistryIdIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_teams_ministry_id'
      );
    `);
    if (!hasTeamsMinistryIdIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_teams_ministry_id ON teams(ministry_id) WHERE deleted_at IS NULL;
      `);
    }
    const hasTeamsLeaderIdIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_teams_leader_id'
      );
    `);
    if (!hasTeamsLeaderIdIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_teams_leader_id ON teams(leader_id) WHERE deleted_at IS NULL;
      `);
    }
    const hasTeamsNameIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_teams_name'
      );
    `);
    if (!hasTeamsNameIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_teams_name ON teams(name) WHERE deleted_at IS NULL;
      `);
    }
    const hasTeamsIsActiveIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_teams_is_active'
      );
    `);
    if (!hasTeamsIsActiveIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_teams_is_active ON teams(is_active) WHERE deleted_at IS NULL;
      `);
    }

    // 6. Add foreign key for persons.team_id (now that teams exists)
    const hasFkPersonTeam = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_person_team'
      );
    `);
    if (!hasFkPersonTeam[0].exists) {
      await queryRunner.query(`
        ALTER TABLE persons 
        ADD CONSTRAINT fk_person_team 
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
      `);
    }

    // 7. Create team_members table
    const hasTeamMembersTable = await queryRunner.hasTable('team_members');
    if (!hasTeamMembersTable) {
      await queryRunner.query(`
        CREATE TABLE team_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
          person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          CONSTRAINT uk_team_member UNIQUE (team_id, person_id)
        );
      `);
    }

    const hasTeamMembersTeamIdIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_team_members_team_id'
      );
    `);
    if (!hasTeamMembersTeamIdIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_team_members_team_id ON team_members(team_id);
      `);
    }
    const hasTeamMembersPersonIdIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_team_members_person_id'
      );
    `);
    if (!hasTeamMembersPersonIdIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_team_members_person_id ON team_members(person_id);
      `);
    }

    // 8. Create services table
    const hasServicesTable = await queryRunner.hasTable('services');
    if (!hasServicesTable) {
      await queryRunner.query(`
        CREATE TABLE services (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
          type service_type NOT NULL,
          day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
          time TIME NOT NULL,
          name VARCHAR(255) NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMP
        );
      `);
    }

    const hasServicesChurchIdIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_services_church_id'
      );
    `);
    if (!hasServicesChurchIdIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_services_church_id ON services(church_id) WHERE deleted_at IS NULL;
      `);
    }
    const hasServicesTypeIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_services_type'
      );
    `);
    if (!hasServicesTypeIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_services_type ON services(type) WHERE deleted_at IS NULL;
      `);
    }
    const hasServicesDayOfWeekIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_services_day_of_week'
      );
    `);
    if (!hasServicesDayOfWeekIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_services_day_of_week ON services(day_of_week) WHERE deleted_at IS NULL;
      `);
    }
    const hasServicesIsActiveIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_services_is_active'
      );
    `);
    if (!hasServicesIsActiveIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_services_is_active ON services(is_active) WHERE deleted_at IS NULL;
      `);
    }

    // 9. Create schedules table
    const hasSchedulesTable = await queryRunner.hasTable('schedules');
    if (!hasSchedulesTable) {
      await queryRunner.query(`
        CREATE TABLE schedules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMP
        );
      `);
    }

    const hasSchedulesServiceIdIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_schedules_service_id'
      );
    `);
    if (!hasSchedulesServiceIdIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_schedules_service_id ON schedules(service_id) WHERE deleted_at IS NULL;
      `);
    }
    const hasSchedulesDateIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_schedules_date'
      );
    `);
    if (!hasSchedulesDateIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_schedules_date ON schedules(date) WHERE deleted_at IS NULL;
      `);
    }
    const hasUkScheduleServiceDate = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'uk_schedule_service_date'
      );
    `);
    if (!hasUkScheduleServiceDate[0].exists) {
      await queryRunner.query(`
        CREATE UNIQUE INDEX uk_schedule_service_date ON schedules(service_id, date) WHERE deleted_at IS NULL;
      `);
    }

    // 10. Create schedule_teams table
    const hasScheduleTeamsTable = await queryRunner.hasTable('schedule_teams');
    if (!hasScheduleTeamsTable) {
      await queryRunner.query(`
        CREATE TABLE schedule_teams (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
          team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          CONSTRAINT uk_schedule_team UNIQUE (schedule_id, team_id)
        );
      `);
    }

    const hasScheduleTeamsScheduleIdIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_schedule_teams_schedule_id'
      );
    `);
    if (!hasScheduleTeamsScheduleIdIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_schedule_teams_schedule_id ON schedule_teams(schedule_id);
      `);
    }
    const hasScheduleTeamsTeamIdIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_schedule_teams_team_id'
      );
    `);
    if (!hasScheduleTeamsTeamIdIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_schedule_teams_team_id ON schedule_teams(team_id);
      `);
    }

    // 11. Create attendances table
    const hasAttendancesTable = await queryRunner.hasTable('attendances');
    if (!hasAttendancesTable) {
      await queryRunner.query(`
        CREATE TABLE attendances (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
          person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
          checked_in_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          checked_in_at TIMESTAMP NOT NULL DEFAULT NOW(),
          method attendance_method NOT NULL,
          qr_code_data JSONB,
          absence_reason TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          CONSTRAINT uk_attendance_schedule_person UNIQUE (schedule_id, person_id)
        );
      `);
    }

    const hasAttendancesScheduleIdIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_attendances_schedule_id'
      );
    `);
    if (!hasAttendancesScheduleIdIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_attendances_schedule_id ON attendances(schedule_id);
      `);
    }
    const hasAttendancesPersonIdIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_attendances_person_id'
      );
    `);
    if (!hasAttendancesPersonIdIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_attendances_person_id ON attendances(person_id);
      `);
    }
    const hasAttendancesCheckedInByIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_attendances_checked_in_by'
      );
    `);
    if (!hasAttendancesCheckedInByIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_attendances_checked_in_by ON attendances(checked_in_by);
      `);
    }
    const hasAttendancesCheckedInAtIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_attendances_checked_in_at'
      );
    `);
    if (!hasAttendancesCheckedInAtIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_attendances_checked_in_at ON attendances(checked_in_at);
      `);
    }
    const hasAttendancesMethodIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_attendances_method'
      );
    `);
    if (!hasAttendancesMethodIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_attendances_method ON attendances(method);
      `);
    }

    // 12. Create refresh_tokens table
    const hasRefreshTokensTable = await queryRunner.hasTable('refresh_tokens');
    if (!hasRefreshTokensTable) {
      await queryRunner.query(`
        CREATE TABLE refresh_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(500) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          is_revoked BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
    }

    const hasRefreshTokensUserIdIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_refresh_tokens_user_id'
      );
    `);
    if (!hasRefreshTokensUserIdIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      `);
    }
    const hasRefreshTokensTokenIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_refresh_tokens_token'
      );
    `);
    if (!hasRefreshTokensTokenIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
      `);
    }
    const hasRefreshTokensExpiresAtIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_refresh_tokens_expires_at'
      );
    `);
    if (!hasRefreshTokensExpiresAtIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
      `);
    }

    // 13. Create password_reset_tokens table
    const hasPasswordResetTokensTable = await queryRunner.hasTable('password_reset_tokens');
    if (!hasPasswordResetTokensTable) {
      await queryRunner.query(`
        CREATE TABLE password_reset_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          used_at TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
    }

    const hasPasswordResetTokensUserIdIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_password_reset_tokens_user_id'
      );
    `);
    if (!hasPasswordResetTokensUserIdIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
      `);
    }
    const hasPasswordResetTokensTokenIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_password_reset_tokens_token'
      );
    `);
    if (!hasPasswordResetTokensTokenIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
      `);
    }
    const hasPasswordResetTokensExpiresAtIndex = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_password_reset_tokens_expires_at'
      );
    `);
    if (!hasPasswordResetTokensExpiresAtIndex[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
      `);
    }

    // Create trigger function for updated_at
    const hasUpdateUpdatedAtFunction = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_updated_at_column'
      );
    `);
    if (!hasUpdateUpdatedAtFunction[0].exists) {
      await queryRunner.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);
    }

    // Create triggers for updated_at
    const tablesWithUpdatedAt = [
      'churches',
      'ministries',
      'persons',
      'users',
      'teams',
      'services',
      'schedules',
      'attendances',
    ];

    for (const table of tablesWithUpdatedAt) {
      const hasTable = await queryRunner.hasTable(table);
      if (hasTable) {
        const hasTrigger = await queryRunner.query(`
          SELECT EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'update_${table}_updated_at'
          );
        `);
        if (!hasTrigger[0].exists) {
          await queryRunner.query(`
            CREATE TRIGGER update_${table}_updated_at
              BEFORE UPDATE ON ${table}
              FOR EACH ROW
              EXECUTE FUNCTION update_updated_at_column();
          `);
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    const tablesWithUpdatedAt = [
      'churches',
      'ministries',
      'persons',
      'users',
      'teams',
      'services',
      'schedules',
      'attendances',
    ];

    for (const table of tablesWithUpdatedAt) {
      await queryRunner.query(`DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};`);
    }

    // Drop function
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column();`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS password_reset_tokens;`);
    await queryRunner.query(`DROP TABLE IF EXISTS refresh_tokens;`);
    await queryRunner.query(`DROP TABLE IF EXISTS attendances;`);
    await queryRunner.query(`DROP TABLE IF EXISTS schedule_teams;`);
    await queryRunner.query(`DROP TABLE IF EXISTS schedules;`);
    await queryRunner.query(`DROP TABLE IF EXISTS services;`);
    await queryRunner.query(`DROP TABLE IF EXISTS team_members;`);
    await queryRunner.query(`DROP TABLE IF EXISTS teams;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
    await queryRunner.query(`DROP TABLE IF EXISTS persons;`);
    await queryRunner.query(`DROP TABLE IF EXISTS ministries;`);
    await queryRunner.query(`DROP TABLE IF EXISTS churches;`);

    // Drop ENUM types
    await queryRunner.query(`DROP TYPE IF EXISTS attendance_method;`);
    await queryRunner.query(`DROP TYPE IF EXISTS service_type;`);
  }
}
