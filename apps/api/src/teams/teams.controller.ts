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
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
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
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, description: 'Team created successfully', type: TeamEntity })
  create(@Body() createTeamDto: CreateTeamDto): Promise<TeamEntity> {
    return this.teamsService.create(createTeamDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all teams' })
  @ApiQuery({ name: 'ministryId', required: false, description: 'Filter by ministry' })
  @ApiResponse({ status: 200, description: 'List of teams', type: [TeamEntity] })
  findAll(@Query('ministryId') ministryId?: string): Promise<TeamEntity[]> {
    if (ministryId) {
      return this.teamsService.findByMinistry(ministryId);
    }
    return this.teamsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a team by ID' })
  @ApiResponse({ status: 200, description: 'Team found', type: TeamEntity })
  @ApiResponse({ status: 404, description: 'Team not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TeamEntity> {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a team' })
  @ApiResponse({ status: 200, description: 'Team updated successfully', type: TeamEntity })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ): Promise<TeamEntity> {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a team (soft delete)' })
  @ApiResponse({ status: 200, description: 'Team removed successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.teamsService.remove(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to team' })
  @ApiResponse({ status: 201, description: 'Member added successfully', type: TeamMemberEntity })
  @ApiResponse({ status: 409, description: 'Person is already a member of the team' })
  addMember(
    @Param('id', ParseUUIDPipe) teamId: string,
    @Body() addTeamMemberDto: AddTeamMemberDto,
  ): Promise<TeamMemberEntity> {
    return this.teamsService.addMember(teamId, addTeamMemberDto);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List team members' })
  @ApiResponse({ status: 200, description: 'List of members', type: [TeamMemberEntity] })
  getMembers(@Param('id', ParseUUIDPipe) teamId: string): Promise<TeamMemberEntity[]> {
    return this.teamsService.getMembers(teamId);
  }

  @Patch(':id/members/:personId')
  @ApiOperation({ summary: 'Update team member role or type' })
  @ApiResponse({ status: 200, description: 'Member updated successfully', type: TeamMemberEntity })
  @ApiResponse({ status: 404, description: 'Person is not a member of the team' })
  updateMemberRole(
    @Param('id', ParseUUIDPipe) teamId: string,
    @Param('personId', ParseUUIDPipe) personId: string,
    @Body() updateDto: UpdateTeamMemberDto,
  ): Promise<TeamMemberEntity> {
    return this.teamsService.updateMemberRole(teamId, personId, updateDto);
  }

  @Delete(':id/members/:personId')
  @ApiOperation({ summary: 'Remove member from team' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({ status: 404, description: 'Person is not a member of the team' })
  removeMember(
    @Param('id', ParseUUIDPipe) teamId: string,
    @Param('personId', ParseUUIDPipe) personId: string,
  ): Promise<void> {
    return this.teamsService.removeMember(teamId, personId);
  }
}
