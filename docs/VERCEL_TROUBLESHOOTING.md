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
