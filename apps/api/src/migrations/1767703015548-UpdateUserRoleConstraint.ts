import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserRoleConstraint1767703015548 implements MigrationInterface {
  name = 'UpdateUserRoleConstraint1767703015548';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the old constraint
    await queryRunner.query(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_role_check;
    `);

    // Add new constraint with all valid roles from UserRole enum
    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('admin', 'pastor', 'lider_de_time', 'lider_de_equipe', 'servo'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to old constraint
    await queryRunner.query(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_role_check;
    `);

    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('admin', 'coordinator', 'leader', 'member'));
    `);
  }
}
