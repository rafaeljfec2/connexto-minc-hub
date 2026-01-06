import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMemberTypeToTeamMembers1767707946000 implements MigrationInterface {
  name = 'AddMemberTypeToTeamMembers1767707946000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if enum type already exists
    const enumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'member_type'
      );
    `);

    if (!enumExists[0].exists) {
      // Create enum type
      await queryRunner.query(`
        CREATE TYPE member_type AS ENUM ('fixed', 'eventual');
      `);
    }

    // Check if column already exists
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' AND column_name = 'member_type'
      );
    `);

    if (!columnExists[0].exists) {
      // Add column with default value
      await queryRunner.query(`
        ALTER TABLE team_members 
        ADD COLUMN member_type member_type NOT NULL DEFAULT 'fixed';
      `);

      // Update existing records to have 'fixed' as default (already done by DEFAULT)
      // But we can explicitly set it to be safe
      await queryRunner.query(`
        UPDATE team_members 
        SET member_type = 'fixed' 
        WHERE member_type IS NULL;
      `);
    }

    // Create index on member_type for better query performance
    const indexExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_team_members_member_type'
      );
    `);

    if (!indexExists[0].exists) {
      await queryRunner.query(`
        CREATE INDEX idx_team_members_member_type ON team_members(member_type);
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    const indexExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_team_members_member_type'
      );
    `);

    if (indexExists[0].exists) {
      await queryRunner.query(`
        DROP INDEX IF EXISTS idx_team_members_member_type;
      `);
    }

    // Drop column
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' AND column_name = 'member_type'
      );
    `);

    if (columnExists[0].exists) {
      await queryRunner.query(`
        ALTER TABLE team_members DROP COLUMN member_type;
      `);
    }

    // Drop enum type (only if no other tables use it)
    const enumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'member_type'
      );
    `);

    if (enumExists[0].exists) {
      // Check if any other columns use this enum
      const enumInUse = await queryRunner.query(`
        SELECT COUNT(*) as count
        FROM information_schema.columns
        WHERE udt_name = 'member_type';
      `);

      if (enumInUse[0].count === '0') {
        await queryRunner.query(`
          DROP TYPE IF EXISTS member_type;
        `);
      }
    }
  }
}
