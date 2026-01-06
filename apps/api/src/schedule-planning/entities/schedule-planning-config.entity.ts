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
  Unique,
} from 'typeorm';
import { ChurchEntity } from '../../churches/entities/church.entity';

@Entity('schedule_planning_configs')
@Unique(['churchId'])
@Index(['churchId'], { where: '"deleted_at" IS NULL' })
export class SchedulePlanningConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'church_id' })
  churchId: string;

  @ManyToOne(() => ChurchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'church_id' })
  church: ChurchEntity;

  @Column({ type: 'integer', default: 10, name: 'max_team_members' })
  maxTeamMembers: number;

  @Column({ type: 'integer', default: 4, name: 'services_per_sunday' })
  servicesPerSunday: number;

  @Column({ type: 'boolean', default: true, name: 'teams_serve_once_per_month' })
  teamsServeOncePerMonth: boolean;

  @Column({ type: 'boolean', default: true, name: 'enable_lottery_for_extra_services' })
  enableLotteryForExtraServices: boolean;

  @Column({ type: 'boolean', default: true, name: 'enable_time_rotation' })
  enableTimeRotation: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
