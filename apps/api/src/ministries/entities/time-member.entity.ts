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
import { MinistryEntity } from './ministry.entity';
import { PersonEntity } from '../../persons/entities/person.entity';

export enum TimeMemberRole {
  LIDER_DE_TIME = 'lider_de_time',
}

@Entity('time_members')
@Unique(['ministryId', 'personId'])
@Index(['ministryId'])
@Index(['personId'])
@Index(['role'])
export class TimeMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'ministry_id' })
  ministryId: string;

  @ManyToOne(() => MinistryEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ministry_id' })
  ministry: MinistryEntity;

  @Column({ type: 'uuid', name: 'person_id' })
  personId: string;

  @ManyToOne(() => PersonEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person: PersonEntity;

  @Column({
    type: 'enum',
    enum: TimeMemberRole,
    default: TimeMemberRole.LIDER_DE_TIME,
  })
  role: TimeMemberRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
