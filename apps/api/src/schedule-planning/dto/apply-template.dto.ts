import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
} from 'class-validator';

export class ApplyTemplateDto {
  @ApiProperty({
    example: 'uuid-da-igreja',
    description: 'ID da igreja para aplicar o template',
  })
  @IsUUID('4', { message: 'ID da igreja deve ser um UUID válido' })
  churchId: string;
}
