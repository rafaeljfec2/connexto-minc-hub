import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SchedulePlanningService } from './schedule-planning.service';
import { CreateSchedulePlanningConfigDto } from './dto/create-schedule-planning-config.dto';
import { UpdateSchedulePlanningConfigDto } from './dto/update-schedule-planning-config.dto';
import { CreateTeamPlanningConfigDto } from './dto/create-team-planning-config.dto';
import { UpdateTeamPlanningConfigDto } from './dto/update-team-planning-config.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { ApplyTemplateDto } from './dto/apply-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchedulePlanningConfigEntity } from './entities/schedule-planning-config.entity';
import { TeamPlanningConfigEntity } from './entities/team-planning-config.entity';
import { SchedulePlanningTemplateEntity } from './entities/schedule-planning-template.entity';

@ApiTags('Schedule Planning')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedule-planning')
export class SchedulePlanningController {
  constructor(private readonly schedulePlanningService: SchedulePlanningService) {}

  @Get('config/:churchId')
  @ApiOperation({ summary: 'Get schedule planning configuration for a church' })
  @ApiResponse({
    status: 200,
    description: 'Configuration found',
    type: SchedulePlanningConfigEntity,
  })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  getConfig(@Param('churchId', ParseUUIDPipe) churchId: string) {
    return this.schedulePlanningService.getConfigByChurch(churchId);
  }

  @Post('config/:churchId')
  @ApiOperation({ summary: 'Create or update schedule planning configuration for a church' })
  @ApiResponse({
    status: 200,
    description: 'Configuration created or updated successfully',
    type: SchedulePlanningConfigEntity,
  })
  createOrUpdateConfig(
    @Param('churchId', ParseUUIDPipe) churchId: string,
    @Body() dto: CreateSchedulePlanningConfigDto | UpdateSchedulePlanningConfigDto,
  ) {
    return this.schedulePlanningService.createOrUpdateConfig(churchId, dto);
  }

  @Get('team/:teamId/config')
  @ApiOperation({ summary: 'Get schedule planning configuration for a team' })
  @ApiResponse({
    status: 200,
    description: 'Team configuration found',
    type: TeamPlanningConfigEntity,
  })
  @ApiResponse({ status: 404, description: 'Team configuration not found' })
  getTeamConfig(@Param('teamId', ParseUUIDPipe) teamId: string) {
    return this.schedulePlanningService.getTeamConfig(teamId);
  }

  @Post('team/:teamId/config')
  @ApiOperation({ summary: 'Create or update schedule planning configuration for a team' })
  @ApiResponse({
    status: 200,
    description: 'Team configuration created or updated successfully',
    type: TeamPlanningConfigEntity,
  })
  createOrUpdateTeamConfig(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Body() dto: CreateTeamPlanningConfigDto | UpdateTeamPlanningConfigDto,
  ) {
    return this.schedulePlanningService.createOrUpdateTeamConfig(teamId, dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List all schedule planning templates' })
  @ApiResponse({
    status: 200,
    description: 'List of templates',
    type: [SchedulePlanningTemplateEntity],
  })
  getAllTemplates(@Query('churchId') churchId?: string) {
    if (churchId) {
      return this.schedulePlanningService.getTemplatesByChurch(churchId);
    }
    return this.schedulePlanningService.getAllTemplates();
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create a new schedule planning template' })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
    type: SchedulePlanningTemplateEntity,
  })
  createTemplate(@Body() body: CreateTemplateDto & { churchId: string }) {
    const { churchId, ...dto } = body;
    if (!churchId) {
      throw new Error('Church ID is required');
    }
    return this.schedulePlanningService.createTemplate(churchId, dto);
  }

  @Post('templates/:templateId/apply')
  @ApiOperation({ summary: 'Apply a template to a church' })
  @ApiResponse({
    status: 200,
    description: 'Template applied successfully',
    type: SchedulePlanningConfigEntity,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  applyTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @Body() dto: ApplyTemplateDto,
  ) {
    return this.schedulePlanningService.applyTemplate(dto.churchId, templateId);
  }

  @Delete('templates/:templateId')
  @ApiOperation({ summary: 'Delete a schedule planning template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 403, description: 'Cannot delete system templates' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  deleteTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @Body() body: { churchId: string },
  ) {
    if (!body.churchId) {
      throw new Error('Church ID is required');
    }
    return this.schedulePlanningService.deleteTemplate(templateId, body.churchId);
  }
}
