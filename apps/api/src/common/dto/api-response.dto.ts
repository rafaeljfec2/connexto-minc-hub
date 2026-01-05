import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard API Response Wrapper
 * Follows REST API best practices for consistent response structure
 */
export class ApiResponseDto<T = unknown> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Human-readable message describing the result',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response data payload',
    required: false,
  })
  data?: T;

  @ApiProperty({
    description: 'Error details (only present when success is false)',
    required: false,
  })
  errors?: Record<string, string[]> | string[];

  @ApiProperty({
    description: 'Timestamp of the response',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path',
    example: '/minc-teams/v1/churches',
  })
  path: string;
}

/**
 * Pagination metadata for list responses
 */
export class PaginationMetaDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrev: boolean;
}

/**
 * Paginated API Response
 */
export class PaginatedApiResponseDto<T = unknown> extends ApiResponseDto<T[]> {
  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
