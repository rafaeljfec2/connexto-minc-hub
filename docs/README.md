# MINC Teams — Documentation

> **Welcome Team Management System**  
> Minha Igreja na Cidade

## Overview

Central documentation index for MINC Teams — people, teams, and schedule management for the Welcome ministry.

**Stack:**

- **Web:** React, TypeScript, Vite, Tailwind CSS
- **Mobile:** React Native, Expo
- **Backend:** NestJS, TypeScript, PostgreSQL
- **Monorepo:** pnpm, Turborepo

---

## Documentation map

### Architecture

| Document | Description |
| -------- | ----------- |
| [DATABASE_SCHEMA](./architecture/DATABASE_SCHEMA.md) | Database schema |
| [SYSTEM_ARCHITECTURE](./architecture/SYSTEM_ARCHITECTURE.md) | System architecture |
| [REFACTORING_HISTORY](./architecture/REFACTORING_HISTORY.md) | Refactoring history |

### Backend

| Document | Description |
| -------- | ----------- |
| [**BACKEND_STANDARDS**](./backend/BACKEND_STANDARDS.md) | Backend development standards |
| [API_ENDPOINTS](./backend/API_ENDPOINTS.md) | REST API reference |
| [API_RESPONSE_CONTRACT](./backend/API_RESPONSE_CONTRACT.md) | Response envelope |
| [CHAT_API](./backend/CHAT_API.md) | Chat REST + WebSocket |
| [MIGRATIONS](./backend/MIGRATIONS.md) | Migrations guide |
| [SETUP](./backend/SETUP.md) | Backend setup |

### Frontend

| Document | Description |
| -------- | ----------- |
| [**DESIGN_SYSTEM**](./frontend/DESIGN_SYSTEM.md) | Design system |
| [WEB_PATTERNS](./frontend/WEB_PATTERNS.md) | Web patterns |

### Mobile

| Document | Description |
| -------- | ----------- |
| [MOBILE_STRATEGY](./mobile/MOBILE_STRATEGY.md) | Mobile strategy |
| [ANDROID_SETUP](./mobile/ANDROID_SETUP.md) | Android setup |
| [IOS_SETUP](./mobile/IOS_SETUP.md) | iOS / TestFlight |
| [WEB_PATTERN_IMPLEMENTATION](./mobile/WEB_PATTERN_IMPLEMENTATION.md) | Shared web patterns on mobile |
| [QR_CODE_IMPLEMENTATION](./mobile/QR_CODE_IMPLEMENTATION.md) | QR check-in |

### DevOps

| Document | Description |
| -------- | ----------- |
| [VERCEL_DEPLOYMENT](./devops/VERCEL_DEPLOYMENT.md) | Vercel deployment |
| [ENV_VARIABLES](./devops/ENV_VARIABLES.md) | Environment variables |
| [DATA_MIGRATION](./devops/DATA_MIGRATION.md) | Data migration |

### Quality

| Document | Description |
| -------- | ----------- |
| [ESLINT_PRETTIER_CONFIG](./quality/ESLINT_PRETTIER_CONFIG.md) | Lint and format |
| [TESTING_STANDARDS](./quality/TESTING_STANDARDS.md) | Testing standards |

### Process

| Document | Description |
| -------- | ----------- |
| [BACKLOG](./process/BACKLOG.md) | Project backlog index |
| [DEVELOPMENT_PROGRESS](./process/DEVELOPMENT_PROGRESS.md) | Progress log |
| [INSIGHTS](./process/INSIGHTS.md) | Learnings |

### Infrastructure

| Document | Description |
| -------- | ----------- |
| [DOCKER_SETUP](./infra/DOCKER_SETUP.md) | Docker setup |

---

## Quick start

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8
- PostgreSQL ≥ 14
- Docker (optional)

### Install and run

```bash
git clone <repo-url>
cd connexto-minc-hub
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cd apps/api && pnpm migration:run
cd ../.. && pnpm dev
```

### URLs

- Web: http://localhost:3000
- API: http://localhost:3001
- Swagger: http://localhost:3001/api/docs

---

## Role-based quick guides

**Frontend:** [Design System](./frontend/DESIGN_SYSTEM.md) → [Web patterns](./frontend/WEB_PATTERNS.md)

**Backend:** [Backend standards](./backend/BACKEND_STANDARDS.md) → [Schema](./architecture/DATABASE_SCHEMA.md) → [API](./backend/API_ENDPOINTS.md)

**Mobile:** [Strategy](./mobile/MOBILE_STRATEGY.md) → platform setup docs

**DevOps:** [Vercel](./devops/VERCEL_DEPLOYMENT.md) → [Env vars](./devops/ENV_VARIABLES.md)

---

## Feature status (summary)

**MVP:** auth, CRUD modules, chat, schedules, segmented comms

**In progress:** QR check-in UI, reports, push notifications, mobile app

**Roadmap:** automation, calendar integration, multi-ministry expansion

---

## Contributing

1. Branch from `main`
2. Implement with tests and lint clean (`pnpm lint`, `pnpm test`)
3. Open a PR; keep **documentation** updated

**Commit prefixes:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## Support

- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- Docs marked ⭐ are recommended for onboarding

---

**Last updated:** 2026-01-10
