# Vercel Deployment Guide

> **Last Updated**: 2026-01-10  
> **Status**: Active

## Overview

Complete guide for deploying MINC Teams on Vercel, including configuration, troubleshooting, and best practices.

## Table of Contents

- [Initial Setup](#initial-setup)
- [Environment Variables](#environment-variables)
- [Build Settings](#build-settings)
- [Ignored Build Step](#ignored-build-step)
- [Troubleshooting](#troubleshooting)

---

## Initial Setup

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Connect your GitHub repository
4. Select the `connexto-minc-hub` repository

### 2. Framework Preset

- **Framework**: Vite
- **Root Directory**: `apps/web`
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`

---

## Environment Variables

Configure these in the Vercel dashboard:

### Production

```bash
VITE_API_URL=https://api.minc-teams.com
VITE_MOCK_MODE=false
```

### Preview/Development

```bash
VITE_API_URL=https://api-dev.minc-teams.com
VITE_MOCK_MODE=false
```

---

## Build Settings

### Framework Settings

```json
{
  "framework": "vite",
  "buildCommand": "cd ../.. && pnpm build --filter @minc-hub/web",
  "outputDirectory": "apps/web/dist",
  "installCommand": "pnpm install",
  "devCommand": "pnpm dev"
}
```

### Root Directory

- **Root Directory**: `./` (monorepo root)
- Do not use `apps/web` as root

---

## Ignored Build Step

To avoid unnecessary builds when changes of the not affect the web app:

### Recommended Script

```bash
#!/bin/bash

# Check for changes in apps/web or packages/shared
if git diff HEAD^ HEAD --quiet apps/web packages/shared; then
  echo "🛑 No changes in web app or shared packages"
  exit 0
else
  echo "✅ Changes detected, proceeding with build"
  exit 1
fi
```

### Vercel Configuration

1. Go to Project Settings → Git
2. Under "Ignored Build Step", add:
   ```bash
   git diff HEAD^ HEAD --quiet apps/web packages/shared
   ```

---

## Troubleshooting

### Build Fails

**Problem**: Build fails with module not found error

**Solution**:

1. Verify `pnpm-workspace.yaml` is correct
2. Ensure `turbo.json` is configured
3. Clear cache: Settings → General → Clear Build Cache

### Environment Variables Not Loading

**Problem**: `VITE_*` variables are not available

**Solution**:

1. Verify variables start with `VITE_`
2. Redeploy after adding variables
3. Check which environment (Production/Preview) they are set for

### Deploy Takes Too Long

**Problem**: Deploy takes more than 5 minutes

**Solution**:

1. Implement Ignored Build Step
2. Use dependency caching
3. Optimize `turbo.json` for cache

### 404 on Routes

**Problem**: React Router routes return 404

**Solution**:
Add `vercel.json` at the project root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Best Practices

### 1. Preview Deployments

- Each PR gets an automatic preview deployment
- Test on preview before merge
- Shared preview URL for review

### 2. Production Deployments

- Only `main` branch deploys to production
- Use tags for important releases
- Monitor logs after deploy

### 3. Monitoring

- Configure error alerts
- Monitor performance metrics
- Review logs regularly

### 4. Rollback

If rollback is needed:

1. Go to Deployments
2. Find a stable previous deployment
3. Click "Promote to Production"

---

## Related documentation

- [ENV_VARIABLES](./ENV_VARIABLES.md)
- [Frontend Patterns](../frontend/WEB_PATTERNS.md)

## Changelog

- 2026-01-10: Consolidated all Vercel documents
