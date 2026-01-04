# Corrigir Ignored Build Step no Dashboard da Vercel

## ⚠️ Erro Atual

O erro mostra que o comando antigo ainda está configurado no Dashboard:
```
git diff HEAD^ HEAD --quiet apps/web/ ../package.json ../pnpm-lock.yaml ../turbo.json
```

## ✅ Solução: Atualizar no Dashboard

### Passo 1: Acessar Configurações

1. Vá para o **Dashboard da Vercel**
2. Selecione seu projeto
3. Vá em **Settings > Git**
4. Encontre a seção **"Ignored Build Step"**

### Passo 2: Atualizar o Comando

**Opção A: Comando Simplificado (Recomendado)**

Na seção **"Project Settings"**, configure:

**Behavior:** "Only build if there are changes in a folder"

**Folder:** `apps/web`

**OU configure manualmente:**

**Command:**
```bash
git diff HEAD^ HEAD --quiet -- apps/web/
```

**Opção B: Remover Completamente (Sempre Fazer Deploy)**

Se você quiser que **sempre** faça deploy (ignorando o Ignored Build Step):

1. Na seção **"Project Settings"**
2. Selecione **"Automatic"** no dropdown
3. Clique em **"Save"**

### Passo 3: Sincronizar Production Overrides

1. Expanda **"Production Overrides"**
2. Se houver um comando lá, ele será atualizado automaticamente após o próximo deploy
3. Ou faça um **Redeploy** do último deployment de produção

### Passo 4: Salvar e Testar

1. Clique em **"Save"**
2. Faça um commit vazio para testar:
   ```bash
   git commit --allow-empty -m "test: verificar deploy após corrigir ignoreCommand"
   git push
   ```

## 🔍 Verificar se Funcionou

1. Vá em **Deployments** na Vercel
2. Verifique se um novo deploy foi criado
3. Se não aparecer erro de `exit code 129`, está funcionando! ✅

## ⚠️ Importante

- O `vercel.json` **não tem mais** o `ignoreCommand` (removido para evitar conflitos)
- A configuração do **Dashboard tem prioridade**
- Certifique-se de que o comando no Dashboard está correto

## Comando Correto para Dashboard

Se você escolher configurar manualmente, use:

```bash
git diff HEAD^ HEAD --quiet -- apps/web/
```

**Nota:** O `--` separa os argumentos do git e os caminhos, evitando problemas com caminhos que começam com `-`.
