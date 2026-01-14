import { IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CspReportBodyDto {
  @IsString()
  @IsOptional()
  'document-uri'?: string;

  @IsString()
  @IsOptional()
  referrer?: string;

  @IsString()
  @IsOptional()
  'violated-directive'?: string;

  @IsString()
  @IsOptional()
  'effective-directive'?: string;

  @IsString()
  @IsOptional()
  'original-policy'?: string;

  @IsString()
  @IsOptional()
  'blocked-uri'?: string;

  @IsString()
  @IsOptional()
  'source-file'?: string;

  @IsString()
  @IsOptional()
  'line-number'?: string;

  @IsString()
  @IsOptional()
  'column-number'?: string;

  @IsString()
  @IsOptional()
  'status-code'?: string;

  @IsString()
  @IsOptional()
  'script-sample'?: string;
}

export class CspReportDto {
  @ValidateNested()
  @Type(() => CspReportBodyDto)
  @IsObject()
  'csp-report': CspReportBodyDto;
}
