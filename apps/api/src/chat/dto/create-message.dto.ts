import { IsNotEmpty, IsString, MaxLength, IsOptional, IsNumber, IsUrl } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  text: string;

  @IsOptional()
  @IsUrl()
  attachmentUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  attachmentName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  attachmentType?: string;

  @IsOptional()
  @IsNumber()
  attachmentSize?: number;
}
