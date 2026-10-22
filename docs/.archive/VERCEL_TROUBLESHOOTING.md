# Vercel Deploy Troubleshooting - Monorepo

## Problem: Deploys are not created after the first push

### Possible Causes

1. **Incorrect `vercel.json` configuration**
2. **Turborepo cache preventing change detection**
3. **Project settings in Vercel Dashboard**

## Solutions

### 1. Verify Project Settings on Vercel

In the Vercel dashboard, verify:

- **Root Directory:** Leave empty (project root) or set to `.`
- **Framework Preset:** Vite
- **Build Command:** Should be empty (uses `vercel.json`) or `pnpm build --filter=@minc-hub/web`
- **Output Directory:** `apps/web/dist`
- **Install Command:** Should be empty (uses `vercel.json`) or `pnpm install`

### 2. Verify `vercel.json`

Root `vercel.json` should contain:

```json
{
  "version": 2,
  "buildCommand": "pnpm build --filter=@minc-hub/web",
  "outputDirectory": "apps/web/dist",
  "installCommand": "pnpm install",
  "framework": "vite"
}
```

### 3. Clear Turborepo Cache

If the problem persists, it may be Turborepo cache. On Vercel:

1. Go to **Settings > Build & Development Settings**
2. Add **Environment Variables**:
   - `TURBO_TOKEN` (if using Remote Cache)
   - `TURBO_TEAM` (if using Remote Cache)
3. Or disable cache with: `TURBO_FORCE=true`

### 4. Force New Deploy

1. In Vercel Dashboard, go to **Deployments**
2. Click the three dots on the latest deploy
3. Select **Redeploy**
4. Or empty commit: `git commit --allow-empty -m "Trigger deploy" && git push`

### 5. Check Build Logs

1. Go to **Deployments** on Vercel
2. Open the failed or missing deploy
3. Check build logs for errors

### 6. Manual Dashboard Configuration

If `vercel.json` is not respected:

1. Go to **Settings > General**
2. Under **Build & Development Settings**, configure:
   - **Root Directory:** `.` (root)
   - **Build Command:** `pnpm build --filter=@minc-hub/web`
   - **Output Directory:** `apps/web/dist`
   - **Install Command:** `pnpm install`
   - **Node.js Version:** 18.x or higher

### 7. Verify Git Hooks

Ensure files are committed:

```bash
git status
git add .
git commit -m "Your message"
git push
```

### 8. Verify Branch

Vercel auto-deploys only:
- Main branch (usually `main` or `master`)
- Branches configured in **Settings > Git**

Verify you are pushing to correct branch.

## Useful Commands

### Test Build Locally

```bash
pnpm install
pnpm build --filter=@minc-hub/web
```

### Verify Structure

```bash
ls -la apps/web/dist
```

### Clean and Rebuild

```bash
pnpm clean
pnpm build --filter=@minc-hub/web
```

## Checklist

- [ ] `vercel.json` is at project root
- [ ] Commands in `vercel.json` are correct
- [ ] Root `package.json` has `build` script
- [ ] `apps/web/package.json` has `build` script
- [ ] Project is connected to correct Git repository
- [ ] Main branch is configured on Vercel
- [ ] Environment variables are configured
- [ ] Node.js version is set (18+)
- [ ] PNPM is used (detected automatically)
- [ ] **Ignored Build Step** is configured correctly (or removed)
- [ ] GitHub webhook is working

## Manual Configuration in Vercel Dashboard

If automatic deploys of the not work, configure manually:

### Settings > Git

1. Verify repository is connected
2. Verify main branch (usually `main` or `master`)
3. Click **"Disconnect"** and reconnect if needed

### Settings > Build & Development Settings

**IMPORTANT:** Leave these fields **EMPTY** to use `vercel.json`:

- **Root Directory:** (empty)
- **Build Command:** (empty - from vercel.json)
- **Output Directory:** (empty - from vercel.json)
- **Install Command:** (empty - from vercel.json)
- **Development Command:** (empty)

**OR configure manually:**

- **Root Directory:** `.`
- **Build Command:** `pnpm build --filter=@minc-hub/web`
- **Output Directory:** `apps/web/dist`
- **Install Command:** `pnpm install --frozen-lockfile`

### Settings > Git > Ignored Build Step

**IMPORTANT:** This field should be **EMPTY** or set to:

```bash
git diff HEAD^ HEAD --quiet apps/web/ package.json pnpm-lock.yaml turbo.json vercel.json
```

This ensures deploy is skipped only when NO relevant change was made.

### Verify Webhooks

1. Go to **Settings > Git**
2. Verify webhooks are configured
3. If not, Vercel should create them when connecting the repo
4. On GitHub, go to **Settings > Webhooks** for the repository
5. Verify an active Vercel webhook exists

## Force Manual Deploy

If nothing works, force a deploy:

1. In Vercel Dashboard, go to **Deployments**
2. Click the three dots on the latest deploy
3. Select **Redeploy**
4. Or use CLI: `vercel --prod`
