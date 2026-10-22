# MINC Teams API

Backend API for the MINC Teams system - Minha Church na Cidade.

## Technologies

- **NestJS** - Node.js framework
- **TypeORM** - ORM for PostgreSQL
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Passport** - Authentication strategies
- **Swagger** - API documentation

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker and Docker Compose (for PostgreSQL)

## Quick Setup

For a quick setup, use the setup script:

```bash
cd apps/api
./scripts/setup.sh
```

Or follow the manual steps below.

## Manual Setup

### 1. Environment Variables

Create a `.env` file at the root of `apps/api/` with the following variables:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=minc_teams
DATABASE_PASSWORD=password
DATABASE_NAME=minc_teams

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRATION_DAYS=7

# App
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 2. Start PostgreSQL

At the project root (connexto-minc-hub), run:

```bash
docker-compose up -d
```

This starts PostgreSQL in a Docker container.

To verify it is running:

```bash
docker-compose ps
```

### 3. Install Dependencies

At the project root (connexto-minc-hub):

```bash
pnpm install
```

This installs dependencies for all apps, including the backend.

## Running

### Development

At the project root:

```bash
pnpm dev
```

Or directly in `apps/api/`:

```bash
cd apps/api
pnpm dev
```

The API will be available at `http://localhost:3001/minc-teams/v1`

### Build

```bash
pnpm build
```

### Production

```bash
pnpm start:prod
```

## Documentation

Swagger documentation is available at:

```
http://localhost:3001/minc-teams/v1/docs
```

## Project Structure

```
apps/api/
├── src/
│   ├── main.ts                 # Entry point
│   ├── app.module.ts           # Main module
│   ├── app.controller.ts       # Main controller
│   ├── app.service.ts          # Main service
│   ├── auth/                   # Authentication module
│   ├── useres/                  # Users module
│   ├── common/                 # Shared utilities
│   └── config/                 # Configuration
├── test/                       # E2E tests
└── package.json
```

## Main Endpoints

### Authentication

- `POST /minc-teams/v1/auth/login` - Login
- `POST /minc-teams/v1/auth/refresh-token` - Refresh token
- `POST /minc-teams/v1/auth/logout` - Logout
- `POST /minc-teams/v1/auth/forgot-password` - Request password recovery
- `POST /minc-teams/v1/auth/reset-password` - Reset password
- `GET /minc-teams/v1/auth/me` - Get current user

### Churches

- `GET /minc-teams/v1/churches` - List all churches
- `GET /minc-teams/v1/churches/:id` - Get church by ID
- `POST /minc-teams/v1/churches` - Create new church
- `PATCH /minc-teams/v1/churches/:id` - Update church
- `DELETE /minc-teams/v1/churches/:id` - Remove church (soft delete)

### Ministries

- `GET /minc-teams/v1/ministries` - List all ministries
- `GET /minc-teams/v1/ministries?churchId=uuid` - Filter by church
- `GET /minc-teams/v1/ministries/:id` - Get ministry by ID
- `POST /minc-teams/v1/ministries` - Create new ministry
- `PATCH /minc-teams/v1/ministries/:id` - Update ministry
- `DELETE /minc-teams/v1/ministries/:id` - Remove ministry (soft delete)

### Persons

- `GET /minc-teams/v1/persons` - List all persons
- `GET /minc-teams/v1/persons?ministryId=uuid` - Filter by ministry
- `GET /minc-teams/v1/persons?teamId=uuid` - Filter by team
- `GET /minc-teams/v1/persons/:id` - Get person by ID
- `POST /minc-teams/v1/persons` - Create new person
- `PATCH /minc-teams/v1/persons/:id` - Update person
- `DELETE /minc-teams/v1/persons/:id` - Remove person (soft delete)

### Services

- `GET /minc-teams/v1/services` - List all worship services
- `GET /minc-teams/v1/services?churchId=uuid` - Filter by church
- `GET /minc-teams/v1/services/:id` - Get service by ID
- `POST /minc-teams/v1/services` - Create new service
- `PATCH /minc-teams/v1/services/:id` - Update service
- `DELETE /minc-teams/v1/services/:id` - Remove service (soft delete)

### Teams

