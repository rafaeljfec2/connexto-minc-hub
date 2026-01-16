# Estrutura do Mobile WebView App

Aplicativo React Native Expo refatorado seguindo as melhores práticas de engenharia de software.

## 📁 Estrutura de Diretórios

```
src/
├── components/          # Componentes reutilizáveis de UI
│   ├── LoadingScreen.tsx
│   ├── ErrorScreen.tsx
│   └── index.ts
├── hooks/              # Hooks customizados para lógica reutilizável
│   ├── useAuthToken.ts
│   ├── useWebViewNavigation.ts
│   ├── useWebViewLoading.ts
│   └── index.ts
├── constants/          # Constantes e configurações
│   ├── webview.ts
│   └── index.ts
├── types/             # Definições de tipos TypeScript
│   ├── webview.ts
│   └── index.ts
├── App.tsx            # Componente principal (limpo e organizado)
└── README.md          # Esta documentação
```

## 🎯 Separação de Responsabilidades

### Components (`/components`)
Componentes de UI isolados e reutilizáveis:
- **LoadingScreen**: Tela de carregamento com logo e spinner
- **ErrorScreen**: Tela de erro com opção de retry

### Hooks (`/hooks`)
Lógica de negócio encapsulada em hooks customizados:
- **useAuthToken**: Gerencia autenticação e comunicação de tokens com o WebView
- **useWebViewNavigation**: Controla navegação, back button e validação de domínios
- **useWebViewLoading**: Gerencia estados de loading, erro e retry

### Constants (`/constants`)
Configurações centralizadas:
- URL do website
- Domínios permitidos
- Chaves de armazenamento
- User agent

### Types (`/types`)
Definições de tipos TypeScript para garantir type-safety.

## 🔧 Como Funciona

### Fluxo de Autenticação
1. App inicia e `useAuthToken` verifica se existe token salvo
2. Se existe, injeta no localStorage do WebView antes de carregar
3. WebView envia mensagens para salvar/remover tokens
4. Tokens são armazenados com segurança via Expo SecureStore

### Fluxo de Navegação
1. `useWebViewNavigation` monitora mudanças de URL
2. Valida se a URL pertence aos domínios permitidos
3. Gerencia botão "voltar" do Android
4. Bloqueia navegação para domínios não autorizados

### Fluxo de Loading
1. `useWebViewLoading` gerencia estados de loading e erro
2. Exibe splash screen por no mínimo 2 segundos
3. Detecta erros de rede e exibe tela de erro
4. Permite retry em caso de falha

## 🎨 Benefícios da Refatoração

### Antes
- ❌ 263 linhas em um único arquivo
- ❌ Lógica misturada com UI
- ❌ Difícil de testar
- ❌ Difícil de manter

### Depois
- ✅ Código modular e organizado
- ✅ Responsabilidades bem definidas
- ✅ Fácil de testar cada parte isoladamente
- ✅ Fácil de adicionar novas funcionalidades
- ✅ Reutilização de código
- ✅ Type-safety completo

## 📝 Exemplo de Uso

```typescript
// App.tsx - Componente principal limpo e legível
export default function App() {
  const webViewRef = useRef<WebView>(null)

  // Cada hook gerencia uma responsabilidade específica
  const { initialScript, handleMessage } = useAuthToken()
  const { handleNavigationStateChange, shouldStartLoadWithRequest } =
    useWebViewNavigation(webViewRef)
  const { isLoading, hasError, handleLoadStart, handleLoadEnd, handleError, handleRetry } =
    useWebViewLoading(webViewRef, initialScript)

  // Renderização condicional simples
  if (hasError) {
    return <ErrorScreen onRetry={handleRetry} />
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        {/* ... outras props */}
      />
      {isLoading && <LoadingScreen />}
    </View>
  )
}
```

## 🧪 Testabilidade

Cada módulo pode ser testado isoladamente:
- Hooks podem ser testados com `@testing-library/react-hooks`
- Componentes podem ser testados com `@testing-library/react-native`
- Lógica de negócio está desacoplada da UI

## 🔄 Manutenção Futura

Para adicionar novas funcionalidades:
1. Crie novos hooks em `/hooks` para lógica complexa
2. Crie novos componentes em `/components` para UI
3. Adicione novas constantes em `/constants`
4. Defina novos tipos em `/types`
5. Mantenha o `App.tsx` limpo e focado apenas em composição
