# Development Backlog — MINC Teams (Index)

## Overview

Index of platform-specific backlogs. Detailed historical epics live under `docs/.archive/`:

| Document | Scope |
| -------- | ----- |
| [BACKLOG_BACKEND.md](../.archive/BACKLOG_BACKEND.md) | NestJS + PostgreSQL |
| [BACKLOG_WEB.md](../.archive/BACKLOG_WEB.md) | React + Vite web app |
| [BACKLOG_MOBILE.md](../.archive/BACKLOG_MOBILE.md) | React Native mobile app |

The **canonical consolidated backlog** is [../BACKLOG.md](../BACKLOG.md).

---

## Phase 1 — MVP (delivered on web; API largely complete)

### Done (web foundation)

- Monorepo, responsive UI, theming, CRUD pages (churches, ministries, teams, volunteers, services, schedules)
- Grid/list views, filters, monthly draw view (UI)

### Backend epics (reference)

| Epic | Theme |
| ---- | ----- |
| EPIC-001 | NestJS module structure, PostgreSQL, migrations |
| EPIC-002 | Auth endpoints and JWT |
| EPIC-003 | Users, roles, person linking |
| EPIC-004–006 | Team draw, reassignment, attendance |
| EPIC-007–008 | Segmented messaging, dashboard metrics |
| EPIC-011–016 | Hierarchy, QR generate/validate, manual check-in, reports, automation |
| EPIC-021–024 | Security, tests, API documentation, CI/CD |

### Web epics (reference)

Mirror backend capabilities: auth integration, user admin, draw UI, reassignment, attendance UI, comms, dashboard, QR UI, reports, notifications, multi-ministry (future).

### Mobile epics (Phase 3)

Setup (Expo, navigation, design tokens), auth, home, schedules, QR (volunteer + leader), manual check-in, push, offline queue, profile.

---

## Success KPIs

- Active usage rate  
- QR vs manual check-in ratio  
- Time to check in  
- Error rate and performance  

---

## Prioritization snapshot

| Priority | Backend | Web | Mobile |
| -------- | ------- | --- | ------ |
| **P0** | Core API, auth, users | Auth integration, users UI | — |
| **P1** | Draw, attendance, dashboard | Matching UI epics | — |
| **P2** | Comms, QR APIs, reports | QR scan UI, reports | App setup after API stable |

---

## Suggested roadmap (historical)

- **Q1:** Web MVP + API foundation  
- **Q2:** Business features and attendance  
- **Q3:** QR study and implementation, mobile setup  
- **Q4:** Mobile features, multi-ministry, polish  

---

## User hierarchy (check-in rules)

1. **Pastor / admin** — full system access  
2. **Ministry leader** — ministry scope; no QR scanning  
3. **Team leader** — team scope; **may scan QR** and manual check-in  
4. **Volunteer** — **generates QR**; linked user account required for login  

Volunteers without a linked user account must not access the system.

---

## Updates

- **Backlog version:** 2.0.0  
- **Review cadence:** Weekly  

For prioritization questions, contact the development team.
