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
import { TeamEntity } from '../../teams/entities/team.entity';
import { PersonEntity } from '../../persons/entities/person.entity';

@Entity('ministries')
@Index(['churchId'], { where: '"deleted_at" IS NULL' })
@Index(['name'], { where: '"deleted_at" IS NULL' })
@Index(['isActive'], { where: '"deleted_at" IS NULL' })
export class MinistryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'church_id' })
  churchId: string;

  @ManyToOne(() => ChurchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'church_id' })
  church: ChurchEntity;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => TeamEntity, (team) => team.ministry)
  teams: TeamEntity[];

  @OneToMany(() => PersonEntity, (person) => person.ministry)
  persons: PersonEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
