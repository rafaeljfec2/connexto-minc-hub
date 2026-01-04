# Plano Revisado: App Mobile MINC Hub

**Data:** Janeiro 2025  
**Baseado em:** Análise do SuperApp + Contexto do Projeto MINC Hub

---

## Contexto e Decisão

**Decisão:** React Native com Expo (recomendado)

**Razões:**
- QR Code é crítico → React Native oferece melhor suporte nativo
- Experiência disponível → Não precisa aprender do zero
- Timeline viável → 3-4 semanas é factível com Expo
- Monorepo → Permite reutilizar ~40-60% do código (types, services, utils)
- Performance e UX superiores
- Escalável para futuras features

---

## Estrutura do Monorepo

### Estrutura Baseada no SuperApp

```
connexto-minc-hub/
├── apps/
│   ├── web/                    # Existente (React + Vite)
│   │   └── src/
│   │       ├── components/
│   │       ├── pages/
│   │       ├── contexts/
│   │       └── navigator/      # NOVO: Rotas modularizadas
│   │           ├── routes.ts
│   │           ├── routes.types.ts
│   │           └── routes.constants.ts
│   │
│   └── mobile/                 # NOVO (React Native + Expo)
│       └── src/
│           ├── App.tsx
│           ├── navigator/
│           │   ├── navigator.tsx
│           │   ├── navigator.type.ts
│           │   └── linking.tsx
│           └── screens/
│
├── packages/
│   ├── shared/                 # NOVO: Código compartilhado
│   │   ├── types/              # Tipos compartilhados
│   │   │   └── index.ts
│   │   ├── services/           # Services compartilhados
│   │   │   ├── api/
│   │   │   │   ├── client.ts
│   │   │   │   └── interceptors.ts
│   │   │   └── index.ts
│   │   ├── utils/              # Utilitários compartilhados
│   │   │   ├── date.ts
│   │   │   ├── format.ts
│   │   │   └── index.ts
│   │   └── design-tokens/      # NOVO: Design tokens
│   │       ├── colors.ts
│   │       ├── spacing.ts
│   │       ├── typography.ts
│   │       └── index.ts
│   │
│   └── components/             # FUTURO: Design system compartilhado
│       └── src/
│           ├── Button/
│           ├── Input/
│           └── index.ts
│
└── turbo.json
```

---

## Fase 1: Preparação e Estrutura Base (Semana 1)

### 1.1 Setup Monorepo e Packages

**Tarefas:**
1. Criar `packages/shared`
   - `packages/shared/types` - Mover tipos de `apps/web/src/types`
   - `packages/shared/services` - Mover services de `apps/web/src/services`
   - `packages/shared/utils` - Mover utils de `apps/web/src/lib/utils`
   - `packages/shared/design-tokens` - Criar design tokens

2. Criar `packages/shared/package.json`
   ```json
   {
     "name": "@minc-hub/shared",
     "version": "1.0.0",
     "main": "./src/index.ts",
     "types": "./src/index.ts",
     "dependencies": {
       "axios": "^1.13.2",
       "date-fns": "^3.0.6"
     }
   }
   ```

3. Atualizar `apps/web/package.json`
   ```json
   {
     "dependencies": {
       "@minc-hub/shared": "workspace:*"
     }
   }
   ```

4. Migrar código para shared
   - Mover `apps/web/src/types/*` → `packages/shared/types/`
   - Mover `apps/web/src/services/*` → `packages/shared/services/`
   - Mover `apps/web/src/lib/utils.ts` → `packages/shared/utils/`
   - Atualizar imports no web

