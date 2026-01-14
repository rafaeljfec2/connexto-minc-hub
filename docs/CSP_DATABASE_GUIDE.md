# Guia: Armazenamento de Relatórios CSP no Banco de Dados

Este guia explica como usar o sistema de armazenamento de relatórios CSP no banco de dados.

## Visão Geral

Todos os relatórios de violação CSP são automaticamente salvos no banco de dados PostgreSQL na tabela `csp_reports`. Isso permite:

- Análise histórica de violações
- Identificação de padrões
- Monitoramento de tendências
- Consultas complexas com filtros

## Estrutura da Tabela

```sql
CREATE TABLE csp_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_uri TEXT,
  referrer TEXT,
  violated_directive VARCHAR(255),
  effective_directive VARCHAR(255),
  original_policy TEXT,
  blocked_uri TEXT,
  source_file TEXT,
  line_number INTEGER,
  column_number INTEGER,
  status_code INTEGER,
  script_sample TEXT,
  is_critical BOOLEAN NOT NULL DEFAULT false,
  raw_report JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Consultando Relatórios

### Via API

**Endpoint**: `GET /minc-teams/v1/security/csp-reports`

**Exemplos:**

```bash
# Listar todos os relatórios (primeira página)
curl "http://localhost:3000/minc-teams/v1/security/csp-reports"

# Filtrar apenas violações críticas
curl "http://localhost:3000/minc-teams/v1/security/csp-reports?isCritical=true"

# Filtrar por diretiva violada
curl "http://localhost:3000/minc-teams/v1/security/csp-reports?violatedDirective=script-src"

# Filtrar por período
curl "http://localhost:3000/minc-teams/v1/security/csp-reports?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z"

# Paginação
curl "http://localhost:3000/minc-teams/v1/security/csp-reports?page=2&limit=50"

# Múltiplos filtros
curl "http://localhost:3000/minc-teams/v1/security/csp-reports?isCritical=true&violatedDirective=script-src&page=1&limit=20"
```

### Via SQL Direto

```sql
-- Total de violações por diretiva
SELECT violated_directive, COUNT(*) as count
FROM csp_reports
GROUP BY violated_directive
ORDER BY count DESC;

-- Violações críticas nas últimas 24 horas
SELECT *
FROM csp_reports
WHERE is_critical = true
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Top 10 URIs bloqueadas
SELECT blocked_uri, COUNT(*) as count
FROM csp_reports
WHERE blocked_uri IS NOT NULL
GROUP BY blocked_uri
ORDER BY count DESC
LIMIT 10;

-- Violações por dia (últimos 7 dias)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_critical = true) as critical
FROM csp_reports
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Análise de Dados

### Queries Úteis

#### 1. Violações Mais Comuns

```sql
SELECT 
  violated_directive,
  blocked_uri,
  COUNT(*) as occurrences,
  COUNT(*) FILTER (WHERE is_critical = true) as critical_count
FROM csp_reports
GROUP BY violated_directive, blocked_uri
ORDER BY occurrences DESC
LIMIT 20;
```

#### 2. Tendência Temporal

```sql
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as violations,
  COUNT(*) FILTER (WHERE is_critical = true) as critical
FROM csp_reports
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour;
```

#### 3. Arquivos com Mais Violações

```sql
SELECT 
  source_file,
  COUNT(*) as violations,
  COUNT(DISTINCT violated_directive) as unique_directives
FROM csp_reports
WHERE source_file IS NOT NULL
GROUP BY source_file
ORDER BY violations DESC
LIMIT 20;
```

#### 4. Análise de Violações Críticas

```sql
SELECT 
  violated_directive,
  blocked_uri,
  document_uri,
  source_file,
  line_number,
  created_at
FROM csp_reports
WHERE is_critical = true
ORDER BY created_at DESC
LIMIT 50;
```

## Manutenção

### Limpeza de Dados Antigos

Para evitar crescimento excessivo da tabela, considere implementar limpeza periódica:

```sql
-- Deletar relatórios com mais de 90 dias
DELETE FROM csp_reports
WHERE created_at < NOW() - INTERVAL '90 days';

-- Ou manter apenas violações críticas antigas
DELETE FROM csp_reports
WHERE created_at < NOW() - INTERVAL '90 days'
  AND is_critical = false;
```

### Job de Limpeza Automática

Crie um job agendado (cron) ou use um scheduler:

```typescript
// Exemplo de job NestJS
@Cron('0 2 * * *') // Todo dia às 2h
async cleanupOldReports() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  
  await this.cspReportRepository.delete({
    createdAt: LessThan(cutoffDate),
    isCritical: false,
  });
}
```

## Integração com Dashboard

Para criar um dashboard frontend, use o endpoint de consulta:

```typescript
// Exemplo de hook React
export function useCspReports(filters: GetCspReportsDto) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/security/csp-reports', { params: filters })
      .then(response => setReports(response.data.data))
      .finally(() => setLoading(false));
  }, [filters]);

  return { reports, loading };
}
```

## Métricas Recomendadas

Monitore estas métricas regularmente:

1. **Taxa de Violações**: Total de violações por dia/semana
2. **Taxa de Violações Críticas**: Porcentagem de violações críticas
3. **Diretivas Mais Violadas**: Identificar políticas CSP problemáticas
4. **URIs Bloqueadas**: Recursos externos causando problemas
5. **Tendências Temporais**: Aumento/diminuição de violações ao longo do tempo

## Exemplo de Dashboard SQL

```sql
-- Dashboard completo
SELECT 
  COUNT(*) as total_violations,
  COUNT(*) FILTER (WHERE is_critical = true) as critical_violations,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7d,
  COUNT(DISTINCT violated_directive) as unique_directives,
  COUNT(DISTINCT document_uri) as unique_pages
FROM csp_reports;
```
