import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { TeamEntity } from './team.entity';
import { PersonEntity } from '../../persons/entities/person.entity';

@Entity('team_members')
@Unique(['teamId', 'personId'])
@Index(['teamId'])
@Index(['personId'])
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
