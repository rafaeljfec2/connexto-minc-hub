# Security Module

Security module for receiving and processing CSP (Content-Security-Policy) violation reports.

## Endpoints

### POST `/minc-teams/v1/security/csp-report`

Receives CSP violation reports from the frontend.

### GET `/minc-teams/v1/security/csp-reports`

Lists CSP violation reports with filters and pagination.

**Query Parameters:**

- `page` (number, default: 1): Page number
- `limit` (number, default: 20, max: 100): Items per page
- `violatedDirective` (string, optional): Filter by violated directive
- `isCritical` (boolean, optional): Filter critical violations only
- `blockedUri` (string, optional): Filter by blocked URI (partial match)
- `documentUri` (string, optional): Filter by document URI (partial match)
- `startDate` (string, optional): Start date (ISO 8601)
- `endDate` (string, optional): End date (ISO 8601)

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

- `204 No Content` - Report received successfully

## Features

1. **CSP Report Ingestion**: Dedicated endpoint for CSP violations
2. **Database Storage**: All reports are saved in the `csp_reports` table
3. **Structured Logging**: Structured logs with full report details
4. **Critical Violation Detection**: Identifies critical violations such as:
   - Script injection
   - Inline scripts
   - Use of `eval()`
   - `javascript:` protocol
5. **Alerts**: ERROR-level logs for critical violations
6. **Report Query**: Endpoint to query reports with filters and pagination

## Monitoring

CSP reports are logged at WARN level. Critical violations are logged at ERROR level.

### Log Example

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

## Database

CSP reports are stored in the `csp_reports` table with the following fields:

- `id`: Unique report UUID
- `document_uri`: URI of the document where the violation occurred
- `violated_directive`: Violated CSP directive
- `blocked_uri`: URI that was blocked
- `is_critical`: Whether this is a critical violation
- `raw_report`: Full report in JSONB format
- `created_at`: Violation date and time

**Índicees created:**

- `idx_csp_reports_created_at`: For date queries
- `idx_csp_reports_violated_directive`: For directive filters
- `idx_csp_reports_is_critical`: To filter critical violations
- `idx_csp_reports_created_at_critical`: Composite index for optimized queries

## Next Steps

For production, consider:

1. ✅ **Database Storage**: Implemented
2. ✅ **Report Query**: Implemented with filters and pagination
3. **Monitoring Integration**: Send to services such as Sentry, DataDog, etc.
4. **Automatic Alerts**: Notify the security team on critical violations
5. **Dashboard**: Build a frontend dashboard to visualize CSP violations
6. **Automatic Cleanup**: Implement a job to clean old reports (e.g. > 90 days)

## Frontend Configuration

CSP is configured in `index.html` with `report-uri` pointing to this endpoint:

```html
<meta
  http-equiv="Content-Security-Policy-Report-Only"
  content="... report-uri /minc-teams/v1/security/csp-report;"
/>
```
