import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CheckActivationDto {
  @ApiProperty({
    example: '(11) 98765-4321',
    description: 'Telefone da pessoa (formato brasileiro)',
  })
  @IsString({ message: 'Telefone deve ser uma string' })
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @Matches(/^[\d\s\(\)\-\+]+$/, {
    message: 'Telefone deve conter apenas números e caracteres de formatação',
  })
  phone: string;

  @ApiProperty({
    example: 'MINC2024',
    description: 'Código de acesso',
  })
  @IsString({ message: 'Código de acesso deve ser uma string' })
  @IsNotEmpty({ message: 'Código de acesso é obrigatório' })
  accessCode: string;
}
