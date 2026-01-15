import { ApiProperty } from '@nestjs/swagger';
import { AccessCodeScopeType } from '../entities/access-code.entity';

export class AccessCodeResponseDto {
  @ApiProperty({
    example: 'b1f2c3d4-5678-1234-9abc-def012345678',
    description: 'ID do código de acesso',
  })
  id: string;

  @ApiProperty({
    example: 'MINC2024',
    description: 'Código de acesso',
  })
  code: string;

  @ApiProperty({
    example: 'team',
    description: 'Tipo de escopo',
    enum: AccessCodeScopeType,
  })
  scopeType: AccessCodeScopeType;

  @ApiProperty({
    example: 'b1f2c3d4-5678-1234-9abc-def012345678',
    description: 'ID do escopo (igreja, ministério ou time)',
  })
  scopeId: string;

  @ApiProperty({
    example: '2024-02-15T10:30:00.000Z',
    description: 'Data de expiração do código',
  })
  expiresAt: Date;

  @ApiProperty({
    example: true,
    description: 'Se o código está ativo',
  })
  isActive: boolean;

  @ApiProperty({
    example: 5,
    description: 'Quantidade de vezes que o código foi usado',
  })
  usageCount: number;

  @ApiProperty({
    example: 100,
    description: 'Limite máximo de usos (null = ilimitado)',
    nullable: true,
  })
  maxUsages: number | null;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Data de criação do código',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Data de última atualização',
  })
  updatedAt: Date;

  @ApiProperty({
    example: 'Time Boas-Vindas',
    description: 'Nome do escopo (igreja, ministério ou time)',
    required: false,
  })
  scopeName?: string;

  @ApiProperty({
    example: false,
    description: 'Se o código está expirado',
  })
  isExpired: boolean;
}
