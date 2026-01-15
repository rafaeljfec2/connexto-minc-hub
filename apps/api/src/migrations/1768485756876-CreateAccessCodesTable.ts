import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccessCodesTable1768485756876 implements MigrationInterface {
  name = 'CreateAccessCodesTable1768485756876';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('access_codes');
    if (hasTable) {
      return;
    }

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "access_codes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" varchar(50) NOT NULL UNIQUE,
        "scope_type" varchar(20) NOT NULL,
        "scope_id" uuid NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_by_id" uuid NOT NULL,
        "usage_count" integer NOT NULL DEFAULT 0,
        "max_usages" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_access_code_created_by" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_access_codes_code" ON "access_codes" ("code");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_access_codes_scope_type_scope_id" 
      ON "access_codes" ("scope_type", "scope_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_access_codes_expires_at" 
      ON "access_codes" ("expires_at");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_access_codes_is_active" 
      ON "access_codes" ("is_active");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_access_codes_created_by_id" 
      ON "access_codes" ("created_by_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_access_codes_created_by_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_access_codes_is_active";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_access_codes_expires_at";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_access_codes_scope_type_scope_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_access_codes_code";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "access_codes" CASCADE;`);
  }
}
