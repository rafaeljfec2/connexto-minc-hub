import { IsOptional, IsString, IsBoolean, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetCspReportsDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by violated directive',
    example: 'script-src',
  })
  @IsOptional()
  @IsString()
  violatedDirective?: string;

  @ApiPropertyOptional({
    description: 'Filter by critical violations only',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isCritical?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by blocked URI (partial match)',
    example: 'inline',
  })
  @IsOptional()
  @IsString()
  blockedUri?: string;

  @ApiPropertyOptional({
    description: 'Filter by document URI (partial match)',
    example: 'https://app.example.com',
  })
  @IsOptional()
  @IsString()
  documentUri?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO 8601)',
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
