import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data) => {
        // If data is already wrapped in ApiResponseDto format, return as is
        if (data && typeof data === 'object' && 'success' in data && 'statusCode' in data) {
          return data as ApiResponseDto<T>;
        }

        // Wrap response in standard format
        return {
          success: true,
          statusCode: context.switchToHttp().getResponse().statusCode || 200,
          message: 'Operation completed successfully',
          data: data ?? undefined,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
