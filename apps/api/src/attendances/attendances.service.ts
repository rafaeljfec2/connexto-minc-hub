import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceEntity } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AttendancesService {
  constructor(
    @InjectRepository(AttendanceEntity)
    private attendancesRepository: Repository<AttendanceEntity>,
  ) {}

  async create(
    createAttendanceDto: CreateAttendanceDto,
    checkedInBy: UserEntity,
  ): Promise<AttendanceEntity> {
    const existing = await this.attendancesRepository
      .createQueryBuilder('attendance')
      .select(['attendance.id'])
      .where('attendance.scheduleId = :scheduleId', { scheduleId: createAttendanceDto.scheduleId })
      .andWhere('attendance.personId = :personId', { personId: createAttendanceDto.personId })
      .getOne();

    if (existing) {
      throw new ConflictException('Attendance already registered for this person in this schedule');
    }

    const attendance = this.attendancesRepository.create({
      ...createAttendanceDto,
      checkedInBy: checkedInBy.id,
      checkedInAt: new Date(),
    });

    return this.attendancesRepository.save(attendance);
  }

  async findAll(): Promise<AttendanceEntity[]> {
    return this.attendancesRepository
      .createQueryBuilder('attendance')
      .select([
        'attendance.id',
        'attendance.scheduleId',
        'attendance.personId',
        'attendance.checkedInBy',
        'attendance.checkedInAt',
        'attendance.method',
        'attendance.absenceReason',
        'attendance.createdAt',
        'attendance.updatedAt',
        'schedule.id',
        'schedule.serviceId',
        'schedule.date',
        'service.id',
        'service.churchId',
        'service.type',
        'service.name',
        'service.time',
        'person.id',
        'person.name',
        'person.email',
        'person.phone',
        'checkedInByUser.id',
        'checkedInByUser.name',
        'checkedInByUser.email',
      ])
      .leftJoin('attendance.schedule', 'schedule')
      .leftJoin('schedule.service', 'service')
      .leftJoin('attendance.person', 'person')
      .leftJoin('attendance.checkedInByUser', 'checkedInByUser')
      .orderBy('attendance.checkedInAt', 'DESC')
      .getMany();
  }

  async findBySchedule(scheduleId: string): Promise<AttendanceEntity[]> {
    return this.attendancesRepository
      .createQueryBuilder('attendance')
      .select([
        'attendance.id',
        'attendance.scheduleId',
        'attendance.personId',
        'attendance.checkedInBy',
        'attendance.checkedInAt',
        'attendance.method',
        'attendance.absenceReason',
        'attendance.createdAt',
        'attendance.updatedAt',
        'person.id',
        'person.name',
        'person.email',
        'person.phone',
        'checkedInByUser.id',
        'checkedInByUser.name',
        'checkedInByUser.email',
      ])
      .leftJoin('attendance.person', 'person')
      .leftJoin('attendance.checkedInByUser', 'checkedInByUser')
      .where('attendance.scheduleId = :scheduleId', { scheduleId })
      .orderBy('attendance.checkedInAt', 'DESC')
      .getMany();
  }

  async findByPerson(personId: string): Promise<AttendanceEntity[]> {
    return this.attendancesRepository
      .createQueryBuilder('attendance')
      .select([
        'attendance.id',
        'attendance.scheduleId',
        'attendance.personId',
        'attendance.checkedInBy',
        'attendance.checkedInAt',
        'attendance.method',
        'attendance.absenceReason',
        'attendance.createdAt',
        'attendance.updatedAt',
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
      .getMany();
  }

  async findOne(id: string): Promise<AttendanceEntity> {
    const attendance = await this.attendancesRepository
      .createQueryBuilder('attendance')
      .select([
        'attendance.id',
        'attendance.scheduleId',
        'attendance.personId',
        'attendance.checkedInBy',
        'attendance.checkedInAt',
        'attendance.method',
        'attendance.absenceReason',
        'attendance.createdAt',
        'attendance.updatedAt',
        'schedule.id',
        'schedule.serviceId',
        'schedule.date',
        'service.id',
        'service.churchId',
        'service.type',
        'service.name',
        'service.time',
        'church.id',
        'church.name',
        'church.address',
        'person.id',
        'person.name',
        'person.email',
        'person.phone',
        'checkedInByUser.id',
        'checkedInByUser.name',
        'checkedInByUser.email',
      ])
      .leftJoin('attendance.schedule', 'schedule')
      .leftJoin('schedule.service', 'service')
      .leftJoin('service.church', 'church')
      .leftJoin('attendance.person', 'person')
      .leftJoin('attendance.checkedInByUser', 'checkedInByUser')
      .where('attendance.id = :id', { id })
      .getOne();

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    return attendance;
  }

  async update(
    id: string,
    updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<AttendanceEntity> {
    const attendance = await this.findOne(id);
    Object.assign(attendance, updateAttendanceDto);
    return this.attendancesRepository.save(attendance);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.attendancesRepository.delete(id);
  }

  async getScheduleAttendance(scheduleId: string): Promise<{
    total: number;
    present: number;
    absent: number;
    attendances: AttendanceEntity[];
  }> {
    const attendances = await this.findBySchedule(scheduleId);
    const present = attendances.filter((a) => !a.absenceReason).length;
    const absent = attendances.filter((a) => a.absenceReason).length;

    return {
      total: attendances.length,
      present,
      absent,
      attendances,
    };
  }
}
