import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleEntity } from './entities/schedule.entity';
import { ScheduleTeamEntity } from './entities/schedule-team.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AddTeamToScheduleDto } from './dto/add-team-to-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private schedulesRepository: Repository<ScheduleEntity>,
    @InjectRepository(ScheduleTeamEntity)
    private scheduleTeamsRepository: Repository<ScheduleTeamEntity>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<ScheduleEntity> {
    const date = new Date(createScheduleDto.date);

    const existing = await this.schedulesRepository.findOne({
      where: { serviceId: createScheduleDto.serviceId, date, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException('Já existe uma escala para este culto nesta data');
    }

    const schedule = this.schedulesRepository.create({
      serviceId: createScheduleDto.serviceId,
      date,
    });

    const savedSchedule = await this.schedulesRepository.save(schedule);

    if (createScheduleDto.teamIds && createScheduleDto.teamIds.length > 0) {
      const scheduleTeams = createScheduleDto.teamIds.map((teamId) =>
        this.scheduleTeamsRepository.create({
          scheduleId: savedSchedule.id,
          teamId,
        }),
      );
      await this.scheduleTeamsRepository.save(scheduleTeams);
    }

    return this.findOne(savedSchedule.id);
  }

  async findAll(): Promise<ScheduleEntity[]> {
    return this.schedulesRepository.find({
      where: { deletedAt: null },
      relations: ['service', 'service.church', 'scheduleTeams', 'scheduleTeams.team'],
      order: { date: 'DESC' },
    });
  }

  async findByService(serviceId: string): Promise<ScheduleEntity[]> {
    return this.schedulesRepository.find({
      where: { serviceId, deletedAt: null },
      relations: ['service', 'scheduleTeams', 'scheduleTeams.team'],
      order: { date: 'DESC' },
    });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<ScheduleEntity[]> {
    return this.schedulesRepository
      .createQueryBuilder('schedule')
      .where('schedule.deletedAt IS NULL')
      .andWhere('schedule.date >= :startDate', { startDate })
      .andWhere('schedule.date <= :endDate', { endDate })
      .leftJoinAndSelect('schedule.service', 'service')
      .leftJoinAndSelect('service.church', 'church')
      .leftJoinAndSelect('schedule.scheduleTeams', 'scheduleTeams')
      .leftJoinAndSelect('scheduleTeams.team', 'team')
      .orderBy('schedule.date', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<ScheduleEntity> {
    const schedule = await this.schedulesRepository.findOne({
      where: { id, deletedAt: null },
      relations: [
        'service',
        'service.church',
        'scheduleTeams',
        'scheduleTeams.team',
        'attendances',
        'attendances.person',
      ],
    });

    if (!schedule) {
      throw new NotFoundException(`Escala com ID ${id} não encontrada`);
    }

    return schedule;
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<ScheduleEntity> {
    const schedule = await this.findOne(id);

    if (updateScheduleDto.date) {
      schedule.date = new Date(updateScheduleDto.date);
    }

    if (updateScheduleDto.serviceId) {
      schedule.serviceId = updateScheduleDto.serviceId;
    }

    await this.schedulesRepository.save(schedule);

    if (updateScheduleDto.teamIds) {
      await this.scheduleTeamsRepository.delete({ scheduleId: id });

      if (updateScheduleDto.teamIds.length > 0) {
        const scheduleTeams = updateScheduleDto.teamIds.map((teamId) =>
          this.scheduleTeamsRepository.create({
            scheduleId: id,
            teamId,
          }),
        );
        await this.scheduleTeamsRepository.save(scheduleTeams);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.schedulesRepository.softDelete(id);
  }

  async addTeam(scheduleId: string, addTeamDto: AddTeamToScheduleDto): Promise<ScheduleTeamEntity> {
    await this.findOne(scheduleId);

    const existing = await this.scheduleTeamsRepository.findOne({
      where: { scheduleId, teamId: addTeamDto.teamId },
    });

    if (existing) {
      throw new ConflictException('Equipe já está atribuída a esta escala');
    }

    const scheduleTeam = this.scheduleTeamsRepository.create({
      scheduleId,
      teamId: addTeamDto.teamId,
    });

    return this.scheduleTeamsRepository.save(scheduleTeam);
  }

  async removeTeam(scheduleId: string, teamId: string): Promise<void> {
    await this.findOne(scheduleId);

    const scheduleTeam = await this.scheduleTeamsRepository.findOne({
      where: { scheduleId, teamId },
    });

    if (!scheduleTeam) {
      throw new NotFoundException('Equipe não está atribuída a esta escala');
    }

    await this.scheduleTeamsRepository.remove(scheduleTeam);
  }

  async getTeams(scheduleId: string): Promise<ScheduleTeamEntity[]> {
    await this.findOne(scheduleId);
    return this.scheduleTeamsRepository.find({
      where: { scheduleId },
      relations: ['team'],
    });
  }
}
