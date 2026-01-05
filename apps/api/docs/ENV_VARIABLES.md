# Variáveis de Ambiente - Backend API

Este documento descreve todas as variáveis de ambiente necessárias para o backend.

## Variáveis Obrigatórias

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

## Variáveis Opcionais

### Application

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES=60
```

## Como Configurar

1. Crie um arquivo `.env` na raiz do projeto `apps/api/`
2. Copie as variáveis acima e ajuste os valores conforme necessário
3. **IMPORTANTE**: Nunca commite o arquivo `.env` no repositório

## Exemplo Completo

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
