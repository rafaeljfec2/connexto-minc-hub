import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly connectedClients = new Map<string, AuthenticatedSocket>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      let token =
        client.handshake.auth?.token ||
        client.handshake.query?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token && client.handshake.headers.cookie) {
        const cookies = client.handshake.headers.cookie.split(';').reduce(
          (acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
          },
          {} as Record<string, string>,
        );

        token = cookies['access_token'];
      }

      if (!token) {
        this.logger.warn(`Connection attempt rejected: No token found for client ${client.id}`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.userId = payload.sub;
      this.connectedClients.set(client.id, client);

      // Join user specific room for online status/notifications
      client.join(`user:${client.userId}`);

      client.emit('connected', { userId: client.userId, serverTime: new Date() });
      this.logger.log(`Chat Client connected: ${client.userId}`);
    } catch (error) {
      this.logger.error(`Chat Client connection failed: ${client.userId}`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Chat Client disconnected: ${client.userId}`);
  }

  @SubscribeMessage('join-conversation')
  handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;
    client.join(`conversation:${data.conversationId}`);
    this.logger.log(`User ${client.userId} joined conversation ${data.conversationId}`);
  }

  @SubscribeMessage('leave-conversation')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;
    client.leave(`conversation:${data.conversationId}`);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: { conversationId: string; text: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;

    try {
      const message = await this.chatService.createMessage(data.conversationId, client.userId, {
        text: data.text,
      });

      // Broadcast to conversation room (including sender, or exclude sender depending on FE preference)
      this.server.to(`conversation:${data.conversationId}`).emit('new-message', {
        ...message,
        timestamp: message.createdAt, // Ensure frontend gets timestamp field as expected
      });

      // Notify other participant if they are not in the conversation room but are online
      // We might need to fetch conversation participants to know who to notify
      // For simplified MVp, assuming active socket room works.

      // Emit conversation update to participants' user rooms (to update list order/unread count)
      // This is a bit heavyweight, maybe just emit 'message' and let FE client update convo list
      const conversation = await this.chatService.findOneConversation(
        data.conversationId,
        client.userId,
      );
      conversation.participants.forEach((p) => {
        this.server.to(`user:${p.userId}`).emit('conversation-updated', {
          conversationId: data.conversationId,
          lastMessage: message,
          // Unread count is user-specific, ideally payload includes generic update signal
        });
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @MessageBody() data: { conversationId: string; messageIds?: string[] },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;

    try {
      const result = await this.chatService.markMessagesAsRead(
        data.conversationId,
        client.userId,
        data.messageIds,
      );

      if (result.updatedCount && result.updatedCount > 0) {
        this.server.to(`conversation:${data.conversationId}`).emit('message-read', {
          conversationId: data.conversationId,
          readBy: client.userId,
          messageIds: data.messageIds,
        });
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;

    // Broadcast to others in room
    client.to(`conversation:${data.conversationId}`).emit('user-typing', {
      conversationId: data.conversationId,
      userId: client.userId,
      isTyping: data.isTyping,
    });
  }
}
