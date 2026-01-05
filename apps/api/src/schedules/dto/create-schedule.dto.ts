import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsArray, IsOptional } from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({
    example: 'uuid-do-culto',
    description: 'ID do culto/serviço',
  })
  @IsUUID('4', { message: 'ID do culto deve ser um UUID válido' })
  serviceId: string;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Data da escala (formato YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'Data deve estar no formato YYYY-MM-DD' })
  date: string;

  @ApiProperty({
    example: ['uuid-equipe-1', 'uuid-equipe-2'],
    description: 'IDs das equipes atribuídas à escala',
    type: [String],
    required: false,
  })
  @IsArray({ message: 'teamIds deve ser um array' })
  @IsUUID('4', { each: true, message: 'Cada ID de equipe deve ser um UUID válido' })
  @IsOptional()
  teamIds?: string[];
}
