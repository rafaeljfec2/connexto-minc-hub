import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { ConversationParticipantEntity } from './entities/conversation-participant.entity';
import { MessageEntity } from './entities/message.entity';
import { UsersService } from '../users/users.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(ConversationParticipantEntity)
    private readonly participantRepository: Repository<ConversationParticipantEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private readonly usersService: UsersService,
  ) {}

  async findConversations(userId: string, limit = 20, offset = 0) {
    // Find all conversation IDs for the user
    const userParticipations = await this.participantRepository.find({
      where: { userId },
      select: ['conversationId'],
    });

    const conversationIds = userParticipations.map((p) => p.conversationId);

    if (conversationIds.length === 0) {
      return [];
    }

    // Fetch conversations with their last message and participants
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('participant.user', 'user')
      .leftJoinAndSelect('conversation.messages', 'message')
      .where('conversation.id IN (:...conversationIds)', { conversationIds })
      .orderBy('conversation.updatedAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();

    // Enhancing conversations with unread count and properly filtering participants if needed
    // Note: detailed mapping logic might be needed for specific frontend requirements
    // For now returning the entity structure
    const enrichedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        // Last message is typically the latest one
        const lastMessage = await this.messageRepository.findOne({
          where: { conversationId: conversation.id },
          order: { createdAt: 'DESC' },
        });

        const unreadCount = await this.messageRepository.count({
          where: {
            conversationId: conversation.id,
            read: false,
            // Only count messages NOT sent by the current user
            // Assuming strict logic: user should read messages sent by others
            // But efficient query is needed.
            // Simplified: count unread messages where sender != userId
          },
        });

        // Correct unread count logic:
        // We need to count messages that are NOT read AND NOT sent by the current user
        const realUnreadCount = await this.messageRepository
          .createQueryBuilder('message')
          .where('message.conversationId = :conversationId', { conversationId: conversation.id })
          .andWhere('message.read = :read', { read: false })
          .andWhere('message.senderId != :userId', { userId })
          .getCount();

        return {
          ...conversation,
          participants: conversation.participants.map((p) => ({
            id: p.userId,
            name: p.user?.name,
            // avatar: p.user?.avatar // Add avatar if UserEntity has it
            timestamp: p.joinedAt,
          })),
          lastMessage,
          unreadCount: realUnreadCount,
        };
      }),
    );

    // Sort again by last message logical timestamp if needed, but updatedAt covers it
    return enrichedConversations;
  }

  async findOrCreateConversation(userId: string, createConversationDto: CreateConversationDto) {
    const { participantId } = createConversationDto;

    if (userId === participantId) {
      throw new BadRequestException('Cannot create conversation with yourself');
    }

    const participantUser = await this.usersService.findOne(participantId);
    if (!participantUser) {
      throw new NotFoundException('Participant not found');
    }

    // Check if conversation exists
    // Find conversation IDs shared by both users
    const conversationIds = await this.participantRepository
      .createQueryBuilder('p1')
      .innerJoin(ConversationParticipantEntity, 'p2', 'p1.conversationId = p2.conversationId')
      .where('p1.userId = :userId', { userId })
      .andWhere('p2.userId = :participantId', { participantId })
      .select('p1.conversationId')
      .getRawMany();

    if (conversationIds.length > 0) {
      // Return existing conversation
      const conversationId = conversationIds[0].p1_conversation_id;
      return this.findOneConversation(conversationId, userId);
    }

    // Create new conversation
    const conversation = this.conversationRepository.create();
    await this.conversationRepository.save(conversation);

    // Add participants
    await this.participantRepository.save([
      { conversationId: conversation.id, userId },
      { conversationId: conversation.id, userId: participantId },
    ]);

    return this.findOneConversation(conversation.id, userId);
  }

  async findOneConversation(conversationId: string, userId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants', 'participants.user'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify participation
    const isParticipant = conversation.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException('Not a participant');
    }

    return conversation;
  }

  async findMessages(
    conversationId: string,
    userId: string,
    limit = 50,
    offset = 0,
    before?: Date,
  ) {
    // Verify participation first
    const isParticipant = await this.participantRepository.findOne({
      where: { conversationId, userId },
    });
    if (!isParticipant) {
      throw new ForbiddenException('Not a participant');
    }

    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId = :conversationId', { conversationId })
      .orderBy('message.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    if (before) {
      query.andWhere('message.createdAt < :before', { before });
    }

    const messages = await query.getMany();
    return messages.reverse(); // Return oldest first for the client usually
  }

  async createMessage(
    conversationId: string,
    senderId: string,
    createMessageDto: CreateMessageDto,
  ) {
    // Verify participation
    const isParticipant = await this.participantRepository.findOne({
      where: { conversationId, userId: senderId },
    });
    if (!isParticipant) {
      throw new ForbiddenException('Not a participant');
    }

    const message = this.messageRepository.create({
      conversationId,
      senderId,
      text: createMessageDto.text,
      read: false,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation timestamp
    await this.conversationRepository.update(conversationId, { updatedAt: new Date() });

    return savedMessage;
  }

  async markMessagesAsRead(conversationId: string, userId: string, messageIds?: string[]) {
    const isParticipant = await this.participantRepository.findOne({
      where: { conversationId, userId },
    });
    if (!isParticipant) {
      throw new ForbiddenException('Not a participant');
    }

    const queryForUpdate = this.messageRepository
      .createQueryBuilder()
      .update(MessageEntity)
      .set({ read: true })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('read = :read', { read: false })
      // Important: only mark messages NOT sent by the user (incoming messages)
      .andWhere('senderId != :userId', { userId });

    if (messageIds && messageIds.length > 0) {
      queryForUpdate.andWhere('id IN (:...messageIds)', { messageIds });
    }

    const result = await queryForUpdate.execute();
    return { updatedCount: result.affected };
  }

  async getUnreadCount(userId: string) {
    // Get all conversations for user
    const userParticipations = await this.participantRepository.find({
      where: { userId },
      select: ['conversationId'],
    });

    const conversationIds = userParticipations.map((p) => p.conversationId);
    if (conversationIds.length === 0) return { totalUnread: 0 };

    const unreadCount = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId IN (:...conversationIds)', { conversationIds })
      .andWhere('message.read = :read', { read: false })
      .andWhere('message.senderId != :userId', { userId })
      .getCount();

    return { totalUnread: unreadCount };
  }
}
