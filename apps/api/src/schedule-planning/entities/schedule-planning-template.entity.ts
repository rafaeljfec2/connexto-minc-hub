import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChurchEntity } from '../../churches/entities/church.entity';

@Entity('schedule_planning_templates')
@Index(['isSystemTemplate'], { where: '"deleted_at" IS NULL' })
@Index(['createdByChurchId'], { where: '"deleted_at" IS NULL' })
export class SchedulePlanningTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: false, name: 'is_system_template' })
  isSystemTemplate: boolean;

  @Column({ type: 'uuid', nullable: true, name: 'created_by_church_id' })
  createdByChurchId: string | null;

  @ManyToOne(() => ChurchEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_church_id' })
  createdByChurch: ChurchEntity | null;

  @Column({ type: 'integer', name: 'max_team_members' })
  maxTeamMembers: number;

  @Column({ type: 'integer', name: 'services_per_sunday' })
  servicesPerSunday: number;

  @Column({ type: 'boolean', name: 'teams_serve_once_per_month' })
  teamsServeOncePerMonth: boolean;

  @Column({ type: 'boolean', name: 'enable_lottery_for_extra_services' })
  enableLotteryForExtraServices: boolean;

  @Column({ type: 'boolean', name: 'enable_time_rotation' })
  enableTimeRotation: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
