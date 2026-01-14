import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CspReportDto } from './dto/csp-report.dto';
import { GetCspReportsDto } from './dto/get-csp-reports.dto';
import { CspReportEntity } from './entities/csp-report.entity';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    @InjectRepository(CspReportEntity)
    private readonly cspReportRepository: Repository<CspReportEntity>,
  ) {}

  /**
   * Processa relatórios de violação CSP
   * @param report Relatório de violação CSP
   */
  async processCspReport(report: CspReportDto): Promise<void> {
    const cspReport = report['csp-report'];

    // Verificar se é violação crítica
    const isCritical = this.isCriticalViolation(cspReport);

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
      isCritical,
    };

    // Log de nível WARN para violações CSP normais, ERROR para críticas
    if (isCritical) {
      this.logger.error('CRITICAL CSP Violation Detected', logData);
    } else {
      this.logger.warn('CSP Violation', logData);
    }

    // Salvar no banco de dados
    try {
      const reportEntity = this.cspReportRepository.create({
        documentUri: cspReport?.['document-uri'],
        referrer: cspReport?.referrer,
        violatedDirective: cspReport?.['violated-directive'],
        effectiveDirective: cspReport?.['effective-directive'],
        originalPolicy: cspReport?.['original-policy'],
        blockedUri: cspReport?.['blocked-uri'],
        sourceFile: cspReport?.['source-file'],
        lineNumber: cspReport?.['line-number'] ? parseInt(cspReport['line-number'], 10) : undefined,
        columnNumber: cspReport?.['column-number']
          ? parseInt(cspReport['column-number'], 10)
          : undefined,
        statusCode: cspReport?.['status-code'] ? parseInt(cspReport['status-code'], 10) : undefined,
        scriptSample: cspReport?.['script-sample'],
        isCritical,
        rawReport: cspReport as Record<string, unknown>,
      });

      await this.cspReportRepository.save(reportEntity);
      this.logger.debug(`CSP report saved with ID: ${reportEntity.id}`);
    } catch (error) {
      // Log erro mas não falha a requisição
      this.logger.error('Failed to save CSP report to database', error);
    }

    // Em produção, você pode querer:
    // 1. Enviar para serviço de monitoramento (Sentry, DataDog, etc.)
    // 2. Alertar equipe de segurança em caso de violações críticas
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

  /**
   * Busca relatórios CSP com filtros e paginação
   * @param query Parâmetros de consulta
   * @returns Lista paginada de relatórios CSP
   */
  async getCspReports(query: GetCspReportsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.cspReportRepository.createQueryBuilder('report');

    // Aplicar filtros
    if (query.violatedDirective) {
      queryBuilder.andWhere('report.violatedDirective = :violatedDirective', {
        violatedDirective: query.violatedDirective,
      });
    }

    if (query.isCritical !== undefined) {
      queryBuilder.andWhere('report.isCritical = :isCritical', {
        isCritical: query.isCritical,
      });
    }

    if (query.blockedUri) {
      queryBuilder.andWhere('report.blockedUri ILIKE :blockedUri', {
        blockedUri: `%${query.blockedUri}%`,
      });
    }

    if (query.documentUri) {
      queryBuilder.andWhere('report.documentUri ILIKE :documentUri', {
        documentUri: `%${query.documentUri}%`,
      });
    }

    if (query.startDate) {
      queryBuilder.andWhere('report.createdAt >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('report.createdAt <= :endDate', {
        endDate: query.endDate,
      });
    }

    // Ordenar por data de criação (mais recentes primeiro)
    queryBuilder.orderBy('report.createdAt', 'DESC');

    // Contar total
    const total = await queryBuilder.getCount();

    // Aplicar paginação
    queryBuilder.skip(skip).take(limit);

    // Buscar resultados
    const reports = await queryBuilder.getMany();

    return {
      success: true,
      statusCode: 200,
      message: 'CSP reports retrieved successfully',
      data: reports,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    };
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
