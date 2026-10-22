# Backend Setup - MINC Teams API

This guide will help you set up the backend from scratch.

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker and Docker Compose

## Step by Step

### 1. Install Dependencies

At the project root (connexto-minc-hub):

```bash
pnpm install
```

### 2. Start PostgreSQL

At the project root, run:

```bash
docker-compose up -d
```

This will:
- Create a PostgreSQL container
- Create the `minc_teams` database
- Configure default user and password

To verify it is running:

```bash
docker-compose ps
```

To view logs:

```bash
docker-compose logs -f postgres
```

### 3. Configure Environment Variables

Create a `.env` file in `apps/api/`:

```bash
cd apps/api
cp .env.example .env
```

Edit the `.env` file and adjust variables as needed:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=minc_teams
DATABASE_PASSWORD=password
DATABASE_NAME=minc_teams

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRATION_DAYS=7

# Application Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Password Reset
RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES=60
```

**IMPORTANT**:
- Change `JWT_SECRET` to a secure value in production
- Never commit the `.env` file to repository

### 4. Test the Connection

Run the server in development mode:

```bash
# At the project root
pnpm dev

# Or directly in apps/api
cd apps/api
pnpm dev
```

The API will be available at:
- **API**: http://localhost:3001
- **Swagger**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/health

### 5. Verify It Works

Open http://localhost:3001/health in the browser or use curl:

```bash
curl http://localhost:3001/health
```

You should receive:

```json
{
  "status": "ok",
  "timestamp": "2024-01-XX..."
}
```

## Useful Commands

### Docker Compose

```bash
# Start the database
docker-compose up -d

# Stop the database
docker-compose down

# Stop and remove volumes (clear data)
docker-compose down -v

# View logs
docker-compose logs -f postgres

# View status
docker-compose ps
```

### Development

```bash
# Run in development mode (watch mode)
pnpm dev

# Production build
pnpm build

# Run in production
pnpm start:prod

# Lint
pnpm lint

# Lint and fix
pnpm lint:fix
```

### Migrations (when implemented)

```bash
# Create a new migration
pnpm migration:create src/migrations/NomeDaMigration

# Generate migration from entities
pnpm migration:generate src/migrations/NomeDaMigration

# Run migrations
pnpm migration:run

# Revert last migration
pnpm migration:revert

# Show migration status
pnpm migration:show
```

## Troubleshooting

### Database Connection Error

1. Verify PostgreSQL is running:
   ```bash
   docker-compose ps
   ```

2. Check environment variables in `.env`

3. Test the connection manually:
   ```bash
   docker-compose exec postgres psql -U minc_teams -d minc_teams
   ```

### Port Already in Use

If port 3001 is in use, change it in `.env`:
```env
PORT=3002
```

### CORS Error

Make sure `FRONTEND_URL` and `CORS_ORIGIN` in `.env` match the frontend URL.

## Next Steps

After basic setup:

1. ✅ Create database migrations
2. ✅ Implement CRUD endpoints for each module
3. ✅ Add tests
4. ✅ Configure CI/CD

## Project Structure

```
apps/api/
├── src/
│   ├── main.ts                 # Entry point
│   ├── app.module.ts           # Main module
│   ├── auth/                   # Authentication
│   ├── users/                  # Users
│   ├── churches/               # Churches
│   ├── ministries/            # Ministries
│   ├── teams/                  # Teams
│   ├── persons/                # Persons/Volunteers
│   ├── services/               # Worship services
│   ├── schedules/              # Schedules
│   ├── attendances/            # Check-ins
│   └── config/                 # Configuration
├── .env                        # Environment variables (not committed)
├── .env.example                # Example variables
└── package.json
```

## Support

If you run into issues, check:
- Docker logs: `docker-compose logs postgres`
- Application logs: console where `pnpm dev` is running
- NestJS documentation: https://docs.nestjs.com
- TypeORM documentation: https://typeorm.io
