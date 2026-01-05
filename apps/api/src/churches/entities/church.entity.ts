import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { MinistryEntity } from '../../ministries/entities/ministry.entity';
import { ServiceEntity } from '../../services/entities/service.entity';

@Entity('churches')
@Index(['name'], { where: '"deleted_at" IS NULL' })
export class ChurchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @OneToMany(() => MinistryEntity, (ministry) => ministry.church)
  ministries: MinistryEntity[];

  @OneToMany(() => ServiceEntity, (service) => service.church)
  services: ServiceEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
