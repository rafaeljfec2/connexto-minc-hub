import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { SchedulePlanningConfigEntity } from './entities/schedule-planning-config.entity';
import { TeamPlanningConfigEntity } from './entities/team-planning-config.entity';
import { SchedulePlanningTemplateEntity } from './entities/schedule-planning-template.entity';
import { CreateSchedulePlanningConfigDto } from './dto/create-schedule-planning-config.dto';
import { UpdateSchedulePlanningConfigDto } from './dto/update-schedule-planning-config.dto';
import { CreateTeamPlanningConfigDto } from './dto/create-team-planning-config.dto';
import { UpdateTeamPlanningConfigDto } from './dto/update-team-planning-config.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TeamEntity } from '../teams/entities/team.entity';

@Injectable()
export class SchedulePlanningService {
  constructor(
    @InjectRepository(SchedulePlanningConfigEntity)
    private configRepository: Repository<SchedulePlanningConfigEntity>,
    @InjectRepository(TeamPlanningConfigEntity)
    private teamConfigRepository: Repository<TeamPlanningConfigEntity>,
    @InjectRepository(SchedulePlanningTemplateEntity)
    private templateRepository: Repository<SchedulePlanningTemplateEntity>,
    @InjectRepository(TeamEntity)
    private teamRepository: Repository<TeamEntity>,
  ) {}

  async getConfigByChurch(churchId: string): Promise<SchedulePlanningConfigEntity | null> {
    return this.configRepository.findOne({
      where: { churchId, deletedAt: IsNull() },
      relations: ['church'],
    });
  }

  async createOrUpdateConfig(
    churchId: string,
    dto: CreateSchedulePlanningConfigDto | UpdateSchedulePlanningConfigDto,
  ): Promise<SchedulePlanningConfigEntity> {
    const existing = await this.getConfigByChurch(churchId);

    if (existing) {
      Object.assign(existing, {
        maxTeamMembers: dto.maxTeamMembers ?? existing.maxTeamMembers,
        servicesPerSunday: dto.servicesPerSunday ?? existing.servicesPerSunday,
        teamsServeOncePerMonth: dto.teamsServeOncePerMonth ?? existing.teamsServeOncePerMonth,
        enableLotteryForExtraServices:
          dto.enableLotteryForExtraServices ?? existing.enableLotteryForExtraServices,
        enableTimeRotation: dto.enableTimeRotation ?? existing.enableTimeRotation,
      });
      return this.configRepository.save(existing);
    }

    const config = this.configRepository.create({
      churchId,
      maxTeamMembers: dto.maxTeamMembers ?? 10,
      servicesPerSunday: dto.servicesPerSunday ?? 4,
      teamsServeOncePerMonth: dto.teamsServeOncePerMonth ?? true,
      enableLotteryForExtraServices: dto.enableLotteryForExtraServices ?? true,
      enableTimeRotation: dto.enableTimeRotation ?? true,
    });

    return this.configRepository.save(config);
  }

  async getTeamConfig(teamId: string): Promise<TeamPlanningConfigEntity | null> {
    return this.teamConfigRepository.findOne({
      where: { teamId, deletedAt: IsNull() },
      relations: ['team'],
    });
  }

  async createOrUpdateTeamConfig(
    teamId: string,
    dto: CreateTeamPlanningConfigDto | UpdateTeamPlanningConfigDto,
  ): Promise<TeamPlanningConfigEntity> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId, deletedAt: IsNull() },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    const existing = await this.getTeamConfig(teamId);

    if (existing) {
      Object.assign(existing, {
        maxTeamMembers: dto.maxTeamMembers !== undefined ? dto.maxTeamMembers : existing.maxTeamMembers,
        teamsServeOncePerMonth:
          dto.teamsServeOncePerMonth !== undefined
            ? dto.teamsServeOncePerMonth
            : existing.teamsServeOncePerMonth,
        enableLotteryForExtraServices:
          dto.enableLotteryForExtraServices !== undefined
            ? dto.enableLotteryForExtraServices
            : existing.enableLotteryForExtraServices,
        enableTimeRotation:
          dto.enableTimeRotation !== undefined ? dto.enableTimeRotation : existing.enableTimeRotation,
      });
      return this.teamConfigRepository.save(existing);
    }

    const config = this.teamConfigRepository.create({
      teamId,
      maxTeamMembers: dto.maxTeamMembers ?? null,
      teamsServeOncePerMonth: dto.teamsServeOncePerMonth ?? null,
      enableLotteryForExtraServices: dto.enableLotteryForExtraServices ?? null,
      enableTimeRotation: dto.enableTimeRotation ?? null,
    });

    return this.teamConfigRepository.save(config);
  }

  async getAllTemplates(): Promise<SchedulePlanningTemplateEntity[]> {
    return this.templateRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['createdByChurch'],
      order: { isSystemTemplate: 'DESC', name: 'ASC' },
    });
  }

  async getTemplatesByChurch(churchId: string): Promise<SchedulePlanningTemplateEntity[]> {
    return this.templateRepository.find({
      where: [
        { isSystemTemplate: true, deletedAt: IsNull() },
        { createdByChurchId: churchId, deletedAt: IsNull() },
      ],
      relations: ['createdByChurch'],
      order: { isSystemTemplate: 'DESC', name: 'ASC' },
    });
  }

  async createTemplate(
    churchId: string,
    dto: CreateTemplateDto,
  ): Promise<SchedulePlanningTemplateEntity> {
    const template = this.templateRepository.create({
      ...dto,
      isSystemTemplate: false,
      createdByChurchId: churchId,
    });

    return this.templateRepository.save(template);
  }

  async applyTemplate(churchId: string, templateId: string): Promise<SchedulePlanningConfigEntity> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId, deletedAt: IsNull() },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    return this.createOrUpdateConfig(churchId, {
      maxTeamMembers: template.maxTeamMembers,
      servicesPerSunday: template.servicesPerSunday,
      teamsServeOncePerMonth: template.teamsServeOncePerMonth,
      enableLotteryForExtraServices: template.enableLotteryForExtraServices,
      enableTimeRotation: template.enableTimeRotation,
    });
  }

  async deleteTemplate(templateId: string, churchId: string): Promise<void> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId, deletedAt: IsNull() },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    if (template.isSystemTemplate) {
      throw new ForbiddenException('Cannot delete system templates');
    }

    if (template.createdByChurchId !== churchId) {
      throw new ForbiddenException('Cannot delete templates created by other churches');
    }

    await this.templateRepository.softDelete(templateId);
  }
}
