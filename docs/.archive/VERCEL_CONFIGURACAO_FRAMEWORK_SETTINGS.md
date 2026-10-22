# Correct Framework Settings Configuration

## 📋 Current Situation

You have:
- ✅ **Framework Preset:** Vite
- ⚠️ **Build Command:** `cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=@minc-...` (Override ON)
- ⚠️ **Output Directory:** `dist` (Override OFF)
- ⚠️ **Install Command:** `pnpm install` (Override OFF)
- ⚠️ **Development Command:** `vite` (Override OFF)

## ✅ Recommended Configuration

### If Root Directory = `apps/web`:

**Build Command:**
```bash
cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=@minc-hub/web
```
- ✅ Enable **Override** (should be ON)

**Output Directory:**
```
dist
```
- ✅ Leave **Override OFF** (uses Vite default)

**Install Command:**
```bash
cd ../.. && pnpm install --frozen-lockfile
```
- ✅ Enable **Override** (turn ON)

**Development Command:**
```bash
cd ../.. && pnpm dev --filter=@minc-hub/web
```
- ✅ Enable **Override** (turn ON)

### If Root Directory = empty (root):

**Build Command:**
```bash
pnpm build --filter=@minc-hub/web
```
- ✅ Enable **Override** (turn ON)

**Output Directory:**
```
apps/web/dist
```
- ✅ Enable **Override** (turn ON)

**Install Command:**
```bash
pnpm install --frozen-lockfile
```
- ✅ Enable **Override** (turn ON)

**Development Command:**
```bash
pnpm dev --filter=@minc-hub/web
```
- ✅ Enable **Override** (turn ON)

## 🔧 Steps to Fix

### 1. Verify Root Directory

1. Go to **Settings > General > Root Directory**
2. Note whether it is `apps/web` or empty

### 2. Configure Project Settings

Based on Root Directory, configure:

#### If Root Directory = `apps/web`:

1. **Build Command:**
   - Enable **Override** (toggle ON)
   - Enter: `cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=@minc-hub/web`

2. **Output Directory:**
   - Leave **Override OFF** (uses Vite `dist`)

3. **Install Command:**
   - Enable **Override** (toggle ON)
   - Enter: `cd ../.. && pnpm install --frozen-lockfile`

4. **Development Command:**
   - Enable **Override** (toggle ON)
   - Enter: `cd ../.. && pnpm dev --filter=@minc-hub/web`

#### If Root Directory = empty:

1. **Build Command:**
   - Enable **Override** (toggle ON)
   - Enter: `pnpm build --filter=@minc-hub/web`

2. **Output Directory:**
   - Enable **Override** (toggle ON)
   - Enter: `apps/web/dist`

3. **Install Command:**
   - Enable **Override** (toggle ON)
   - Enter: `pnpm install --frozen-lockfile`

4. **Development Command:**
   - Enable **Override** (toggle ON)
   - Enter: `pnpm dev --filter=@minc-hub/web`

### 3. Save

1. Click **"Save"**
2. The yellow warning should disappear after the next deploy

### 4. Create New Deploy

```bash
git commit --allow-empty -m "chore: sync Framework Settings"
git push
```

## ⚠️ Important

- **Build Command** may be truncated (`@minc-...`)—use the full filter: `@minc-hub/web`
- Enable **Override** only on fields you want to customize
- The yellow warning disappears automatically after saving and deploying again
