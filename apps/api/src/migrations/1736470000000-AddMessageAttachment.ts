import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessageAttachment1736470000000 implements MigrationInterface {
  name = 'AddMessageAttachment1736470000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "messages" 
      ADD COLUMN IF NOT EXISTS "attachment_url" varchar NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "messages" 
      ADD COLUMN IF NOT EXISTS "attachment_name" varchar NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "messages" 
      ADD COLUMN IF NOT EXISTS "attachment_type" varchar NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "messages" 
      ADD COLUMN IF NOT EXISTS "attachment_size" integer NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "messages" DROP COLUMN IF EXISTS "attachment_size"
    `);

    await queryRunner.query(`
      ALTER TABLE "messages" DROP COLUMN IF EXISTS "attachment_type"
    `);

    await queryRunner.query(`
      ALTER TABLE "messages" DROP COLUMN IF EXISTS "attachment_name"
    `);

    await queryRunner.query(`
      ALTER TABLE "messages" DROP COLUMN IF EXISTS "attachment_url"
    `);
  }
}
