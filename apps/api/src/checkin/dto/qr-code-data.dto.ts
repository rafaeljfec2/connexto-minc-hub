import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class QrCodeDataDto {
  @IsString()
  @IsNotEmpty()
  scheduleId: string;

  @IsString()
  @IsNotEmpty()
  personId: string;

  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  timestamp: number;
}
