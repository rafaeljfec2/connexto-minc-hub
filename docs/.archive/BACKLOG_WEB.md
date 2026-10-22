# Web Development Backlog (React + Vite + TypeScript)

Frontend work for MINC Teams web app.

## Completed (snapshot)

- Monorepo (pnpm + Turborepo)
- React + Vite + TypeScript app
- Mock authentication
- Responsive layout, dark/light theme
- Reusable CRUD components
- Churches, ministries, teams, volunteers, worship services, schedules pages
- Grid/list views, filters, search
- Monthly draw view (read-only)

## Phase 1 — Functional MVP

### Authentication (web)

- [ ] Login, refresh, logout API integration
- [ ] Password recovery and change screens
- [ ] Auth context and interceptors
- [ ] Auth error handling

### Users and roles

- [ ] `/users` management
- [ ] Create/edit user forms
- [ ] User ↔ volunteer linking
- [ ] Role assignment and validation rules

### Schedules and teams (enhancements)

- [ ] Real API for schedules and team assignment
- [ ] Attendance views
- [ ] Reassignment UI

### Communication

- [ ] Messaging UI
- [ ] Notification preferences and inbox

### QR Code (web leader flow)

- [ ] Leader scan flow (where applicable on web)
- [ ] Invalid/expired QR error states

## Phase 2 — Reports and automation

- [ ] Attendance and team reports
- [ ] Export (PDF/Excel) when backend ready
- [ ] Dashboard KPIs wired to API

## Phase 3 — Expansion

- [ ] Multi-ministry admin views
- [ ] Performance passes (lazy routes, memoization)
- [ ] Full backend integration (mock off)

## Roles (reference)

**PASTOR** — full access; **Coordinator / Leader / Member** — scoped per hierarchy.
