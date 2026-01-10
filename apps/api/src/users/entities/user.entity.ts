import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { PersonEntity } from '../../persons/entities/person.entity';

export enum UserRole {
  ADMIN = 'admin',
  PASTOR = 'pastor',
  LIDER_DE_TIME = 'lider_de_time',
  LIDER_DE_EQUIPE = 'lider_de_equipe',
  SERVO = 'servo',
}

@Entity('users')
@Index(['email'], { where: '"deleted_at" IS NULL' })
@Index(['personId'], { where: '"deleted_at" IS NULL' })
@Index(['role'], { where: '"deleted_at" IS NULL' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'person_id' })
  personId: string | null;

  @OneToOne(() => PersonEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'person_id' })
  person: PersonEntity | null;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: UserRole,
    default: UserRole.SERVO,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'boolean', default: false, name: 'can_check_in' })
  canCheckIn: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
