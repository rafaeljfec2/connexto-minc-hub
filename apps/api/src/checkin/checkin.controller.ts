import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CheckinService } from './checkin.service';
import { GenerateQrCodeDto } from './dto/generate-qr-code.dto';
import { ValidateQrCodeDto } from './dto/validate-qr-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { AttendanceEntity } from '../attendances/entities/attendance.entity';

@ApiTags('Check-in')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('checkin')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post('generate-qr')
  @ApiOperation({ summary: 'Generate QR Code for check-in' })
  @ApiResponse({
    status: 201,
    description: 'QR Code generated successfully',
    schema: {
      example: {
        qrCode: '{"scheduleId":"uuid","personId":"uuid","serviceId":"uuid","date":"2024-03-10","timestamp":1234567890}',
        schedule: {
          id: 'uuid',
          serviceId: 'uuid',
          date: '2024-03-10',
        },
        expiresAt: '2024-03-10T19:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'No schedules found for this person on this date' })
  @ApiResponse({ status: 403, description: 'Check-in not yet open or already closed' })
  generateQrCode(
    @Body() generateQrCodeDto: GenerateQrCodeDto,
    @GetUser() user: UserEntity,
  ) {
    return this.checkinService.generateQrCode(user, generateQrCodeDto);
  }

  @Post('validate-qr')
  @ApiOperation({ summary: 'Validate and process QR Code check-in' })
  @ApiResponse({
    status: 201,
    description: 'Check-in registered successfully',
    type: AttendanceEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid QR Code or already checked in' })
  @ApiResponse({ status: 403, description: 'Check-in not yet open or already closed' })
  validateQrCode(
    @Body() validateQrCodeDto: ValidateQrCodeDto,
    @GetUser() user: UserEntity,
  ) {
    return this.checkinService.validateQrCode(validateQrCodeDto, user);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get check-in history for current user' })
  @ApiResponse({
    status: 200,
    description: 'Check-in history',
    type: [AttendanceEntity],
  })
  getCheckInHistory(
    @GetUser() user: UserEntity,
    @Query('limit') limit?: string,
  ) {
    if (!user.personId) {
      return [];
    }
    return this.checkinService.getCheckInHistory(
      user.personId,
      limit ? Number.parseInt(limit, 10) : 50,
    );
  }
}
