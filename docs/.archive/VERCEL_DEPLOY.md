# Deploy on Vercel - MINC Teams

Complete instructions for deploying the project on Vercel.

## Prerequisites

1. Vercel account (https://vercel.com)
2. Git repository (GitHub, GitLab, or Bitbucket)
3. Project connected to repository

## Initial Setup

### 1. Connect the Project

1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import the GitHub/GitLab/Bitbucket repository
4. Configure the project:

### 2. Vercel Project Settings

**Framework Preset:** Vite

**Root Directory:** Leave empty (project root)

**Build Command:**

```bash
cd apps/web && pnpm build
```

**Output Directory:**

```
apps/web/dist
```

**Install Command:**

```bash
pnpm install
```

### 3. Environment Variables

Configure these in the Vercel dashboard:

#### Production

```
VITE_API_URL=https://api.minc-teams.com
VITE_MOCK_MODE=false
```

#### Preview/Staging

```
VITE_API_URL=https://api-staging.minc-teams.com
VITE_MOCK_MODE=false
```

#### Development (Branch)

```
VITE_API_URL=http://localhost:3001
VITE_MOCK_MODE=true
```

### 4. Additional Settings

**Node.js Version:** 18.x or higher

**PNPM Version:** 8.x or higher (Vercel detects automatically)

## Implemented Optimizations

### Build

- ✅ Minification with esbuild
- ✅ Automatic code splitting
- ✅ Separate chunks for React and UI vendors
- ✅ Minified CSS
- ✅ Source maps disabled in production

### Cache

- ✅ Static assets cached for 1 year
- ✅ Immutable cache for versioned files

### Routing

- ✅ SPA routing configured (all routes rewrite to index.html)

## Project Structure

The project is a Turborepo monorepo:

- **Root:** Monorepo configuration
- **apps/web:** React + Vite frontend application

## Build Commands

`vercel.json` is already configured with the correct commands:

- Build: `cd apps/web && pnpm build`
- Output: `apps/web/dist`

## Post-Deploy Verification

After deploy, verify:

1. ✅ Application loads correctly
2. ✅ Routes work (test navigation)
3. ✅ Environment variables are set
4. ✅ Mock mode is disabled in production
5. ✅ API is reachable

## Troubleshooting

### Error: "Build failed"

- Verify all dependencies are in `package.json`
- Confirm Node.js version is correct (18+)
- Check build logs on Vercel

### Error: "404 on routes"

- Verify `vercel.json` has `rewrites` configuration
- Confirm `outputDirectory` is correct

### Error: "Environment variables not found"

- Verify variables start with `VITE_`
- Confirm they were set in the Vercel dashboard
- Redeploy after adding variables

## Custom Domain

To configure a custom domain:

1. Go to Settings > Domains
2. Add your domain
3. Configure DNS records per Vercel instructions

## CI/CD

Vercel deploys automatically when you:

- Push to main branch (production)
- Open a Pull Request (preview)
- Push to other branches (preview)

## Monitoring

Vercel provides:

- Performance analytics
- Error logs
- Build metrics
- Visitor analytics (optional)

## Support

For more information, see:

- [Vercel Documentation](https://vercel.com/docs)
- [Vite + Vercel](https://vercel.com/docs/frameworks/vite)
