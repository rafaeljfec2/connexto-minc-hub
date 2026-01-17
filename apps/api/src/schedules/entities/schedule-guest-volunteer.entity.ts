import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ScheduleEntity } from './schedule.entity';
import { PersonEntity } from '../../persons/entities/person.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('schedule_guest_volunteers')
@Unique(['scheduleId', 'personId'])
@Index(['scheduleId'])
@Index(['personId'])
@Index(['addedBy'])
export class ScheduleGuestVolunteerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'schedule_id' })
  scheduleId: string;

  @ManyToOne(() => ScheduleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schedule_id' })
  schedule: ScheduleEntity;

  @Column({ type: 'uuid', name: 'person_id' })
  personId: string;

  @ManyToOne(() => PersonEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person: PersonEntity;

  @Column({ type: 'uuid', name: 'added_by' })
  addedBy: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'added_by' })
  addedByUser: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
