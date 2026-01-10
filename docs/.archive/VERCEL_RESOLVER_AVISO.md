# Resolver Aviso: "Configuration Settings differ from Project Settings"

## ⚠️ Problema Identificado

Você está vendo o aviso:
> "Configuration Settings in the current Production deployment differ from your current Project Settings."

Isso significa que há **configurações diferentes** entre:
- **Production Overrides** (configurações do último deploy de produção)
- **Project Settings** (configurações atuais do projeto)

## 🔧 Solução Passo a Passo

### 1. Expandir "Production Overrides"

1. Clique na seta ao lado de **"Production Overrides"**
2. Anote todas as configurações mostradas:
   - Build Command
   - Output Directory
   - Install Command
   - Ignored Build Step
   - Root Directory

### 2. Expandir "Project Settings"

1. Clique na seta ao lado de **"Project Settings"**
2. Compare com as configurações de "Production Overrides"

### 3. Sincronizar Configurações

**Opção A: Usar as configurações do Projeto (Recomendado)**

1. Em **"Project Settings"**, configure:

   **Ignored Build Step:**
   ```bash
   git diff HEAD^ HEAD --quiet apps/web/ package.json pnpm-lock.yaml turbo.json vercel.json
   ```
   
   **OU selecione:** "Only build if there are changes in a folder"
   - **Folder:** `apps/web`

2. Clique em **"Save"**

3. Isso vai sincronizar as configurações do projeto com os próximos deploys

**Opção B: Usar as configurações de Produção**

1. Copie as configurações de **"Production Overrides"**
2. Cole em **"Project Settings"**
3. Clique em **"Save"**

## ✅ Configuração Recomendada para Ignored Build Step

### Se Root Directory = `apps/web`:

**Configure como:**
```bash
git diff HEAD^ HEAD --quiet apps/web/
```

**OU use a opção visual:**
- Selecione: **"Only build if there are changes in a folder"**
- **Folder:** `apps/web`

### Se Root Directory = vazio (raiz):

**Configure como:**
```bash
git diff HEAD^ HEAD --quiet apps/web/ package.json pnpm-lock.yaml turbo.json vercel.json
```

## 🎯 Passos Imediatos

1. ✅ Expanda **"Production Overrides"** e anote as configurações
2. ✅ Expanda **"Project Settings"** e compare
3. ✅ Configure o **"Ignored Build Step"** conforme acima
4. ✅ Clique em **"Save"**
5. ✅ Faça um novo push para testar:
   ```bash
   git commit --allow-empty -m "test: verificar deploy automático"
   git push
   ```

## 🔍 Verificar se Funcionou

1. Vá em **Deployments** na Vercel
2. Verifique se um novo deploy foi criado após o push
3. Se não aparecer, verifique os logs em **Settings > Git > Webhooks**

## ⚠️ Importante

Após salvar as configurações, o aviso amarelo deve desaparecer. Se persistir:

1. Faça um **redeploy manual** do último deployment de produção
2. Isso vai sincronizar as configurações
3. Ou aguarde o próximo deploy automático
