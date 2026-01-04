# Deploy na Vercel - MINC Teams

Este documento contém instruções completas para fazer deploy do projeto na Vercel.

## Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Projeto conectado ao repositório

## Configuração Inicial

### 1. Conectar o Projeto

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em "Add New Project"
3. Importe o repositório do GitHub/GitLab/Bitbucket
4. Configure o projeto:

### 2. Configurações do Projeto na Vercel

**Framework Preset:** Vite

**Root Directory:** Deixe vazio (raiz do projeto)

**Build Command:** 
```bash
cd apps/web && pnpm build
```

**Output Directory:** 
```
apps/web/dist
```

**Install Command:**
```bash
pnpm install
```

### 3. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no painel da Vercel:

#### Produção
```
VITE_API_URL=https://api.minc-teams.com
VITE_MOCK_MODE=false
```

#### Preview/Staging
```
VITE_API_URL=https://api-staging.minc-teams.com
VITE_MOCK_MODE=false
```

#### Desenvolvimento (Branch)
```
VITE_API_URL=http://localhost:3001
VITE_MOCK_MODE=true
```

### 4. Configurações Adicionais

**Node.js Version:** 18.x ou superior

**PNPM Version:** 8.x ou superior (a Vercel detecta automaticamente)

## Otimizações Implementadas

### Build
- ✅ Minificação com esbuild
- ✅ Code splitting automático
- ✅ Chunks separados para React e UI vendors
- ✅ CSS minificado
- ✅ Source maps desabilitados em produção

### Cache
- ✅ Assets estáticos com cache de 1 ano
- ✅ Cache imutável para arquivos versionados

### Routing
- ✅ SPA routing configurado (todas as rotas redirecionam para index.html)

## Estrutura do Projeto

O projeto é um monorepo com Turborepo:
- **Raiz:** Configurações do monorepo
- **apps/web:** Aplicação frontend React + Vite

## Comandos de Build

O arquivo `vercel.json` já está configurado com os comandos corretos:
- Build: `cd apps/web && pnpm build`
- Output: `apps/web/dist`

## Verificação Pós-Deploy

Após o deploy, verifique:

1. ✅ A aplicação carrega corretamente
2. ✅ As rotas funcionam (teste navegação)
3. ✅ As variáveis de ambiente estão configuradas
4. ✅ O modo mock está desabilitado em produção
5. ✅ A API está acessível

## Troubleshooting

### Erro: "Build failed"
- Verifique se todas as dependências estão no `package.json`
- Confirme que o Node.js version está correto (18+)
- Verifique os logs de build na Vercel

### Erro: "404 em rotas"
- Verifique se o `vercel.json` tem a configuração de `rewrites`
- Confirme que o `outputDirectory` está correto

### Erro: "Variáveis de ambiente não encontradas"
- Verifique se as variáveis começam com `VITE_`
- Confirme que foram configuradas no painel da Vercel
- Faça um novo deploy após adicionar variáveis

## Domínio Customizado

Para configurar um domínio customizado:

1. Vá em Settings > Domains
2. Adicione seu domínio
3. Configure os registros DNS conforme instruções da Vercel

## CI/CD

A Vercel faz deploy automaticamente quando você:
- Faz push para a branch principal (produção)
- Cria um Pull Request (preview)
- Faz push para outras branches (preview)

## Monitoramento

A Vercel fornece:
- Analytics de performance
- Logs de erro
- Métricas de build
- Analytics de visitantes (opcional)

## Suporte

Para mais informações, consulte:
- [Documentação Vercel](https://vercel.com/docs)
- [Vite + Vercel](https://vercel.com/docs/frameworks/vite)
