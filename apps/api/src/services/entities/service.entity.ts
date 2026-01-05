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
import { ChurchEntity } from '../../churches/entities/church.entity';
import { ScheduleEntity } from '../../schedules/entities/schedule.entity';

export enum ServiceType {
  SUNDAY_MORNING = 'sunday_morning',
  SUNDAY_EVENING = 'sunday_evening',
  WEDNESDAY = 'wednesday',
  FRIDAY = 'friday',
  SPECIAL = 'special',
}

@Entity('services')
@Index(['churchId'], { where: '"deleted_at" IS NULL' })
@Index(['type'], { where: '"deleted_at" IS NULL' })
@Index(['dayOfWeek'], { where: '"deleted_at" IS NULL' })
@Index(['isActive'], { where: '"deleted_at" IS NULL' })
export class ServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'church_id' })
  churchId: string;

  @ManyToOne(() => ChurchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'church_id' })
  church: ChurchEntity;

  @Column({
    type: 'enum',
    enum: ServiceType,
  })
  type: ServiceType;

  @Column({ type: 'integer', name: 'day_of_week' })
  dayOfWeek: number;

  @Column({ type: 'time' })
  time: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => ScheduleEntity, (schedule) => schedule.service)
  schedules: ScheduleEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