5. Criar design tokens
   ```typescript
   // packages/shared/design-tokens/colors.ts
   export const colors = {
     primary: {
       50: '#fff7ed',
       500: '#f97316',
       600: '#ea580c',
       // ... (do tailwind.config.ts)
     },
     dark: {
       // ...
     },
   };

   // packages/shared/design-tokens/spacing.ts
   export const spacing = {
     xs: 4,
     sm: 8,
     md: 16,
     lg: 24,
     xl: 32,
   };

   // packages/shared/design-tokens/typography.ts
   export const typography = {
     fontFamily: {
       sans: ['Inter', 'system-ui', 'sans-serif'],
     },
     sizes: {
       sm: 14,
       md: 16,
       lg: 18,
       xl: 20,
     },
   };
   ```

**Entregáveis:**
- [x] Estrutura `packages/shared` criada
- [ ] Tipos, services e utils migrados
- [ ] Design tokens criados
- [ ] Web funcionando com imports de shared

---

### 1.2 Modularização de Rotas (Web)

**Tarefas:**
1. Criar `apps/web/src/navigator/`
   - `routes.ts` - Definição de rotas
   - `routes.types.ts` - Tipos de rotas
   - `routes.constants.ts` - Constantes de rotas

2. Extrair rotas do `App.tsx`
   ```typescript
   // apps/web/src/navigator/routes.ts
   export const routes = {
     public: [
       { path: '/login', component: LoginPage },
     ],
     protected: [
       { 
         path: '/dashboard', 
         component: DashboardPage, 
         roles: [] 
       },
       { 
         path: '/people', 
         component: PeoplePage, 
         roles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER] 
       },
       // ...
     ],
   };
   ```

3. Criar constantes de rotas
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

4. Refatorar `App.tsx` para usar rotas modulares

**Entregáveis:**
- [ ] Rotas modularizadas
- [ ] `App.tsx` reduzido (< 150 linhas)
- [ ] Constantes de rotas criadas

---

### 1.3 Setup React Native + Expo

**Tarefas:**
1. Inicializar Expo no monorepo
   ```bash
   cd apps
   npx create-expo-app mobile --template blank-typescript
   ```

2. Configurar `apps/mobile/package.json`
   ```json
   {
     "name": "@minc-hub/mobile",
     "version": "1.0.0",
     "main": "expo-router/entry",
     "dependencies": {
       "@minc-hub/shared": "workspace:*",
       "expo": "~51.0.0",
       "react-native": "0.74.0",
       "@react-navigation/native": "^6.1.0",
       "@react-navigation/native-stack": "^6.9.0",
       "@react-navigation/bottom-tabs": "^6.5.0",
       "react-native-screens": "~3.31.0",
       "react-native-safe-area-context": "4.10.0"
     }
   }
   ```

3. Configurar `apps/mobile/app.json`
   ```json
   {
     "expo": {
       "name": "MINC Hub",
       "slug": "minc-hub",
       "version": "1.0.0",
       "scheme": "minchub",
       "platforms": ["ios", "android"]
     }
   }
   ```

4. Criar estrutura base
   ```
   apps/mobile/src/
   ├── App.tsx
   ├── navigator/
   │   ├── navigator.tsx
   │   ├── navigator.type.ts
   │   └── linking.tsx
   └── screens/
   ```

5. Configurar Turbo para mobile
   ```json
   // turbo.json
   {
     "tasks": {
       "dev": {
         "cache": false,
         "persistent": true
       },
       "build": {
         "dependsOn": ["^build"],
         "outputs": ["dist/**", "build/**", ".expo/**"]
       }
     }
   }
   ```

**Entregáveis:**
- [ ] Expo inicializado
- [ ] Estrutura base criada
- [ ] Dependências instaladas
- [ ] App rodando no emulador

---

## Fase 2: Navegação e Autenticação (Semana 2)

### 2.1 Estrutura de Navegação Mobile

**Tarefas:**
1. Criar tipos de navegação
   ```typescript
   // apps/mobile/src/navigator/navigator.type.ts
   export type RootStackParamList = {
     LoginRoute: undefined;
     Main: NavigatorScreenParams<TabStackParamList>;
   };

   export type TabStackParamList = {
     Dashboard: undefined;
     People: undefined;
     Teams: undefined;
     Schedules: undefined;
   };
   ```

