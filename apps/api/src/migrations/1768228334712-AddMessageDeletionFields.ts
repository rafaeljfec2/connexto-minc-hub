import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessageDeletionFields1768228334712 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS deleted_for_everyone BOOLEAN NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS deleted_by TEXT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE messages 
      DROP COLUMN IF EXISTS deleted_for_everyone
    `);

    await queryRunner.query(`
      ALTER TABLE messages 
      DROP COLUMN IF EXISTS deleted_by
    `);
  }
}
