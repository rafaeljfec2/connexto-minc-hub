import { PartialType } from '@nestjs/swagger';
import { CreateSchedulePlanningConfigDto } from './create-schedule-planning-config.dto';

export class UpdateSchedulePlanningConfigDto extends PartialType(CreateSchedulePlanningConfigDto) {}
