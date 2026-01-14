# Guia de Monitoramento CSP

Este guia explica como monitorar e analisar violações CSP (Content-Security-Policy) na aplicação.

## Visão Geral

O sistema de proteção XSS implementado inclui:
- **CSP Report-Only**: Monitora violações sem bloquear funcionalidades
- **Endpoint de Relatório**: `/minc-teams/v1/security/csp-report`
- **Logging Estruturado**: Todas as violações são logadas no backend

## Como Funciona

1. **Frontend**: Quando uma violação CSP ocorre, o navegador envia automaticamente um relatório para o endpoint
2. **Backend**: O endpoint recebe, valida e processa o relatório
3. **Logging**: Violações são logadas com nível WARN, violações críticas com nível ERROR

## Monitoramento em Desenvolvimento

### 1. Verificar Logs da API

```bash
# Inicie a API e monitore os logs
cd apps/api
pnpm start:dev

# Os logs mostrarão violações CSP assim:
# [SecurityService] WARN CSP Violation { ... }
```

### 2. Testar Violações CSP Manualmente

#### No Console do Navegador

```javascript
// Importar utilitário de teste (se disponível)
import { triggerCspViolation } from '@/utils/test-csp-violation'

// Testar violação de script inline
triggerCspViolation('script-src', 'inline')

// Testar uso de eval
triggerCspViolation('script-src', 'eval')

// Testar estilo inline
triggerCspViolation('style-src', 'inline')
```

#### Usando o Script de Teste do Backend

```bash
# Execute o script de teste
cd apps/api
pnpm ts-node src/security/scripts/test-csp-report.ts
```

### 3. Verificar Relatórios no Browser

1. Abra o DevTools (F12)
2. Vá para a aba **Console**
3. Procure por mensagens relacionadas a CSP
4. Vá para a aba **Network**
5. Filtre por `csp-report`
6. Verifique se as requisições estão sendo enviadas

## Tipos de Violações

### Violações Comuns (WARN)

- **Fontes externas**: Carregamento de recursos de domínios não permitidos
- **Estilos inline**: Uso de atributos `style` em elementos HTML
- **Scripts externos**: Carregamento de scripts de CDNs não configurados

### Violações Críticas (ERROR)

- **Script injection**: Tentativas de injeção de scripts maliciosos
- **Inline scripts**: Uso de `<script>` tags inline
- **eval()**: Uso da função `eval()` ou similares
- **javascript: protocol**: URLs com protocolo `javascript:`

## Análise de Relatórios

### Estrutura de um Relatório CSP

```json
{
  "csp-report": {
    "document-uri": "https://app.example.com/page",
    "violated-directive": "script-src",
    "blocked-uri": "inline",
    "source-file": "https://app.example.com/app.js",
    "line-number": "42",
    "column-number": "10",
    "original-policy": "..."
  }
}
```

### Campos Importantes

- **violated-directive**: Diretiva CSP que foi violada
- **blocked-uri**: URI que foi bloqueada
- **source-file**: Arquivo onde a violação ocorreu
- **line-number**: Linha do código onde ocorreu
- **original-policy**: Política CSP completa

## Ajustando a Política CSP

### Passo 1: Analisar Violações

1. Colete relatórios por alguns dias
2. Identifique padrões comuns
3. Separe violações legítimas de problemas reais

### Passo 2: Ajustar Diretivas

Edite `apps/web/index.html`:

```html
<meta
  http-equiv="Content-Security-Policy-Report-Only"
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://trusted-cdn.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    ...
  "
/>
```

### Passo 3: Validar Ajustes

1. Teste a aplicação após cada ajuste
2. Monitore novos relatórios
3. Repita até que não haja violações legítimas

## Ativando CSP Enforcement

### Quando Ativar

- ✅ Todas as violações legítimas foram resolvidas
- ✅ Aplicação funciona corretamente em Report-Only
- ✅ Equipe está confiante na política CSP

### Como Ativar

1. Mude de `Content-Security-Policy-Report-Only` para `Content-Security-Policy`:

```html
<!-- ANTES (Report-Only) -->
<meta
  http-equiv="Content-Security-Policy-Report-Only"
  content="..."
/>

<!-- DEPOIS (Enforcement) -->
<meta
  http-equiv="Content-Security-Policy"
  content="..."
/>
```

2. Atualize também no `vite.config.ts` se necessário

3. Faça deploy e monitore de perto

### Monitoramento Pós-Ativação

- Monitore logs de erro do frontend
- Verifique relatórios CSP (agora bloqueando de fato)
- Esteja pronto para reverter se necessário

## Integração com Serviços de Monitoramento

### Sentry

```typescript
// Em security.service.ts
import * as Sentry from '@sentry/node';

if (this.isCriticalViolation(cspReport)) {
  Sentry.captureMessage('Critical CSP Violation', {
    level: 'error',
    extra: logData,
  });
}
```

### DataDog

```typescript
// Em security.service.ts
import { StatsD } from 'node-statsd';

const statsd = new StatsD();

statsd.increment('csp.violations', 1, {
  directive: cspReport['violated-directive'],
  critical: this.isCriticalViolation(cspReport) ? 'true' : 'false',
});
```

## Dashboard de Violações (Futuro)

Para criar um dashboard, considere:

1. **Armazenar relatórios em banco de dados**
2. **Criar endpoint de consulta** (`GET /security/csp-reports`)
3. **Frontend dashboard** para visualizar:
   - Gráficos de violações por tipo
   - Tendências ao longo do tempo
   - Violações críticas destacadas

## Troubleshooting

### Relatórios não estão sendo enviados

1. Verifique se o CSP está configurado corretamente
2. Verifique o console do navegador para erros
3. Verifique a aba Network para requisições bloqueadas
4. Verifique CORS se necessário

### Muitas violações falsas

1. Ajuste a política CSP para ser mais permissiva inicialmente
2. Identifique padrões e ajuste gradualmente
3. Use `'unsafe-inline'` temporariamente se necessário (não recomendado)

### Violações críticas aparecendo

1. **URGENTE**: Investigar imediatamente
2. Verificar código fonte na linha indicada
3. Corrigir vulnerabilidade
4. Revisar política CSP

## Recursos Adicionais

- [MDN: Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Report URI](https://report-uri.com/) - Serviço de monitoramento CSP
