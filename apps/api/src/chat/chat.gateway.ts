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
import { jwtConstants } from '../auth/constants';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

interface TokenExtractionResult {
  token: string | undefined;
  source: string | null;
}

interface JoinConversationDto {
  conversationId: string;
}

interface LeaveConversationDto {
  conversationId: string;
}

interface SendMessageDto {
  conversationId: string;
  text: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentSize?: number;
}

interface MarkReadDto {
  conversationId: string;
  messageIds?: string[];
}

interface TypingDto {
  conversationId: string;
  isTyping: boolean;
}

const MIN_TOKEN_LENGTH = 50;
const COOKIE_TOKEN_NAMES = ['access_token', 'auth_token'];

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'https://www.mincteams.com.br',
      'https://mincteams.com.br',
    ],
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

  /**
   * Extracts JWT token from various sources (auth, query, header)
   */
  private extractTokenFromHandshake(client: AuthenticatedSocket): TokenExtractionResult {
    const token =
      client.handshake.auth?.token ||
      client.handshake.query?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return { token: undefined, source: null };
    }

    // Validate token length - JWT tokens are typically 200+ characters
    if (token.length < MIN_TOKEN_LENGTH) {
      this.logger.warn(
        `Token from auth/header is too short (${token.length} chars), likely invalid. Trying cookies...`,
      );
      return { token: undefined, source: null };
    }

    this.logger.debug(
      `Found token in auth/header for client ${client.id} (length: ${token.length})`,
    );
    return { token, source: 'auth/header' };
  }

  /**
   * Parses cookies from handshake headers
   */
  private parseCookies(cookieHeader: string): Record<string, string> {
    return cookieHeader.split(';').reduce(
      (acc, cookie) => {
        const parts = cookie.trim().split('=');
        if (parts.length >= 2) {
          const key = parts.shift()?.trim();
          const value = parts.join('='); // Rejoin in case value had '='
          if (key && value) {
            acc[key] = decodeURIComponent(value);
          }
        }
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  /**
   * Extracts JWT token from cookies
   */
  private extractTokenFromCookies(client: AuthenticatedSocket): TokenExtractionResult {
    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) {
      this.logger.warn(`No cookies found in handshake headers for client ${client.id}`);
      return { token: undefined, source: null };
    }

    try {
      this.logger.debug(
        `Parsing cookies for client ${client.id}: ${cookieHeader.substring(0, 100)}...`,
      );

      const cookies = this.parseCookies(cookieHeader);
      this.logger.debug(
        `Parsed cookies for client ${client.id}: ${Object.keys(cookies).join(', ')}`,
      );

      // Try both cookie names
      const token = COOKIE_TOKEN_NAMES.reduce<string | undefined>(
        (found, name) => found || cookies[name],
        undefined,
      );

      if (!token) {
        this.logger.warn(
          `No ${COOKIE_TOKEN_NAMES.join(' or ')} found in cookies for client ${client.id}`,
        );
        return { token: undefined, source: null };
      }

      // Validate cookie token length
      if (token.length < MIN_TOKEN_LENGTH) {
        this.logger.warn(`Cookie token is too short (${token.length} chars), likely invalid.`);
        return { token: undefined, source: null };
      }

      this.logger.debug(`Found token in cookie for client ${client.id} (length: ${token.length})`);
      return { token, source: 'cookie' };
    } catch (error) {
      this.logger.warn(`Failed to parse cookies for client ${client.id}: ${error.message}`);
      return { token: undefined, source: null };
    }
  }

  /**
   * Extracts and validates JWT token from handshake
   */
  private extractToken(client: AuthenticatedSocket): TokenExtractionResult {
    // Try auth/header first
    const authResult = this.extractTokenFromHandshake(client);
    if (authResult.token) {
      return authResult;
    }

    // Fallback to cookies
    return this.extractTokenFromCookies(client);
  }

  /**
   * Authenticates client and sets userId
   */
  private authenticateClient(client: AuthenticatedSocket, token: string): string {
    const payload = this.jwtService.verify(token, {
      secret: jwtConstants.secret,
    });

    const userId = payload.sub;
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid token: userId not found in payload');
    }

    client.userId = userId;
    this.connectedClients.set(client.id, client);

    return userId;
  }

  /**
   * Joins user to their personal room for receiving messages
   */
  private joinUserRoom(client: AuthenticatedSocket, userId: string): void {
    const userRoom = `user:${userId}`;
    client.join(userRoom);
    this.logger.log(`User ${userId} joined room: ${userRoom}`);
  }

  /**
   * Logs client room membership for debugging
   */
  private logRoomMembership(client: AuthenticatedSocket): void {
    const rooms = Array.from(client.rooms);
    this.logger.debug(`Client ${client.id} is now in rooms: ${rooms.join(', ')}`);
  }

  /**
   * Handles successful client connection
   */
  private handleSuccessfulConnection(client: AuthenticatedSocket, userId: string): void {
    this.joinUserRoom(client, userId);
    this.logRoomMembership(client);

    this.logger.log(`Chat Client connected: ${userId} (Client ID: ${client.id})`);
    client.emit('connected', { userId, serverTime: new Date() });
  }

  /**
   * Handles failed client connection
   */
  private handleFailedConnection(client: AuthenticatedSocket, error: Error): void {
    this.logger.error(
      `Chat Client connection failed: ${client.userId || 'unknown'} - ${error.message}`,
    );
    if (error.stack) {
      this.logger.debug(`Stack trace: ${error.stack}`);
    }
    client.emit('error', { message: `Authentication failed: ${error.message}` });
    client.disconnect();
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      // Extract token from handshake
      const { token, source: tokenSource } = this.extractToken(client);

      if (!token) {
        this.logger.warn(
          `Connection attempt rejected: No valid token found for client ${client.id}. Check if cookies are being sent.`,
        );
        client.emit('error', { message: 'Authentication failed: No valid token found' });
        client.disconnect();
        return;
      }

      // Authenticate client
      this.logger.log(
        `Authenticating client ${client.id} via ${tokenSource || 'unknown'} (Token len: ${token.length})`,
      );

      const userId = this.authenticateClient(client, token);

      // Join user room - CRITICAL for receiving messages
      this.handleSuccessfulConnection(client, userId);
    } catch (error) {
      this.handleFailedConnection(client, error);
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.connectedClients.delete(client.id);
    this.logger.log(`Chat Client disconnected: ${client.userId || 'unknown'}`);
  }

  @SubscribeMessage('join-conversation')
  handleJoinConversation(
    @MessageBody() data: JoinConversationDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): void {
    if (!client.userId) {
      this.logger.warn(`join-conversation: Client ${client.id} has no userId`);
      return;
    }

    const conversationRoom = `conversation:${data.conversationId}`;
    client.join(conversationRoom);
    this.logger.log(`User ${client.userId} joined conversation ${data.conversationId}`);
    this.logRoomMembership(client);
  }

  @SubscribeMessage('leave-conversation')
  handleLeaveConversation(
    @MessageBody() data: LeaveConversationDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): void {
    if (!client.userId) {
      return;
    }

    const conversationRoom = `conversation:${data.conversationId}`;
    client.leave(conversationRoom);
    this.logger.debug(`User ${client.userId} left conversation ${data.conversationId}`);
  }

  /**
   * Broadcasts message to conversation room
   */
  private broadcastToConversationRoom(
    conversationId: string,
    event: string,
    payload: unknown,
  ): void {
    const conversationRoom = `conversation:${conversationId}`;
    this.server.to(conversationRoom).emit(event, payload);
    this.logger.debug(`Emitted ${event} to conversation room: ${conversationRoom}`);
  }

  /**
   * Broadcasts message to user's personal room
   */
  private broadcastToUserRoom(userId: string, event: string, payload: unknown): void {
    const userRoom = `user:${userId}`;
    this.server.to(userRoom).emit(event, payload);
    this.logger.debug(`Emitted ${event} to user room: ${userRoom}`);
  }

  /**
   * Broadcasts message to all conversation participants
   */
  private broadcastToParticipants(
    conversationId: string,
    participants: Array<{ userId: string }>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
  ): void {
    const messagePayload = {
      ...message,
      timestamp: message.createdAt,
    };

    // Broadcast to conversation room (for users who have the conversation open)
    this.broadcastToConversationRoom(conversationId, 'new-message', messagePayload);

    // Broadcast to individual user rooms to ensure all participants receive the message
    // This is critical because users might not be in the conversation room if they don't have it open
    participants.forEach((participant) => {
      this.broadcastToUserRoom(participant.userId, 'new-message', messagePayload);
      this.broadcastToUserRoom(participant.userId, 'conversation-updated', {
        conversationId,
        lastMessage: message,
      });
    });
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    if (!client.userId) {
      return;
    }

    try {
      // Create message with optional attachment
      const message = await this.chatService.createMessage(data.conversationId, client.userId, {
        text: data.text,
        attachmentUrl: data.attachmentUrl,
        attachmentName: data.attachmentName,
        attachmentType: data.attachmentType,
        attachmentSize: data.attachmentSize,
      });

      if (!message) {
        throw new Error('Failed to create message');
      }

      // Get conversation with participants
      const conversation = await this.chatService.findOneConversation(
        data.conversationId,
        client.userId,
      );

      // Log broadcasting
      const participantUserIds = conversation.participants.map((p) => p.userId);
      this.logger.log(
        `Broadcasting message ${message.id} from user ${client.userId} to conversation ${data.conversationId}`,
      );
      this.logger.log(`Participants: ${participantUserIds.join(', ')}`);

      // Broadcast to all participants
      this.broadcastToParticipants(data.conversationId, conversation.participants, message);

      this.logger.log(
        `Message ${message.id} sent to conversation ${data.conversationId} by user ${client.userId}. Broadcasted to ${conversation.participants.length} participants.`,
      );
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @MessageBody() data: MarkReadDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    if (!client.userId) {
      return;
    }

    try {
      const result = await this.chatService.markMessagesAsRead(
        data.conversationId,
        client.userId,
        data.messageIds,
      );

      if (result.updatedCount && result.updatedCount > 0) {
        this.broadcastToConversationRoom(data.conversationId, 'message-read', {
          conversationId: data.conversationId,
          readBy: client.userId,
          messageIds: data.messageIds,
        });
      }
    } catch (error) {
      this.logger.error(`Error marking messages as read: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: TypingDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): void {
    if (!client.userId) {
      return;
    }

    const conversationRoom = `conversation:${data.conversationId}`;
    client.to(conversationRoom).emit('user-typing', {
      conversationId: data.conversationId,
      userId: client.userId,
      isTyping: data.isTyping,
    });
  }
}
