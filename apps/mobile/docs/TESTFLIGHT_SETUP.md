# Configuração EAS Build para TestFlight (iOS)

Este guia explica como configurar e fazer build do app iOS para TestFlight.

## Pré-requisitos

1. **Conta Apple Developer**

   - Acesse: https://developer.apple.com
   - É necessário ser membro do Apple Developer Program ($99/ano)

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

## Passo 2: Configurar Credenciais

### Opção A: Deixar o EAS gerenciar automaticamente (recomendado)

O EAS pode gerar e gerenciar automaticamente os certificados e perfis de provisionamento:

```bash
eas credentials
```

Selecione:

- Platform: `ios`
- Para TestFlight, use o perfil `production`

O EAS irá:

- Criar App ID na Apple Developer
- Gerar certificados de distribuição
- Criar perfis de provisionamento

### Opção B: Usar credenciais existentes

Se você já tem certificados e perfis de provisionamento:

```bash
eas credentials
```

E selecione "Use existing" para cada tipo de credencial.

## Passo 3: Configurar app.json

Verifique se o `app.json` tem as configurações corretas:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.minc.hub",
      "buildNumber": "1"
    }
  }
}
```

⚠️ **Importante**: O `bundleIdentifier` deve ser único e corresponder ao App ID na Apple Developer.

## Passo 4: Build para TestFlight

Para TestFlight, use o perfil `production`:

```bash
# Build iOS para produção (TestFlight)
pnpm build:ios -- --profile production

# Ou usando EAS diretamente
eas build --platform ios --profile production
```

O build vai:

1. Compilar o app
2. Assinar com o certificado de distribuição
3. Gerar um `.ipa` pronto para TestFlight

## Passo 5: Submeter para TestFlight

### Via EAS Submit (recomendado)

```bash
# Submeter o último build para TestFlight
eas submit --platform ios --profile production

# Ou submeter um build específico
eas submit --platform ios --latest
```

### Via App Store Connect (manual)

1. Acesse: https://appstoreconnect.apple.com
2. Vá em "Meus Apps" > Seu App > "TestFlight"
3. Faça upload do arquivo `.ipa` gerado pelo EAS
4. Após processamento, adicione testadores

## Passo 6: Configurar TestFlight

1. **Adicionar Informações de Teste**

   - Em App Store Connect > TestFlight
   - Adicione "O que testar" e notas de versão

2. **Adicionar Testadores**

   - **Testadores Internos**: Até 100 pessoas (membros da equipe)
   - **Testadores Externos**: Até 10.000 pessoas (requer revisão da Apple)

3. **Distribuir Build**
   - Selecione o build processado
   - Adicione aos grupos de testadores
   - Testadores receberão email com convite

## Configuração do eas.json

O arquivo `eas.json` já está configurado com o perfil `production` para iOS:

```json
{
  "build": {
    "production": {
      "distribution": "store",
      "ios": {
        "resourceClass": "m-medium",
        "buildConfiguration": "Release"
      }
    }
  }
}
```

### Configurações importantes:

- **distribution: "store"** - Build para App Store/TestFlight
- **buildConfiguration: "Release"** - Build otimizado para produção
- **resourceClass: "m-medium"** - Recursos de build (pode ajustar conforme necessidade)

## Verificar Status do Build

```bash
# Listar builds
eas build:list --platform ios

# Ver detalhes de um build específico
eas build:view [BUILD_ID]
```

## Troubleshooting

### Erro: "No Apple Team ID found"

- Configure o Team ID: `eas credentials`
- Ou defina no `eas.json`: `"appleTeamId": "YOUR_TEAM_ID"`

### Erro: "Bundle identifier already exists"

- O bundle identifier já está em uso
- Altere o `bundleIdentifier` no `app.json` para algo único

### Build falha na assinatura

- Verifique as credenciais: `eas credentials`
- Regenere os certificados se necessário

### App não aparece no TestFlight

- Verifique se o build foi processado (pode levar 10-30 minutos)
- Verifique se foi submetido corretamente: `eas submit:list`

## Comandos Úteis

```bash
# Login no Expo
eas login

# Ver informações da conta
eas whoami

# Inicializar projeto EAS
eas init

# Configurar credenciais iOS
eas credentials --platform ios

# Build iOS para produção
eas build --platform ios --profile production

# Submeter para TestFlight
eas submit --platform ios --latest

# Ver builds
eas build:list --platform ios

# Ver submissões
eas submit:list --platform ios
```

## Notas Importantes

1. **Primeiro Build**: Pode demorar mais (15-30 minutos) devido à configuração inicial
2. **TestFlight Review**: Primeira submissão para testadores externos requer revisão da Apple (1-2 dias)
3. **Build Number**: Incremente o `buildNumber` no `app.json` para cada novo build
4. **Version**: Incremente o `version` no `app.json` quando publicar nova versão

## Próximos Passos

Após testar no TestFlight:

1. Corrigir bugs encontrados
2. Incrementar `buildNumber` no `app.json`
3. Fazer novo build: `eas build --platform ios --profile production`
4. Submeter novamente: `eas submit --platform ios --latest`
