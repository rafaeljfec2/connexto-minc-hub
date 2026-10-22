# CSP Monitoring Guide

This guide explains how to monitor and analyze Content-Security-Policy (CSP) violations in the application.

## Overview

The implemented XSS protection system includes:
- **CSP Report-Only**: Monitors violations without blocking functionality
- **Report endpoint**: `/minc-teams/v1/security/csp-report`
- **Structured logging**: All violations are logged on the backend

## How It Works

1. **Frontend**: When a CSP violation occurs, the browser automatically sends a report to endpoint
2. **Backend**: The endpoint receives, validates, and processes the report
3. **Logging**: Violations are logged at WARN level; critical violations at ERROR level

## Monitoring in Development

### 1. Check API Logs

```bash
# Start the API and monitor logs
cd apps/api
pnpm start:dev

# Logs will show CSP violations like:
# [SecurityService] WARN CSP Violation { ... }
```

### 2. Test CSP Violations Manually

#### In the Browser Console

```javascript
// Import test utility (if available)
import { triggerCspViolation } from '@/utils/test-csp-violation'

// Test inline script violation
triggerCspViolation('script-src', 'inline')

// Test eval usage
triggerCspViolation('script-src', 'eval')

// Test inline style
triggerCspViolation('style-src', 'inline')
```

#### Using the Backend Test Script

```bash
# Run the test script
cd apps/api
pnpm ts-node src/security/scripts/test-csp-report.ts
```

### 3. Check Reports in the Browser

1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for CSP-related messages
4. Go to **Network** tab
5. Filter by `csp-report`
6. Verify requests are being sent

## Violation Types

### Common Violations (WARN)

- **External sources**: Loading resources from disallowed domains
- **Inline styles**: Use of `style` attributes on HTML elements
- **External scripts**: Loading scripts from unconfigured CDNs

### Critical Violations (ERROR)

- **Script injection**: Attempts to inject malicious scripts
- **Inline scripts**: Use of inline `<script>` tags
- **eval()**: Use of `eval()` or similar functions
- **javascript: protocol**: URLs with the `javascript:` protocol

## Report Analysis

### CSP Report Structure

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

### Important Fields

- **violated-directive**: CSP directive that was violated
- **blocked-uri**: URI that was blocked
- **source-file**: File where the violation occurred
- **line-number**: Line number where it occurred
- **original-policy**: Full CSP policy

## Adjusting the CSP Policy

### Step 1: Analyze Violations

1. Collect reports for a few days
2. Identify common patterns
3. Separate legitimate violations from real issues

### Step 2: Adjust Directives

Edit `apps/web/index.html`:

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

### Step 3: Validate Changes

1. Test the application after each change
2. Monitor new reports
3. Repeat until there are no legitimate violations

## Enabling CSP Enforcement

### When to Enable

- ✅ All legitimate violations have been resolved
- ✅ Application works correctly in Report-Only mode
- ✅ Team is confident in the CSP policy

### How to Enable

1. Change from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`:

```html
<!-- BEFORE (Report-Only) -->
<meta
  http-equiv="Content-Security-Policy-Report-Only"
  content="..."
/>

<!-- AFTER (Enforcement) -->
<meta
  http-equiv="Content-Security-Policy"
  content="..."
/>
```

2. Update `vite.config.ts` as well if needed

3. Deploy and monitor closely

### Post-Activation Monitoring

- Monitor frontend error logs
- Check CSP reports (now actually blocking)
- Be ready to roll back if needed

## Monitoring Service Integration

### Sentry

```typescript
// In security.service.ts
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
// In security.service.ts
import { StatsD } from 'node-statsd';

const statsd = new StatsD();

statsd.increment('csp.violations', 1, {
  directive: cspReport['violated-directive'],
  critical: this.isCriticalViolation(cspReport) ? 'true' : 'false',
});
```

## Violations Dashboard (Future)

To build a dashboard, consider:

1. **Store reports in a database**
2. **Create a query endpoint** (`GET /security/csp-reports`)
3. **Frontend dashboard** to view:
   - Violation charts by type
   - Trends over time
   - Highlighted critical violations

## Troubleshooting

### Reports are not being sent

1. Verify CSP is configured correctly
2. Check the browser console for errors
3. Check the Network tab for blocked requests
4. Check CORS if needed

### Too many false positives

1. Adjust the CSP policy to be more permissive initially
2. Identify patterns and adjust gradually
3. Use `'unsafe-inline'` temporarily if needed (not recommended)

### Critical violations appearing

1. **URGENT**: Investigate immediately
2. Check source code at the indicated line
3. Fix the vulnerability
4. Review CSP policy

## Additional Resources

- [MDN: Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Report URI](https://report-uri.com/) - CSP monitoring service
