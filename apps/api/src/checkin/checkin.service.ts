import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ScheduleEntity } from '../schedules/entities/schedule.entity';
import { ScheduleTeamEntity } from '../schedules/entities/schedule-team.entity';
import { ServiceEntity } from '../services/entities/service.entity';
import { AttendanceEntity, AttendanceMethod } from '../attendances/entities/attendance.entity';
import { PersonEntity } from '../persons/entities/person.entity';
import { TeamMemberEntity } from '../teams/entities/team-member.entity';
import { TeamEntity } from '../teams/entities/team.entity';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { GenerateQrCodeDto } from './dto/generate-qr-code.dto';
import { ValidateQrCodeDto } from './dto/validate-qr-code.dto';
import { QrCodeDataDto } from './dto/qr-code-data.dto';
import { validateCheckInTime, isQrCodeExpired } from './utils/checkin-time.utils';

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly schedulesRepository: Repository<ScheduleEntity>,
    @InjectRepository(ScheduleTeamEntity)
    private readonly scheduleTeamsRepository: Repository<ScheduleTeamEntity>,
    @InjectRepository(ServiceEntity)
    private readonly servicesRepository: Repository<ServiceEntity>,
    @InjectRepository(AttendanceEntity)
    private readonly attendancesRepository: Repository<AttendanceEntity>,
    @InjectRepository(PersonEntity)
    private readonly personsRepository: Repository<PersonEntity>,
    @InjectRepository(TeamMemberEntity)
    private readonly teamMembersRepository: Repository<TeamMemberEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamsRepository: Repository<TeamEntity>,
  ) {}

  /**
   * Generate QR Code for check-in
   *
   * This method considers two types of team relationships:
   * 1. Direct relationship (1:N): persons.team_id - the person's primary/fixed team
   * 2. Many-to-many relationship (N:N): team_members table - all teams the person serves in
   *
   * A person can:
   * - Serve in multiple teams from the same ministry
   * - Serve in teams from different ministries
   * - Have a fixed team (persons.team_id) and also help in other teams occasionally (team_members)
   *
   * Validates:
   * - User is linked to a person
   * - Person belongs to at least one active team (from either relationship)
   * - There is an active schedule for the person's teams on the target date
   * - Check-in time is within the allowed window (30 minutes before service)
   * - Person has not already checked in for this schedule
   */
  async generateQrCode(
    user: UserEntity,
    generateQrCodeDto: GenerateQrCodeDto,
  ): Promise<{ qrCode: string; schedule: ScheduleEntity; expiresAt: Date }> {
    if (!user.personId) {
      throw new BadRequestException(
        `User ${user.email} (${user.name}) must be linked to a person to generate QR code`,
      );
    }

    const person = await this.personsRepository.findOne({
      where: { id: user.personId },
    });

    if (!person) {
      throw new NotFoundException(
        `Person with ID ${user.personId} not found for user ${user.email}`,
      );
    }

    // Get date (default to today) - use UTC to avoid timezone issues
    let targetDate: Date;
    if (generateQrCodeDto.date) {
      // If date is provided as string (YYYY-MM-DD), parse it in UTC
      const dateParts = generateQrCodeDto.date.split('-').map(Number);
      targetDate = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2], 0, 0, 0, 0));
    } else {
      // Get today's date in UTC
      const now = new Date();
      targetDate = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
      );
    }

    // Collect all active team IDs the person belongs to
    const uniqueTeamIds = await this.getActiveTeamIds(person, user);

    // Find schedules for the date where person's teams are assigned
    const validSchedules = await this.findValidSchedules(uniqueTeamIds, targetDate, person);

    // Get the first valid schedule (or the one for today's service)
    const schedule = validSchedules[0];

    // Service is already loaded from the query above
    const service = schedule.service;

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Validate check-in time (30 minutes before service)
    // Use schedule.date from DB (it's already a Date object)
    const timeValidation = validateCheckInTime(service, schedule.date);
    if (!timeValidation.isValid) {
      throw new ForbiddenException(timeValidation.errorMessage);
    }

    // Check if already checked in
    const existingAttendance = await this.attendancesRepository.findOne({
      where: {
        scheduleId: schedule.id,
        personId: person.id,
      },
    });

    if (existingAttendance) {
      throw new BadRequestException('Already checked in for this schedule');
    }

    // Generate QR Code data
    const qrCodeData: QrCodeDataDto = {
      scheduleId: schedule.id,
      personId: person.id,
      serviceId: service.id,
      date: targetDate.toISOString().split('T')[0],
      timestamp: Date.now(),
    };

    const qrCode = JSON.stringify(qrCodeData);

    // QR Code expires at check-in close time (1h after service start)
    const expiresAt = timeValidation.checkInCloseTime;

    return {
      qrCode,
      schedule,
      expiresAt,
    };
  }

  /**
   * Validate and process QR Code check-in
   */
  async validateQrCode(
    qrCodeDto: ValidateQrCodeDto,
    checkedInBy: UserEntity,
  ): Promise<AttendanceEntity> {
    if (checkedInBy.role !== UserRole.ADMIN && !checkedInBy.canCheckIn) {
      throw new ForbiddenException('You do not have permission to perform check-ins');
    }

    const qrCodeData = this.validateQrCodeData(qrCodeDto);

    // Validate schedule exists
    const schedule = await this.schedulesRepository
      .createQueryBuilder('schedule')
      .select([
        'schedule.id',
        'schedule.serviceId',
        'schedule.date',
        'service.id',
        'service.churchId',
        'service.type',
        'service.name',
        'service.time',
      ])
      .leftJoinAndSelect('schedule.service', 'service')
      .where('schedule.id = :scheduleId', { scheduleId: qrCodeData.scheduleId })
      .andWhere('schedule.deletedAt IS NULL')
      .getOne();

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    this.validateScheduleAndService(schedule, qrCodeData);

    // Service is already loaded from the query above
    const service = schedule.service;

    // Validate person exists
    const person = await this.personsRepository.findOne({
      where: { id: qrCodeData.personId },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    // Check if already checked in
    const existingAttendance = await this.attendancesRepository.findOne({
      where: {
        scheduleId: schedule.id,
        personId: person.id,
      },
    });

    if (existingAttendance) {
      throw new BadRequestException('Person already checked in for this schedule');
    }

    // Validate check-in time (30 minutes before service)
    const timeValidation = validateCheckInTime(service, schedule.date);
    if (!timeValidation.isValid) {
      throw new ForbiddenException(timeValidation.errorMessage);
    }

    // Create attendance record
    const attendance = this.attendancesRepository.create({
      scheduleId: schedule.id,
      personId: person.id,
      checkedInBy: checkedInBy.id,
      checkedInAt: new Date(),
      method: AttendanceMethod.QR_CODE,
      qrCodeData: qrCodeData as unknown as Record<string, unknown>,
    });

    return this.attendancesRepository.save(attendance);
  }

  /**
   * Get check-in history for a person
   */
  async getCheckInHistory(personId: string, limit = 50): Promise<AttendanceEntity[]> {
    return this.attendancesRepository
      .createQueryBuilder('attendance')
      .select([
        'attendance.id',
        'attendance.scheduleId',
        'attendance.personId',
        'attendance.checkedInBy',
        'attendance.checkedInAt',
        'attendance.method',
        'attendance.qrCodeData',
        'attendance.createdAt',
        'schedule.id',
        'schedule.serviceId',
        'schedule.date',
        'service.id',
        'service.churchId',
        'service.type',
        'service.name',
        'service.time',
      ])
      .leftJoin('attendance.schedule', 'schedule')
      .leftJoin('schedule.service', 'service')
      .where('attendance.personId = :personId', { personId })
      .orderBy('attendance.checkedInAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  /* Private Helper Methods */

  private async getActiveTeamIds(person: PersonEntity, user: UserEntity): Promise<string[]> {
    const teamIds: string[] = [];

    // 1. Get teams from team_members table (N:N relationship) - active teams only
    const personTeamsFromMembers = await this.teamMembersRepository
      .createQueryBuilder('teamMember')
      .select(['teamMember.teamId'])
      .innerJoin('teamMember.team', 'team')
      .where('teamMember.personId = :personId', { personId: person.id })
      .andWhere('team.isActive = :isActive', { isActive: true })
      .andWhere('team.deletedAt IS NULL')
      .getMany();

    teamIds.push(...personTeamsFromMembers.map((tm) => tm.teamId));

    // 2. Check if person has a direct team_id (1:N relationship - primary/fixed team)
    if (person.teamId) {
      // Verify if the direct team is active and not deleted
      const directTeam = await this.teamsRepository.findOne({
        where: {
          id: person.teamId,
          isActive: true,
          deletedAt: IsNull(),
        },
        select: ['id'],
      });

      if (directTeam) {
        teamIds.push(directTeam.id);
      }
    }

    // Remove duplicates
    const uniqueTeamIds = [...new Set(teamIds)];

    if (uniqueTeamIds.length === 0) {
      // Logic for meaningful error message
      const allPersonTeamsFromMembers = await this.teamMembersRepository
        .createQueryBuilder('teamMember')
        .where('teamMember.personId = :personId', { personId: person.id })
        .getCount();

      const directTeamExists = person.teamId
        ? (await this.teamsRepository.count({ where: { id: person.teamId } })) > 0
        : false;

      if (allPersonTeamsFromMembers === 0 && !directTeamExists) {
        throw new BadRequestException(
          `Person ${person.name} (ID: ${person.id}) linked to user ${user.email} is not a member of any team. Please add this person to at least one team.`,
        );
      } else {
        const totalTeams = allPersonTeamsFromMembers + (directTeamExists ? 1 : 0);
        throw new BadRequestException(
          `Person ${person.name} (ID: ${person.id}) linked to user ${user.email} is associated with ${totalTeams} team(s), but none of them are active. Please activate at least one team.`,
        );
      }
    }

    return uniqueTeamIds;
  }

  private async findValidSchedules(
    teamIds: string[],
    date: Date,
    person: PersonEntity,
  ): Promise<ScheduleEntity[]> {
    const validSchedules = await this.schedulesRepository
      .createQueryBuilder('schedule')
      .select([
        'schedule.id',
        'schedule.serviceId',
        'schedule.date',
        'service.id',
        'service.churchId',
        'service.type',
        'service.name',
        'service.time',
        'service.dayOfWeek',
      ])
      .leftJoinAndSelect('schedule.service', 'service')
      .innerJoin('schedule.scheduleTeams', 'scheduleTeam')
      .where('CAST(schedule.date AS DATE) = :date', {
        date: date.toISOString().split('T')[0],
      })
      .andWhere('schedule.deletedAt IS NULL')
      .andWhere('service.isActive = true')
      .andWhere('service.deletedAt IS NULL')
      .andWhere('scheduleTeam.teamId IN (:...teamIds)', { teamIds })
      .getMany();

    if (validSchedules.length === 0) {
      throw new NotFoundException(
        `No schedules found for person ${person.name} (ID: ${person.id}) on date ${date.toISOString().split('T')[0]}`,
      );
    }

    return validSchedules;
  }

  private validateQrCodeData(qrCodeDto: ValidateQrCodeDto): QrCodeDataDto {
    let qrCodeData: QrCodeDataDto;

    try {
      const parsed = JSON.parse(qrCodeDto.qrCodeData);
      qrCodeData = parsed as QrCodeDataDto;
    } catch {
      throw new BadRequestException('Invalid QR Code format');
    }

    // Validate QR Code structure
    if (
      !qrCodeData.scheduleId ||
      !qrCodeData.personId ||
      !qrCodeData.serviceId ||
      !qrCodeData.date ||
      !qrCodeData.timestamp
    ) {
      throw new BadRequestException('Invalid QR Code data structure');
    }

    // Validate timestamp (QR Code expires after 1 hour)
    if (isQrCodeExpired(qrCodeData.timestamp)) {
      throw new BadRequestException('QR Code has expired');
    }

    return qrCodeData;
  }

  private validateScheduleAndService(schedule: ScheduleEntity, qrCodeData: QrCodeDataDto): void {
    // Validate service matches
    if (schedule.serviceId !== qrCodeData.serviceId) {
      throw new BadRequestException('QR Code service does not match schedule service');
    }

    // Validate date matches
    const scheduleDate = new Date(schedule.date).toISOString().split('T')[0];
    if (scheduleDate !== qrCodeData.date) {
      throw new BadRequestException('QR Code date does not match schedule date');
    }
  }
}
