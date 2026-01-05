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
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamEntity } from './entities/team.entity';
import { TeamMemberEntity } from './entities/team-member.entity';

@ApiTags('Teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova equipe' })
  @ApiResponse({ status: 201, description: 'Equipe criada com sucesso', type: TeamEntity })
  create(@Body() createTeamDto: CreateTeamDto): Promise<TeamEntity> {
    return this.teamsService.create(createTeamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as equipes' })
  @ApiQuery({ name: 'ministryId', required: false, description: 'Filtrar por ministério' })
  @ApiResponse({ status: 200, description: 'Lista de equipes', type: [TeamEntity] })
  findAll(@Query('ministryId') ministryId?: string): Promise<TeamEntity[]> {
    if (ministryId) {
      return this.teamsService.findByMinistry(ministryId);
    }
    return this.teamsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma equipe por ID' })
  @ApiResponse({ status: 200, description: 'Equipe encontrada', type: TeamEntity })
  @ApiResponse({ status: 404, description: 'Equipe não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TeamEntity> {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma equipe' })
  @ApiResponse({ status: 200, description: 'Equipe atualizada com sucesso', type: TeamEntity })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ): Promise<TeamEntity> {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma equipe (soft delete)' })
  @ApiResponse({ status: 200, description: 'Equipe removida com sucesso' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.teamsService.remove(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Adicionar membro à equipe' })
  @ApiResponse({ status: 201, description: 'Membro adicionado com sucesso', type: TeamMemberEntity })
  @ApiResponse({ status: 409, description: 'Pessoa já é membro da equipe' })
  addMember(
    @Param('id', ParseUUIDPipe) teamId: string,
    @Body() addTeamMemberDto: AddTeamMemberDto,
  ): Promise<TeamMemberEntity> {
    return this.teamsService.addMember(teamId, addTeamMemberDto);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Listar membros da equipe' })
  @ApiResponse({ status: 200, description: 'Lista de membros', type: [TeamMemberEntity] })
  getMembers(@Param('id', ParseUUIDPipe) teamId: string): Promise<TeamMemberEntity[]> {
    return this.teamsService.getMembers(teamId);
  }

  @Delete(':id/members/:personId')
  @ApiOperation({ summary: 'Remover membro da equipe' })
  @ApiResponse({ status: 200, description: 'Membro removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Pessoa não é membro da equipe' })
  removeMember(
    @Param('id', ParseUUIDPipe) teamId: string,
    @Param('personId', ParseUUIDPipe) personId: string,
  ): Promise<void> {
    return this.teamsService.removeMember(teamId, personId);
  }
}
