import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

export enum AccessCodeScopeType {
  CHURCH = 'church',
  MINISTRY = 'ministry',
  TEAM = 'team',
}

@Entity('access_codes')
@Index(['code'], { unique: true })
@Index(['scopeType', 'scopeId'])
@Index(['expiresAt'])
@Index(['isActive'])
@Index(['createdById'])
export class AccessCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: AccessCodeScopeType,
    name: 'scope_type',
  })
  scopeType: AccessCodeScopeType;

  @Column({ type: 'uuid', name: 'scope_id' })
  scopeId: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'uuid', name: 'created_by_id' })
  createdById: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: UserEntity;

  @Column({ type: 'int', default: 0, name: 'usage_count' })
  usageCount: number;

  @Column({ type: 'int', nullable: true, name: 'max_usages' })
  maxUsages: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
