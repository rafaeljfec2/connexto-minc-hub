import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'currentPassword123',
    description: 'Senha atual do usuário',
  })
  @IsString({ message: 'Senha atual deve ser uma string' })
  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'Nova senha do usuário',
    minLength: 8,
  })
  @IsString({ message: 'Nova senha deve ser uma string' })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(8, { message: 'Nova senha deve ter no mínimo 8 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).*$/, {
    message: 'Nova senha deve conter pelo menos uma letra maiúscula e um número',
  })
  newPassword: string;
}
