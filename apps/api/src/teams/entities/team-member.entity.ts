import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { TeamEntity } from './team.entity';
import { PersonEntity } from '../../persons/entities/person.entity';

export enum MemberType {
  FIXED = 'fixed',
  EVENTUAL = 'eventual',
}

export enum TeamMemberRole {
  LIDER_DE_EQUIPE = 'lider_de_equipe',
  MEMBRO = 'membro',
}

@Entity('team_members')
@Unique(['teamId', 'personId'])
@Index(['teamId'])
@Index(['personId'])
@Index(['memberType'])
export class TeamMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'team_id' })
  teamId: string;

  @ManyToOne(() => TeamEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: TeamEntity;

  @Column({ type: 'uuid', name: 'person_id' })
  personId: string;

  @ManyToOne(() => PersonEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person: PersonEntity;

  @Column({
    type: 'enum',
    enum: MemberType,
    name: 'member_type',
    default: MemberType.FIXED,
  })
  memberType: MemberType;

  @Column({
    type: 'enum',
    enum: TeamMemberRole,
    default: TeamMemberRole.MEMBRO,
  })
  role: TeamMemberRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
