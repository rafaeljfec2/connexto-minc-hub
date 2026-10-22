# SuperApp Project Insights — Patterns for MINC Hub

Archived notes from analyzing a React Native SuperApp codebase and mapping reusable patterns to MINC Hub (web and mobile).

## Monorepo and features

- Feature folders (`people/`, `schedules/`, etc.) with colocated screens, hooks, and API clients
- Multiple entry apps (client, staff) sharing packages — MINC can share types and API layer between web and mobile

## Navigation

- Stack + tab composition; deep linking for notifications
- Typed route params (align with React Navigation on mobile)

## State

- Prefer server state (React Query) for API data; minimal global client state (auth, theme)
- Jotai or Zustand only where truly global — MINC web already uses Context for auth/theme

## API layer

- Single HTTP client with interceptors (auth refresh, error normalization)
- DTO mapping at the boundary; Zod validation on forms

## Mobile-specific

- Secure token storage (Keychain/Keystore), not `localStorage`
- Native camera module for QR (Expo `expo-camera` or equivalent)
- Push via FCM with permission UX up front

## Web-specific (from SuperApp admin patterns)

- List/detail layouts with skeleton loaders
- Optimistic updates only where rollback is cheap
- Role-gated menus driven by backend claims

## Recommended adoption order for MINC

1. Shared `@minc/api` types and client in monorepo  
2. React Query on web (already started in chat module)  
3. Mobile auth + navigation shell  
4. QR flows on native camera  
5. Push notifications after backend FCM  

## Out of scope for copy-paste

- SuperApp payment and accounting modules  
- White-label theming beyond MINC design system  
