import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToTeamMembers1768825640060 implements MigrationInterface {
  name = 'AddRoleToTeamMembers1768825640060';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for team_member_role
    const enumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'team_member_role'
      );
    `);

    if (!enumExists[0].exists) {
      await queryRunner.query(`
        CREATE TYPE team_member_role AS ENUM ('lider_de_equipe', 'membro');
      `);
    }

    // Check if column already exists
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' AND column_name = 'role'
      );
    `);

    if (!columnExists[0].exists) {
      // Add column with default value
      await queryRunner.query(`
        ALTER TABLE team_members 
        ADD COLUMN role team_member_role NOT NULL DEFAULT 'membro';
      `);

      // Populate role based on team.leader_id
      // If personId matches team.leaderId, set role to LIDER_DE_EQUIPE
      await queryRunner.query(`
        UPDATE team_members tm
        SET role = 'lider_de_equipe'::team_member_role
        FROM teams t
        WHERE tm.team_id = t.id
          AND t.leader_id IS NOT NULL
          AND tm.person_id IN (
            SELECT u.person_id 
            FROM users u 
            WHERE u.id = t.leader_id AND u.person_id IS NOT NULL
          );
      `);

      // Create index on role for better query performance
      const indexExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE indexname = 'idx_team_members_role'
        );
      `);

      if (!indexExists[0].exists) {
        await queryRunner.query(`
          CREATE INDEX idx_team_members_role ON team_members(role);
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX IF EXISTS idx_team_members_role;`);

    // Drop column
    await queryRunner.query(`
      ALTER TABLE team_members DROP COLUMN IF EXISTS role;
    `);

    // Drop enum type
    await queryRunner.query(`DROP TYPE IF EXISTS team_member_role;`);
  }
}
