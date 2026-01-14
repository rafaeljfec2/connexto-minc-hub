# Security Module

Módulo de segurança para receber e processar relatórios de violação CSP (Content-Security-Policy).

## Endpoints

### POST `/minc-teams/v1/security/csp-report`

Recebe relatórios de violação CSP do frontend.

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
2. **Logging Estruturado**: Logs estruturados com todas as informações do relatório
3. **Detecção de Violações Críticas**: Identifica violações críticas como:
   - Script injection
   - Inline scripts
   - Uso de `eval()`
   - Protocolo `javascript:`
4. **Alertas**: Logs de nível ERROR para violações críticas

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

## Próximos Passos

Para produção, considere:

1. **Armazenamento em Banco de Dados**: Salvar relatórios para análise histórica
2. **Integração com Monitoramento**: Enviar para serviços como Sentry, DataDog, etc.
3. **Alertas Automáticos**: Notificar equipe de segurança em caso de violações críticas
4. **Dashboard**: Criar dashboard para visualizar violações CSP

## Configuração no Frontend

O CSP está configurado no `index.html` com `report-uri` apontando para este endpoint:

```html
<meta
  http-equiv="Content-Security-Policy-Report-Only"
  content="... report-uri /minc-teams/v1/security/csp-report;"
/>
```
