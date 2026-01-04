# Configuração Manual no Dashboard da Vercel

## ⚠️ Situação Atual

Você tem **Root Directory = `apps/web`** configurado no Dashboard.

## ✅ Configuração Correta para Root Directory = `apps/web`

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

**Selecione:** "Only build if there are changes in a folder"

**Configure:**

- **Folder:** `apps/web`

**OU configure manualmente:**

```bash
git diff HEAD^ HEAD --quiet apps/web/
```

**OU deixe como "Automatic"** para sempre fazer deploy.

## ✅ Alternativa: Usar Raiz do Projeto (Recomendado)

Se preferir usar a **raiz do projeto** (melhor para monorepo):

### 1. Settings > General > Root Directory

- **Deixe VAZIO** (ou configure como `.`)
- **Desabilite** o toggle "Include files outside the root directory"

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

**OU selecione:** "Only build if there are changes in a folder"

- **Folder:** `apps/web`

## 📝 Arquivos Criados

1. ✅ `vercel.json` na raiz (para usar raiz)
2. ✅ `apps/web/vercel.json` (para usar root=apps/web)

A Vercel vai usar o `vercel.json` que estiver no Root Directory configurado.

## 🧪 Teste

Após configurar, faça um commit vazio:

```bash
git commit --allow-empty -m "test: trigger Vercel deploy"
git push
```

Se aparecer um novo deploy, está funcionando! 🎉
