# Environment Variables - Backend API

This document describes all environment variables required for the backend.

## Required Variables

### Database

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=minc_teams
DATABASE_PASSWORD=password
DATABASE_NAME=minc_teams
```

### JWT

```env
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRATION_DAYS=7
```

## Optional Variables

### Application

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES=60
```

## How to Configure

1. Create a `.env` file at the root of `apps/api/`
2. Copy the variables above and adjust values as needed
3. **IMPORTANT**: Never commit the `.env` file à repository

## Complete Example

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
