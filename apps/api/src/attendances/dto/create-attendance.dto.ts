import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsObject,
  IsString,
  MaxLength,
} from 'class-validator';
import { AttendanceMethod } from '../entities/attendance.entity';

export class CreateAttendanceDto {
  @ApiProperty({
    example: 'uuid-da-escala',
    description: 'ID da escala',
  })
  @IsUUID('4', { message: 'ID da escala deve ser um UUID válido' })
  scheduleId: string;

  @ApiProperty({
    example: 'uuid-da-pessoa',
    description: 'ID da pessoa/servo',
  })
  @IsUUID('4', { message: 'ID da pessoa deve ser um UUID válido' })
  personId: string;

  @ApiProperty({
    example: 'qr_code',
    enum: AttendanceMethod,
    description: 'Método de check-in',
  })
  @IsEnum(AttendanceMethod, { message: 'Método deve ser qr_code ou manual' })
  method: AttendanceMethod;

  @ApiProperty({
    example: { qrCode: 'abc123', timestamp: '2024-01-15T10:00:00Z' },
    description: 'Dados do QR Code (se método for qr_code)',
    required: false,
  })
  @IsObject({ message: 'qrCodeData deve ser um objeto' })
  @IsOptional()
  qrCodeData?: Record<string, unknown>;

  @ApiProperty({
    example: 'Justificativa de ausência',
    description: 'Justificativa de ausência (se não presente)',
    required: false,
  })
  @IsString({ message: 'Justificativa deve ser uma string' })
  @IsOptional()
  @MaxLength(500, { message: 'Justificativa deve ter no máximo 500 caracteres' })
  absenceReason?: string;
}
