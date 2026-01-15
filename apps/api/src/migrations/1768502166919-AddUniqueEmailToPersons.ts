import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueEmailToPersons1768502166919 implements MigrationInterface {
  name = 'AddUniqueEmailToPersons1768502166919';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se já existe constraint unique no email
    const hasUniqueConstraint = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'persons'::regclass 
        AND contype = 'u' 
        AND conname LIKE '%email%'
      );
    `);

    if (!hasUniqueConstraint[0].exists) {
      // Criar índice único parcial (apenas para registros não deletados)
      // Isso permite múltiplos NULLs mas garante unicidade para emails não-nulos e não-deletados
      await queryRunner.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "idx_persons_email_unique" 
        ON "persons" ("email") 
        WHERE "deleted_at" IS NULL AND "email" IS NOT NULL;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_persons_email_unique";`);
  }
}
