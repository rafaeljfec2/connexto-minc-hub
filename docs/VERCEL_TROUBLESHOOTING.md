# Troubleshooting Deploy Vercel - Monorepo

## Problema: Deploys não são criados após o primeiro push

### Possíveis Causas

1. **Configuração incorreta do `vercel.json`**
2. **Cache do Turborepo impedindo detecção de mudanças**
3. **Configuração do projeto na Vercel Dashboard**

## Soluções

### 1. Verificar Configuração do Projeto na Vercel

No painel da Vercel, verifique:

- **Root Directory:** Deixe vazio (raiz do projeto) ou configure como `.`
- **Framework Preset:** Vite
- **Build Command:** Deve estar vazio (usa o `vercel.json`) ou `pnpm build --filter=@minc-hub/web`
- **Output Directory:** `apps/web/dist`
- **Install Command:** Deve estar vazio (usa o `vercel.json`) ou `pnpm install`

### 2. Verificar `vercel.json`

O arquivo `vercel.json` na raiz deve ter:

```json
{
  "version": 2,
  "buildCommand": "pnpm build --filter=@minc-hub/web",
  "outputDirectory": "apps/web/dist",
  "installCommand": "pnpm install",
  "framework": "vite"
}
```

### 3. Limpar Cache do Turborepo

Se o problema persistir, pode ser cache do Turborepo. Na Vercel:

1. Vá em **Settings > Build & Development Settings**
2. Adicione nas **Environment Variables**:
   - `TURBO_TOKEN` (se usar Remote Cache)
   - `TURBO_TEAM` (se usar Remote Cache)
3. Ou desabilite o cache adicionando: `TURBO_FORCE=true`

### 4. Forçar Novo Deploy

1. Na Vercel Dashboard, vá em **Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **Redeploy**
4. Ou faça um commit vazio: `git commit --allow-empty -m "Trigger deploy" && git push`

### 5. Verificar Logs de Build

1. Vá em **Deployments** na Vercel
2. Clique no deploy que falhou ou não foi criado
3. Verifique os logs de build para erros

### 6. Configuração Manual na Vercel Dashboard

Se o `vercel.json` não estiver sendo respeitado:

1. Vá em **Settings > General**
2. Em **Build & Development Settings**, configure:
   - **Root Directory:** `.` (raiz)
   - **Build Command:** `pnpm build --filter=@minc-hub/web`
   - **Output Directory:** `apps/web/dist`
   - **Install Command:** `pnpm install`
   - **Node.js Version:** 18.x ou superior

### 7. Verificar Git Hooks

Certifique-se de que os arquivos estão sendo commitados:

```bash
git status
git add .
git commit -m "Your message"
git push
```

### 8. Verificar Branch

A Vercel só faz deploy automático de:
- Branch principal (geralmente `main` ou `master`)
- Branches configuradas em **Settings > Git**

Verifique se você está fazendo push para a branch correta.

## Comandos Úteis

### Testar Build Localmente

```bash
pnpm install
pnpm build --filter=@minc-hub/web
```

### Verificar Estrutura

```bash
ls -la apps/web/dist
```

### Limpar e Rebuild

```bash
pnpm clean
pnpm build --filter=@minc-hub/web
```

## Checklist

- [ ] `vercel.json` está na raiz do projeto
- [ ] Comandos no `vercel.json` estão corretos
- [ ] `package.json` na raiz tem o script `build`
- [ ] `apps/web/package.json` tem o script `build`
- [ ] Projeto está conectado ao repositório Git correto
- [ ] Branch principal está configurada na Vercel
- [ ] Variáveis de ambiente estão configuradas
- [ ] Node.js version está configurada (18+)
- [ ] PNPM está sendo usado (detectado automaticamente)
- [ ] **Ignored Build Step** está configurado corretamente (ou removido)
- [ ] Webhook do GitHub está funcionando

## Configuração Manual no Dashboard da Vercel

Se os deploys automáticos não funcionarem, configure manualmente:

### Settings > Git

1. Verifique se o repositório está conectado
2. Verifique se a branch principal está correta (geralmente `main` ou `master`)
3. Clique em **"Disconnect"** e reconecte se necessário

### Settings > Build & Development Settings

**IMPORTANTE:** Deixe estes campos **VAZIOS** para usar o `vercel.json`:

- **Root Directory:** (vazio)
- **Build Command:** (vazio - usa do vercel.json)
- **Output Directory:** (vazio - usa do vercel.json)
- **Install Command:** (vazio - usa do vercel.json)
- **Development Command:** (vazio)

**OU configure manualmente:**

- **Root Directory:** `.`
- **Build Command:** `pnpm build --filter=@minc-hub/web`
- **Output Directory:** `apps/web/dist`
- **Install Command:** `pnpm install --frozen-lockfile`

### Settings > Git > Ignored Build Step

**IMPORTANTE:** Este campo deve estar **VAZIO** ou configurado como:

```bash
git diff HEAD^ HEAD --quiet apps/web/ package.json pnpm-lock.yaml turbo.json vercel.json
```

Isso garante que o deploy só seja ignorado se NENHUMA mudança relevante foi feita.

### Verificar Webhooks

1. Vá em **Settings > Git**
2. Verifique se há webhooks configurados
3. Se não houver, a Vercel deve criar automaticamente ao conectar o repositório
4. No GitHub, vá em **Settings > Webhooks** do repositório
5. Verifique se há um webhook da Vercel ativo

## Forçar Deploy Manual

Se nada funcionar, force um deploy:

1. Na Vercel Dashboard, vá em **Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **Redeploy**
4. Ou use a CLI: `vercel --prod`
