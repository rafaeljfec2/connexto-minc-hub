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
import { CheckinService } from './checkin.service';
import { ValidateQrCodeDto } from './dto/validate-qr-code.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  personId?: string;
}

@WebSocketGateway({
  namespace: '/checkin',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class CheckinGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CheckinGateway.name);
  private readonly connectedClients = new Map<string, AuthenticatedSocket>();

  constructor(
    private readonly checkinService: CheckinService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth or query
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.userId = payload.sub;
      client.personId = payload.personId;

      this.connectedClients.set(client.id, client);

      this.logger.log(`Client ${client.id} connected (User: ${client.userId})`);

      // Join user-specific room
      client.join(`user:${client.userId}`);
      if (client.personId) {
        client.join(`person:${client.personId}`);
      }

      // Notify client of successful connection
      client.emit('checkin:connected', {
        userId: client.userId,
        personId: client.personId,
      });
    } catch (error) {
      this.logger.error(`Client ${client.id} connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client ${client.id} disconnected`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('checkin:validate-qr')
  async handleValidateQr(
    @MessageBody() data: { qrCodeData: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        client.emit('checkin:error', { message: 'Unauthorized' });
        return;
      }

      // Get user from database
      let user: UserEntity | null;
      try {
        user = await this.usersService.findOne(client.userId);
        if (!user) {
          this.logger.error(`User not found: ${client.userId}`);
          client.emit('checkin:error', { message: 'User not found' });
          return;
        }
      } catch (error) {
        this.logger.error(`Error fetching user ${client.userId}: ${error.message}`);
        client.emit('checkin:error', { message: 'Error validating user' });
        return;
      }

      const validateDto: ValidateQrCodeDto = {
        qrCodeData: data.qrCodeData,
      };

      const attendance = await this.checkinService.validateQrCode(validateDto, user);

      // Emit success to the scanner (person who scanned)
      client.emit('checkin:success', {
        attendance: {
          id: attendance.id,
          scheduleId: attendance.scheduleId,
          personId: attendance.personId,
          checkedInAt: attendance.checkedInAt,
          method: attendance.method,
        },
      });

      // Emit notification to the person who was checked in (if they're connected)
      this.server.to(`person:${attendance.personId}`).emit('checkin:notify', {
        attendance: {
          id: attendance.id,
          scheduleId: attendance.scheduleId,
          checkedInAt: attendance.checkedInAt,
          method: attendance.method,
        },
        message: 'Check-in realizado com sucesso!',
      });

      // Emit to schedule room (for real-time updates on schedule page)
      this.server.to(`schedule:${attendance.scheduleId}`).emit('checkin:new', {
        attendance: {
          id: attendance.id,
          scheduleId: attendance.scheduleId,
          personId: attendance.personId,
          checkedInAt: attendance.checkedInAt,
          method: attendance.method,
        },
      });

      this.logger.log(
        `Check-in validated: Person ${attendance.personId} for Schedule ${attendance.scheduleId}`,
      );
    } catch (error) {
      this.logger.error(`Error validating QR code: ${error.message}`);
      client.emit('checkin:error', {
        message: error.message || 'Error validating QR code',
      });
    }
  }

  @SubscribeMessage('checkin:join-schedule')
  handleJoinSchedule(
    @MessageBody() data: { scheduleId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      client.emit('checkin:error', { message: 'Unauthorized' });
      return;
    }

    client.join(`schedule:${data.scheduleId}`);
    this.logger.log(`Client ${client.id} joined schedule room: ${data.scheduleId}`);
  }

  @SubscribeMessage('checkin:leave-schedule')
  handleLeaveSchedule(
    @MessageBody() data: { scheduleId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.leave(`schedule:${data.scheduleId}`);
    this.logger.log(`Client ${client.id} left schedule room: ${data.scheduleId}`);
  }
}
