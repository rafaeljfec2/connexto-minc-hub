# Insights do Projeto SuperApp - Padrões Aplicáveis ao MINC Hub

**Data da Análise:** Janeiro 2025  
**Projeto Analisado:** SuperApp (TR Fintech)  
**Localização:** `/mnt/c/trapps/superapp`

---

## 📋 Resumo Executivo

Análise do projeto SuperApp React Native para extrair padrões, estruturas e melhores práticas aplicáveis ao desenvolvimento do app mobile MINC Hub e melhorias no projeto web.

---

## 🏗️ Estrutura de Monorepo

### Padrão Identificado

```
superapp/
├── apps/                    # Entry points (client, accountant, employee)
│   └── client/
│       └── src/
│           ├── App.tsx      # Providers e configuração
│           ├── navigator/   # Navegação raiz do app
│           └── screens/     # Screens específicas do app
├── packages/                # Packages compartilhados
│   ├── components/          # Design system
│   ├── types/               # Tipos compartilhados
│   ├── hooks/               # Hooks customizados
│   ├── network/             # Cliente HTTP, Realm, etc.
│   ├── login/               # Feature completa (screens + navigator)
│   ├── home/                # Feature completa
│   └── ...
```

### Insights Aplicáveis ao MINC Hub

**1. Separação por Features (Packages)**
- Cada feature grande vira um package separado
- Package contém: screens, navigator, types, services
- Reutilização entre apps diferentes

**Aplicação:**
```
packages/
├── components/      # Design system (já temos)
├── types/          # Tipos compartilhados (já temos)
├── auth/           # Feature de autenticação
│   ├── screens/
│   ├── navigator/
│   └── types/
├── people/         # Feature de gestão de pessoas
├── teams/          # Feature de equipes
└── schedules/      # Feature de escalas
```

**2. Apps como Entry Points**
- Cada app (client, accountant, employee) é um entry point
- App configura providers globais
- App define navegação raiz
- Compartilha packages

**Aplicação:**
```
apps/
├── web/            # Existente (React web)
└── mobile/         # Novo (React Native)
    └── src/
        ├── App.tsx
        ├── navigator/
        └── screens/
```

---

## 🧭 Estrutura de Navegação

### Padrão Identificado

**1. Navegação Modular por Feature**

Cada package/feature tem seu próprio navigator:
```
packages/login/src/navigator/
├── navigator.tsx       # Navigator da feature
├── navigator.type.ts   # Tipos de rotas
└── navigator.route.tsx # Screens da feature
```

**2. Tipagem Forte**

```typescript
// navigator.type.ts
export type LoginStackParamList = {
  LoginScreen: undefined;
  ForgotPasswordScreen: { email?: string };
};

// No app principal
import { NavigatorScreenParams } from '@react-navigation/native';
import { LoginStackParamList } from '@trfintech/login';

export type RootStackParamList = {
  LoginRoute: NavigatorScreenParams<LoginStackParamList>;
  Main: NavigatorScreenParams<TabStackParamList>;
};
```

**3. Navegação Híbrida (Stack + Tabs)**

```typescript
// Stack Navigator (rotas principais)
const Stack = createNativeStackNavigator<RootStackParamList>();

// Tab Navigator (navegação principal)
const Tab = createBottomTabNavigator<TabStackParamList>();

// Stack contém Tabs
<Stack.Screen name="Main" component={TabNavigator} />
```

**4. Constantes para Navegação**

```typescript
export const TabNavigationItems = {
  Home: 'Home',
  Account: 'Account',
  Charges: 'Charges',
  Benefit: 'Benefit',
};

// Uso tipado
navigation.navigate(TabNavigationItems.Home);
```

**5. Linking Separado**

```typescript
// navigator/linking.tsx
export const linking = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      LoginRoute: {
        screens: {
          LoginScreen: 'login',
        },
      },
      Main: {
        screens: {
          Home: {
            screens: {
              DashboardScreen: 'dashboard',
            },
          },
        },
      },
    },
  },
};
```

### Insights Aplicáveis ao MINC Hub Web

**1. Modularização de Rotas**

Atualmente o `App.tsx` tem 295 linhas com todas as rotas. Podemos modularizar:

```typescript
// apps/web/src/navigator/routes.ts
export const routes = {
  public: [
    { path: '/login', component: LoginPage },
  ],
  protected: [
    { path: '/dashboard', component: DashboardPage, roles: [] },
    { path: '/people', component: PeoplePage, roles: [UserRole.ADMIN, UserRole.COORDINATOR] },
    // ...
  ],
};
```

**2. Tipagem de Rotas**

```typescript
// apps/web/src/navigator/types.ts
export type RouteParams = {
  '/people': { id?: string };
  '/teams': { teamId?: string };
};

// Helper para navegação tipada
export function useTypedNavigate() {
  const navigate = useNavigate();
  return (path: keyof RouteParams, params?: RouteParams[typeof path]) => {
    // Implementação
  };
}
```

