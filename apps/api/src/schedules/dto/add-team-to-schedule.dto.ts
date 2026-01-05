import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddTeamToScheduleDto {
  @ApiProperty({
    example: 'uuid-da-equipe',
    description: 'ID da equipe a ser adicionada à escala',
  })
  @IsUUID('4', { message: 'ID da equipe deve ser um UUID válido' })
  teamId: string;
}
