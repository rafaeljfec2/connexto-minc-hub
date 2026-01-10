# Como Sincronizar Configurações da Vercel

## ⚠️ Entendendo o Problema

O campo **"Production Overrides"** é **somente leitura** - ele apenas mostra as configurações que foram usadas no último deploy de produção. Você **não pode editar** esse campo diretamente.

## ✅ Solução: Configurar "Project Settings" e Fazer Novo Deploy

### Passo 1: Configurar "Project Settings"

1. Na seção **"Project Settings"**, configure:

   **Behavior:** "Only build if there are changes in a folder"
   
   **Command:**
   ```bash
   git diff HEAD^ HEAD --quiet apps/web/
   ```

2. Clique em **"Save"**

### Passo 2: Fazer um Novo Deploy

Você tem duas opções:

#### Opção A: Redeploy do Último Deployment (Rápido)

1. Vá em **Deployments** na Vercel
2. Encontre o último deployment de produção
3. Clique nos **três pontos** (⋯) ao lado do deployment
4. Selecione **"Redeploy"**
5. Isso vai usar as novas configurações de "Project Settings"

#### Opção B: Fazer um Novo Push (Recomendado)

1. Faça um commit vazio:
   ```bash
   git commit --allow-empty -m "chore: sincronizar configurações Vercel"
   git push
   ```
2. Isso vai criar um novo deploy com as configurações atualizadas

### Passo 3: Verificar

Após o deploy:
1. O aviso amarelo deve desaparecer
2. As configurações de "Production Overrides" vão ser atualizadas automaticamente
3. Os próximos deploys automáticos vão funcionar corretamente

## 🎯 Resumo

- ✅ **"Project Settings"** = Configurações editáveis (o que você quer)
- 📖 **"Production Overrides"** = Configurações do último deploy (somente leitura)
- 🔄 **Solução** = Configurar "Project Settings" + Fazer novo deploy

## ⚠️ Importante

O aviso amarelo vai desaparecer automaticamente após você:
1. Salvar as configurações em "Project Settings"
2. Fazer um novo deploy (redeploy ou novo push)

Não precisa editar "Production Overrides" - ele é atualizado automaticamente!
