# Fix Ignored Build Step in the Vercel Dashboard

## ⚠️ Current Error

The error shows the old command is still configured in the Dashboard:
```
git diff HEAD^ HEAD --quiet apps/web/ ../package.json ../pnpm-lock.yaml ../turbo.json
```

## ✅ Solution: Update in the Dashboard

### Step 1: Open Settings

1. Go to **Vercel Dashboard**
2. Select your project
3. Go to **Settings > Git**
4. Find the **"Ignored Build Step"** section

### Step 2: Update the Command

**Option A: Simplified Command (Recommended)**

Under **"Project Settings"**, configure:

**Behavior:** "Only build if there are changes in a folder"

**Folder:** `apps/web`

**OR configure manually:**

**Command:**
```bash
git diff HEAD^ HEAD --quiet -- apps/web/
```

**Option B: Remove Completely (Always Deploy)**

If you want to **always** deploy (ignoring Ignored Build Step):

1. Under **"Project Settings"**
2. Select **"Automatic"** in the dropdown
3. Click **"Save"**

### Step 3: Sync Production Overrides

1. Expand **"Production Overrides"**
2. If a command exists there, it will update automatically after the next production deploy
3. Or **Redeploy** the latest production deployment

### Step 4: Save and Test

1. Click **"Save"**
2. Make an empty commit to test:
   ```bash
   git commit --allow-empty -m "test: verify deploy after fixing ignoreCommand"
   git push
   ```

## 🔍 Verify It Worked

1. Go to **Deployments** on Vercel
2. Check that a new deploy was created
3. If there is no `exit code 129` error, it is working ✅

## ⚠️ Important

- `vercel.json` **no longer** has `ignoreCommand` (removed to avoid conflicts)
- **Dashboard configuration takes priority**
- Make sure the Dashboard command is correct

## Correct Command for Dashboard

If you configure manually, use:

```bash
git diff HEAD^ HEAD --quiet -- apps/web/
```

**Note:** `--` separates git arguments from paths, avoiding issues with paths starting with `-`.
