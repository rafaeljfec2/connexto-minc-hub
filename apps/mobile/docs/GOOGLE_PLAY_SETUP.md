# Configuração EAS Build para Google Play (Android)

Este guia explica como configurar e fazer build do app Android para Google Play.

## Pré-requisitos

1. **Conta Google Play Developer**
   - Acesse: https://play.google.com/console
   - Taxa única: $25 (paga uma vez)

2. **EAS CLI instalado**
   ```bash
   npm install -g eas-cli
   ```

3. **Login no Expo**
   ```bash
   eas login
   ```

## Passo 1: Configurar o Projeto EAS

```bash
cd apps/mobile
eas init
```

Isso criará o projeto na sua conta Expo (se ainda não existir).

## Passo 2: Configurar Credenciais Android

### Opção A: Deixar o EAS gerenciar automaticamente (recomendado)

O EAS pode gerar e gerenciar automaticamente a keystore:

```bash
eas credentials
```

Selecione:
- Platform: `android`
- Para Google Play, use o perfil `production`

O EAS irá:
- Gerar uma keystore automaticamente
- Gerenciar a assinatura do app
- Armazenar as credenciais de forma segura

⚠️ **Importante**: Salve a senha da keystore em local seguro. Se perder, não poderá atualizar o app.

### Opção B: Usar keystore existente

Se você já tem uma keystore:

```bash
eas credentials
```

E selecione "Use existing" e forneça:
- Caminho para o arquivo `.jks` ou `.keystore`
- Alias da keystore
- Senhas (keystore e key)

## Passo 3: Configurar app.json

Verifique se o `app.json` tem as configurações corretas:

```json
{
  "expo": {
    "android": {
      "package": "com.minc.hub",
      "versionCode": 1
    }
  }
}
```

⚠️ **Importante**: 
- O `package` deve ser único e corresponder ao Package Name no Google Play Console
- O `versionCode` deve incrementar a cada build (inteiro sequencial)

## Passo 4: Criar App no Google Play Console

1. Acesse: https://play.google.com/console
2. Clique em "Criar app"
3. Preencha:
   - Nome do app: "MINC Hub"
   - Idioma padrão: Português (Brasil)
   - Tipo de app: App
   - Gratuito ou pago: Gratuito
4. Aceite os termos e crie

## Passo 5: Configurar Service Account (para submissão automática)

### Criar Service Account

1. No Google Play Console, vá em:
   - **Configurações** > **Acesso à API**
2. Link sua conta do Google Cloud Platform
3. Crie um projeto (ou selecione existente)
4. Crie um Service Account:
   - Vá para: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Clique em "Criar conta de serviço"
   - Nome: "EAS Submit" (ou qualquer nome)
   - Clique em "Criar e continuar"
   - Role: Deixe vazio (será configurado depois)
   - Clique em "Concluído"

### Conceder Permissões

1. Volte ao Google Play Console:
   - **Configurações** > **Acesso à API**
2. Na seção "Contas de serviço", encontre a conta criada
3. Clique em "Conceder acesso"
4. Role: Selecione **Administrador**
5. Salve

### Baixar Chave JSON

1. No Google Cloud Console:
   - Vá para a conta de serviço criada
   - Aba "Chaves"
   - Clique em "Adicionar chave" > "Criar nova chave"
   - Tipo: JSON
   - Criar
   - O arquivo JSON será baixado

2. Salve o arquivo JSON em local seguro (ex: `apps/mobile/google-play-key.json`)

3. ⚠️ **IMPORTANTE**: Adicione ao `.gitignore`:
   ```
   *.json
   google-play-key.json
   ```

### Atualizar eas.json

Atualize o caminho no `eas.json`:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json",
        "track": "internal"
      }
    }
  }
}
```

**Tracks disponíveis:**
- `internal` - Teste interno (até 100 testadores)
- `alpha` - Teste fechado Alpha
- `beta` - Teste fechado Beta
- `production` - Produção

## Passo 6: Build para Google Play

Para Google Play, use o perfil `production`:

```bash
# Build Android para produção (Google Play)
pnpm build:android -- --profile production

# Ou usando EAS diretamente
eas build --platform android --profile production
```

O build vai:
1. Compilar o app
2. Assinar com a keystore
3. Gerar um `.aab` (Android App Bundle) pronto para Google Play

## Passo 7: Submeter para Google Play

### Via EAS Submit (recomendado)

```bash
# Submeter o último build para Google Play
eas submit --platform android --profile production

