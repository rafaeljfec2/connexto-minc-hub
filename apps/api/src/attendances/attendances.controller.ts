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
  @ApiOperation({ summary: 'Registrar check-in/presença' })
  @ApiResponse({ status: 201, description: 'Check-in registrado com sucesso', type: AttendanceEntity })
  @ApiResponse({ status: 409, description: 'Check-in já registrado para esta pessoa nesta escala' })
  create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @GetUser() user: UserEntity,
  ): Promise<AttendanceEntity> {
    return this.attendancesService.create(createAttendanceDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os check-ins' })
  @ApiQuery({ name: 'scheduleId', required: false, description: 'Filtrar por escala' })
  @ApiQuery({ name: 'personId', required: false, description: 'Filtrar por pessoa' })
  @ApiResponse({ status: 200, description: 'Lista de check-ins', type: [AttendanceEntity] })
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
  @ApiOperation({ summary: 'Obter estatísticas de presença de uma escala' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de presença',
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
  @ApiOperation({ summary: 'Obter um check-in por ID' })
  @ApiResponse({ status: 200, description: 'Check-in encontrado', type: AttendanceEntity })
  @ApiResponse({ status: 404, description: 'Check-in não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AttendanceEntity> {
    return this.attendancesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um check-in' })
  @ApiResponse({ status: 200, description: 'Check-in atualizado com sucesso', type: AttendanceEntity })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<AttendanceEntity> {
    return this.attendancesService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um check-in' })
  @ApiResponse({ status: 200, description: 'Check-in removido com sucesso' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.attendancesService.remove(id);
  }
}
