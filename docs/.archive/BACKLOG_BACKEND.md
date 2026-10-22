# Backend Development Backlog (NestJS + PostgreSQL)

Organized backend work for MINC Teams: NestJS API, PostgreSQL, incremental delivery.

## Phase 1 — Functional MVP

### EPIC-001: NestJS foundation

- [ ] NestJS project setup
- [ ] Module structure (Clean Architecture)
- [ ] PostgreSQL configuration
- [ ] Database migrations
- [ ] Entities and DTOs
- [ ] Domain services
- [ ] REST controllers and routes
- [ ] JWT authentication middleware
- [ ] Role-based authorization guards
- [ ] Input validation (class-validator)
- [ ] Global error handling
- [ ] Logging and monitoring

### EPIC-002: Authentication

- [ ] `POST /auth/login`
- [ ] `POST /auth/refresh`
- [ ] `POST /auth/logout`
- [ ] `POST /auth/forgot-password`
- [ ] `POST /auth/change-password`
- [ ] JWT generation and validation
- [ ] Refresh token rotation
- [ ] Rate limiting on auth endpoints

### EPIC-003: Users and roles

- [ ] System user entity
- [ ] User ↔ Person/Volunteer linking
- [ ] User CRUD endpoints
- [ ] Roles: Admin, Coordinator, Leader, Member
- [ ] Role assignment
- [ ] Rule: volunteer access only when linked to a user
- [ ] User management endpoints

### EPIC-004: Automatic team draw

- [ ] Fair rotation algorithm
- [ ] Draw rules configuration
- [ ] `POST /schedules/draw`
- [ ] Draw history persistence
- [ ] Draw rule validation
- [ ] Notification when teams are drawn

### EPIC-005: Manual reassignment

- [ ] `PUT /schedules/:id/reassign`
- [ ] Change history
- [ ] Audit trail
- [ ] Permission checks
- [ ] Reassignment notifications

### EPIC-006: Attendance

- [ ] Attendance entity
- [ ] `POST /check-ins`
- [ ] `GET /schedules/:id/attendance`
- [ ] `GET /reports/attendance`
- [ ] Attendance metrics
- [ ] QR or manual check-in validation

### EPIC-007: Segmented messaging

- [ ] Message entity
- [ ] `POST /messages`, `GET /messages`
- [ ] Segmentation (ministry, team, volunteer)
- [ ] Firebase Cloud Messaging integration
- [ ] Push notification service
- [ ] Scheduled messages

### EPIC-008: Dashboard metrics

- [ ] `GET /dashboard/attendance`
- [ ] `GET /dashboard/teams`
- [ ] `GET /dashboard/stats`
- [ ] KPI calculation and chart aggregation

### EPIC-011: Hierarchy

- [ ] Hierarchy data model
- [ ] Level-based permission guards
- [ ] Hierarchy management endpoints

## Phase 2 — QR Code, reports, automation

### EPIC-012–016

- QR generation and validation endpoints
- Encrypted payload, expiry, team/schedule checks
- Attendance reports (PDF/Excel)
- Automated reminders and low-attendance alerts
- Notification preferences

## Phase 3 — Expansion

- Multi-ministry data model
- Advanced security (encryption, audit, LGPD delete endpoints)
- Unit and integration tests (80% coverage target)

## Roles (reference)

1. **PASTOR** — full system access  
2. **Ministry leader** — manages ministry  
3. **Team leader** — manages team, can scan QR  
4. **Member / volunteer** — scoped access  

## QR check-in flow

1. Volunteer generates unique QR code  
2. Leader scans QR code  
3. Server validates signature, expiry, team, schedule  
4. Check-in recorded when valid  

## Updates

- **Next review:** weekly  
