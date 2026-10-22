# Manual Configuration in the Vercel Dashboard

## ⚠️ Current Situation

You have **Root Directory = `apps/web`** configured in the Dashboard.

## ✅ Correct Configuration for Root Directory = `apps/web`

### Settings > Build & Development Settings

**Build Command:**

```bash
cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=@minc-hub/web
```

**Output Directory:**

```
dist
```

**Install Command:**

```bash
cd ../.. && pnpm install --frozen-lockfile
```

**Development Command:**

```bash
cd ../.. && pnpm dev --filter=@minc-hub/web
```

### Settings > Git > Ignored Build Step

**Select:** "Only build if there are changes in a folder"

**Configure:**

- **Folder:** `apps/web`

**OR configure manually:**

```bash
git diff HEAD^ HEAD --quiet apps/web/
```

**OR leave as "Automatic"** to always deploy.

## ✅ Alternative: Use Project Root (Recommended)

If you prefer the **project root** (better for monorepos):

### 1. Settings > General > Root Directory

- Leave **EMPTY** (or set to `.`)
- **Disable** the toggle "Include files outside the root directory"

### 2. Settings > Build & Development Settings

**Build Command:**

```bash
pnpm build --filter=@minc-hub/web
```

**Output Directory:**

```
apps/web/dist
```

**Install Command:**

```bash
pnpm install --frozen-lockfile
```

### 3. Settings > Git > Ignored Build Step

**Configure:**

```bash
git diff HEAD^ HEAD --quiet apps/web/ package.json pnpm-lock.yaml turbo.json vercel.json
```

**OR select:** "Only build if there are changes in a folder"

- **Folder:** `apps/web`

## 📝 Files Created

1. ✅ `vercel.json` at repo root (for root deploy)
2. ✅ `apps/web/vercel.json` (for root=apps/web)

Vercel uses the `vercel.json` in the configured Root Directory.

## 🧪 Test

After configuring, make an empty commit:

```bash
git commit --allow-empty -m "test: trigger Vercel deploy"
git push
```

If a new deploy appears, it is working 🎉
