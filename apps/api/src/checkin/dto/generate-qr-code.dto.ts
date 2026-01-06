import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class GenerateQrCodeDto {
  @ApiProperty({
    description: 'Date for which to generate QR code (ISO format). Defaults to today',
    required: false,
    example: '2024-03-10',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
