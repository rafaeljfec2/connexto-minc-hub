import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ScheduleEntity } from '../../schedules/entities/schedule.entity';
import { PersonEntity } from '../../persons/entities/person.entity';
import { UserEntity } from '../../users/entities/user.entity';

export enum AttendanceMethod {
  QR_CODE = 'qr_code',
  MANUAL = 'manual',
}

@Entity('attendances')
@Unique(['scheduleId', 'personId'])
@Index(['scheduleId'])
@Index(['personId'])
@Index(['checkedInBy'])
@Index(['checkedInAt'])
@Index(['method'])
export class AttendanceEntity {
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

  @Column({ type: 'uuid', name: 'checked_in_by' })
  checkedInBy: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'checked_in_by' })
  checkedInByUser: UserEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'checked_in_at' })
  checkedInAt: Date;

  @Column({
    type: 'enum',
    enum: AttendanceMethod,
  })
  method: AttendanceMethod;

  @Column({ type: 'jsonb', nullable: true, name: 'qr_code_data' })
  qrCodeData: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true, name: 'absence_reason' })
  absenceReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
