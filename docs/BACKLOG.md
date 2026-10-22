# Development Backlog — MINC Teams

> **Last updated:** 2026-01-10  
> **Status:** Active  
> **Version:** 3.1.0

## Overview

Consolidated backlog for MINC Teams, grouped by platform and priority. See also:

- [Backend Standards](./backend/BACKEND_STANDARDS.md)
- [Design System](./frontend/DESIGN_SYSTEM.md)
- [Mobile Strategy](./mobile/MOBILE_STRATEGY.md)

---

## MVP completed (Phase 1)

### Infrastructure

- [x] Monorepo (pnpm + Turborepo)
- [x] NestJS API + PostgreSQL + TypeORM
- [x] Web app (React + Vite + TypeScript + Tailwind)
- [x] Vercel build and deploy
- [x] Database migrations
- [x] Environment configuration (dev, staging, prod)

### Authentication and security

- [x] JWT auth (login, refresh, logout, forgot/reset password, `/auth/me`)
- [x] HttpOnly refresh cookies
- [x] Role-based guards and RBAC
- [x] Rate limiting and security logging
- [x] Web auth context, interceptors, login UI

### CRUD modules (API + web)

- [x] Churches, ministries, teams, persons/volunteers, worship services, schedules, users
- [x] Soft delete, filters, grid/list views, ComboBox selectors, team membership

### Chat

- [x] WebSocket + REST chat (1:1, groups, read receipts, unread counts, floating widget)

### Check-in (backend)

- [x] QR generate/validate endpoints, attendance records, business rules, history UI

### Scheduling

- [x] Monthly planning, schedule calendar, planning rules API

### Web UI

- [x] Responsive layout, dark/light theme, navigation, design system components, dashboard, profile, settings

### Uploads and docs

- [x] File upload API, Swagger, design system and API documentation reorganized

---

## In development (Phase 2)

### Advanced check-in

- [ ] Web camera QR scanner
- [ ] Visual/audio validation feedback
- [ ] Full manual check-in UI
- [ ] Absence justification
- [ ] Detailed attendance reports

### Advanced communications

- [ ] Segmented messaging (ministry, team, volunteer)
- [ ] Bulk send, scheduling, attachments
- [ ] Push notifications (FCM)
- [ ] Segmented comms UI

### Reports and analytics

- [ ] Frequency and performance reports (volunteer, team, ministry)
- [ ] PDF/Excel export, charts, advanced filters, analytics dashboard

### Automation

- [ ] Fair team rotation draw
- [ ] Schedule reminders (24h before)
- [ ] Pending check-in and low-attendance alerts
- [ ] Cron-driven jobs

---

## Mobile (Phase 3)

- [ ] React Native + Expo in monorepo
- [ ] Mobile auth, dashboard, schedules, QR generate/scan, chat, push, offline sync
- [ ] Google Play and App Store (TestFlight beta)
- [ ] Mobile deployment documentation

---

## Priority backlog

### P0 — next ~2 weeks

**Web:** QR scanner, manual check-in screen, validation feedback  
**API:** QR/check-in hardening and performance as needed

### P1 — next month

**API:** FCM, segmented comms, reporting endpoints, scheduled messages, auto team draw  
**Web:** Segmented comms UI, reports, PDF/Excel export, accessibility (WCAG 2.1 AA)

### P2 — 2–3 months

**API:** Audit log, backups, retention policy  
**Web:** Drag-and-drop reassignment, change timeline, calendar integration  
**Mobile:** RN setup, auth, dashboard, QR, chat

### P3 — future

Multi-ministry/church, document library, external calendar, E2E coverage > 80%, Sentry, analytics

---

## Epics (summary)

### EPIC-001: QR scanner (web)

Camera-based scan, library integration (`html5-qrcode` or similar), error handling (invalid/expired QR), camera switch, local check-in history.

### EPIC-002: Segmented communications

Backend segmentation + FCM; web compose with multi-select recipients, preview, schedule send, history.

### EPIC-003: Reports and analytics

Metrics endpoints, dashboard charts, filters, export formats, interactive visualizations.

---

## 2026 roadmap

| Quarter | Focus |
| ------- | ----- |
| **Q1** | Complete check-in UX, segmented comms, FCM setup, check-in E2E tests |
| **Q2** | Analytics dashboard, exports, auto draw, reminders, audit log |
| **Q3** | Mobile MVP (auth, schedules, QR, chat, push, beta) |
| **Q4** | Multi-ministry, performance/load testing, production launch |

### Critical milestones

| Month | Milestone |
| ----- | --------- |
| Jan | Documentation baseline |
| Feb | QR scan UI live |
| Mar | Bulk messaging |
| Apr–Jun | Reports and automation |
| Jul–Sep | Mobile beta |
| Oct–Dec | Scale and production rollout |

### Dependencies and risks

- Firebase for push
- App Store / Play review timelines
- Production infra and user training
- Fair rotation algorithm complexity — prototype early
- Load testing before multi-church scale

---

## Role model (check-in)

| Role | Capabilities |
| ---- | -------------- |
| **Admin / pastor** | Full access, all reports, role assignment |
| **Ministry coordinator** | Manage ministry, teams, ministry reports; cannot scan QR |
| **Team leader** | Manage team, **scan volunteer QR**, manual check-in, team reports |
| **Volunteer** | View schedule, **generate QR**; cannot self check-in |

### QR check-in flow

1. Volunteer generates time-bound QR in app  
2. Leader scans at service  
3. Server validates signature, expiry, team, schedule, duplicate  
4. Attendance recorded with confirmation feedback  

---

## Success metrics

- Adoption > 80% of volunteers  
- QR check-in > 70% of attendance events  
- Median check-in < 30 seconds  
- User satisfaction > 4.5/5  
- Uptime > 99.5%  
- Test coverage > 80%; API p95 < 200 ms  

---

## Related documentation

- [Backend Standards](./backend/BACKEND_STANDARDS.md)
- [Design System](./frontend/DESIGN_SYSTEM.md)
- [API Endpoints](./backend/API_ENDPOINTS.md)
- [Database Schema](./architecture/DATABASE_SCHEMA.md)
- [Vercel Deployment](./devops/VERCEL_DEPLOYMENT.md)

---

## Contact

- **Issues / discussions:** GitHub  
- **Backlog review:** Weekly (Fridays)

**Legend:** ✅ Done · 🚧 In progress · 📝 Planned · ⏸ Paused · ❌ Cancelled
