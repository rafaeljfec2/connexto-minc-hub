# How to Sync Vercel Settings

## ⚠️ Understanding the Problem

The **"Production Overrides"** field is **read-only**—it only shows settings used in the last production deploy. You **cannot edit** that field directly.

## ✅ Solution: Configure "Project Settings" and Deploy Again

### Step 1: Configure "Project Settings"

1. Under **"Project Settings"**, configure:

   **Behavior:** "Only build if there are changes in a folder"
   
   **Command:**
   ```bash
   git diff HEAD^ HEAD --quiet apps/web/
   ```

2. Click **"Save"**

### Step 2: Create a New Deploy

You have two options:

#### Option A: Redeploy Latest Deployment (Fast)

1. Go to **Deployments** on Vercel
2. Find the latest production deployment
3. Click the **three dots** (⋯) next to deployment
4. Select **"Redeploy"**
5. This uses the new **"Project Settings"** configuration

#### Option B: Push Again (Recommended)

1. Make an empty commit:
   ```bash
   git commit --allow-empty -m "chore: sync Vercel settings"
   git push
   ```
2. This creates a new deploy with updated settings

### Step 3: Verify

After deploy:
1. The yellow warning should disappear
2. **"Production Overrides"** updates automatically
3. Future automatic deploys should work correctly

## 🎯 Summary

- ✅ **"Project Settings"** = Editable settings (what you want)
- 📖 **"Production Overrides"** = Last deploy settings (read-only)
- 🔄 **Solution** = Configure "Project Settings" + New deploy

## ⚠️ Important

The yellow warning disappears automatically after you:
1. Save settings in "Project Settings"
2. Create a new deploy (redeploy or new push)

You of the not need to edit "Production Overrides"—it updates automatically!
