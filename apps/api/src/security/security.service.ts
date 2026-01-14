import { Injectable, Logger } from '@nestjs/common';
import { CspReportDto } from './dto/csp-report.dto';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  /**
   * Processa relatórios de violação CSP
   * @param report Relatório de violação CSP
   */
  async processCspReport(report: CspReportDto): Promise<void> {
    const cspReport = report['csp-report'];

    // Log estruturado para facilitar análise
    const logData = {
      timestamp: new Date().toISOString(),
      violatedDirective: cspReport?.['violated-directive'],
      effectiveDirective: cspReport?.['effective-directive'],
      blockedUri: cspReport?.['blocked-uri'],
      documentUri: cspReport?.['document-uri'],
      referrer: cspReport?.referrer,
      sourceFile: cspReport?.['source-file'],
      lineNumber: cspReport?.['line-number'],
      columnNumber: cspReport?.['column-number'],
      statusCode: cspReport?.['status-code'],
      scriptSample: cspReport?.['script-sample'],
      originalPolicy: cspReport?.['original-policy'],
    };

    // Log de nível WARN para violações CSP
    this.logger.warn('CSP Violation', logData);

    // Em produção, você pode querer:
    // 1. Salvar em banco de dados para análise
    // 2. Enviar para serviço de monitoramento (Sentry, DataDog, etc.)
    // 3. Alertar equipe de segurança em caso de violações críticas

    // Exemplo de alerta para violações críticas
    if (this.isCriticalViolation(cspReport)) {
      this.logger.error('CRITICAL CSP Violation Detected', logData);
      // Aqui você pode adicionar lógica para alertar equipe de segurança
    }
  }

  /**
   * Verifica se a violação é crítica
   * @param cspReport Relatório CSP
   * @returns true se a violação é crítica
   */
  private isCriticalViolation(cspReport: CspReport['csp-report']): boolean {
    if (!cspReport) return false;

    const violatedDirective = cspReport['violated-directive']?.toLowerCase() || '';
    const blockedUri = cspReport['blocked-uri']?.toLowerCase() || '';

    // Violações críticas:
    // - Script injection
    // - Inline scripts
    // - eval() usage
    // - javascript: protocol
    const criticalPatterns = [
      'script-src',
      'default-src',
      'javascript:',
      'eval(',
      'inline',
      'unsafe-inline',
      'unsafe-eval',
    ];

    return (
      criticalPatterns.some((pattern) => violatedDirective.includes(pattern)) ||
      criticalPatterns.some((pattern) => blockedUri.includes(pattern))
    );
  }
}

// Tipo auxiliar para o relatório CSP
type CspReport = {
  'csp-report': {
    'violated-directive'?: string;
    'blocked-uri'?: string;
    'document-uri'?: string;
    referrer?: string;
    'source-file'?: string;
    'line-number'?: string;
    'column-number'?: string;
    'status-code'?: string;
    'script-sample'?: string;
    'original-policy'?: string;
    'effective-directive'?: string;
  };
};
