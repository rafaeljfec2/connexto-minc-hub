import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, MaxLength, IsBoolean } from 'class-validator';

export class CreateMinistryDto {
  @ApiProperty({
    example: 'Boas-Vindas',
    description: 'Nome do ministério',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name: string;

  @ApiProperty({
    example: 'uuid-da-igreja',
    description: 'ID da igreja',
  })
  @IsUUID('4', { message: 'ID da igreja deve ser um UUID válido' })
  churchId: string;

  @ApiProperty({
    example: 'Ministério responsável por receber visitantes',
    description: 'Descrição do ministério',
    required: false,
  })
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Se o ministério está ativo',
    default: true,
    required: false,
  })
  @IsBoolean({ message: 'isActive deve ser um booleano' })
  @IsOptional()
  isActive?: boolean;
}
