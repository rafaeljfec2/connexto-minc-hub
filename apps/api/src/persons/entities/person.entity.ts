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
  OneToOne,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { MinistryEntity } from '../../ministries/entities/ministry.entity';
import { TeamEntity } from '../../teams/entities/team.entity';
import { TeamMemberEntity } from '../../teams/entities/team-member.entity';
import { AttendanceEntity } from '../../attendances/entities/attendance.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('persons')
@Index(['ministryId'], { where: '"deleted_at" IS NULL' })
@Index(['teamId'], { where: '"deleted_at" IS NULL' })
@Index(['name'], { where: '"deleted_at" IS NULL' })
@Index(['email'], { where: '"deleted_at" IS NULL' })
export class PersonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'ministry_id' })
  ministryId: string | null;

  @ManyToOne(() => MinistryEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ministry_id' })
  ministry: MinistryEntity | null;

  @Column({ type: 'uuid', nullable: true, name: 'team_id' })
  teamId: string | null;

  @ManyToOne(() => TeamEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'team_id' })
  team: TeamEntity | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'date', nullable: true, name: 'birth_date' })
  birthDate: Date | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => TeamMemberEntity, (teamMember) => teamMember.person)
  teamMembers: TeamMemberEntity[];

  @OneToMany(() => AttendanceEntity, (attendance) => attendance.person)
  attendances: AttendanceEntity[];

  @OneToOne(() => UserEntity, (user) => user.person, { nullable: true })
  user: UserEntity | null;

  // Virtual property to get avatar from associated user
  @Expose()
  get avatar(): string | null {
    return this.user?.avatar ?? null;
  }

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
