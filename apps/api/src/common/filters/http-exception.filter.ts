import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errors: Record<string, string[]> | string[] | undefined;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as {
          message?: string | string[];
          error?: string;
          errors?: Record<string, string[]> | string[];
        };

        if (Array.isArray(responseObj.message)) {
          message = responseObj.message[0] ?? 'Validation failed';
          errors = responseObj.message;
        } else if (responseObj.message) {
          message = responseObj.message;
        } else if (responseObj.error) {
          message = responseObj.error;
        }

        if (responseObj.errors) {
          errors = responseObj.errors;
        }
      }
    }

    // Translate common error messages to English
    message = this.translateToEnglish(message);

    const apiResponse: ApiResponseDto = {
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(apiResponse);
  }

  private translateToEnglish(message: string): string {
    const translations: Record<string, string> = {
      'Usuário não encontrado': 'User not found',
      'Igreja não encontrada': 'Church not found',
      'Ministério não encontrado': 'Ministry not found',
      'Pessoa não encontrada': 'Person not found',
      'Equipe não encontrada': 'Team not found',
      'Culto não encontrado': 'Service not found',
      'Escala não encontrada': 'Schedule not found',
      'Check-in não encontrado': 'Attendance not found',
      'Email já está em uso': 'Email already in use',
      'Credenciais inválidas': 'Invalid credentials',
      'Token inválido': 'Invalid token',
      'Token expirado': 'Token expired',
      'Não autorizado': 'Unauthorized',
      'Acesso negado': 'Access denied',
      'Recurso não encontrado': 'Resource not found',
      'Erro interno do servidor': 'Internal server error',
      'Erro de validação': 'Validation error',
      Conflito: 'Conflict',
      'Já existe uma escala para este culto nesta data':
        'A schedule already exists for this service on this date',
      'Membro já está na equipe': 'Member is already in the team',
      'Equipe já está na escala': 'Team is already in the schedule',
    };

    return translations[message] ?? message;
  }
}
