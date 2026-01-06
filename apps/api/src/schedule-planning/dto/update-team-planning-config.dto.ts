import { PartialType } from '@nestjs/swagger';
import { CreateTeamPlanningConfigDto } from './create-team-planning-config.dto';

export class UpdateTeamPlanningConfigDto extends PartialType(CreateTeamPlanningConfigDto) {}
