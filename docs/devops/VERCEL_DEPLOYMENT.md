# Vercel Deployment Guide

> **Last Updated**: 2026-01-10  
> **Status**: Active

## Overview

Guia completo para deploy do MINC Teams na plataforma Vercel, incluindo configuração, troubleshooting e boas práticas.

## Table of Contents

- [Configuração Inicial](#configuração-inicial)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Build Settings](#build-settings)
- [Ignored Build Step](#ignored-build-step)
- [Troubleshooting](#troubleshooting)

---

## Configuração Inicial

### 1. Conectar Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Conecte seu repositório GitHub
4. Selecione o repositório `connexto-minc-hub`

### 2. Framework Preset

- **Framework**: Vite
- **Root Directory**: `apps/web`
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`

---

## Variáveis de Ambiente

Configure as seguintes variáveis no painel da Vercel:

### Production

```bash
VITE_API_URL=https://api.minc-teams.com
VITE_MOCK_MODE=false
```

### Preview/Development

```bash
VITE_API_URL=https://api-dev.minc-teams.com
VITE_MOCK_MODE=false
```

---

## Build Settings

### Framework Settings

```json
{
  "framework": "vite",
  "buildCommand": "cd ../.. && pnpm build --filter @minc-hub/web",
  "outputDirectory": "apps/web/dist",
  "installCommand": "pnpm install",
  "devCommand": "pnpm dev"
}
```

### Root Directory

- **Root Directory**: `./` (monorepo root)
- Não usar `apps/web` como root

---

## Ignored Build Step

Para evitar builds desnecessários em mudanças que não afetam o web app:

### Script Recomendado

```bash
#!/bin/bash

# Verifica se houve mudanças em apps/web ou packages/shared
if git diff HEAD^ HEAD --quiet apps/web packages/shared; then
  echo "🛑 No changes in web app or shared packages"
  exit 0
else
  echo "✅ Changes detected, proceeding with build"
  exit 1
fi
```

### Configuração no Vercel

1. Acesse Project Settings → Git
2. Em "Ignored Build Step", adicione:
   ```bash
   git diff HEAD^ HEAD --quiet apps/web packages/shared
   ```

---

## Troubleshooting

### Build Falha

**Problema**: Build falha com erro de módulo não encontrado

**Solução**:

1. Verificar se `pnpm-workspace.yaml` está correto
2. Garantir que `turbo.json` está configurado
3. Limpar cache: Settings → General → Clear Build Cache

### Variáveis de Ambiente Não Carregam

**Problema**: Variáveis `VITE_*` não estão disponíveis

**Solução**:

1. Verificar que variáveis começam com `VITE_`
2. Redeployar após adicionar variáveis
3. Verificar em qual ambiente (Production/Preview) estão configuradas

### Deploy Demora Muito

**Problema**: Deploy leva mais de 5 minutos

**Solução**:

1. Implementar Ignored Build Step
2. Usar cache de dependências
3. Otimizar `turbo.json` para cache

### Erro 404 em Rotas

**Problema**: Rotas do React Router retornam 404

**Solução**:
Adicionar `vercel.json` na raiz do projeto:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Boas Práticas

### 1. Preview Deployments

- Cada PR gera um preview deployment automático
- Testar em preview antes de merge
- Compartilhar URL de preview para revisão

### 2. Production Deployments

- Apenas branch `main` faz deploy para production
- Usar tags para releases importantes
- Monitorar logs após deploy

### 3. Monitoramento

- Configurar alertas de erro
- Monitorar métricas de performance
- Revisar logs regularmente

### 4. Rollback

Se necessário fazer rollback:

1. Acesse Deployments
2. Encontre deployment anterior estável
3. Clique em "Promote to Production"

---

## Related Documentation

- [ENV_VARIABLES](./ENV_VARIABLES.md)
- [Frontend Patterns](../frontend/WEB_PATTERNS.md)

## Changelog

- 2026-01-10: Consolidação de todos os documentos Vercel
