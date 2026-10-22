# Guide: Storing CSP Reports in the Database

This guide explains how to use CSP report storage in the database.

## Overview

All CSP violation reports are automatically saved in PostgreSQL in the `csp_reports` table. This enables:

- Historical analysis of violations
- Pattern identification
- Trend monitoring
- Complex filtered queries

## Table Structure

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

## Querying Reports

### Via API

**Endpoint**: `GET /minc-teams/v1/security/csp-reports`

**Examples:**

```bash
# List all reports (first page)
curl "http://localhost:3000/minc-teams/v1/security/csp-reports"

# Filter critical violations only
curl "http://localhost:3000/minc-teams/v1/security/csp-reports?isCritical=true"

# Filter by violated directive
curl "http://localhost:3000/minc-teams/v1/security/csp-reports?violatedDirective=script-src"

# Filter by date range
curl "http://localhost:3000/minc-teams/v1/security/csp-reports?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z"

# Pagination
curl "http://localhost:3000/minc-teams/v1/security/csp-reports?page=2&limit=50"

# Multiple filters
curl "http://localhost:3000/minc-teams/v1/security/csp-reports?isCritical=true&violatedDirective=script-src&page=1&limit=20"
```

### Via Direct SQL

```sql
-- Total violations by directive
SELECT violated_directive, COUNT(*) as count
FROM csp_reports
GROUP BY violated_directive
ORDER BY count DESC;

-- Critical violations in the last 24 hours
SELECT *
FROM csp_reports
WHERE is_critical = true
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Top 10 blocked URIs
SELECT blocked_uri, COUNT(*) as count
FROM csp_reports
WHERE blocked_uri IS NOT NULL
GROUP BY blocked_uri
ORDER BY count DESC
LIMIT 10;

-- Violations per day (last 7 days)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_critical = true) as critical
FROM csp_reports
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Data Analysis

### Useful Queries

#### 1. Most Common Violations

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

#### 2. Time Trend

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

#### 3. Files with Most Violations

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

#### 4. Critical Violation Analysis

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

## Maintenance

### Cleaning Old Data

To avoid unbounded table growth, consider periodic cleanup:

```sql
-- Delete reports older than 90 days
DELETE FROM csp_reports
WHERE created_at < NOW() - INTERVAL '90 days';

-- Or keep only old critical violations
DELETE FROM csp_reports
WHERE created_at < NOW() - INTERVAL '90 days'
  AND is_critical = false;
```

### Automatic Cleanup Job

Create a scheduled job (cron) or use a scheduler:

```typescript
// Example NestJS job
@Cron('0 2 * * *') // Every day at 2am
async cleanupOldReports() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  
  await this.cspReportRepository.delete({
    createdAt: LessThan(cutoffDate),
    isCritical: false,
  });
}
```

## Dashboard Integration

To build a frontend dashboard, use the query endpoint:

```typescript
// Example React hook
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

## Recommended Metrics

Monitor these metrics regularly:

1. **Violation Rate**: Total violations per day/week
2. **Critical Violation Rate**: Percentage of critical violations
3. **Most Violated Directives**: Identify problematic CSP policies
4. **Blocked URIs**: External resources causing issues
5. **Time Trends**: Increase/decrease in violations over time

## Example SQL Dashboard

```sql
-- Full dashboard
SELECT 
  COUNT(*) as total_violations,
  COUNT(*) FILTER (WHERE is_critical = true) as critical_violations,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7d,
  COUNT(DISTINCT violated_directive) as unique_directives,
  COUNT(DISTINCT document_uri) as unique_pages
FROM csp_reports;
```
