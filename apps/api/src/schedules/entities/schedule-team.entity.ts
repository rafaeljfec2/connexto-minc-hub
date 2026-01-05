import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ScheduleEntity } from './schedule.entity';
import { TeamEntity } from '../../teams/entities/team.entity';

@Entity('schedule_teams')
@Unique(['scheduleId', 'teamId'])
@Index(['scheduleId'])
@Index(['teamId'])
export class ScheduleTeamEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'schedule_id' })
  scheduleId: string;

  @ManyToOne(() => ScheduleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schedule_id' })
  schedule: ScheduleEntity;

  @Column({ type: 'uuid', name: 'team_id' })
  teamId: string;

  @ManyToOne(() => TeamEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: TeamEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
