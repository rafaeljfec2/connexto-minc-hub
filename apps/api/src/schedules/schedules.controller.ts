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
  @ApiOperation({ summary: 'Criar uma nova escala' })
  @ApiResponse({ status: 201, description: 'Escala criada com sucesso', type: ScheduleEntity })
  @ApiResponse({ status: 409, description: 'Já existe uma escala para este culto nesta data' })
  create(@Body() createScheduleDto: CreateScheduleDto): Promise<ScheduleEntity> {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as escalas' })
  @ApiQuery({ name: 'serviceId', required: false, description: 'Filtrar por culto' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data final (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Lista de escalas', type: [ScheduleEntity] })
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
  @ApiOperation({ summary: 'Obter uma escala por ID' })
  @ApiResponse({ status: 200, description: 'Escala encontrada', type: ScheduleEntity })
  @ApiResponse({ status: 404, description: 'Escala não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ScheduleEntity> {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma escala' })
  @ApiResponse({ status: 200, description: 'Escala atualizada com sucesso', type: ScheduleEntity })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<ScheduleEntity> {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma escala (soft delete)' })
  @ApiResponse({ status: 200, description: 'Escala removida com sucesso' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.schedulesService.remove(id);
  }

  @Post(':id/teams')
  @ApiOperation({ summary: 'Adicionar equipe à escala' })
  @ApiResponse({ status: 201, description: 'Equipe adicionada com sucesso', type: ScheduleTeamEntity })
  @ApiResponse({ status: 409, description: 'Equipe já está atribuída a esta escala' })
  addTeam(
    @Param('id', ParseUUIDPipe) scheduleId: string,
    @Body() addTeamDto: AddTeamToScheduleDto,
  ): Promise<ScheduleTeamEntity> {
    return this.schedulesService.addTeam(scheduleId, addTeamDto);
  }

  @Get(':id/teams')
  @ApiOperation({ summary: 'Listar equipes da escala' })
  @ApiResponse({ status: 200, description: 'Lista de equipes', type: [ScheduleTeamEntity] })
  getTeams(@Param('id', ParseUUIDPipe) scheduleId: string): Promise<ScheduleTeamEntity[]> {
    return this.schedulesService.getTeams(scheduleId);
  }

  @Delete(':id/teams/:teamId')
  @ApiOperation({ summary: 'Remover equipe da escala' })
  @ApiResponse({ status: 200, description: 'Equipe removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Equipe não está atribuída a esta escala' })
  removeTeam(
    @Param('id', ParseUUIDPipe) scheduleId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
  ): Promise<void> {
    return this.schedulesService.removeTeam(scheduleId, teamId);
  }
}