**3. Constant Routes**

```typescript
// apps/web/src/navigator/routes.constants.ts
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PEOPLE: '/people',
  TEAMS: '/teams',
  // ...
} as const;
```

---

## 🎨 Design System e Componentes

### Padrão Identificado

**1. Package Separado para Componentes**

```
packages/components/src/
├── PrimaryButton/
│   ├── PrimaryButton.tsx
│   ├── styles.tsx
│   ├── styles.active.tsx
│   ├── styles.disabled.tsx
│   └── index.ts
├── TextField/
├── Footer/
└── index.ts          # Export centralizado
```

**2. Estilos por Estado**

Componentes têm estilos separados por estado:
- `styles.tsx` - Estilos base
- `styles.active.tsx` - Estilos ativos
- `styles.disabled.tsx` - Estilos desabilitados

**3. Props Tipadas e Extensíveis**

```typescript
interface PrimaryButtonProps extends TouchableOpacityProps {
  text: string;
  loading?: boolean;
  icon?: React.ReactNode;
  // Props customizadas
}

// Uso
<PrimaryButton
  text="Enviar"
  loading={isLoading}
  {...otherTouchableOpacityProps}
/>
```

**4. Test IDs Consistentes**

```typescript
import testProps from '@trfintech/sdks/src/testProps';

<TouchableOpacity
  {...testProps(props.testID ? ensureButtonPrefix(props.testID) : 'buttonPrimaryButton')}
>
```

**5. Export Centralizado**

```typescript
// packages/components/src/index.ts
export { PrimaryButton } from './PrimaryButton';
export { TextField } from './TextField';
// ...

// Uso
import { PrimaryButton, TextField } from '@trfintech/components';
```

### Insights Aplicáveis ao MINC Hub

**1. Melhorar Estrutura de Componentes Web**

Atualmente temos:
```
apps/web/src/components/ui/
├── Button.tsx
├── Input.tsx
└── ...
```

Podemos melhorar para:
```
packages/components/src/          # Ou apps/web/src/components/ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.types.ts
│   ├── Button.styles.ts         # Se usar styled-components
│   ├── Button.test.tsx
│   └── index.ts
├── Input/
└── index.ts
```

**2. Variants Consistentes**

```typescript
// Button.tsx
export const Button = ({ variant = 'primary', size = 'md', ...props }) => {
  const variantStyles = {
    primary: 'bg-primary-600 text-white',
    secondary: 'bg-dark-200 text-dark-900',
    outline: 'border-2 border-primary-600',
  };
  
  const sizeStyles = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-13 px-6 text-lg',
  };
  
  // Implementação
};
```

**3. Design Tokens Centralizados**

```typescript
// packages/shared/design-tokens.ts
export const colors = {
  primary: {
    50: '#fff7ed',
    500: '#f97316',
    600: '#ea580c',
    // ...
  },
  dark: {
    // ...
  },
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  // ...
};

export const typography = {
  fontFamily: ['Inter', 'system-ui', 'sans-serif'],
  sizes: {
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
  },
};
```

---

## 🔌 Arquitetura de Providers

### Padrão Identificado

```typescript
// App.tsx
function App() {
  return (
    <DatadogProvider>
      <RealmProvider>
        <JotaiProvider>
          <KeyboardProvider>
            <TokenRefreshActivityProvider>
              <NavigationContainer>
                <RootNavigation />
              </NavigationContainer>
            </TokenRefreshActivityProvider>
          </KeyboardProvider>
        </JotaiProvider>
      </RealmProvider>
    </DatadogProvider>
  );
}
```

**Características:**
- Providers aninhados por ordem de dependência
- Providers específicos (TokenRefreshActivityProvider)
- Suspense para lazy loading

### Insights Aplicáveis ao MINC Hub

**1. Estrutura de Providers Web**

Atualmente:
```typescript
<ThemeProvider>
  <AuthProvider>
    <Routes>...</Routes>
  </AuthProvider>
</ThemeProvider>
```

Podemos melhorar:
```typescript
<ErrorBoundary>
  <ThemeProvider>
    <AuthProvider>
      <NotificationProvider>
        <QueryClientProvider>  {/* Se usar React Query */}
          <Routes>...</Routes>
        </QueryClientProvider>
      </NotificationProvider>
    </AuthProvider>
  </ThemeProvider>
</ErrorBoundary>
```

**2. Provider Customizado para Mobile**

```typescript
// apps/mobile/src/App.tsx
<ThemeProvider>
  <AuthProvider>
    <RealmProvider>  {/* Para cache local */}
      <NavigationContainer>
        <RootNavigation />
      </NavigationContainer>
    </RealmProvider>
  </AuthProvider>
</ThemeProvider>
```

---

## 📦 Estado Global (Jotai)

### Padrão Identificado

