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
import { TeamsService } from '../teams/teams.service';
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
    private readonly teamsService: TeamsService,
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

        // Count unread messages that are NOT read AND NOT sent by the current user
        const unreadCount = await this.messageRepository
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
            avatar: p.user?.avatar ?? null,
            role: p.role, // ✅ Adicionado campo role
            timestamp: p.joinedAt,
          })),
          lastMessage,
          unreadCount,
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

    // Check if PRIVATE conversation exists
    // Find conversation IDs shared by both users
    const conversationIds = await this.participantRepository
      .createQueryBuilder('p1')
      .innerJoin(ConversationParticipantEntity, 'p2', 'p1.conversationId = p2.conversationId')
      .innerJoin(ConversationEntity, 'c', 'p1.conversationId = c.id')
      .where('p1.userId = :userId', { userId })
      .andWhere('p2.userId = :participantId', { participantId })
      .andWhere('c.type = :type', { type: 'private' })
      .select('p1.conversationId')
      .getRawMany();

    if (conversationIds.length > 0) {
      // Return existing conversation
      const conversationId = conversationIds[0].p1_conversation_id;
      return this.findOneConversation(conversationId, userId);
    }

    // Create new conversation
    const conversation = this.conversationRepository.create({
      type: 'private',
      createdBy: userId,
    });
    await this.conversationRepository.save(conversation);

    // Add participants
    await this.participantRepository.save([
      { conversationId: conversation.id, userId, role: 'admin' },
      { conversationId: conversation.id, userId: participantId, role: 'member' },
    ]);

    return this.findOneConversation(conversation.id, userId);
  }

  async createGroup(userId: string, name: string, memberIds: string[]) {
    // Validate members exist
    const members = await Promise.all(memberIds.map((id) => this.usersService.findOne(id)));

    if (members.some((m) => !m)) {
      throw new NotFoundException('One or more members not found');
    }

    const conversation = this.conversationRepository.create({
      type: 'group',
      name,
      createdBy: userId,
    });

    await this.conversationRepository.save(conversation);

    // Add creator as admin
    const participantsToSave = [{ conversationId: conversation.id, userId, role: 'admin' }];

    // Add other members
    memberIds.forEach((id) => {
      // Avoid duplicate if creator is in list
      if (id !== userId) {
        participantsToSave.push({
          conversationId: conversation.id,
          userId: id,
          role: 'member',
        });
      }
    });

    // @ts-expect-error - Role enum compatible string
    await this.participantRepository.save(participantsToSave);

    return this.findOneConversation(conversation.id, userId);
  }

  async createGroupFromTeam(userId: string, teamId: string, customName?: string) {
    const team = await this.teamsService.findOne(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const teamMembers = await this.teamsService.getMembers(teamId);
    const memberPersonIds = teamMembers.map((member) => member.personId);

    // Find users by personId
    const users = await Promise.all(
      memberPersonIds.map((personId) =>
        this.usersService.findByPersonId(personId).catch(() => null),
      ),
    );
    const validUserIds = users.filter((u) => u !== null).map((u) => u!.id);

    if (validUserIds.length === 0) {
      throw new BadRequestException('No valid users found in team');
    }

    const groupName = customName || `Grupo ${team.name}`;

    const conversation = this.conversationRepository.create({
      type: 'group',
      name: groupName,
      createdBy: userId,
    });

    await this.conversationRepository.save(conversation);

    const participantsToSave = [{ conversationId: conversation.id, userId, role: 'admin' }];

    validUserIds.forEach((id) => {
      if (id !== userId) {
        participantsToSave.push({
          conversationId: conversation.id,
          userId: id,
          role: 'member',
        });
      }
    });

    // @ts-expect-error - Role enum compatible string
    await this.participantRepository.save(participantsToSave);

    return this.findOneConversation(conversation.id, userId);
  }

  async addParticipant(conversationId: string, adminId: string, newMemberId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.type !== 'group')
      throw new BadRequestException('Cannot add members to private chat');

    // Check if requester is admin
    const adminPart = await this.participantRepository.findOne({
      where: { conversationId, userId: adminId },
    });

    // Allow any member to add? or only admin? User prompt says "Indicar quem é admin", usually implies permissions.
    // For now, let's enforce admin or at least membership. Let's start with admin-only add.
    if (adminPart?.role !== 'admin') {
      throw new ForbiddenException('Only admins can add members');
    }

    const startMember = await this.usersService.findOne(newMemberId);
    if (!startMember) throw new NotFoundException('User not found');

    const existing = await this.participantRepository.findOne({
      where: { conversationId, userId: newMemberId },
    });
    if (existing) throw new BadRequestException('User already in group');

    await this.participantRepository.save({
      conversationId,
      userId: newMemberId,
      role: 'member',
    });

    return this.findOneConversation(conversationId, adminId);
  }

  async removeParticipant(conversationId: string, adminId: string, memberIdToRemove: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.type !== 'group')
      throw new BadRequestException('Cannot remove members from private chat');

    // Check if requester is admin or if they are removing themselves (leaving)
    const requestorPart = conversation.participants.find((p) => p.userId === adminId);
    if (!requestorPart) throw new ForbiddenException('Not a participant');

    if (adminId !== memberIdToRemove && requestorPart.role !== 'admin') {
      throw new ForbiddenException('Only admins can remove other members');
    }

    const participantToRemove = conversation.participants.find(
      (p) => p.userId === memberIdToRemove,
    );
    if (!participantToRemove) throw new NotFoundException('Participant not found');

    // Rule: Admin only leaves if there is at least one other admin
    if (participantToRemove.role === 'admin') {
      const otherAdmins = conversation.participants.filter(
        (p) => p.role === 'admin' && p.userId !== memberIdToRemove,
      );
      const otherMembers = conversation.participants.filter((p) => p.userId !== memberIdToRemove);

      // If there are other members but no other admins, prevent exit
      if (otherAdmins.length === 0 && otherMembers.length > 0) {
        throw new BadRequestException(
          'You are the only admin. Please promote another member to admin before leaving.',
        );
      }
    }

    await this.participantRepository.delete({ conversationId, userId: memberIdToRemove });

    return { success: true };
  }

  async promoteToAdmin(conversationId: string, adminId: string, targetUserId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.type !== 'group') throw new BadRequestException('Not a group');

    const adminPart = conversation.participants.find((p) => p.userId === adminId);
    if (adminPart?.role !== 'admin') {
      throw new ForbiddenException('Only admins can promote members');
    }

    const targetPart = conversation.participants.find((p) => p.userId === targetUserId);
    if (!targetPart) throw new NotFoundException('Target user not in group');

    targetPart.role = 'admin';
    await this.participantRepository.save(targetPart);

    return this.findOneConversation(conversationId, adminId);
  }

  async updateGroup(
    conversationId: string,
    adminId: string,
    data: { name?: string; avatar?: string },
  ) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.type !== 'group') throw new BadRequestException('Not a group');

    const adminPart = conversation.participants.find((p) => p.userId === adminId);
    if (adminPart?.role !== 'admin') {
      throw new ForbiddenException('Only admins can update group details');
    }

    if (data.name) conversation.name = data.name;

    await this.conversationRepository.save(conversation);

    return this.findOneConversation(conversationId, adminId);
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
      .leftJoinAndSelect('message.sender', 'sender')
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
      // Attachment fields
      attachmentUrl: createMessageDto.attachmentUrl || null,
      attachmentName: createMessageDto.attachmentName || null,
      attachmentType: createMessageDto.attachmentType || null,
      attachmentSize: createMessageDto.attachmentSize || null,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation timestamp
    await this.conversationRepository.update(conversationId, { updatedAt: new Date() });

    // Return with sender info for immediate display
    const msgWithSender = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });

    return msgWithSender;
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

  async updateMessage(messageId: string, userId: string, text: string) {
    // Find the message
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Verify the user is the sender
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    // Update the message
    message.text = text;
    message.isEdited = true;

    const updatedMessage = await this.messageRepository.save(message);

    // Return with sender info
    const msgWithSender = await this.messageRepository.findOne({
      where: { id: updatedMessage.id },
      relations: ['sender'],
    });

    return msgWithSender;
  }

  async deleteMessage(messageId: string, userId: string, deleteType: 'everyone' | 'me') {
    // Find the message
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (deleteType === 'everyone') {
      // Only sender can delete for everyone
      if (message.senderId !== userId) {
        throw new ForbiddenException('You can only delete your own messages for everyone');
      }

      // Mark as deleted for everyone and replace text
      message.deletedForEveryone = true;
      message.text = 'Mensagem excluída';
    } else {
      // Delete for me - add user to deletedBy array
      const deletedBy = message.deletedBy || [];
      if (!deletedBy.includes(userId)) {
        deletedBy.push(userId);
        message.deletedBy = deletedBy;
      }
    }

    const updatedMessage = await this.messageRepository.save(message);

    // Return with sender info
    const msgWithSender = await this.messageRepository.findOne({
      where: { id: updatedMessage.id },
      relations: ['sender'],
    });

    return msgWithSender;
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
