# Desabilitar Ignored Build Step no Dashboard da Vercel

## ⚠️ Problema

O comando `git diff` não funciona no ambiente de build da Vercel, causando erro `exit code 129`.

## ✅ Solução: Desabilitar ou Usar "Automatic"

### Opção 1: Desabilitar Ignored Build Step (Recomendado)

1. Vá para o **Dashboard da Vercel**
2. Selecione seu projeto
3. Vá em **Settings > Git**
4. Encontre a seção **"Ignored Build Step"**
5. Na seção **"Project Settings"**, selecione:
   - **"Automatic"** no dropdown
   - OU **"Don't build anything"** e depois mude para **"Automatic"**
6. Clique em **"Save"**

Isso fará com que a Vercel use sua própria lógica para determinar quando fazer deploy, sem executar comandos git customizados.

### Opção 2: Remover Completamente

Se a opção "Automatic" não estiver disponível:

1. Na seção **"Project Settings"**
2. Deixe o campo **Command** completamente **VAZIO**
3. Clique em **"Save"**

### Opção 3: Usar "Only build if there are changes in a folder" (Sem Comando)

1. Selecione: **"Only build if there are changes in a folder"**
2. Configure o **Folder** como: `apps/web`
3. **NÃO configure** um comando customizado
4. Clique em **"Save"**

## 🧪 Testar

Após configurar:

```bash
git commit --allow-empty -m "test: verificar deploy após desabilitar ignoreCommand"
git push
```

## 📝 Nota

- O `vercel.json` **não tem** `ignoreCommand` (já removido)
- A Vercel tem sua própria lógica para detectar mudanças
- O Ignored Build Step customizado está causando problemas no ambiente de build
- É melhor deixar a Vercel gerenciar isso automaticamente

## ✅ Resultado Esperado

Após desabilitar, os deploys devem funcionar normalmente:
- ✅ Deploys automáticos quando houver mudanças
- ✅ Sem erros de `exit code 129`
- ✅ Build funcionando corretamente
