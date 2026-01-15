import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsOptional,
  Matches,
} from 'class-validator';
import { AccessCodeScopeType } from '../entities/access-code.entity';

export class CreateAccessCodeDto {
  @ApiProperty({
    example: 'MINC2024',
    description: 'Código de acesso (máximo 50 caracteres, apenas letras e números)',
    maxLength: 50,
  })
  @IsString({ message: 'Código deve ser uma string' })
  @IsNotEmpty({ message: 'Código é obrigatório' })
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Código deve conter apenas letras maiúsculas e números',
  })
  code: string;

  @ApiProperty({
    example: 'team',
    description: 'Tipo de escopo do código',
    enum: AccessCodeScopeType,
  })
  @IsEnum(AccessCodeScopeType, {
    message: 'Tipo de escopo deve ser: church, ministry ou team',
  })
  @IsNotEmpty({ message: 'Tipo de escopo é obrigatório' })
  scopeType: AccessCodeScopeType;

  @ApiProperty({
    example: 'b1f2c3d4-5678-1234-9abc-def012345678',
    description: 'ID da igreja, ministério ou time conforme o scopeType',
  })
  @IsUUID('4', { message: 'ID do escopo deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID do escopo é obrigatório' })
  scopeId: string;

  @ApiProperty({
    example: 30,
    description: 'Número de dias até a expiração do código',
    default: 30,
    minimum: 1,
    maximum: 365,
  })
  @IsInt({ message: 'Dias de validade deve ser um número inteiro' })
  @Min(1, { message: 'Dias de validade deve ser no mínimo 1' })
  @Max(365, { message: 'Dias de validade deve ser no máximo 365' })
  @IsOptional()
  expiresInDays?: number;

  @ApiProperty({
    example: 100,
    description: 'Limite máximo de usos do código (null = ilimitado)',
    nullable: true,
    required: false,
  })
  @IsInt({ message: 'Limite de usos deve ser um número inteiro' })
  @Min(1, { message: 'Limite de usos deve ser no mínimo 1' })
  @IsOptional()
  maxUsages?: number | null;
}
