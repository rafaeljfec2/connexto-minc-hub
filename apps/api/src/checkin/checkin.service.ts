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

interface QrCodeData {
  scheduleId: string;
  personId: string;
  serviceId: string;
  date: string;
  timestamp: number;
}

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

    // Find schedules for the date
    const schedules = await this.schedulesRepository
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
      .leftJoin('schedule.service', 'service')
      .where('schedule.date = :date', { date: targetDate })
      .andWhere('schedule.deletedAt IS NULL')
      .andWhere('service.isActive = true')
      .getMany();

    if (schedules.length === 0) {
      throw new NotFoundException('No schedules found for this date');
    }

    // Find teams the person belongs to
    const personTeams = await this.teamMembersRepository
      .createQueryBuilder('teamMember')
      .select(['teamMember.teamId'])
      .where('teamMember.personId = :personId', { personId: person.id })
      .getMany();

    const teamIds = personTeams.map((tm) => tm.teamId);

    if (teamIds.length === 0) {
      throw new BadRequestException('Person must belong to at least one team');
    }

    // Find schedules where person's teams are assigned
    const scheduleTeams = await this.scheduleTeamsRepository
      .createQueryBuilder('scheduleTeam')
      .select(['scheduleTeam.scheduleId', 'scheduleTeam.teamId'])
      .where('scheduleTeam.teamId IN (:...teamIds)', { teamIds })
      .andWhere('scheduleTeam.scheduleId IN (:...scheduleIds)', {
        scheduleIds: schedules.map((s) => s.id),
      })
      .getMany();

    const validScheduleIds = scheduleTeams.map((st) => st.scheduleId);
    const validSchedules = schedules.filter((s) => validScheduleIds.includes(s.id));

    if (validSchedules.length === 0) {
      throw new NotFoundException('No schedules found for this person on this date');
    }

    // Get the first valid schedule (or the one for today's service)
    const schedule = validSchedules[0];
    const service = await this.servicesRepository.findOne({
      where: { id: schedule.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Validate check-in time (30 minutes before service)
    const now = new Date();
    const serviceTime = new Date(targetDate);
    const [hours, minutes] = service.time.split(':').map(Number);
    serviceTime.setHours(hours, minutes, 0, 0);

    const checkInOpenTime = new Date(serviceTime);
    checkInOpenTime.setMinutes(checkInOpenTime.getMinutes() - 30);

    if (now < checkInOpenTime) {
      throw new ForbiddenException(
        `Check-in opens 30 minutes before service. Opens at ${checkInOpenTime.toLocaleTimeString('pt-BR')}`,
      );
    }

    if (now > serviceTime) {
      throw new ForbiddenException('Check-in is closed. Service time has passed.');
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
    const qrCodeData: QrCodeData = {
      scheduleId: schedule.id,
      personId: person.id,
      serviceId: service.id,
      date: targetDate.toISOString().split('T')[0],
      timestamp: Date.now(),
    };

    const qrCode = JSON.stringify(qrCodeData);

    // QR Code expires at service time
    const expiresAt = new Date(serviceTime);

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
    let qrCodeData: QrCodeData;

    try {
      qrCodeData = JSON.parse(qrCodeDto.qrCodeData) as QrCodeData;
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
    const qrCodeAge = Date.now() - qrCodeData.timestamp;
    const oneHour = 60 * 60 * 1000;
    if (qrCodeAge > oneHour) {
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
      .leftJoin('schedule.service', 'service')
      .where('schedule.id = :scheduleId', { scheduleId: qrCodeData.scheduleId })
      .andWhere('schedule.deletedAt IS NULL')
      .getOne();

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

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
    const service = await this.servicesRepository.findOne({
      where: { id: schedule.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const now = new Date();
    const serviceTime = new Date(schedule.date);
    const [hours, minutes] = service.time.split(':').map(Number);
    serviceTime.setHours(hours, minutes, 0, 0);

    const checkInOpenTime = new Date(serviceTime);
    checkInOpenTime.setMinutes(checkInOpenTime.getMinutes() - 30);

    if (now < checkInOpenTime) {
      throw new ForbiddenException(
        `Check-in opens 30 minutes before service. Opens at ${checkInOpenTime.toLocaleTimeString('pt-BR')}`,
      );
    }

    if (now > serviceTime) {
      throw new ForbiddenException('Check-in is closed. Service time has passed.');
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
