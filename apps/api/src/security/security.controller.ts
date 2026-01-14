import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CspReportDto } from './dto/csp-report.dto';
import { SecurityService } from './security.service';

@ApiTags('Security')
@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('csp-report')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Recebe relatórios de violação CSP',
    description:
      'Endpoint para receber relatórios de violação do Content-Security-Policy do frontend. Retorna 204 No Content.',
  })
  @ApiResponse({
    status: 204,
    description: 'Relatório recebido com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Formato de relatório inválido',
  })
  async receiveCspReport(@Body() report: CspReportDto): Promise<void> {
    await this.securityService.processCspReport(report);
  }
}
