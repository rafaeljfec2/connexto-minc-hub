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
    const existing = await this.attendancesRepository.findOne({
      where: {
        scheduleId: createAttendanceDto.scheduleId,
        personId: createAttendanceDto.personId,
      },
    });

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
    return this.attendancesRepository.find({
      relations: ['schedule', 'schedule.service', 'person', 'checkedInByUser'],
      order: { checkedInAt: 'DESC' },
    });
  }

  async findBySchedule(scheduleId: string): Promise<AttendanceEntity[]> {
    return this.attendancesRepository.find({
      where: { scheduleId },
      relations: ['person', 'checkedInByUser'],
      order: { checkedInAt: 'DESC' },
    });
  }

  async findByPerson(personId: string): Promise<AttendanceEntity[]> {
    return this.attendancesRepository.find({
      where: { personId },
      relations: ['schedule', 'schedule.service'],
      order: { checkedInAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AttendanceEntity> {
    const attendance = await this.attendancesRepository.findOne({
      where: { id },
      relations: [
        'schedule',
        'schedule.service',
        'schedule.service.church',
        'person',
        'checkedInByUser',
      ],
    });

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
