import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateSchedulePlanningConfigDto {
  @ApiProperty({
    example: 10,
    description: 'Máximo de pessoas por equipe',
    minimum: 1,
    default: 10,
    required: false,
  })
  @IsInt({ message: 'Máximo de pessoas por equipe deve ser um número inteiro' })
  @Min(1, { message: 'Máximo de pessoas por equipe deve ser pelo menos 1' })
  @IsOptional()
  maxTeamMembers?: number;

  @ApiProperty({
    example: 4,
    description: 'Quantos cultos por domingo',
    minimum: 1,
    default: 4,
    required: false,
  })
  @IsInt({ message: 'Quantos cultos por domingo deve ser um número inteiro' })
  @Min(1, { message: 'Quantos cultos por domingo deve ser pelo menos 1' })
  @IsOptional()
  servicesPerSunday?: number;

  @ApiProperty({
    example: true,
    description: 'Se cada equipe serve uma vez ao mês',
    default: true,
    required: false,
  })
  @IsBoolean({ message: 'teamsServeOncePerMonth deve ser um booleano' })
  @IsOptional()
  teamsServeOncePerMonth?: boolean;

  @ApiProperty({
    example: true,
    description: 'Se deve sortear equipes para servir mais de uma vez quando necessário',
    default: true,
    required: false,
  })
  @IsBoolean({ message: 'enableLotteryForExtraServices deve ser um booleano' })
  @IsOptional()
  enableLotteryForExtraServices?: boolean;

  @ApiProperty({
    example: true,
    description: 'Se deve fazer rotação de horários mensalmente',
    default: true,
    required: false,
  })
  @IsBoolean({ message: 'enableTimeRotation deve ser um booleano' })
  @IsOptional()
  enableTimeRotation?: boolean;
}
