import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEmail,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreatePersonDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo da pessoa',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name: string;

  @ApiProperty({
    example: 'uuid-do-ministerio',
    description: 'ID do ministério',
    required: false,
  })
  @IsUUID('4', { message: 'ID do ministério deve ser um UUID válido' })
  @IsOptional()
  ministryId?: string;

  @ApiProperty({
    example: 'uuid-da-equipe',
    description: 'ID da equipe',
    required: false,
  })
  @IsUUID('4', { message: 'ID da equipe deve ser um UUID válido' })
  @IsOptional()
  teamId?: string;

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email de contato',
    required: false,
  })
  @IsEmail({}, { message: 'Email deve ser um endereço de email válido' })
  @IsOptional()
  @MaxLength(255, { message: 'Email deve ter no máximo 255 caracteres' })
  email?: string;

  @ApiProperty({
    example: '(11) 99999-9999',
    description: 'Telefone de contato',
    required: false,
  })
  @IsString({ message: 'Telefone deve ser uma string' })
  @IsOptional()
  @MaxLength(20, { message: 'Telefone deve ter no máximo 20 caracteres' })
  phone?: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Data de nascimento',
    required: false,
  })
  @IsDateString({}, { message: 'Data de nascimento deve ser uma data válida' })
  @IsOptional()
  birthDate?: string;

  @ApiProperty({
    example: 'Rua Exemplo, 123',
    description: 'Endereço completo',
    required: false,
  })
  @IsString({ message: 'Endereço deve ser uma string' })
  @IsOptional()
  address?: string;

  @ApiProperty({
    example: 'Observações sobre a pessoa',
    description: 'Notas e observações',
    required: false,
  })
  @IsString({ message: 'Notas deve ser uma string' })
  @IsOptional()
  notes?: string;
}
