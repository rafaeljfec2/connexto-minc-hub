import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { CheckinGateway } from './checkin.gateway';
import { ScheduleEntity } from '../schedules/entities/schedule.entity';
import { ScheduleTeamEntity } from '../schedules/entities/schedule-team.entity';
import { ServiceEntity } from '../services/entities/service.entity';
import { AttendanceEntity } from '../attendances/entities/attendance.entity';
import { PersonEntity } from '../persons/entities/person.entity';
import { TeamMemberEntity } from '../teams/entities/team-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScheduleEntity,
      ScheduleTeamEntity,
      ServiceEntity,
      AttendanceEntity,
      PersonEntity,
      TeamMemberEntity,
    ]),
    JwtModule,
    ConfigModule,
  ],
  controllers: [CheckinController],
  providers: [CheckinService, CheckinGateway],
  exports: [CheckinService],
})
export class CheckinModule {}
