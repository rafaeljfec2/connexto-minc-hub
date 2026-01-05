# MINC Teams Mobile

Aplicativo mobile para o sistema de gestão de times da MINC (Minha Igreja na Cidade).

## Tecnologias

- React Native
- Expo
- TypeScript
- React Navigation
- Expo Camera (QR Code)

## Desenvolvimento

```bash
# Instalar dependências (do root do monorepo)
pnpm install

# Iniciar servidor de desenvolvimento
pnpm --filter mobile start

# Iniciar no Android
pnpm --filter mobile android

# Iniciar no iOS
pnpm --filter mobile ios
```

## Build

### Desenvolvimento (EAS Build)

```bash
# Build Android APK (desenvolvimento)
pnpm --filter mobile build:android -- --profile development

# Build iOS (desenvolvimento)
pnpm --filter mobile build:ios -- --profile development
```

### Produção

```bash
# Build Android
pnpm --filter mobile build:android -- --profile production

# Build iOS
pnpm --filter mobile build:ios -- --profile production

# Build ambas plataformas
pnpm --filter mobile build:all -- --profile production
```

## Submissão

```bash
# Submeter Android para Google Play
pnpm --filter mobile submit:android

# Submeter iOS para App Store
pnpm --filter mobile submit:ios
```

## Estrutura

```
apps/mobile/
├── src/
│   ├── App.tsx              # Entry point
│   ├── components/          # Componentes reutilizáveis
│   ├── contexts/            # Contextos (Auth, Theme)
│   ├── navigator/           # Configuração de navegação
│   ├── screens/             # Telas da aplicação
│   ├── theme/               # Design tokens
│   └── lib/                 # Utilitários e API client
├── app.json                 # Configuração Expo
├── eas.json                 # Configuração EAS Build
└── package.json
```

## Variáveis de Ambiente

Criar arquivo `.env`:

```
EXPO_PUBLIC_API_URL=https://api.minc-teams.com
EXPO_PUBLIC_MOCK_MODE=false
```

## Permissões

O app requer as seguintes permissões:

- **Câmera**: Para escanear QR codes (funcionalidade crítica)

Configuradas automaticamente via `app.json`.

## Notas

- O app usa `@minc-teams/shared` para compartilhar types, services e utils com o web
- Navegação híbrida: Stack Navigator + Tab Navigator
- Design system baseado em tokens compartilhados
