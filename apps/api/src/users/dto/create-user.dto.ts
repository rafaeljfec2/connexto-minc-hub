import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsUUID, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  name: string;

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email do usuário',
  })
  @IsEmail({}, { message: 'Email deve ser um email válido' })
  email: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário',
    minLength: 6,
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;

  @ApiProperty({
    example: UserRole.MEMBER,
    description: 'Papel do usuário no sistema',
    enum: UserRole,
    required: false,
    default: UserRole.MEMBER,
  })
  @IsEnum(UserRole, { message: 'Papel deve ser um valor válido' })
  @IsOptional()
  role?: UserRole;

  @ApiProperty({
    example: 'uuid-do-servo',
    description: 'ID do servo vinculado (opcional)',
    required: false,
  })
  @IsUUID('4', { message: 'ID do servo deve ser um UUID válido' })
  @IsOptional()
  personId?: string | null;
}
