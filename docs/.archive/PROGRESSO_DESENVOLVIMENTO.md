# MINC Teams — Development Progress (archived snapshot)

Status of Web, Mobile, and Backend at the time of this document.

## Summary

| Platform | Status |
|----------|--------|
| Web | MVP UI largely complete; mock API mode |
| Mobile | Core screens and QR flows in progress |
| Backend | NestJS foundation; integration pending |

**Next focus:** Replace mock mode with real backend integration (auth, CRUD, check-in, chat).

## Web — done

- Auth mock, protected routes, role-based access
- Dashboard with stats placeholders
- CRUD: people, teams, schedules, churches, ministries, worship services, users
- Profile and password change UI
- Communication shell
- Shared components, filters, grid/list toggles
- Error handling patterns

## Web — pending

- Full backend wiring for all entities
- QR integration with mobile
- Advanced reports and push notifications

## Mobile — done

- Navigation (tabs: Home, Schedules, Check-in, Chat, Profile)
- Auth persistence (AsyncStorage)
- People, teams, schedules screens (mock data)
- QR generate/scan flows (prototype)

## Mobile — pending

- Production API client
- Push notifications
- Offline/sync strategy

## Backend — done (partial)

- Project structure, docs, migration strategy

## Backend — pending

- JWT auth, entities, REST APIs, WebSocket chat, FCM, attendance and draw services

## Metrics (indicative)

- Monorepo packages: web + mobile + shared
- Mock mode: enabled for local/demo
