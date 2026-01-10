import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({
    example: 'Template Padrão',
    description: 'Nome do template',
    maxLength: 255,
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name: string;

  @ApiProperty({
    example: 'Template padrão para igrejas',
    description: 'Descrição do template',
    required: false,
    nullable: true,
  })
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  @MaxLength(1000, { message: 'Descrição deve ter no máximo 1000 caracteres' })
  description?: string | null;

  @ApiProperty({
    example: 10,
    description: 'Máximo de pessoas por equipe',
    minimum: 1,
  })
  @IsInt({ message: 'Máximo de pessoas por equipe deve ser um número inteiro' })
  @Min(1, { message: 'Máximo de pessoas por equipe deve ser pelo menos 1' })
  maxTeamMembers: number;

  @ApiProperty({
    example: 4,
    description: 'Quantos cultos por domingo',
    minimum: 1,
  })
  @IsInt({ message: 'Quantos cultos por domingo deve ser um número inteiro' })
  @Min(1, { message: 'Quantos cultos por domingo deve ser pelo menos 1' })
  servicesPerSunday: number;

  @ApiProperty({
    example: true,
    description: 'Se cada equipe serve uma vez ao mês',
  })
  @IsBoolean({ message: 'teamsServeOncePerMonth deve ser um booleano' })
  teamsServeOncePerMonth: boolean;

  @ApiProperty({
    example: true,
    description: 'Se deve sortear equipes para servir mais de uma vez quando necessário',
  })
  @IsBoolean({ message: 'enableLotteryForExtraServices deve ser um booleano' })
  enableLotteryForExtraServices: boolean;

  @ApiProperty({
    example: true,
    description: 'Se deve fazer rotação de horários mensalmente',
  })
  @IsBoolean({ message: 'enableTimeRotation deve ser um booleano' })
  enableTimeRotation: boolean;
}
