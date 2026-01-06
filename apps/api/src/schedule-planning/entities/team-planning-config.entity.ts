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
import { TeamEntity } from '../../teams/entities/team.entity';

@Entity('team_planning_configs')
@Unique(['teamId'])
@Index(['teamId'], { where: '"deleted_at" IS NULL' })
export class TeamPlanningConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'team_id' })
  teamId: string;

  @ManyToOne(() => TeamEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: TeamEntity;

  @Column({ type: 'integer', nullable: true, name: 'max_team_members' })
  maxTeamMembers: number | null;

  @Column({ type: 'boolean', nullable: true, name: 'teams_serve_once_per_month' })
  teamsServeOncePerMonth: boolean | null;

  @Column({ type: 'boolean', nullable: true, name: 'enable_lottery_for_extra_services' })
  enableLotteryForExtraServices: boolean | null;

  @Column({ type: 'boolean', nullable: true, name: 'enable_time_rotation' })
  enableTimeRotation: boolean | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
