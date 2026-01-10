import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateQrCodeDto {
  @ApiProperty({
    description: 'QR Code data as JSON string',
    example:
      '{"scheduleId":"uuid","personId":"uuid","serviceId":"uuid","date":"2024-03-10","timestamp":1234567890}',
  })
  @IsString()
  @IsNotEmpty()
  qrCodeData: string;
}
