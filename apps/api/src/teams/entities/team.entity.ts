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
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { MinistryEntity } from '../../ministries/entities/ministry.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { PersonEntity } from '../../persons/entities/person.entity';
import { TeamMemberEntity } from './team-member.entity';
import { ScheduleTeamEntity } from '../../schedules/entities/schedule-team.entity';

@Entity('teams')
@Index(['ministryId'], { where: '"deleted_at" IS NULL' })
@Index(['leaderId'], { where: '"deleted_at" IS NULL' })
@Index(['name'], { where: '"deleted_at" IS NULL' })
@Index(['isActive'], { where: '"deleted_at" IS NULL' })
export class TeamEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'ministry_id' })
  ministryId: string;

  @ManyToOne(() => MinistryEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ministry_id' })
  ministry: MinistryEntity;

  @Column({ type: 'uuid', nullable: true, name: 'leader_id' })
  leaderId: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'leader_id' })
  leader: UserEntity | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => TeamMemberEntity, (teamMember) => teamMember.team)
  teamMembers: TeamMemberEntity[];

  @OneToMany(() => ScheduleTeamEntity, (scheduleTeam) => scheduleTeam.team)
  scheduleTeams: ScheduleTeamEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
