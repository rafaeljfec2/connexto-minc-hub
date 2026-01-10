import {
  Entity,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  Index,
  Column,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ConversationEntity } from './conversation.entity';

@Entity('conversation_participants')
@Index(['userId'])
@Index(['conversationId'])
export class ConversationParticipantEntity {
  @PrimaryColumn('uuid', { name: 'conversation_id' })
  conversationId: string;

  @PrimaryColumn('uuid', { name: 'user_id' })
  userId: string;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  @Column({
    type: 'enum',
    enum: ['admin', 'member'],
    default: 'member',
  })
  role: 'admin' | 'member';

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: ConversationEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
