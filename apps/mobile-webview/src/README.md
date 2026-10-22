# Mobile WebView App Structure

Refactored React Native Expo app following software engineering best practices.

## 📁 Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── LoadingScreen.tsx
│   ├── ErrorScreen.tsx
│   └── index.ts
├── hooks/              # Custom hooks for reusable logic
│   ├── useAuthToken.ts
│   ├── useWebViewNavigation.ts
│   ├── useWebViewLoading.ts
│   └── index.ts
├── constants/          # Constants and configuration
│   ├── webview.ts
│   └── index.ts
├── types/             # TypeScript type definitions
│   ├── webview.ts
│   └── index.ts
├── App.tsx            # Main component (clean and organized)
└── README.md          # This documentation
```

## 🎯 Separation of Concerns

### Components (`/components`)
Isolated, reusable UI components:
- **LoadingScreen**: Loading screen with logo and spinner
- **ErrorScreen**: Error screen with retry option

### Hooks (`/hooks`)
Business logic encapsulated in custom hooks:
- **useAuthToken**: Manages authentication and token communication with the WebView
- **useWebViewNavigation**: Controls navigation, back button, and domain validation
- **useWebViewLoading**: Manages loading, error, and retry states

### Constants (`/constants`)
Centralized configuration:
- Website URL
- Allowed domains
- Storage keys
- User agent

### Types (`/types`)
TypeScript type definitions for full type safety.

## 🔧 How It Works

### Authentication Flow
1. App starts and `useAuthToken` checks for a saved token
2. If present, injects it into WebView localStorage before load
3. WebView sends messages to save/remove tokens
4. Tokens are stored securely via Expo SecureStore

### Navigation Flow
1. `useWebViewNavigation` monitors URL changes
2. Validates that the URL belongs to allowed domains
3. Handles the Android back button
4. Blocks navigation to unauthorized domains

### Loading Flow
1. `useWebViewLoading` manages loading and error states
2. Shows splash screen for at least 2 seconds
3. Detects network errors and shows error screen
4. Allows retry on failure

## 🎨 Refactoring Benefits

### Before
- ❌ 263 lines in a single file
- ❌ Logic mixed with UI
- ❌ Hard to test
- ❌ Hard to maintain

### After
- ✅ Modular, organized code
- ✅ Well-defined responsibilities
- ✅ Easy to test each part in isolation
- ✅ Easy to add new features
- ✅ Code reuse
- ✅ Full type safety

## 📝 Usage Example

```typescript
// App.tsx - Clean, readable main component
export default function App() {
  const webViewRef = useRef<WebView>(null)

  // Each hook manages a specific responsibility
  const { initialScript, handleMessage } = useAuthToken()
  const { handleNavigationStateChange, shouldStartLoadWithRequest } =
    useWebViewNavigation(webViewRef)
  const { isLoading, hasError, handleLoadStart, handleLoadEnd, handleError, handleRetry } =
    useWebViewLoading(webViewRef, initialScript)

  // Simple conditional rendering
  if (hasError) {
    return <ErrorScreen onRetry={handleRetry} />
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        {/* ... other props */}
      />
      {isLoading && <LoadingScreen />}
    </View>
  )
}
```

## 🧪 Testability

Each module can be tested in isolation:
- Hooks can be tested with `@testing-library/react-hooks`
- Components can be tested with `@testing-library/react-native`
- Business logic is decoupled from UI

## 🔄 Future Maintenance

To add new features:
1. Create new hooks in `/hooks` for complex logic
2. Create new components in `/components` for UI
3. Add new constants in `/constants`
4. Define new types in `/types`
5. Keep `App.tsx` clean and focused on composition only