```typescript
// Atoms separados por feature/contexto
export const footerHeightAtom = atom<number>(0);
export const appNameAtom = atom<string>('');

// Uso
const footerHeight = useAtomValue(footerHeightAtom);
const setAppName = useSetAtom(appNameAtom);
```

### Insights Aplicáveis

**Para Web:**
- Continuar com Context API (mais simples para React web)
- Ou migrar para Zustand/Jotai se necessário

**Para Mobile:**
- Usar Jotai ou Zustand para estado global
- Context API para providers (Auth, Theme)

---

## 🧪 Testes

### Padrão Identificado

```
packages/components/src/PrimaryButton/
├── PrimaryButton.tsx
├── tests/
│   └── PrimaryButton.test.tsx
└── index.ts
```

**Características:**
- Testes colocalizados com componentes
- Test IDs consistentes
- Testing Library

### Insights Aplicáveis

**Para Web:**
```
apps/web/src/components/ui/Button/
├── Button.tsx
├── Button.test.tsx
└── index.ts
```

---

## 🔗 Linking (Deep Linking)

### Padrão Identificado

```typescript
// navigator/linking.tsx
export const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      LoginRoute: 'login',
      Main: {
        screens: {
          Home: {
            screens: {
              DashboardScreen: 'dashboard',
            },
          },
        },
      },
    },
  },
};
```

### Insights Aplicáveis

**Para Mobile:**
- Configurar deep linking desde o início
- URLs como: `minchub://dashboard`, `minchub://people/:id`

**Para Web:**
- Já temos URLs web, mobile pode usar mesmo padrão

---

## 📱 Estrutura de Screens

### Padrão Identificado

```
packages/login/src/screens/
├── LoginScreen/
│   ├── LoginScreen.tsx
│   ├── LoginScreen.styles.ts
│   └── index.ts
└── ForgotPasswordScreen/
```

**Características:**
- Screen = pasta com componente principal
- Estilos separados
- Index para export

### Insights Aplicáveis

**Para Mobile:**
```
apps/mobile/src/screens/
├── DashboardScreen/
├── PeopleScreen/
└── TeamsScreen/
```

---

## 🎯 Feature Flags

### Padrão Identificado

```typescript
const { isFeatureFlagWhiteListed } = useFeatureFlag();
const moduleBillingEnabled = isFeatureFlagWhiteListed(FeatureFlagUseCase.MODULE_BILLING);

{moduleBillingEnabled && (
  <Tab.Screen name="Charges" component={ChargesNavigator} />
)}
```

### Insights Aplicáveis

**Para MINC Hub:**
- Implementar feature flags para funcionalidades em desenvolvimento
- Útil para QR Code, relatórios, etc.

---

## 🔐 Autenticação e Segurança

### Padrão Identificado

- Token refresh automático via `TokenRefreshActivityProvider`
- Interceptors para refresh token
- Logout automático em caso de erro

### Insights Aplicáveis

**Para Web:**
- Já temos interceptors Axios
- Podemos melhorar com token refresh automático

**Para Mobile:**
- Implementar token refresh provider similar
- AsyncStorage para tokens (não localStorage)

---

## 📊 Resumo de Padrões Aplicáveis

### Alta Prioridade (aplicar logo)

1. **Modularização de Rotas (Web)**
   - Separar rotas em arquivo dedicado
   - Tipagem de rotas
   - Constantes para rotas

2. **Estrutura de Packages (Monorepo)**
   - Mover tipos para `packages/shared/types`
   - Criar `packages/shared/services`
   - Criar `packages/shared/utils`

3. **Design Tokens Centralizados**
   - Criar `packages/shared/design-tokens`
   - Cores, espaçamento, tipografia centralizados

4. **Estrutura de Navegação Mobile**
   - Navigator por feature
   - Tipagem forte
   - Linking configurado

### Média Prioridade

5. **Estrutura de Componentes**
   - Componentes em pastas separadas
   - Estilos por estado
   - Test IDs consistentes

6. **Feature Flags**
   - Sistema de feature flags
   - Útil para MVP e lançamento gradual

7. **Testes Colocalizados**
   - Testes próximos aos componentes
   - Testing Library

### Baixa Prioridade

8. **Estado Global (Mobile)**
   - Jotai/Zustand se necessário
   - Context API para providers

---

## 🎓 Conclusão

O projeto SuperApp demonstra padrões maduros de desenvolvimento React Native em monorepo:

1. **Modularização extrema** - Features como packages separados
2. **Tipagem forte** - TypeScript em todos os níveis
3. **Design system** - Componentes compartilhados e consistentes
4. **Navegação modular** - Navigator por feature
5. **Arquitetura escalável** - Suporta múltiplos apps

**Próximos Passos para MINC Hub:**
1. Aplicar insights na estrutura do monorepo
2. Modularizar rotas web
3. Criar estrutura base para mobile
4. Centralizar design tokens
5. Implementar navegação modular no mobile