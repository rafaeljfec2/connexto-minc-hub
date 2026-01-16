import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakePersonNameRequired1768583154405 implements MigrationInterface {
  name = 'MakePersonNameRequired1768583154405';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Primeiro, deletar registros com nome vazio ou apenas espaços em branco
    // Esses registros não devem existir no sistema
    await queryRunner.query(`
      DELETE FROM persons 
      WHERE name IS NULL OR TRIM(name) = '';
    `);

    // Verificar se já existe a constraint
    const hasConstraint = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'persons'::regclass 
        AND contype = 'c' 
        AND conname = 'check_persons_name_not_empty'
      );
    `);

    if (!hasConstraint[0].exists) {
      // Adicionar constraint CHECK para garantir que o nome não seja vazio
      await queryRunner.query(`
        ALTER TABLE persons 
        ADD CONSTRAINT check_persons_name_not_empty 
        CHECK (name IS NOT NULL AND TRIM(name) != '');
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE persons 
      DROP CONSTRAINT IF EXISTS check_persons_name_not_empty;
    `);
  }
}
