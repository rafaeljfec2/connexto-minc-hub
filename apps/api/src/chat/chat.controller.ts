import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
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

  @Get('users/:userId/status')
  async getUserStatus(@Param('userId', ParseUUIDPipe) userId: string) {
    // TODO: Implement actual online status tracking
    // For now returning mock or last seen from user entity if available
    return {
      userId,
      isOnline: false,
      lastSeen: new Date(),
    };
  }
}