2. Criar navigator raiz
   ```typescript
   // apps/mobile/src/navigator/navigator.tsx
   const Stack = createNativeStackNavigator<RootStackParamList>();
   const Tab = createBottomTabNavigator<TabStackParamList>();

   export default function RootNavigator() {
     return (
       <Stack.Navigator>
         <Stack.Screen name="LoginRoute" component={LoginNavigator} />
         <Stack.Screen name="Main" component={TabNavigator} />
       </Stack.Navigator>
     );
   }
   ```

3. Configurar linking
   ```typescript
   // apps/mobile/src/navigator/linking.tsx
   export const linking = {
     prefixes: ['minchub://', 'https://app.minc-teams.com'],
     config: {
       screens: {
         LoginRoute: 'login',
         Main: {
           screens: {
             Dashboard: 'dashboard',
             People: 'people',
             Teams: 'teams',
           },
         },
       },
     },
   };
   ```

**Entregáveis:**
- [ ] Navegação estruturada
- [ ] Tipos de navegação criados
- [ ] Linking configurado

---

### 2.2 Autenticação Mobile

**Tarefas:**
1. Criar `packages/shared/services/auth.ts`
   - Adaptar `apps/web/src/contexts/AuthContext.tsx`
   - Usar AsyncStorage em vez de localStorage
   - Manter mesma interface

2. Criar `apps/mobile/src/contexts/AuthContext.tsx`
   ```typescript
   import { createContext, useContext, useState, useEffect } from 'react';
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import { User, UserRole } from '@minc-hub/shared/types';
   import { authService } from '@minc-hub/shared/services/auth';

   // Implementação similar ao web, mas com AsyncStorage
   ```

3. Criar `apps/mobile/src/screens/LoginScreen/`
   - Componente de login
   - Reutilizar lógica de autenticação

4. Criar ProtectedRoute para mobile
   ```typescript
   // apps/mobile/src/components/ProtectedRoute.tsx
   export function ProtectedRoute({ children, allowedRoles }) {
     const { isAuthenticated, hasAnyRole } = useAuth();
     
     if (!isAuthenticated) {
       return <Navigate to="LoginRoute" />;
     }
     
     if (allowedRoles && !hasAnyRole(allowedRoles)) {
       return <Navigate to="Dashboard" />;
     }
     
     return <>{children}</>;
   }
   ```

**Entregáveis:**
- [ ] AuthContext mobile criado
- [ ] LoginScreen implementado
- [ ] ProtectedRoute funcionando

---

### 2.3 Providers no App.tsx

**Tarefas:**
1. Criar `apps/mobile/src/App.tsx`
   ```typescript
   import { ThemeProvider } from './contexts/ThemeContext';
   import { AuthProvider } from './contexts/AuthContext';
   import { NavigationContainer } from '@react-navigation/native';
   import RootNavigator from './navigator/navigator';
   import { linking } from './navigator/linking';

   export default function App() {
     return (
       <ThemeProvider>
         <AuthProvider>
           <NavigationContainer linking={linking}>
             <RootNavigator />
           </NavigationContainer>
         </AuthProvider>
       </ThemeProvider>
     );
   }
   ```

**Entregáveis:**
- [ ] App.tsx configurado
- [ ] Providers funcionando
- [ ] Navegação conectada

---

## Fase 3: Páginas Principais (Semana 3)

### 3.1 Design System Mobile

**Tarefas:**
1. Criar componentes base mobile
   - `apps/mobile/src/components/Button/Button.tsx`
   - `apps/mobile/src/components/Input/Input.tsx`
   - `apps/mobile/src/components/Card/Card.tsx`
   - Usar design tokens de `packages/shared/design-tokens`

2. Implementar ThemeContext mobile
   - Similar ao web, mas usando React Native
   - Usar `useColorScheme` do React Native

