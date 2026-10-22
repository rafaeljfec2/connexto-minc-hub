# Revised Mobile Plan — React Native (Expo)

## Decision

**Stack:** React Native with Expo (recommended).

**Why:** Native QR/camera support, team skill fit, 3–4 week MVP feasible, scalable for push and offline later.

## Target structure

```
apps/mobile/
  src/
    navigation/
    screens/
    features/     # auth, schedules, check-in, chat, profile
    hooks/
    services/     # API client
packages/shared/  # types, validation, constants
```

## Phase 1 — Foundation (week 1)

- Create `apps/mobile` with Expo
- Wire monorepo scripts (pnpm, Turborepo)
- Auth context + secure token storage
- Root navigation (auth stack vs main tabs)
- Environment config (`EXPO_PUBLIC_API_URL`)

**Deliverables:** Runnable app, login screen (mock or API), tab skeleton

## Phase 2 — Auth and navigation (week 2)

- Login, refresh, logout against backend
- Typed React Navigation routes
- Profile screen stub

**Deliverables:** End-to-end auth against staging API

## Phase 3 — Core screens (week 3)

- Schedule list and detail
- People/team read-only views as needed for check-in context
- Volunteer QR display screen with expiry refresh

**Deliverables:** Primary user journeys without scanner

## Phase 4 — QR scanner (week 4)

- Camera permissions and scanner component
- Leader check-in submission
- Error states (invalid, expired, wrong team)

**Deliverables:** Complete check-in loop with backend

## Phase 5 — Hardening

- Push notification hookup (FCM)
- Performance (FlatList tuning, memoization)
- Store/build pipelines (EAS)

## Web coordination

- Modularize web routes (already refactored in web app)
- Share DTO types from `packages/shared`

## References

- Expo camera docs
- React Navigation 6+
- MINC backend OpenAPI / CHAT_API for integration points
