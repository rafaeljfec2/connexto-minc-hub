import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';
import { ServiceType } from '../entities/service.entity';

export class CreateServiceDto {
  @ApiProperty({
    example: 'uuid-da-igreja',
    description: 'ID da igreja',
  })
  @IsUUID('4', { message: 'ID da igreja deve ser um UUID válido' })
  churchId: string;

  @ApiProperty({
    example: 'sunday_morning',
    enum: ServiceType,
    description: 'Tipo de culto',
  })
  @IsEnum(ServiceType, { message: 'Tipo deve ser um valor válido do enum' })
  type: ServiceType;

  @ApiProperty({
    example: 0,
    description: 'Dia da semana (0=Domingo, 6=Sábado)',
    minimum: 0,
    maximum: 6,
  })
  @IsInt({ message: 'Dia da semana deve ser um número inteiro' })
  @Min(0, { message: 'Dia da semana deve ser entre 0 e 6' })
  @Max(6, { message: 'Dia da semana deve ser entre 0 e 6' })
  dayOfWeek: number;

  @ApiProperty({
    example: '09:00:00',
    description: 'Horário do culto (formato HH:mm:ss)',
  })
  @IsString({ message: 'Horário deve ser uma string' })
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Horário deve estar no formato HH:mm:ss',
  })
  time: string;

  @ApiProperty({
    example: 'Culto da Manhã',
    description: 'Nome do culto',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name: string;

  @ApiProperty({
    example: true,
    description: 'Se o culto está ativo',
    default: true,
    required: false,
  })
  @IsBoolean({ message: 'isActive deve ser um booleano' })
  @IsOptional()
  isActive?: boolean;
}
