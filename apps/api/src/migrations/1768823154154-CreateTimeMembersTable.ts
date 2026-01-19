import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTimeMembersTable1768823154154 implements MigrationInterface {
  name = 'CreateTimeMembersTable1768823154154';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for time_member_role
    const enumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'time_member_role'
      );
    `);

    if (!enumExists[0].exists) {
      await queryRunner.query(`
        CREATE TYPE time_member_role AS ENUM ('lider_de_time');
      `);
    }

    // Create time_members table
    await queryRunner.query(`
      CREATE TABLE time_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ministry_id UUID NOT NULL,
        person_id UUID NOT NULL,
        role time_member_role NOT NULL DEFAULT 'lider_de_time',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        
        CONSTRAINT fk_time_member_ministry FOREIGN KEY (ministry_id) 
          REFERENCES ministries(id) ON DELETE CASCADE,
        CONSTRAINT fk_time_member_person FOREIGN KEY (person_id) 
          REFERENCES persons(id) ON DELETE CASCADE,
        CONSTRAINT uk_time_member UNIQUE (ministry_id, person_id)
      );
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX idx_time_members_ministry_id ON time_members(ministry_id);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_time_members_person_id ON time_members(person_id);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_time_members_role ON time_members(role);
    `);

    // Populate time_members with existing data
    // Find users with LIDER_DE_TIME role and their associated persons with ministry
    await queryRunner.query(`
      INSERT INTO time_members (ministry_id, person_id, role)
      SELECT DISTINCT
        p.ministry_id,
        p.id as person_id,
        'lider_de_time'::time_member_role
      FROM persons p
      INNER JOIN users u ON u.person_id = p.id
      WHERE u.role = 'lider_de_time'
        AND p.ministry_id IS NOT NULL
        AND u.deleted_at IS NULL
        AND p.deleted_at IS NULL
      ON CONFLICT (ministry_id, person_id) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_time_members_role;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_time_members_person_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_time_members_ministry_id;`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS time_members;`);

    // Drop enum type
    await queryRunner.query(`DROP TYPE IF EXISTS time_member_role;`);
  }
}
