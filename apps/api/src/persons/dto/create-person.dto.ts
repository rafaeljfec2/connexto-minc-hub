import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEmail,
  IsDateString,
  MaxLength,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MemberType } from '../../teams/entities/team-member.entity';

class TeamMemberDto {
  @ApiProperty({
    example: 'uuid-da-equipe',
    description: 'ID da equipe',
  })
  @IsUUID('4', { message: 'ID da equipe deve ser um UUID válido' })
  teamId: string;

  @ApiProperty({
    example: 'fixed',
    description: 'Tipo de membro: fixed (fixo) ou eventual',
    enum: MemberType,
    default: MemberType.FIXED,
  })
  @IsEnum(MemberType, { message: 'Tipo de membro deve ser "fixed" ou "eventual"' })
  @IsOptional()
  memberType?: MemberType;
}

export class CreatePersonDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo da pessoa',
    required: true,
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(1, { message: 'Nome não pode estar vazio' })
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
    description: 'ID da equipe principal (legado, para compatibilidade)',
    required: false,
  })
  @IsUUID('4', { message: 'ID da equipe deve ser um UUID válido' })
  @IsOptional()
  teamId?: string;

  @ApiProperty({
    example: [
      { teamId: 'uuid-equipe-1', memberType: 'fixed' },
      { teamId: 'uuid-equipe-2', memberType: 'eventual' },
    ],
    description: 'Lista de equipes em que a pessoa serve',
    type: [TeamMemberDto],
    required: false,
  })
  @IsArray({ message: 'teamMembers deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  @IsOptional()
  teamMembers?: TeamMemberDto[];

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
