import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class CreateChurchDto {
  @ApiProperty({
    example: 'Minha Igreja na Cidade',
    description: 'Nome da igreja',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name: string;

  @ApiProperty({
    example: 'Rua Exemplo, 123 - Centro',
    description: 'Endereço completo da igreja',
    required: false,
  })
  @IsString({ message: 'Endereço deve ser uma string' })
  @IsOptional()
  address?: string;

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
    example: 'contato@igreja.com',
    description: 'Email de contato',
    required: false,
  })
  @IsEmail({}, { message: 'Email deve ser um endereço de email válido' })
  @IsOptional()
  @MaxLength(255, { message: 'Email deve ter no máximo 255 caracteres' })
  email?: string;
}
