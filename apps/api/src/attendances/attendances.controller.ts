import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AttendancesService } from './attendances.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { AttendanceEntity } from './entities/attendance.entity';

@ApiTags('Attendances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Post()
  @ApiOperation({ summary: 'Register attendance/check-in' })
  @ApiResponse({ status: 201, description: 'Attendance registered successfully', type: AttendanceEntity })
  @ApiResponse({ status: 409, description: 'Attendance already registered for this person in this schedule' })
  create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @GetUser() user: UserEntity,
  ): Promise<AttendanceEntity> {
    return this.attendancesService.create(createAttendanceDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all attendances' })
  @ApiQuery({ name: 'scheduleId', required: false, description: 'Filter by schedule' })
  @ApiQuery({ name: 'personId', required: false, description: 'Filter by person' })
  @ApiResponse({ status: 200, description: 'List of attendances', type: [AttendanceEntity] })
  findAll(
    @Query('scheduleId') scheduleId?: string,
    @Query('personId') personId?: string,
  ): Promise<AttendanceEntity[]> {
    if (scheduleId) {
      return this.attendancesService.findBySchedule(scheduleId);
    }
    if (personId) {
      return this.attendancesService.findByPerson(personId);
    }
    return this.attendancesService.findAll();
  }

  @Get('schedule/:scheduleId/stats')
  @ApiOperation({ summary: 'Get attendance statistics for a schedule' })
  @ApiResponse({
    status: 200,
    description: 'Attendance statistics',
    schema: {
      example: {
        total: 10,
        present: 8,
        absent: 2,
        attendances: [],
      },
    },
  })
  getScheduleStats(@Param('scheduleId', ParseUUIDPipe) scheduleId: string) {
    return this.attendancesService.getScheduleAttendance(scheduleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an attendance by ID' })
  @ApiResponse({ status: 200, description: 'Attendance found', type: AttendanceEntity })
  @ApiResponse({ status: 404, description: 'Attendance not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AttendanceEntity> {
    return this.attendancesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an attendance' })
  @ApiResponse({ status: 200, description: 'Attendance updated successfully', type: AttendanceEntity })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<AttendanceEntity> {
    return this.attendancesService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an attendance' })
  @ApiResponse({ status: 200, description: 'Attendance removed successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.attendancesService.remove(id);
  }
}
