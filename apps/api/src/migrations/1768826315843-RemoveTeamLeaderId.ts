import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTeamLeaderId1768826315843 implements MigrationInterface {
  name = 'RemoveTeamLeaderId1768826315843';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Before removing leader_id, ensure all leaders are represented in team_members
    // Create TeamMember with role=LIDER_DE_EQUIPE for any leader_id that doesn't have a team_member entry
    await queryRunner.query(`
      INSERT INTO team_members (team_id, person_id, member_type, role)
      SELECT DISTINCT
        t.id as team_id,
        u.person_id,
        'fixed'::team_members_member_type_enum,
        'lider_de_equipe'::team_member_role
      FROM teams t
      INNER JOIN users u ON u.id = t.leader_id
      WHERE t.leader_id IS NOT NULL
        AND u.person_id IS NOT NULL
        AND t.deleted_at IS NULL
        AND u.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM team_members tm 
          WHERE tm.team_id = t.id 
            AND tm.person_id = u.person_id
        )
      ON CONFLICT (team_id, person_id) DO UPDATE SET role = 'lider_de_equipe'::team_member_role;
    `);

    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE teams DROP CONSTRAINT IF EXISTS fk_team_leader;
    `);

    // Drop index
    await queryRunner.query(`DROP INDEX IF EXISTS idx_teams_leader_id;`);

    // Drop column
    await queryRunner.query(`
      ALTER TABLE teams DROP COLUMN IF EXISTS leader_id;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add column back
    await queryRunner.query(`
      ALTER TABLE teams ADD COLUMN leader_id UUID;
    `);

    // Restore foreign key constraint
    await queryRunner.query(`
      ALTER TABLE teams 
      ADD CONSTRAINT fk_team_leader 
      FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE SET NULL;
    `);

    // Restore index
    await queryRunner.query(`
      CREATE INDEX idx_teams_leader_id ON teams(leader_id) WHERE deleted_at IS NULL;
    `);

    // Try to restore leader_id from team_members (pick first LIDER_DE_EQUIPE)
    await queryRunner.query(`
      UPDATE teams t
      SET leader_id = (
        SELECT u.id
        FROM team_members tm
        INNER JOIN users u ON u.person_id = tm.person_id
        WHERE tm.team_id = t.id
          AND tm.role = 'lider_de_equipe'
          AND u.deleted_at IS NULL
        LIMIT 1
      )
      WHERE EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = t.id AND tm.role = 'lider_de_equipe'
      );
    `);
  }
}
