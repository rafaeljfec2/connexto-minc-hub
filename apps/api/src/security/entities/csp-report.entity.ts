import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('csp_reports')
@Index(['createdAt'])
@Index(['violatedDirective'])
@Index(['isCritical'])
@Index(['createdAt', 'isCritical'])
export class CspReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true, name: 'document_uri' })
  documentUri?: string;

  @Column({ type: 'text', nullable: true })
  referrer?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'violated_directive' })
  violatedDirective?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'effective_directive' })
  effectiveDirective?: string;

  @Column({ type: 'text', nullable: true, name: 'original_policy' })
  originalPolicy?: string;

  @Column({ type: 'text', nullable: true, name: 'blocked_uri' })
  blockedUri?: string;

  @Column({ type: 'text', nullable: true, name: 'source_file' })
  sourceFile?: string;

  @Column({ type: 'integer', nullable: true, name: 'line_number' })
  lineNumber?: number;

  @Column({ type: 'integer', nullable: true, name: 'column_number' })
  columnNumber?: number;

  @Column({ type: 'integer', nullable: true, name: 'status_code' })
  statusCode?: number;

  @Column({ type: 'text', nullable: true, name: 'script_sample' })
  scriptSample?: string;

  @Column({ type: 'boolean', default: false, name: 'is_critical' })
  isCritical: boolean;

  @Column({ type: 'jsonb', nullable: true, name: 'raw_report' })
  rawReport?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
