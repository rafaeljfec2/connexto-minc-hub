import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM types
    await queryRunner.query(`
      CREATE TYPE service_type AS ENUM (
        'sunday_morning',
        'sunday_evening',
        'wednesday',
        'friday',
        'special'
      );
    `);

    await queryRunner.query(`
      CREATE TYPE attendance_method AS ENUM ('qr_code', 'manual');
    `);

    // 1. Create churches table
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

    await queryRunner.query(`
      CREATE INDEX idx_churches_name ON churches(name) WHERE deleted_at IS NULL;
    `);

    // 2. Create ministries table
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

    await queryRunner.query(`
      CREATE INDEX idx_ministries_church_id ON ministries(church_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_ministries_name ON ministries(name) WHERE deleted_at IS NULL;
      CREATE INDEX idx_ministries_is_active ON ministries(is_active) WHERE deleted_at IS NULL;
    `);

    // 3. Create persons table (before users, as users reference persons)
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

    await queryRunner.query(`
      CREATE INDEX idx_persons_ministry_id ON persons(ministry_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_persons_team_id ON persons(team_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_persons_name ON persons(name) WHERE deleted_at IS NULL;
      CREATE INDEX idx_persons_email ON persons(email) WHERE deleted_at IS NULL;
    `);

    // 4. Create users table
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

    await queryRunner.query(`
      CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
      CREATE INDEX idx_users_person_id ON users(person_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
    `);

    // 5. Create teams table (now that users exists)
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

    await queryRunner.query(`
      CREATE INDEX idx_teams_ministry_id ON teams(ministry_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_teams_leader_id ON teams(leader_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_teams_name ON teams(name) WHERE deleted_at IS NULL;
      CREATE INDEX idx_teams_is_active ON teams(is_active) WHERE deleted_at IS NULL;
    `);

    // 6. Add foreign key for persons.team_id (now that teams exists)
    await queryRunner.query(`
      ALTER TABLE persons 
      ADD CONSTRAINT fk_person_team 
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
    `);

    // 7. Create team_members table
    await queryRunner.query(`
      CREATE TABLE team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT uk_team_member UNIQUE (team_id, person_id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_team_members_team_id ON team_members(team_id);
      CREATE INDEX idx_team_members_person_id ON team_members(person_id);
    `);

    // 8. Create services table
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

    await queryRunner.query(`
      CREATE INDEX idx_services_church_id ON services(church_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_services_type ON services(type) WHERE deleted_at IS NULL;
      CREATE INDEX idx_services_day_of_week ON services(day_of_week) WHERE deleted_at IS NULL;
      CREATE INDEX idx_services_is_active ON services(is_active) WHERE deleted_at IS NULL;
    `);

    // 9. Create schedules table
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

    await queryRunner.query(`
      CREATE INDEX idx_schedules_service_id ON schedules(service_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_schedules_date ON schedules(date) WHERE deleted_at IS NULL;
      CREATE UNIQUE INDEX uk_schedule_service_date ON schedules(service_id, date) WHERE deleted_at IS NULL;
    `);

    // 10. Create schedule_teams table
    await queryRunner.query(`
      CREATE TABLE schedule_teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT uk_schedule_team UNIQUE (schedule_id, team_id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_schedule_teams_schedule_id ON schedule_teams(schedule_id);
      CREATE INDEX idx_schedule_teams_team_id ON schedule_teams(team_id);
    `);

    // 11. Create attendances table
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

    await queryRunner.query(`
      CREATE INDEX idx_attendances_schedule_id ON attendances(schedule_id);
      CREATE INDEX idx_attendances_person_id ON attendances(person_id);
      CREATE INDEX idx_attendances_checked_in_by ON attendances(checked_in_by);
      CREATE INDEX idx_attendances_checked_in_at ON attendances(checked_in_at);
      CREATE INDEX idx_attendances_method ON attendances(method);
    `);

    // 12. Create refresh_tokens table
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

    await queryRunner.query(`
      CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
      CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
    `);

    // 13. Create password_reset_tokens table
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

    await queryRunner.query(`
      CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
      CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
      CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
    `);

    // Create trigger function for updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

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
      await queryRunner.query(`
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
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
