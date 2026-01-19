import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, MaxLength, IsBoolean } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({
    example: 'Equipe A',
    description: 'Nome da equipe',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name: string;

  @ApiProperty({
    example: 'uuid-do-ministerio',
    description: 'ID do ministério',
  })
  @IsUUID('4', { message: 'ID do ministério deve ser um UUID válido' })
  ministryId: string;

  @ApiProperty({
    example: 'Equipe responsável pelo recebimento',
    description: 'Descrição da equipe',
    required: false,
  })
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Se a equipe está ativa',
    default: true,
    required: false,
  })
  @IsBoolean({ message: 'isActive deve ser um booleano' })
  @IsOptional()
  isActive?: boolean;
}
