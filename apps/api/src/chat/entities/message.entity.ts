import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ConversationEntity } from './conversation.entity';

@Entity('messages')
@Index(['conversationId', 'createdAt']) // For chronological ordering
@Index(['senderId'])
@Index(['conversationId', 'read'], { where: 'read = false' }) // For unread count
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  // Attachment fields
  @Column({ name: 'attachment_url', type: 'varchar', nullable: true })
  attachmentUrl: string | null;

  @Column({ name: 'attachment_name', type: 'varchar', nullable: true })
  attachmentName: string | null;

  @Column({ name: 'attachment_type', type: 'varchar', nullable: true })
  attachmentType: string | null;

  @Column({ name: 'attachment_size', type: 'int', nullable: true })
  attachmentSize: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: ConversationEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: UserEntity;
}
