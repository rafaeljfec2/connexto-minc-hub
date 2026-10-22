# Fix Warning: "Configuration Settings differ from Project Settings"

## ⚠️ Problem Identified

You see the warning:
> "Configuration Settings in the current Production deployment differ from your current Project Settings."

This means **settings differ** between:
- **Production Overrides** (last production deploy settings)
- **Project Settings** (current project settings)

## 🔧 Step-by-Step Solution

### 1. Expand "Production Overrides"

1. Click the arrow next to **"Production Overrides"**
2. Note all shown settings:
   - Build Command
   - Output Directory
   - Install Command
   - Ignored Build Step
   - Root Directory

### 2. Expand "Project Settings"

1. Click the arrow next to **"Project Settings"**
2. Compare with **"Production Overrides"**

### 3. Sync Settings

**Option A: Use Project Settings (Recommended)**

1. Under **"Project Settings"**, configure:

   **Ignored Build Step:**
   ```bash
   git diff HEAD^ HEAD --quiet apps/web/ package.json pnpm-lock.yaml turbo.json vercel.json
   ```
   
   **OR select:** "Only build if there are changes in a folder"
   - **Folder:** `apps/web`

2. Click **"Save"**

3. This syncs project settings for future deploys

**Option B: Use Production Settings**

1. Copy settings from **"Production Overrides"**
2. Paste into **"Project Settings"**
3. Click **"Save"**

## ✅ Recommended Ignored Build Step Configuration

### If Root Directory = `apps/web`:

**Configure as:**
```bash
git diff HEAD^ HEAD --quiet apps/web/
```

**OR use the visual option:**
- Select: **"Only build if there are changes in a folder"**
- **Folder:** `apps/web`

### If Root Directory = empty (root):

**Configure as:**
```bash
git diff HEAD^ HEAD --quiet apps/web/ package.json pnpm-lock.yaml turbo.json vercel.json
```

## 🎯 Immediate Steps

1. ✅ Expand **"Production Overrides"** and naoe settings
2. ✅ Expand **"Project Settings"** and compare
3. ✅ Configure **"Ignored Build Step"** as above
4. ✅ Click **"Save"**
5. ✅ Push to test:
   ```bash
   git commit --allow-empty -m "test: verify automatic deploy"
   git push
   ```

## 🔍 Verify It Worked

1. Go to **Deployments** on Vercel
2. Check that a new deploy was created after the push
3. If not, check logs under **Settings > Git > Webhooks**

## ⚠️ Important

After saving, the yellow warning should disappear. If it persists:

1. **Redeploy manually** the latest production deployment
2. This syncs settings
3. Or wait for the next automatic deploy
