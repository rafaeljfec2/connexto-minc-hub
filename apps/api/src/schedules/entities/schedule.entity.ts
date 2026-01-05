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
} from 'typeorm';
import { ServiceEntity } from '../../services/entities/service.entity';
import { ScheduleTeamEntity } from './schedule-team.entity';
import { AttendanceEntity } from '../../attendances/entities/attendance.entity';

@Entity('schedules')
@Index(['serviceId'], { where: '"deleted_at" IS NULL' })
@Index(['date'], { where: '"deleted_at" IS NULL' })
export class ScheduleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'service_id' })
  serviceId: string;

  @ManyToOne(() => ServiceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: ServiceEntity;

  @Column({ type: 'date' })
  date: Date;

  @OneToMany(() => ScheduleTeamEntity, (scheduleTeam) => scheduleTeam.schedule)
  scheduleTeams: ScheduleTeamEntity[];

  @OneToMany(() => AttendanceEntity, (attendance) => attendance.schedule)
  attendances: AttendanceEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
