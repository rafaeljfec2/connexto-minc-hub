# Configuração Completa Vercel - Deploy Automático

## ⚠️ Problema: Deploys não são criados automaticamente

Este guia resolve o problema de deploys automáticos não funcionarem na Vercel.

## Passo 1: Verificar Configuração no Dashboard da Vercel

### A. Settings > General > Build & Development Settings

**IMPORTANTE:** Deixe estes campos **COMPLETAMENTE VAZIOS** para usar o `vercel.json`:

- ✅ **Root Directory:** (vazio)
- ✅ **Build Command:** (vazio)
- ✅ **Output Directory:** (vazio)
- ✅ **Install Command:** (vazio)
- ✅ **Development Command:** (vazio)

**OU configure manualmente (se preferir):**

- **Root Directory:** `.`
- **Build Command:** `pnpm build --filter=@minc-hub/web`
- **Output Directory:** `apps/web/dist`
- **Install Command:** `pnpm install --frozen-lockfile`
- **Node.js Version:** 18.x ou superior

### B. Settings > Git > Ignored Build Step

**CRÍTICO:** Este é o campo mais importante! Configure como:

```bash
git diff HEAD^ HEAD --quiet apps/web/ package.json pnpm-lock.yaml turbo.json vercel.json
```

**OU deixe VAZIO** para sempre fazer deploy.

**O que este comando faz:**
- Verifica se houve mudanças em arquivos relevantes
- Se NÃO houver mudanças, ignora o build (exit code 0)
- Se HOUVER mudanças, faz o build (exit code 1)

### C. Settings > Git

1. Verifique se o repositório está conectado
2. Verifique a **Production Branch** (geralmente `main` ou `master`)
3. Se necessário, clique em **"Disconnect"** e reconecte

## Passo 2: Verificar Webhooks do GitHub

1. No GitHub, vá em **Settings > Webhooks** do seu repositório
2. Verifique se há um webhook da Vercel ativo
3. Se não houver, a Vercel deve criar automaticamente ao conectar
4. Se o webhook estiver inativo, reconecte o repositório na Vercel

## Passo 3: Verificar Arquivos no Repositório

Certifique-se de que estes arquivos estão commitados:

```bash
git status
git add vercel.json turbo.json package.json pnpm-lock.yaml
git commit -m "fix: configurar deploy automático Vercel"
git push
```

## Passo 4: Testar Deploy Manual

1. Na Vercel Dashboard, vá em **Deployments**
2. Clique em **"Create Deployment"** ou **"Redeploy"**
3. Se funcionar, o problema é apenas com detecção automática
4. Se não funcionar, verifique os logs de erro

## Passo 5: Forçar Deploy com Commit Vazio

Se nada funcionar, force um deploy:

```bash
git commit --allow-empty -m "chore: trigger Vercel deploy"
git push
```

## Passo 6: Verificar Logs

1. Vá em **Deployments** na Vercel
2. Clique no deploy mais recente
3. Verifique os logs para erros
4. Procure por mensagens como:
   - "Ignored via ignoreCommand"
   - "No changes detected"
   - "Build skipped"

## Configuração Alternativa: Usar Root Directory

Se o problema persistir, tente configurar o **Root Directory** como `apps/web`:

### No Dashboard da Vercel:

- **Root Directory:** `apps/web`
- **Build Command:** `pnpm build` (sem filter)
- **Output Directory:** `dist`
- **Install Command:** `cd ../.. && pnpm install`

**MAS** isso requer ajustar o `vercel.json` ou removê-lo.

## Solução Recomendada: Ignored Build Step Correto

A configuração mais confiável é:

### No Dashboard da Vercel > Settings > Git > Ignored Build Step:

```bash
git diff HEAD^ HEAD --quiet apps/web/ package.json pnpm-lock.yaml turbo.json vercel.json .vercelignore
```

Isso garante que:
- ✅ Deploy só é ignorado se NENHUMA mudança relevante foi feita
- ✅ Qualquer mudança em `apps/web/` ou arquivos de configuração gera deploy
- ✅ Funciona corretamente com monorepo

## Checklist Final

- [ ] `vercel.json` está na raiz e commitado
- [ ] `turbo.json` tem `"cache": false` no build
- [ ] Campos de build no Dashboard estão vazios OU configurados corretamente
- [ ] **Ignored Build Step** está configurado corretamente
- [ ] Webhook do GitHub está ativo
- [ ] Branch principal está configurada
- [ ] Testou deploy manual (funcionou?)
- [ ] Fez push de mudanças e verificou se gerou deploy

## Comando para Testar Ignored Build Step

Teste localmente se o comando funciona:

```bash
# Deve retornar exit code 1 (fazer deploy) se houver mudanças
git diff HEAD^ HEAD --quiet apps/web/ package.json pnpm-lock.yaml turbo.json vercel.json
echo $?  # Deve ser 1 se houver mudanças, 0 se não houver
```

## Se Nada Funcionar

1. **Desconecte e reconecte o repositório** na Vercel
2. **Remova o Ignored Build Step** temporariamente
3. **Faça um commit vazio** para forçar deploy
4. **Verifique os logs** do último deploy
5. **Entre em contato com suporte da Vercel** se persistir
