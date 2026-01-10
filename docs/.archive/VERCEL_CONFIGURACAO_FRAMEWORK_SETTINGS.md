# Configuração Correta do Framework Settings

## 📋 Situação Atual

Você tem:
- ✅ **Framework Preset:** Vite
- ⚠️ **Build Command:** `cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=@minc-...` (com Override ON)
- ⚠️ **Output Directory:** `dist` (com Override OFF)
- ⚠️ **Install Command:** `pnpm install` (com Override OFF)
- ⚠️ **Development Command:** `vite` (com Override OFF)

## ✅ Configuração Recomendada

### Se Root Directory = `apps/web`:

**Build Command:**
```bash
cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=@minc-hub/web
```
- ✅ Ative o **Override** (deve estar ON)

**Output Directory:**
```
dist
```
- ✅ Deixe o **Override OFF** (usa o padrão do Vite)

**Install Command:**
```bash
cd ../.. && pnpm install --frozen-lockfile
```
- ✅ Ative o **Override** (mude para ON)

**Development Command:**
```bash
cd ../.. && pnpm dev --filter=@minc-hub/web
```
- ✅ Ative o **Override** (mude para ON)

### Se Root Directory = vazio (raiz):

**Build Command:**
```bash
pnpm build --filter=@minc-hub/web
```
- ✅ Ative o **Override** (mude para ON)

**Output Directory:**
```
apps/web/dist
```
- ✅ Ative o **Override** (mude para ON)

**Install Command:**
```bash
pnpm install --frozen-lockfile
```
- ✅ Ative o **Override** (mude para ON)

**Development Command:**
```bash
pnpm dev --filter=@minc-hub/web
```
- ✅ Ative o **Override** (mude para ON)

## 🔧 Passos para Corrigir

### 1. Verificar Root Directory

1. Vá em **Settings > General > Root Directory**
2. Anote se está como `apps/web` ou vazio

### 2. Configurar Project Settings

Baseado no Root Directory, configure:

#### Se Root Directory = `apps/web`:

1. **Build Command:**
   - Ative **Override** (toggle ON)
   - Digite: `cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=@minc-hub/web`

2. **Output Directory:**
   - Deixe **Override OFF** (usa `dist` do Vite)

3. **Install Command:**
   - Ative **Override** (toggle ON)
   - Digite: `cd ../.. && pnpm install --frozen-lockfile`

4. **Development Command:**
   - Ative **Override** (toggle ON)
   - Digite: `cd ../.. && pnpm dev --filter=@minc-hub/web`

#### Se Root Directory = vazio:

1. **Build Command:**
   - Ative **Override** (toggle ON)
   - Digite: `pnpm build --filter=@minc-hub/web`

2. **Output Directory:**
   - Ative **Override** (toggle ON)
   - Digite: `apps/web/dist`

3. **Install Command:**
   - Ative **Override** (toggle ON)
   - Digite: `pnpm install --frozen-lockfile`

4. **Development Command:**
   - Ative **Override** (toggle ON)
   - Digite: `pnpm dev --filter=@minc-hub/web`

### 3. Salvar

1. Clique em **"Save"**
2. O aviso amarelo deve desaparecer após o próximo deploy

### 4. Fazer Novo Deploy

```bash
git commit --allow-empty -m "chore: sincronizar Framework Settings"
git push
```

## ⚠️ Importante

- O **Build Command** está cortado (`@minc-...`) - certifique-se de escrever o comando completo: `@minc-hub/web`
- Ative o **Override** apenas nos campos que você quer personalizar
- O aviso amarelo desaparece automaticamente após salvar e fazer um novo deploy
