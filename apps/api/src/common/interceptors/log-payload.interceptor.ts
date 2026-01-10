import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Fields that should be obscured in logs for security
 */
const SENSITIVE_FIELDS = [
  'password',
  'newPassword',
  'oldPassword',
  'currentPassword',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'authorization',
];

/**
 * Maximum size for stringified JSON in logs (to avoid huge log files)
 */
const MAX_LOG_SIZE = 50000; // 50KB

/**
 * Truncate large strings for logging
 */
function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + `...[truncated ${str.length - maxLength} chars]`;
}

/**
 * Obscures a sensitive value (password, token, etc.)
 */
function obscureSensitiveValue(value: unknown): string {
  if (typeof value === 'string' && value.length > 0) {
    // Keep first 4 and last 4 characters for tokens/keys
    return value.length > 8 ? value.slice(0, 4) + '***' + value.slice(-4) : '***';
  }
  return '***';
}

/**
 * Checks if a field key is sensitive
 */
function isSensitiveField(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()));
}

/**
 * Processes an array, limiting its size for logging
 */
function processArray(obj: any[], depth: number): any[] {
  if (obj.length > 100) {
    return [
      ...obj.slice(0, 100).map((item) => obscureSensitiveFields(item, depth + 1)),
      `...[${obj.length - 100} more items]`,
    ];
  }
  return obj.map((item) => obscureSensitiveFields(item, depth + 1));
}

/**
 * Processes an object, limiting field count and obscuring sensitive fields
 */
function processObject(obj: Record<string, any>, depth: number): Record<string, any> {
  const obscured: Record<string, any> = {};
  const MAX_FIELDS = 50;
  let fieldCount = 0;

  for (const [key, value] of Object.entries(obj)) {
    if (fieldCount >= MAX_FIELDS) {
      obscured['...'] = `[${Object.keys(obj).length - MAX_FIELDS} more fields]`;
      break;
    }

    obscured[key] = isSensitiveField(key)
      ? obscureSensitiveValue(value)
      : obscureSensitiveFields(value, depth + 1);
    fieldCount++;
  }

  return obscured;
}

/**
 * Recursively obscures sensitive fields in an object
 */
function obscureSensitiveFields(obj: any, depth = 0): any {
  // Prevent infinite recursion
  if (depth > 10) {
    return '[Max depth reached]';
  }

  if (obj === null || obj === undefined || typeof obj === 'string') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return processArray(obj, depth);
  }

  if (typeof obj === 'object') {
    return processObject(obj, depth);
  }

  return obj;
}

/**
 * Interceptor to log request and response payloads
 */
@Injectable()
export class LogPayloadInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LogPayloadInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, query, params } = request;
    const route = context.getHandler().name;
    const controller = context.getClass().name;

    // Log request payload
    const requestPayload = {
      method,
      url,
      route: `${controller}.${route}`,
      params,
      query,
      body: obscureSensitiveFields(body),
    };

    const requestPayloadStr = JSON.stringify(requestPayload);
    const truncatedRequestPayload = truncateString(requestPayloadStr, MAX_LOG_SIZE);

    this.logger.log(`[Request] ${method} ${url} | Payload: ${truncatedRequestPayload}`);

    // Log response payload
    return next.handle().pipe(
      tap({
        next: (data) => {
          const responsePayload = {
            statusCode: response.statusCode,
            route: `${controller}.${route}`,
            data: obscureSensitiveFields(data),
          };

          const responsePayloadStr = JSON.stringify(responsePayload);
          const truncatedResponsePayload = truncateString(responsePayloadStr, MAX_LOG_SIZE);

          this.logger.log(
            `[Response] ${method} ${url} | Status: ${response.statusCode} | Payload: ${truncatedResponsePayload}`,
          );
        },
        error: (error) => {
          const errorPayload = {
            statusCode: error.status || response.statusCode || 500,
            route: `${controller}.${route}`,
            error: {
              message: error.message,
              name: error.name,
              // Only log stack in development
              ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
            },
          };

          const errorPayloadStr = JSON.stringify(errorPayload);
          const truncatedErrorPayload = truncateString(errorPayloadStr, MAX_LOG_SIZE);

          this.logger.error(
            `[Response Error] ${method} ${url} | Status: ${errorPayload.statusCode} | Error: ${truncatedErrorPayload}`,
          );
        },
      }),
    );
  }
}
