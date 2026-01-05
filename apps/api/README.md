# MINC Teams API

Backend API para o sistema MINC Teams - Minha Igreja na Cidade.

## Tecnologias

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Passport** - Estratégias de autenticação
- **Swagger** - Documentação da API

## Pré-requisitos

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker e Docker Compose (para PostgreSQL)

## Configuração Rápida

Para uma configuração rápida, use o script de setup:

```bash
cd apps/api
./scripts/setup.sh
```

Ou siga os passos manuais abaixo.

## Configuração Manual

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto `apps/api/` com as seguintes variáveis:

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

### 2. Subir o PostgreSQL

Na raiz do projeto (connexto-minc-hub), execute:

```bash
docker-compose up -d
```

Isso irá subir o PostgreSQL em um container Docker.

Para verificar se está rodando:
```bash
docker-compose ps
```

### 3. Instalar Dependências

Na raiz do projeto (connexto-minc-hub):

```bash
pnpm install
```

Isso instalará as dependências de todos os apps, incluindo o backend.

## Executando

### Desenvolvimento

Na raiz do projeto:
```bash
pnpm dev
```

Ou diretamente em `apps/api/`:
```bash
cd apps/api
pnpm dev
```

A API estará disponível em `http://localhost:3001/minc-teams/v1`

### Build

```bash
pnpm build
```

### Produção

```bash
pnpm start:prod
```

## Documentação

A documentação Swagger está disponível em:

```
http://localhost:3001/minc-teams/v1/docs
```

## Estrutura do Projeto

```
apps/api/
├── src/
│   ├── main.ts                 # Entry point
│   ├── app.module.ts           # Módulo principal
│   ├── app.controller.ts       # Controller principal
│   ├── app.service.ts          # Service principal
│   ├── auth/                   # Módulo de autenticação
│   ├── users/                  # Módulo de usuários
│   ├── common/                 # Utilitários compartilhados
│   └── config/                 # Configurações
├── test/                       # Testes E2E
└── package.json
```

## Endpoints Principais

### Autenticação

- `POST /minc-teams/v1/auth/login` - Login
- `POST /minc-teams/v1/auth/refresh-token` - Refresh token
- `POST /minc-teams/v1/auth/logout` - Logout
- `POST /minc-teams/v1/auth/forgot-password` - Solicitar recuperação de senha
- `POST /minc-teams/v1/auth/reset-password` - Resetar senha
- `GET /minc-teams/v1/auth/me` - Obter usuário atual

### Churches (Igrejas)

- `GET /minc-teams/v1/churches` - Listar todas as igrejas
- `GET /minc-teams/v1/churches/:id` - Obter igreja por ID
- `POST /minc-teams/v1/churches` - Criar nova igreja
- `PATCH /minc-teams/v1/churches/:id` - Atualizar igreja
- `DELETE /minc-teams/v1/churches/:id` - Remover igreja (soft delete)

### Ministries (Ministérios)

- `GET /minc-teams/v1/ministries` - Listar todos os ministérios
- `GET /minc-teams/v1/ministries?churchId=uuid` - Filtrar por igreja
- `GET /minc-teams/v1/ministries/:id` - Obter ministério por ID
- `POST /minc-teams/v1/ministries` - Criar novo ministério
- `PATCH /minc-teams/v1/ministries/:id` - Atualizar ministério
- `DELETE /minc-teams/v1/ministries/:id` - Remover ministério (soft delete)

### Persons (Pessoas/Servos)

- `GET /minc-teams/v1/persons` - Listar todas as pessoas
- `GET /minc-teams/v1/persons?ministryId=uuid` - Filtrar por ministério
- `GET /minc-teams/v1/persons?teamId=uuid` - Filtrar por equipe
- `GET /minc-teams/v1/persons/:id` - Obter pessoa por ID
- `POST /minc-teams/v1/persons` - Criar nova pessoa
- `PATCH /minc-teams/v1/persons/:id` - Atualizar pessoa
- `DELETE /minc-teams/v1/persons/:id` - Remover pessoa (soft delete)

### Services (Cultos/Serviços)

- `GET /minc-teams/v1/services` - Listar todos os cultos
- `GET /minc-teams/v1/services?churchId=uuid` - Filtrar por igreja
- `GET /minc-teams/v1/services/:id` - Obter culto por ID
- `POST /minc-teams/v1/services` - Criar novo culto
- `PATCH /minc-teams/v1/services/:id` - Atualizar culto
- `DELETE /minc-teams/v1/services/:id` - Remover culto (soft delete)

### Teams (Equipes)

