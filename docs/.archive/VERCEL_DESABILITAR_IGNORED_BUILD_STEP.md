# Disable Ignored Build Step in the Vercel Dashboard

## ⚠️ Problem

The `git diff` command does not work in the Vercel build environment, causing `exit code 129`.

## ✅ Solution: Disable or Use "Automatic"

### Option 1: Disable Ignored Build Step (Recommended)

1. Go to **Vercel Dashboard**
2. Select your project
3. Go to **Settings > Git**
4. Find the **"Ignored Build Step"** section
5. Under **"Project Settings"**, select:
   - **"Automatic"** in the dropdown
   - OR **"Don't build anything"** and then switch to **"Automatic"**
6. Click **"Save"**

This makes Vercel use its own logic to decide when to deploy, without running custom git commands.

### Option 2: Remove Completely

If the "Automatic" option is not available:

1. Under **"Project Settings"**
2. Leave the **Command** field completely **EMPTY**
3. Click **"Save"**

### Option 3: Use "Only build if there are changes in a folder" (No Command)

1. Select: **"Only build if there are changes in a folder"**
2. Set **Folder** to: `apps/web`
3. **Do NOT** configure a custom command
4. Click **"Save"**

## 🧪 Test

After configuring:

```bash
git commit --allow-empty -m "test: verify deploy after disabling ignoreCommand"
git push
```

## 📝 Note

- `vercel.json` **does not** include `ignoreCommand` (already removed)
- Vercel has its own change detection logic
- A custom Ignored Build Step is causing problems in the build environment
- It is better to let Vercel manage this automatically

## ✅ Expected Result

After disabling, deploys should work normally:
- ✅ Automatic deploys when there are changes
- ✅ No `exit code 129` errors
- ✅ Build working correctly
