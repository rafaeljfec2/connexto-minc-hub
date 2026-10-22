# Correct Ignored Build Step Configuration

## ✅ Current Dashboard Configuration

You have configured:
- **Behavior:** "Only build if there are changes in a folder"
- **Command:** `git diff HEAD^ HEAD --quiet -- ./apps/web`

## 🔧 Required Fix

The command is **almost correct**, but needs a small adjustment:

### Option 1: Simplified Command (Recommended)

**Command:**
```bash
git diff HEAD^ HEAD --quiet apps/web/
```

**Why?**
- Removes unnecessary `--`
- Adds trailing `/` to ensure folder changes are detected
- Simpler and more direct

### Option 2: More Specific Command

If you also want to detect changes in config files:

**Command:**
```bash
git diff HEAD^ HEAD --quiet apps/web/ package.json pnpm-lock.yaml turbo.json
```

**Note:** If Root Directory is `apps/web`, paths like `package.json` must be relative to repo root, so use `../package.json`.

## 📝 Steps to Fix

1. **In the Vercel Dashboard:**
   - Go to **Settings > Git > Ignored Build Step**
   - Under **"Project Settings"**
   - Change **Command** to:
     ```bash
     git diff HEAD^ HEAD --quiet apps/web/
     ```
   - Click **"Save"**

2. **Sync Production Overrides:**
   - Expand **"Production Overrides"**
   - If the Command field is empty, copy the same command
   - This removes the yellow warning

## 🧪 Test

After saving, make an empty commit:

```bash
git commit --allow-empty -m "test: verify automatic deploy"
git push
```

If a new deploy is created, it is working 🎉

## ⚠️ Important

- **Exit code 0** = No changes = **Does NOT deploy**
- **Exit code 1** = Changes present = **Deploys**

The command `git diff HEAD^ HEAD --quiet` returns:
- `0` if there are no differences (quiet mode)
- `1` if there are differences

That is why it works perfectly for Ignored Build Step!
