# MINC Teams WebView App

Aplicativo React Native Expo que exibe o site MINC Teams em um WebView.

## Estrutura

```
apps/mobile-webview/
├── src/
│   └── App.tsx          # Componente principal com WebView
├── assets/              # Ícones e splash screen
├── index.ts             # Entry point
├── app.json             # Configuração Expo
├── package.json         # Dependências
├── tsconfig.json        # TypeScript config
└── babel.config.js      # Babel config
```

## Funcionalidades

- ✅ WebView apontando para https://mincteams.com.br
- ✅ Splash screen
- ✅ Loading indicator
- ✅ Bloqueio de domínios externos
- ✅ Suporte ao botão voltar do Android
- ✅ Tratamento de erros de conexão
- ✅ Fallback offline com retry
- ✅ TypeScript
- ✅ Configuração para EAS Build

## Como Usar

### Desenvolvimento

```bash
cd apps/mobile-webview
pnpm start
```

Escaneie o QR code com o app Expo Go (Android/iOS).

### Build para Produção

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## Configuração

- **URL do site**: Edite `WEBSITE_URL` em `src/App.tsx`
- **Domínios permitidos**: Edite `ALLOWED_DOMAINS` em `src/App.tsx`
- **Bundle IDs**: Edite `app.json` para alterar identificadores

## Notas

- Baseado na configuração do `apps/mobile`
- Usa Expo SDK 54 com React 19 e React Native 0.81
- Para desenvolvimento com Expo Go, pode ser necessário fazer build standalone
