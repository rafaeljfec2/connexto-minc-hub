import { MigrationInterface, QueryRunner } from 'typeorm';

export class SimplifyUserRoles1768823229239 implements MigrationInterface {
  name = 'SimplifyUserRoles1768823229239';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Note: TeamMember.role will be added in next migration
    // This migration only migrates User.role

    // Update all LIDER_DE_TIME and LIDER_DE_EQUIPE to SERVO
    await queryRunner.query(`
      UPDATE users 
      SET role = 'servo'
      WHERE role IN ('lider_de_time', 'lider_de_equipe')
        AND deleted_at IS NULL;
    `);

    // Drop old constraint
    await queryRunner.query(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_role_check;
    `);

    // Add new constraint with simplified roles
    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('admin', 'pastor', 'servo'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop new constraint
    await queryRunner.query(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_role_check;
    `);

    // Restore old constraint
    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('admin', 'pastor', 'lider_de_time', 'lider_de_equipe', 'servo'));
    `);

    // Note: Cannot restore original roles without additional data
    // Users will remain as 'servo'
  }
}
