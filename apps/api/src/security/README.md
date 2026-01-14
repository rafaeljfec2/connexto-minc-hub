# Security Module

Módulo de segurança para receber e processar relatórios de violação CSP (Content-Security-Policy).

## Endpoints

### POST `/minc-teams/v1/security/csp-report`

Recebe relatórios de violação CSP do frontend.

### GET `/minc-teams/v1/security/csp-reports`

Lista relatórios de violação CSP com filtros e paginação.

**Query Parameters:**

- `page` (number, default: 1): Número da página
- `limit` (number, default: 20, max: 100): Itens por página
- `violatedDirective` (string, optional): Filtrar por diretiva violada
- `isCritical` (boolean, optional): Filtrar apenas violações críticas
- `blockedUri` (string, optional): Filtrar por URI bloqueada (busca parcial)
- `documentUri` (string, optional): Filtrar por URI do documento (busca parcial)
- `startDate` (string, optional): Data inicial (ISO 8601)
- `endDate` (string, optional): Data final (ISO 8601)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "CSP reports retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "documentUri": "https://app.example.com/page",
      "violatedDirective": "script-src",
      "blockedUri": "inline",
      "isCritical": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      ...
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Request Body:**

```json
{
  "csp-report": {
    "document-uri": "https://example.com/page",
    "referrer": "https://example.com/",
    "violated-directive": "script-src",
    "effective-directive": "script-src",
    "original-policy": "default-src 'self'; script-src 'self'",
    "blocked-uri": "inline",
    "source-file": "https://example.com/app.js",
    "line-number": "42",
    "column-number": "10",
    "status-code": "200",
    "script-sample": "eval('...')"
  }
}
```

**Response:**

- `204 No Content` - Relatório recebido com sucesso

## Funcionalidades

1. **Recebimento de Relatórios CSP**: Endpoint dedicado para receber violações CSP
2. **Armazenamento em Banco de Dados**: Todos os relatórios são salvos na tabela `csp_reports`
3. **Logging Estruturado**: Logs estruturados com todas as informações do relatório
4. **Detecção de Violações Críticas**: Identifica violações críticas como:
   - Script injection
   - Inline scripts
   - Uso de `eval()`
   - Protocolo `javascript:`
5. **Alertas**: Logs de nível ERROR para violações críticas
6. **Consulta de Relatórios**: Endpoint para consultar relatórios com filtros e paginação

## Monitoramento

Os relatórios CSP são logados com nível WARN. Violações críticas são logadas com nível ERROR.

### Exemplo de Log

```
[SecurityService] WARN CSP Violation {
  timestamp: '2024-01-15T10:30:00.000Z',
  violatedDirective: 'script-src',
  blockedUri: 'inline',
  documentUri: 'https://example.com/page',
  sourceFile: 'https://example.com/app.js',
  lineNumber: '42',
  columnNumber: '10'
}
```

## Banco de Dados

Os relatórios CSP são armazenados na tabela `csp_reports` com os seguintes campos:

- `id`: UUID único do relatório
- `document_uri`: URI do documento onde ocorreu a violação
- `violated_directive`: Diretiva CSP violada
- `blocked_uri`: URI que foi bloqueada
- `is_critical`: Indica se é uma violação crítica
- `raw_report`: Relatório completo em formato JSONB
- `created_at`: Data e hora da violação

**Índices criados:**

- `idx_csp_reports_created_at`: Para consultas por data
- `idx_csp_reports_violated_directive`: Para filtros por diretiva
- `idx_csp_reports_is_critical`: Para filtrar violações críticas
- `idx_csp_reports_created_at_critical`: Índice composto para consultas otimizadas

## Próximos Passos

Para produção, considere:

1. ✅ **Armazenamento em Banco de Dados**: Implementado
2. ✅ **Consulta de Relatórios**: Implementado com filtros e paginação
3. **Integração com Monitoramento**: Enviar para serviços como Sentry, DataDog, etc.
4. **Alertas Automáticos**: Notificar equipe de segurança em caso de violações críticas
5. **Dashboard**: Criar dashboard frontend para visualizar violações CSP
6. **Limpeza Automática**: Implementar job para limpar relatórios antigos (ex: > 90 dias)

## Configuração no Frontend

O CSP está configurado no `index.html` com `report-uri` apontando para este endpoint:

```html
<meta
  http-equiv="Content-Security-Policy-Report-Only"
  content="... report-uri /minc-teams/v1/security/csp-report;"
/>
```
