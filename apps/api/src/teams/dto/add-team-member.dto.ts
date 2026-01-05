import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddTeamMemberDto {
  @ApiProperty({
    example: 'uuid-da-pessoa',
    description: 'ID da pessoa a ser adicionada à equipe',
  })
  @IsUUID('4', { message: 'ID da pessoa deve ser um UUID válido' })
  personId: string;
}
