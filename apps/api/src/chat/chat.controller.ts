import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  Delete,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { MarkMessagesReadDto } from './dto/mark-messages-read.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async findConversations(
    @Req() req: { user: UserEntity },
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.chatService.findConversations(req.user.id, limit, offset);
  }

  @Post('conversations')
  async createConversation(
    @Req() req: { user: UserEntity },
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return this.chatService.findOrCreateConversation(req.user.id, createConversationDto);
  }

  @Get('conversations/unread-count')
  async getUnreadCount(@Req() req: { user: UserEntity }) {
    return this.chatService.getUnreadCount(req.user.id);
  }

  @Get('conversations/:conversationId/messages')
  async findMessages(
    @Req() req: { user: UserEntity },
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('before') before?: string,
  ) {
    const beforeDate = before ? new Date(before) : undefined;
    return this.chatService.findMessages(conversationId, req.user.id, limit, offset, beforeDate);
  }

  @Post('conversations/:conversationId/messages')
  async createMessage(
    @Req() req: { user: UserEntity },
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.chatService.createMessage(conversationId, req.user.id, createMessageDto);
  }

  @Put('conversations/:conversationId/messages/read')
  async markMessagesAsRead(
    @Req() req: { user: UserEntity },
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body() markMessagesReadDto: MarkMessagesReadDto,
  ) {
    return this.chatService.markMessagesAsRead(
      conversationId,
      req.user.id,
      markMessagesReadDto.messageIds,
    );
  }

  @Patch('messages/:messageId')
  async updateMessage(
    @Req() req: { user: UserEntity },
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.chatService.updateMessage(messageId, req.user.id, updateMessageDto.text);
  }

  @Get('users/:userId/status')
  async getUserStatus(@Param('userId', ParseUUIDPipe) userId: string) {
    // For now returning mock or last seen from user entity if available
    return {
      userId,
      isOnline: false,
      lastSeen: new Date(),
    };
  }
  @Post('groups')
  async createGroup(@Req() req: { user: UserEntity }, @Body() createGroupDto: CreateGroupDto) {
    return this.chatService.createGroup(req.user.id, createGroupDto.name, createGroupDto.members);
  }

  @Post('groups/from-team/:teamId')
  async createGroupFromTeam(
    @Req() req: { user: UserEntity },
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Body() body: { customName?: string },
  ) {
    return this.chatService.createGroupFromTeam(req.user.id, teamId, body.customName);
  }

  @Post('groups/:id/members')
  async addMember(
    @Req() req: { user: UserEntity },
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body('userId', ParseUUIDPipe) newMemberId: string,
  ) {
    return this.chatService.addParticipant(conversationId, req.user.id, newMemberId);
  }

  @Post('groups/:id/participants/:userId/promote')
  async promoteToAdmin(
    @Req() req: { user: UserEntity },
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
  ) {
    return this.chatService.promoteToAdmin(conversationId, req.user.id, targetUserId);
  }

  @Put('groups/:id')
  async updateGroup(
    @Req() req: { user: UserEntity },
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() body: { name?: string; avatar?: string },
  ) {
    return this.chatService.updateGroup(conversationId, req.user.id, body);
  }

  @Delete('groups/:id/members/:userId')
  async removeMember(
    @Req() req: { user: UserEntity },
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Param('userId', ParseUUIDPipe) memberIdToRemove: string,
  ) {
    return this.chatService.removeParticipant(conversationId, req.user.id, memberIdToRemove);
  }
}