**Entregáveis:**
- [ ] Componentes base criados
- [ ] Theme funcionando

---

### 3.2 Screens Principais

**Tarefas:**
1. DashboardScreen
   - Reutilizar lógica do web
   - Adaptar layout para mobile

2. PeopleScreen
   - Lista de pessoas
   - Formulário de criação/edição

3. TeamsScreen
   - Lista de equipes
   - Gestão de equipes

4. SchedulesScreen
   - Lista de escalas
   - Calendário

**Entregáveis:**
- [ ] Screens principais implementadas
- [ ] Navegação entre screens funcionando

---

### 3.3 QR Code (Crítico)

**Tarefas:**
1. Instalar biblioteca QR Code
   ```bash
   npx expo install expo-camera
   npx expo install expo-barcode-scanner
   ```

2. Criar QRCodeScannerScreen
   ```typescript
   // apps/mobile/src/screens/QRCodeScannerScreen/QRCodeScannerScreen.tsx
   import { CameraView, useCameraPermissions } from 'expo-camera';
   
   export function QRCodeScannerScreen() {
     const [permission, requestPermission] = useCameraPermissions();
     
     // Implementação
   }
   ```

3. Integrar na navegação
   - Adicionar rota para scanner
   - Navegação a partir de botão

**Entregáveis:**
- [ ] QR Code scanner funcionando
- [ ] Permissões de câmera tratadas
- [ ] Integrado na navegação

---

## Fase 4: Polish e Deploy (Semana 4)

### 4.1 Testes e Ajustes

**Tarefas:**
1. Testes manuais
   - Navegação
   - Autenticação
   - QR Code
   - Todas as screens

2. Ajustes de UX
   - Animações
   - Loading states
   - Error handling

3. Performance
   - Otimizações de renderização
   - Lazy loading de screens

**Entregáveis:**
- [ ] App testado
- [ ] Bugs corrigidos
- [ ] Performance otimizada

---

### 4.2 Deploy

**Tarefas:**
1. Configurar EAS Build
   ```bash
   npm install -g eas-cli
   eas build:configure
   ```

2. Build para Android
   ```bash
   eas build --platform android
   ```

3. Build para iOS
   ```bash
   eas build --platform ios
   ```

4. Configurar EAS Submit (opcional)
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

**Entregáveis:**
- [ ] APK/IPA gerados
- [ ] App pronto para distribuição

---

## Checklist Geral

### Estrutura
- [ ] Monorepo configurado
- [ ] Packages shared criados
- [ ] Design tokens centralizados
- [ ] Rotas web modularizadas

### Mobile
- [ ] Expo inicializado
- [ ] Navegação estruturada
- [ ] Autenticação funcionando
- [ ] Screens principais implementadas
- [ ] QR Code funcionando
- [ ] App testado
- [ ] Build configurado

---

## Tecnologias

- **React Native:** 0.74.0
- **Expo:** ~51.0.0
- **React Navigation:** ^6.1.0
- **Expo Camera:** Para QR Code
- **AsyncStorage:** Para armazenamento local
- **TypeScript:** Strict mode
- **Design Tokens:** Centralizados em shared

---

## Próximos Passos Após MVP

1. **Feature Flags**
   - Sistema de feature flags
   - Lançamento gradual

2. **Notificações Push**
   - Firebase Cloud Messaging
   - Notificações locais

3. **Offline Support**
   - Realm/SQLite para cache
   - Sincronização offline

4. **Performance**
   - Code splitting
   - Image optimization
   - Lazy loading

5. **Analytics**
   - Mixpanel / Amplitude
   - Crash reporting

---

## Referências

- **SuperApp:** `/mnt/c/trapps/superapp`
- **Documentação Expo:** https://docs.expo.dev
- **React Navigation:** https://reactnavigation.org
- **Design Tokens:** https://design-tokens.github.io/community-group/format/