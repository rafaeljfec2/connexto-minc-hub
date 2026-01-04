# Configuração Correta do Ignored Build Step

## ✅ Configuração Atual no Dashboard

Você tem configurado:
- **Behavior:** "Only build if there are changes in a folder"
- **Command:** `git diff HEAD^ HEAD --quiet -- ./apps/web`

## 🔧 Correção Necessária

O comando está **quase correto**, mas precisa de um pequeno ajuste:

### Opção 1: Comando Simplificado (Recomendado)

**Command:**
```bash
git diff HEAD^ HEAD --quiet apps/web/
```

**Por quê?**
- Remove o `--` que não é necessário
- Adiciona `/` no final para garantir que detecta mudanças na pasta
- Mais simples e direto

### Opção 2: Comando Mais Específico

Se quiser detectar mudanças em arquivos de configuração também:

**Command:**
```bash
git diff HEAD^ HEAD --quiet apps/web/ package.json pnpm-lock.yaml turbo.json
```

**Nota:** Se o Root Directory for `apps/web`, os caminhos `package.json`, etc. precisam ser relativos à raiz do repositório, então use `../package.json`.

## 📝 Passos para Corrigir

1. **No Dashboard da Vercel:**
   - Vá em **Settings > Git > Ignored Build Step**
   - Na seção **"Project Settings"**
   - Altere o **Command** para:
     ```bash
     git diff HEAD^ HEAD --quiet apps/web/
     ```
   - Clique em **"Save"**

2. **Sincronizar Production Overrides:**
   - Expanda **"Production Overrides"**
   - Se o campo Command estiver vazio, copie o mesmo comando
   - Isso vai remover o aviso amarelo

## 🧪 Testar

Após salvar, faça um commit vazio:

```bash
git commit --allow-empty -m "test: verificar deploy automático"
git push
```

Se um novo deploy for criado, está funcionando! 🎉

## ⚠️ Importante

- **Exit code 0** = Não há mudanças = **NÃO faz deploy**
- **Exit code 1** = Há mudanças = **FAZ deploy**

O comando `git diff HEAD^ HEAD --quiet` retorna:
- `0` se não houver diferenças (quiet mode)
- `1` se houver diferenças

Por isso funciona perfeitamente para o Ignored Build Step!
