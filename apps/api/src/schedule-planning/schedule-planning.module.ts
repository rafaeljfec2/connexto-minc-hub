import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulePlanningService } from './schedule-planning.service';
import { SchedulePlanningController } from './schedule-planning.controller';
import { SchedulePlanningConfigEntity } from './entities/schedule-planning-config.entity';
import { TeamPlanningConfigEntity } from './entities/team-planning-config.entity';
import { SchedulePlanningTemplateEntity } from './entities/schedule-planning-template.entity';
import { TeamEntity } from '../teams/entities/team.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SchedulePlanningConfigEntity,
      TeamPlanningConfigEntity,
      SchedulePlanningTemplateEntity,
      TeamEntity,
    ]),
  ],
  controllers: [SchedulePlanningController],
  providers: [SchedulePlanningService],
  exports: [SchedulePlanningService],
})
export class SchedulePlanningModule {}
