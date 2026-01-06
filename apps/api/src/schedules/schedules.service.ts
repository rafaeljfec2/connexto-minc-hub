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
    private readonly schedulesRepository: Repository<ScheduleEntity>,
    @InjectRepository(ScheduleTeamEntity)
    private readonly scheduleTeamsRepository: Repository<ScheduleTeamEntity>,
  ) {}

  private getBaseQueryBuilder(alias = 'schedule') {
    return this.schedulesRepository
      .createQueryBuilder(alias)
      .select([
        `${alias}.id`,
        `${alias}.serviceId`,
        `${alias}.date`,
        `${alias}.createdAt`,
        `${alias}.updatedAt`,
        'service.id',
        'service.churchId',
        'service.type',
        'service.dayOfWeek',
        'service.time',
        'service.name',
        'service.isActive',
        'church.id',
        'church.name',
        'church.address',
        'church.phone',
        'church.email',
        'scheduleTeams.id',
        'scheduleTeams.scheduleId',
        'scheduleTeams.teamId',
        'team.id',
        'team.ministryId',
        'team.name',
        'team.description',
        'team.isActive',
      ])
      .leftJoin(`${alias}.service`, 'service')
      .leftJoin('service.church', 'church')
      .leftJoin(`${alias}.scheduleTeams`, 'scheduleTeams')
      .leftJoin('scheduleTeams.team', 'team')
      .where(`${alias}.deletedAt IS NULL`);
  }

  async create(createScheduleDto: CreateScheduleDto): Promise<ScheduleEntity> {
    const date = new Date(createScheduleDto.date);

    const existing = await this.schedulesRepository
      .createQueryBuilder('schedule')
      .select(['schedule.id'])
      .where('schedule.serviceId = :serviceId', { serviceId: createScheduleDto.serviceId })
      .andWhere('schedule.date = :date', { date })
      .andWhere('schedule.deletedAt IS NULL')
      .getOne();

    if (existing) {
      throw new ConflictException('A schedule already exists for this service on this date');
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
    return this.getBaseQueryBuilder().orderBy('schedule.date', 'DESC').getMany();
  }

  async findByService(serviceId: string): Promise<ScheduleEntity[]> {
    return this.getBaseQueryBuilder()
      .andWhere('schedule.serviceId = :serviceId', { serviceId })
      .orderBy('schedule.date', 'DESC')
      .getMany();
  }

  async findByDateRange(startDate: string, endDate: string): Promise<ScheduleEntity[]> {
    return this.getBaseQueryBuilder()
      .andWhere('schedule.date >= :startDate', { startDate })
      .andWhere('schedule.date <= :endDate', { endDate })
      .orderBy('schedule.date', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<ScheduleEntity> {
    const schedule = await this.getBaseQueryBuilder()
      .addSelect([
        'attendances.id',
        'attendances.scheduleId',
        'attendances.personId',
        'attendances.checkedInBy',
        'attendances.checkedInAt',
        'attendances.method',
        'attendances.absenceReason',
        'person.id',
        'person.ministryId',
        'person.teamId',
        'person.name',
        'person.email',
        'person.phone',
      ])
      .leftJoin('schedule.attendances', 'attendances')
      .leftJoin('attendances.person', 'person')
      .andWhere('schedule.id = :id', { id })
      .getOne();

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<ScheduleEntity> {
    // First verify the schedule exists
    await this.findOne(id);

    // Build update object with only the fields we want to update
    const updateData: { serviceId?: string; date?: string } = {};

    if (updateScheduleDto.serviceId) {
      updateData.serviceId = updateScheduleDto.serviceId;
    }

    if (updateScheduleDto.date) {
      // Keep date as string in YYYY-MM-DD format to avoid timezone issues
      updateData.date = updateScheduleDto.date;
    }

    // Use update method to ensure DB update
    if (Object.keys(updateData).length > 0) {
      await this.schedulesRepository.update(id, updateData);
    }

    // Handle team updates
    if (updateScheduleDto.teamIds !== undefined) {
      // Delete existing team assignments
      await this.scheduleTeamsRepository.delete({ scheduleId: id });

      // Add new team assignments if any
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

    // Reload from database
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
      throw new ConflictException('Team is already assigned to this schedule');
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
      throw new NotFoundException('Team is not assigned to this schedule');
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
