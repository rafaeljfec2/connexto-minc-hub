# Checklist to Enable CSP Enforcement

Use this checklist before switching from `Report-Only` to `Enforcement`.

## Prerequisites

- [ ] CSP has been in Report-Only mode for at least 1 week
- [ ] All CSP reports have been analyzed
- [ ] Legitimate violations have been identified and resolved
- [ ] Application works correctly with no console errors
- [ ] Team has been notified about the change

## Technical Checks

### Frontend

- [ ] CSP is configured correctly in `index.html`
- [ ] Trusted Types is initialized before React
- [ ] DOMPurify is used for sanitization
- [ ] External resource URLs are on the CSP whitelist
- [ ] No use of `eval()` or `Function()` in code
- [ ] No inline scripts in HTML
- [ ] No critical inline styles

### Backend

- [ ] Endpoint `/minc-teams/v1/security/csp-report` is working
- [ ] Logs are generated correctly
- [ ] Critical violations are detected
- [ ] Alert system is configured (if applicable)

## Tests

- [ ] E2E tests pass with CSP Report-Only
- [ ] Manual tests on all major browsers
- [ ] Tests on mobile devices
- [ ] Critical feature tests:
  - [ ] Login/Authentication
  - [ ] File upload
  - [ ] Chat/Messages
  - [ ] Forms
  - [ ] Page navigation

## Monitoring

- [ ] Monitoring system configured
- [ ] Alerts configured for critical violations
- [ ] CSP violations dashboard (if available)
- [ ] Rollback process defined

## Activation Plan

### Phase 1: Preparation (1-2 days before)

- [ ] Notify team about the change
- [ ] Review final CSP policy
- [ ] Prepare rollback if needed

### Phase 2: Gradual Activation

**Option A: By Environment**

- [ ] Enable in development first
- [ ] Monitor for 24h
- [ ] Enable in staging
- [ ] Monitor for 48h
- [ ] Enable in production

**Option B: By User Percentage**

- [ ] Enable for 10% of users
- [ ] Monitor for 24h
- [ ] Increase to 50%
- [ ] Monitor for 24h
- [ ] Enable for 100%

### Phase 3: Post-Activation

- [ ] Monitor logs intensively for the first 24h
- [ ] Check error metrics
- [ ] Collect user feedback
- [ ] Adjust policy if needed

## Rollback

If problems occur:

1. **Immediate**: Revert to Report-Only
2. **Investigate**: Analyze logs and CSP reports
3. **Fix**: Adjust policy or code
4. **Retest**: Validate before trying again

## Useful Commands

### Check Current CSP

```bash
# In browser console
document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content
```

### Test Violation

```javascript
// In browser console
import { triggerCspViolation } from '@/utils/test-csp-violation'
triggerCspViolation('script-src', 'inline')
```

### View Reports

```bash
# View API logs
cd apps/api
pnpm start:dev | grep "CSP Violation"
```

## Emergency Contacts

- **Development Team**: [contacts]
- **Security Team**: [contacts]
- **DevOps**: [contacts]

## Notes

- Keep this checklist up to date
- Document any issues found
- Review the CSP policy periodically
