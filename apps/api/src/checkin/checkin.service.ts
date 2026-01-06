import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleEntity } from '../schedules/entities/schedule.entity';
import { ScheduleTeamEntity } from '../schedules/entities/schedule-team.entity';
import { ServiceEntity } from '../services/entities/service.entity';
import { AttendanceEntity, AttendanceMethod } from '../attendances/entities/attendance.entity';
import { PersonEntity } from '../persons/entities/person.entity';
import { TeamMemberEntity } from '../teams/entities/team-member.entity';
import { UserEntity } from '../users/entities/user.entity';
import { GenerateQrCodeDto } from './dto/generate-qr-code.dto';
import { ValidateQrCodeDto } from './dto/validate-qr-code.dto';
import { QrCodeDataDto } from './dto/qr-code-data.dto';
import { validateCheckInTime, isQrCodeExpired } from './utils/checkin-time.utils';

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private schedulesRepository: Repository<ScheduleEntity>,
    @InjectRepository(ScheduleTeamEntity)
    private scheduleTeamsRepository: Repository<ScheduleTeamEntity>,
    @InjectRepository(ServiceEntity)
    private servicesRepository: Repository<ServiceEntity>,
    @InjectRepository(AttendanceEntity)
    private attendancesRepository: Repository<AttendanceEntity>,
    @InjectRepository(PersonEntity)
    private personsRepository: Repository<PersonEntity>,
    @InjectRepository(TeamMemberEntity)
    private teamMembersRepository: Repository<TeamMemberEntity>,
  ) {}

  /**
   * Generate QR Code for check-in
   * Validates:
   * 1. Person has a schedule for the date
   * 2. Check-in is allowed 30 minutes before service time
   */
  async generateQrCode(
    user: UserEntity,
    generateQrCodeDto: GenerateQrCodeDto,
  ): Promise<{ qrCode: string; schedule: ScheduleEntity; expiresAt: Date }> {
    if (!user.personId) {
      throw new BadRequestException('User must be linked to a person to generate QR code');
    }

    const person = await this.personsRepository.findOne({
      where: { id: user.personId },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    // Get date (default to today)
    const targetDate = generateQrCodeDto.date ? new Date(generateQrCodeDto.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Find teams the person belongs to (optimized: single query)
    const personTeams = await this.teamMembersRepository.find({
      where: { personId: person.id },
      select: ['teamId'],
    });

    const teamIds = personTeams.map((tm) => tm.teamId);

    if (teamIds.length === 0) {
      throw new BadRequestException('Person must belong to at least one team');
    }

    // Find schedules for the date where person's teams are assigned (optimized: single query)
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
      .where('schedule.date = :date', { date: targetDate })
      .andWhere('schedule.deletedAt IS NULL')
      .andWhere('service.isActive = true')
      .andWhere('scheduleTeam.teamId IN (:...teamIds)', { teamIds })
      .getMany();

    if (validSchedules.length === 0) {
      throw new NotFoundException('No schedules found for this person on this date');
    }

    // Get the first valid schedule (or the one for today's service)
    const schedule = validSchedules[0];
    
    // Service is already loaded from the query above
    const service = (schedule as any).service as ServiceEntity;
    
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Validate check-in time (30 minutes before service)
    const timeValidation = validateCheckInTime(service, targetDate);
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

    // QR Code expires at service time
    const expiresAt = timeValidation.serviceTime;

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
    let qrCodeData: QrCodeDataDto;

    try {
      const parsed = JSON.parse(qrCodeDto.qrCodeData);
      qrCodeData = parsed as QrCodeDataDto;
    } catch (error) {
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

    // Service is already loaded from the query above
    const service = (schedule as any).service as ServiceEntity;

    // Validate service matches
    if (schedule.serviceId !== qrCodeData.serviceId) {
      throw new BadRequestException('QR Code service does not match schedule service');
    }

    // Validate date matches
    const scheduleDate = new Date(schedule.date).toISOString().split('T')[0];
    if (scheduleDate !== qrCodeData.date) {
      throw new BadRequestException('QR Code date does not match schedule date');
    }

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
}
