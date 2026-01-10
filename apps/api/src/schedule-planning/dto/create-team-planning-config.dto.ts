import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateTeamPlanningConfigDto {
  @ApiProperty({
    example: 8,
    description: 'Máximo de pessoas por equipe (null para usar configuração global)',
    minimum: 1,
    nullable: true,
    required: false,
  })
  @IsInt({ message: 'Máximo de pessoas por equipe deve ser um número inteiro' })
  @Min(1, { message: 'Máximo de pessoas por equipe deve ser pelo menos 1' })
  @IsOptional()
  maxTeamMembers?: number | null;

  @ApiProperty({
    example: true,
    description: 'Se cada equipe serve uma vez ao mês (null para usar configuração global)',
    nullable: true,
    required: false,
  })
  @IsBoolean({ message: 'teamsServeOncePerMonth deve ser um booleano' })
  @IsOptional()
  teamsServeOncePerMonth?: boolean | null;

  @ApiProperty({
    example: true,
    description:
      'Se deve sortear equipes para servir mais de uma vez quando necessário (null para usar configuração global)',
    nullable: true,
    required: false,
  })
  @IsBoolean({ message: 'enableLotteryForExtraServices deve ser um booleano' })
  @IsOptional()
  enableLotteryForExtraServices?: boolean | null;

  @ApiProperty({
    example: true,
    description:
      'Se deve fazer rotação de horários mensalmente (null para usar configuração global)',
    nullable: true,
    required: false,
  })
  @IsBoolean({ message: 'enableTimeRotation deve ser um booleano' })
  @IsOptional()
  enableTimeRotation?: boolean | null;
}
