# Complete Vercel Setup - Automatic Deploy

## ⚠️ Problem: Deploys are not created automatically

This guide fixes automatic deploys not working on Vercel.

## Step 1: Verify Dashboard Configuration

### A. Settings > General > Build & Development Settings

**IMPORTANT:** Leave these fields **COMPLETELY EMPTY** to use `vercel.json`:

- ✅ **Root Directory:** (empty)
- ✅ **Build Command:** (empty)
- ✅ **Output Directory:** (empty)
- ✅ **Install Command:** (empty)
- ✅ **Development Command:** (empty)

**OR configure manually (if you prefer):**

- **Root Directory:** `.`
- **Build Command:** `pnpm build --filter=@minc-hub/web`
- **Output Directory:** `apps/web/dist`
- **Install Command:** `pnpm install --frozen-lockfile`
- **Node.js Version:** 18.x or higher

### B. Settings > Git > Ignored Build Step

**CRITICAL:** This is the most important field! Configure as:

```bash
git diff HEAD^ HEAD --quiet apps/web/ package.json pnpm-lock.yaml turbo.json vercel.json
```

**OR leave EMPTY** to always deploy.

**What this command does:**
- Checks for changes in relevant files
- If there are NO changes, skips the build (exit code 0)
- If there ARE changes, runs the build (exit code 1)

### C. Settings > Git

1. Verify the repository is connected
2. Verify **Production Branch** (usually `main` or `master`)
3. If needed, click **"Disconnect"** and reconnect

## Step 2: Verify GitHub Webhooks

1. On GitHub, go to **Settings > Webhooks** for your repository
2. Verify an active Vercel webhook exists
3. If not, Vercel should create one when connecting
4. If the webhook is inactive, reconnect the repository on Vercel

## Step 3: Verify Repository Files

Ensure these files are committed:

```bash
git status
git add vercel.json turbo.json package.json pnpm-lock.yaml
git commit -m "fix: configure Vercel automatic deploy"
git push
```

## Step 4: Test Manual Deploy

1. In Vercel Dashboard, go to **Deployments**
2. Click **"Create Deployment"** or **"Redeploy"**
3. If it works, the issue is only automatic detection
4. If not, check error logs

## Step 5: Force Deploy with Empty Commit

If nothing works, force a deploy:

```bash
git commit --allow-empty -m "chore: trigger Vercel deploy"
git push
```

## Step 6: Check Logs

1. Go to **Deployments** on Vercel
2. Open the most recent deploy
3. Check logs for errors
4. Look for messages such as:
   - "Ignored via ignoreCommand"
   - "No changes detected"
   - "Build skipped"

## Alternative: Use Root Directory

If the problem persists, try **Root Directory** as `apps/web`:

### In Vercel Dashboard:

- **Root Directory:** `apps/web`
- **Build Command:** `pnpm build` (no filter)
- **Output Directory:** `dist`
- **Install Command:** `cd ../.. && pnpm install`

**BUT** this requires adjusting or removing `vercel.json`.

## Recommended Solution: Correct Ignored Build Step

The most reliable configuration is:

### Vercel Dashboard > Settings > Git > Ignored Build Step:

```bash
git diff HEAD^ HEAD --quiet apps/web/ package.json pnpm-lock.yaml turbo.json vercel.json .vercelignore
```

This ensures:
- ✅ Deploy is skipped only if NO relevant change was made
- ✅ Any change in `apps/web/` or config files triggers deploy
- ✅ Works correctly with monorepos

## Final Checklist

- [ ] `vercel.json` is at root and committed
- [ ] `turbo.json` has `"cache": false` on build
- [ ] Build fields in Dashboard are empty OR configured correctly
- [ ] **Ignored Build Step** is configured correctly
- [ ] GitHub webhook is active
- [ ] Main branch is configured
- [ ] Tested manual deploy (worked?)
- [ ] Pushed changes and verified deploy was created

## Command to Test Ignored Build Step

Test locally whether the command works:

```bash
# Should return exit code 1 (deploy) if there are changes
git diff HEAD^ HEAD --quiet apps/web/ package.json pnpm-lock.yaml turbo.json vercel.json
echo $?  # Should be 1 if changes, 0 if none
```

## If Nothing Works

1. **Disconnect and reconnect the repository** on Vercel
2. **Remove Ignored Build Step** temporarily
3. **Make an empty commit** to force deploy
4. **Check logs** from the last deploy
5. **Contact Vercel support** if it persists
