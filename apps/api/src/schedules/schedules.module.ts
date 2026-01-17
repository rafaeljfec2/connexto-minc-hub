import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { ScheduleEntity } from './entities/schedule.entity';
import { ScheduleTeamEntity } from './entities/schedule-team.entity';
import { ScheduleGuestVolunteerEntity } from './entities/schedule-guest-volunteer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduleEntity, ScheduleTeamEntity, ScheduleGuestVolunteerEntity]),
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