- `GET /minc-teams/v1/teams` - List all teams
- `GET /minc-teams/v1/teams?ministryId=uuid` - Filter by ministry
- `GET /minc-teams/v1/teams/:id` - Get team by ID
- `POST /minc-teams/v1/teams` - Create new team
- `PATCH /minc-teams/v1/teams/:id` - Update team
- `DELETE /minc-teams/v1/teams/:id` - Remove team (soft delete)
- `POST /minc-teams/v1/teams/:id/members` - Add member to team
- `GET /minc-teams/v1/teams/:id/members` - List team members
- `DELETE /minc-teams/v1/teams/:id/members/:personId` - Remove member from team

### Schedules

- `GET /minc-teams/v1/schedules` - List all schedules
- `GET /minc-teams/v1/schedules?serviceId=uuid` - Filter by service
- `GET /minc-teams/v1/schedules?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Filter by date range
- `GET /minc-teams/v1/schedules/:id` - Get schedule by ID
- `POST /minc-teams/v1/schedules` - Create new schedule
- `PATCH /minc-teams/v1/schedules/:id` - Update schedule
- `DELETE /minc-teams/v1/schedules/:id` - Remove schedule (soft delete)
- `POST /minc-teams/v1/schedules/:id/teams` - Add team to schedule
- `GET /minc-teams/v1/schedules/:id/teams` - List schedule teams
- `DELETE /minc-teams/v1/schedules/:id/teams/:teamId` - Remove team from schedule

### Attendances (Check-ins)

- `GET /minc-teams/v1/attendances` - List all check-ins
- `GET /minc-teams/v1/attendances?scheduleId=uuid` - Filter by schedule
- `GET /minc-teams/v1/attendances?personId=uuid` - Filter by person
- `GET /minc-teams/v1/attendances/schedule/:scheduleId/stats` - Attendance statistics
- `GET /minc-teams/v1/attendances/:id` - Get check-in by ID
- `POST /minc-teams/v1/attendances` - Record check-in
- `PATCH /minc-teams/v1/attendances/:id` - Update check-in
- `DELETE /minc-teams/v1/attendances/:id` - Remove check-in

## Useful Commands

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View PostgreSQL logs
docker-compose logs -f postgres

# Clear PostgreSQL data
docker-compose down -v

# Run migrations (when implemented)
pnpm migration:run

# Revert last migration
pnpm migration:revert
```

## Implementation Status

### ✅ Completed

- [x] Docker Compose for PostgreSQL
- [x] Base NestJS structure
- [x] TypeORM configuration
- [x] Complete authentication system (JWT with HttpOnly cookies)
- [x] Main entities created:
  - User, RefreshToken, PasswordResetToken
  - Person, Church, Ministry, Team, TeamMember
  - Service, Schedule, ScheduleTeam
  - Attendance
- [x] Basic modules created for all entities
- [x] Initial migration created (creates all base tables)

### ✅ Completed - Business Modules

- [x] Churches - full CRUD
- [x] Ministries - full CRUD with filters
- [x] Persons - full CRUD with filters
- [x] Services - full CRUD
- [x] Teams - full CRUD + member management
- [x] Schedules - full CRUD + team management
- [x] Attendances - full CRUD + statistics

### 🚧 Next Steps

- [ ] Advanced validations and business rules
- [ ] Automatic team assignment
- [ ] Manual reassignment
- [ ] Reports and dashboards
- [ ] QR Code system

### 📋 Next Steps

- [ ] Implement TypeORM migrations
- [ ] Create services and controllers for each module
- [ ] Implement CRUD endpoints
- [ ] Add tests
- [ ] Configure CI/CD

## Migrations

After configuring the database, run the initial migration:

```bash
cd apps/api
pnpm migration:run
```

This creates all tables in the database.

For more information about migrations, see [MIGRATIONS.md](./MIGRATIONS.md).

## Additional documentation

- [SETUP.md](./SETUP.md) - Complete step-by-step setup guide with troubleshooting
- [ENV_VARIABLES.md](./ENV_VARIABLES.md) - Detailed environment variable documentation
- [MIGRATIONS.md](./MIGRATIONS.md) - Complete migrations guide
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Complete documentation of all endpoints
- [CHAT_API.md](./CHAT_API.md) - Complete Chat API specification (based on mobile implementation)
- [scripts/setup.sh](./scripts/setup.sh) - Automated setup script