# Ou submeter um build específico
eas submit --platform android --latest
```

### Via Google Play Console (manual)

1. Acesse: https://play.google.com/console
2. Vá em seu app > **Produção** (ou **Teste interno**)
3. Clique em **Criar nova versão**
4. Faça upload do arquivo `.aab` gerado pelo EAS
5. Preencha as informações da versão
6. Revise e publique

## Passo 8: Configurar Testes

### Teste Interno

1. No Google Play Console, vá em **Teste interno**
2. Adicione testadores (até 100 emails)
3. Publique o build
4. Testadores receberão link para testar

### Teste Fechado (Alpha/Beta)

1. Vá em **Teste** > **Criar lista de testes**
2. Nome: "Alpha Test" ou "Beta Test"
3. Adicione testadores ou crie link público
4. Publique o build na track desejada

## Configuração do eas.json

O arquivo `eas.json` já está configurado com o perfil `production` para Android:

```json
{
  "build": {
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      }
    }
  }
}
```

### Configurações importantes:

- **distribution: "store"** - Build para Google Play
- **buildType: "app-bundle"** - Formato obrigatório para Google Play
- **gradleCommand: ":app:bundleRelease"** - Comando para gerar AAB

## Verificar Status do Build

```bash
# Listar builds
eas build:list --platform android

# Ver detalhes de um build específico
eas build:view [BUILD_ID]
```

## Troubleshooting

### Erro: "No keystore found"
- Configure a keystore: `eas credentials --platform android`
- Escolha "Set up new keystore" para criar uma nova

### Erro: "Package name already exists"
- O package name já está em uso
- Altere o `package` no `app.json` para algo único

### Erro: "Service account key not found"
- Verifique o caminho no `eas.json`
- Certifique-se de que o arquivo JSON existe
- Verifique as permissões do arquivo

### Erro: "Upload failed"
- Verifique se o Service Account tem permissões corretas
- Certifique-se de que o arquivo JSON está válido
- Verifique se o app existe no Google Play Console

### Build falha na assinatura
- Verifique as credenciais: `eas credentials`
- Regenere a keystore se necessário (⚠️ apenas se for novo app)

### Version code já usado
- Incremente o `versionCode` no `app.json`
- Cada build deve ter um `versionCode` único e maior que o anterior

## Comandos Úteis

```bash
# Login no Expo
eas login

# Ver informações da conta
eas whoami

# Inicializar projeto EAS
eas init

# Configurar credenciais Android
eas credentials --platform android

# Build Android para produção
eas build --platform android --profile production

# Submeter para Google Play
eas submit --platform android --latest

# Ver builds
eas build:list --platform android

# Ver submissões
eas submit:list --platform android
```

## Versionamento

### Version Code vs Version Name

- **versionCode** (app.json): Número inteiro sequencial (1, 2, 3...)
  - Deve incrementar a cada build
  - Usado pelo Google Play para identificar versões
  - Não visível para usuários

- **version** (app.json): String de versão (1.0.0, 1.0.1, 1.1.0...)
  - Visível para usuários
  - Formato: MAJOR.MINOR.PATCH

### Exemplo de versionamento:

```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    }
  }
}
```

Para próxima versão:
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

## Checklist de Lançamento

- [ ] EAS CLI instalado
- [ ] Login no Expo (`eas login`)
- [ ] Projeto inicializado (`eas init`)
- [ ] Credenciais configuradas (`eas credentials`)
- [ ] App criado no Google Play Console
- [ ] Service Account criado e configurado
- [ ] Chave JSON baixada e salva
- [ ] `eas.json` atualizado com caminho da chave
- [ ] `app.json` com package name único
- [ ] `versionCode` configurado e incrementado
- [ ] Build realizado (`eas build --platform android --profile production`)
- [ ] Build submetido (`eas submit --platform android --latest`)
- [ ] Testadores adicionados (Teste Interno)
- [ ] App testado antes de publicar

## Notas Importantes

1. **Primeiro Build**: Pode demorar mais (15-30 minutos) devido à configuração inicial
2. **Keystore**: Se perder a keystore, não poderá atualizar o app existente (será necessário criar novo app)
3. **AAB vs APK**: Google Play exige AAB (Android App Bundle) para novas submissões
4. **Version Code**: Sempre incremente para cada novo build
5. **Review Time**: Primeira publicação pode levar algumas horas para revisão do Google

## Próximos Passos

Após testar no Teste Interno:
1. Corrigir bugs encontrados
2. Incrementar `versionCode` no `app.json`
3. Fazer novo build: `eas build --platform android --profile production`
4. Submeter para track desejada: `eas submit --platform android --latest`
5. Quando estiver pronto, promover para Produção
