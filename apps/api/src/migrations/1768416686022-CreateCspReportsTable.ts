import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCspReportsTable1768416686022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('csp_reports');
    if (hasTable) {
      return;
    }

    await queryRunner.query(`
      CREATE TABLE csp_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_uri TEXT,
        referrer TEXT,
        violated_directive VARCHAR(255),
        effective_directive VARCHAR(255),
        original_policy TEXT,
        blocked_uri TEXT,
        source_file TEXT,
        line_number INTEGER,
        column_number INTEGER,
        status_code INTEGER,
        script_sample TEXT,
        is_critical BOOLEAN NOT NULL DEFAULT false,
        raw_report JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_csp_reports_created_at 
      ON csp_reports(created_at);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_csp_reports_violated_directive 
      ON csp_reports(violated_directive);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_csp_reports_is_critical 
      ON csp_reports(is_critical);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_csp_reports_created_at_critical 
      ON csp_reports(created_at, is_critical);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS csp_reports CASCADE;`);
  }
}
