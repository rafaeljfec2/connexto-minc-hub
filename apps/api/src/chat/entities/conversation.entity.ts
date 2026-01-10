import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Column,
} from 'typeorm';
import { ConversationParticipantEntity } from './conversation-participant.entity';
import { MessageEntity } from './message.entity';

@Entity('conversations')
export class ConversationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @Column({
    type: 'enum',
    enum: ['private', 'group'],
    default: 'private',
  })
  type: 'private' | 'group';

  @Column({ nullable: true })
  name: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @OneToMany(() => ConversationParticipantEntity, (participant) => participant.conversation)
  participants: ConversationParticipantEntity[];

  @OneToMany(() => MessageEntity, (message) => message.conversation)
  messages: MessageEntity[];
}
