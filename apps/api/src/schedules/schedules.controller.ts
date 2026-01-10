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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AddTeamToScheduleDto } from './dto/add-team-to-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScheduleEntity } from './entities/schedule.entity';
import { ScheduleTeamEntity } from './entities/schedule-team.entity';

@ApiTags('Schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new schedule' })
  @ApiResponse({ status: 201, description: 'Schedule created successfully', type: ScheduleEntity })
  @ApiResponse({
    status: 409,
    description: 'A schedule already exists for this service on this date',
  })
  create(@Body() createScheduleDto: CreateScheduleDto): Promise<ScheduleEntity> {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all schedules' })
  @ApiQuery({ name: 'serviceId', required: false, description: 'Filter by service' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'List of schedules', type: [ScheduleEntity] })
  findAll(
    @Query('serviceId') serviceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ScheduleEntity[]> {
    if (startDate && endDate) {
      return this.schedulesService.findByDateRange(startDate, endDate);
    }
    if (serviceId) {
      return this.schedulesService.findByService(serviceId);
    }
    return this.schedulesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a schedule by ID' })
  @ApiResponse({ status: 200, description: 'Schedule found', type: ScheduleEntity })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ScheduleEntity> {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a schedule' })
  @ApiResponse({ status: 200, description: 'Schedule updated successfully', type: ScheduleEntity })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<ScheduleEntity> {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a schedule (soft delete)' })
  @ApiResponse({ status: 200, description: 'Schedule removed successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.schedulesService.remove(id);
  }

  @Post(':id/teams')
  @ApiOperation({ summary: 'Add team to schedule' })
  @ApiResponse({ status: 201, description: 'Team added successfully', type: ScheduleTeamEntity })
  @ApiResponse({ status: 409, description: 'Team is already assigned to this schedule' })
  addTeam(
    @Param('id', ParseUUIDPipe) scheduleId: string,
    @Body() addTeamDto: AddTeamToScheduleDto,
  ): Promise<ScheduleTeamEntity> {
    return this.schedulesService.addTeam(scheduleId, addTeamDto);
  }

  @Get(':id/teams')
  @ApiOperation({ summary: 'List schedule teams' })
  @ApiResponse({ status: 200, description: 'List of teams', type: [ScheduleTeamEntity] })
  getTeams(@Param('id', ParseUUIDPipe) scheduleId: string): Promise<ScheduleTeamEntity[]> {
    return this.schedulesService.getTeams(scheduleId);
  }

  @Delete(':id/teams/:teamId')
  @ApiOperation({ summary: 'Remove team from schedule' })
  @ApiResponse({ status: 200, description: 'Team removed successfully' })
  @ApiResponse({ status: 404, description: 'Team is not assigned to this schedule' })
  removeTeam(
    @Param('id', ParseUUIDPipe) scheduleId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
  ): Promise<void> {
    return this.schedulesService.removeTeam(scheduleId, teamId);
  }
}