- `GET /minc-teams/v1/teams` - Listar todas as equipes
- `GET /minc-teams/v1/teams?ministryId=uuid` - Filtrar por ministério
- `GET /minc-teams/v1/teams/:id` - Obter equipe por ID
- `POST /minc-teams/v1/teams` - Criar nova equipe
- `PATCH /minc-teams/v1/teams/:id` - Atualizar equipe
- `DELETE /minc-teams/v1/teams/:id` - Remover equipe (soft delete)
- `POST /minc-teams/v1/teams/:id/members` - Adicionar membro à equipe
- `GET /minc-teams/v1/teams/:id/members` - Listar membros da equipe
- `DELETE /minc-teams/v1/teams/:id/members/:personId` - Remover membro da equipe

### Schedules (Escalas)

- `GET /minc-teams/v1/schedules` - Listar todas as escalas
- `GET /minc-teams/v1/schedules?serviceId=uuid` - Filtrar por culto
- `GET /minc-teams/v1/schedules?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Filtrar por período
- `GET /minc-teams/v1/schedules/:id` - Obter escala por ID
- `POST /minc-teams/v1/schedules` - Criar nova escala
- `PATCH /minc-teams/v1/schedules/:id` - Atualizar escala
- `DELETE /minc-teams/v1/schedules/:id` - Remover escala (soft delete)
- `POST /minc-teams/v1/schedules/:id/teams` - Adicionar equipe à escala
- `GET /minc-teams/v1/schedules/:id/teams` - Listar equipes da escala
- `DELETE /minc-teams/v1/schedules/:id/teams/:teamId` - Remover equipe da escala

### Attendances (Check-ins)

- `GET /minc-teams/v1/attendances` - Listar todos os check-ins
- `GET /minc-teams/v1/attendances?scheduleId=uuid` - Filtrar por escala
- `GET /minc-teams/v1/attendances?personId=uuid` - Filtrar por pessoa
- `GET /minc-teams/v1/attendances/schedule/:scheduleId/stats` - Estatísticas de presença
- `GET /minc-teams/v1/attendances/:id` - Obter check-in por ID
- `POST /minc-teams/v1/attendances` - Registrar check-in
- `PATCH /minc-teams/v1/attendances/:id` - Atualizar check-in
- `DELETE /minc-teams/v1/attendances/:id` - Remover check-in

## Comandos Úteis

```bash
# Subir PostgreSQL
docker-compose up -d

# Parar PostgreSQL
docker-compose down

# Ver logs do PostgreSQL
docker-compose logs -f postgres

# Limpar dados do PostgreSQL
docker-compose down -v

# Executar migrations (quando implementadas)
pnpm migration:run

# Reverter última migration
pnpm migration:revert
```

## Status da Implementação

### ✅ Concluído

- [x] Docker Compose para PostgreSQL
- [x] Estrutura base do NestJS
- [x] Configuração TypeORM
- [x] Sistema de autenticação completo (JWT com cookies HttpOnly)
- [x] Entidades principais criadas:
  - User, RefreshToken, PasswordResetToken
  - Person, Church, Ministry, Team, TeamMember
  - Service, Schedule, ScheduleTeam
  - Attendance
- [x] Módulos básicos criados para todas as entidades
- [x] Migration inicial criada (cria todas as tabelas base)

### ✅ Concluído - Módulos de Negócio

- [x] Churches (Igrejas) - CRUD completo
- [x] Ministries (Ministérios) - CRUD completo com filtros
- [x] Persons (Pessoas/Servos) - CRUD completo com filtros
- [x] Services (Cultos/Serviços) - CRUD completo
- [x] Teams (Equipes) - CRUD completo + gestão de membros
- [x] Schedules (Escalas) - CRUD completo + gestão de equipes
- [x] Attendances (Check-ins) - CRUD completo + estatísticas

### 🚧 Próximos Passos

- [ ] Validações e regras de negócio avançadas
- [ ] Sorteio automático de equipes
- [ ] Remanejamento manual
- [ ] Relatórios e dashboards
- [ ] Sistema de QR Code

### 📋 Próximos Passos

- [ ] Implementar migrations do TypeORM
- [ ] Criar services e controllers para cada módulo
- [ ] Implementar endpoints CRUD
- [ ] Adicionar testes
- [ ] Configurar CI/CD

## Migrations

Após configurar o banco de dados, execute a migration inicial:

```bash
cd apps/api
pnpm migration:run
```

Isso criará todas as tabelas no banco de dados.

Para mais informações sobre migrations, consulte [MIGRATIONS.md](./MIGRATIONS.md).

## Documentação Adicional

- [SETUP.md](./SETUP.md) - Guia completo de setup passo a passo com troubleshooting
- [ENV_VARIABLES.md](./ENV_VARIABLES.md) - Documentação detalhada das variáveis de ambiente
- [MIGRATIONS.md](./MIGRATIONS.md) - Guia completo sobre migrations
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Documentação completa de todos os endpoints
- [CHAT_API.md](./CHAT_API.md) - Especificação completa da API de Chat (baseada na implementação mobile)
- [scripts/setup.sh](./scripts/setup.sh) - Script automatizado de setup
