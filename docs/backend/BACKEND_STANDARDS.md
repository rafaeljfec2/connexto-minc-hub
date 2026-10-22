# Backend Standards

> **Last Updated:** 2026-01-10  
> **Status:** Active

## Overview

Development standards for the MINC Teams API (NestJS, TypeScript, PostgreSQL). Goals: consistency, maintainability, and scalability.

## Table of contents

- [Architecture](#architecture)
- [Folder structure](#folder-structure)
- [API patterns](#api-patterns)
- [Controllers](#controllers)
- [Services](#services)
- [Entities and DTOs](#entities-and-dtos)
- [Validation](#validation)
- [Error handling](#error-handling)
- [Authentication and authorization](#authentication-and-authorization)
- [Database and migrations](#database-and-migrations)
- [Naming conventions](#naming-conventions)
- [Best practices](#best-practices)

---

## Architecture

### Module layout

```
Controller → Service → Repository (TypeORM)
```

### SOLID

- **Single responsibility** per class
- **Dependency injection** via NestJS
- **DTOs** per operation; no fat “god” DTOs
- **Depend on abstractions** (interfaces) where it adds clarity

### Layers

1. **Controllers** — HTTP, input validation, delegate to services
2. **Services** — business logic
3. **Repositories** — TypeORM data access
4. **Entities** — persistence models
5. **DTOs** — request/response shapes
6. **Guards / interceptors / pipes** — cross-cutting concerns

---

## Folder structure

```
apps/api/src/
├── auth/
├── users/
├── common/
├── config/
├── migrations/
└── main.ts
```

Each feature module should include controller, service, module, entities, and DTOs.

---

## API patterns

### REST

- Base URL (local): `http://localhost:3001`
- Versioning: implicit v1 (no URL prefix today)

| Method | Path | Action |
| ------ | ---- | ------ |
| GET | `/resource` | List |
| GET | `/resource/:id` | Get by id |
| POST | `/resource` | Create |
| PATCH | `/resource/:id` | Partial update |
| DELETE | `/resource/:id` | Soft delete |

### Query parameters

```
GET /persons?ministryId=uuid&teamId=uuid
GET /resource?page=1&limit=10&sortBy=name&order=asc
```

### Responses

Success: return the resource or list directly (see API response contract).

Error example:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Status codes

| Code | Meaning |
| ---- | ------- |
| 200 | OK |
| 201 | Created |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 422 | Unprocessable entity |
| 500 | Internal error |

---

## Controllers

Keep controllers thin: route, validate DTO, call service.

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id)
  }
}
```

---

## Services

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find()
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return user
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(dto)
    return this.usersRepository.save(user)
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findOne(id)
    await this.usersRepository.update(id, dto)
    return this.findOne(id)
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id)
    await this.usersRepository.softDelete(id)
  }
}
```

Prefer **async/await**, explicit exceptions, transactions for multi-step writes, and **soft delete** where the domain requires history.

---

## Entities and DTOs

Use TypeORM decorators, UUID primary keys, `createdAt` / `updatedAt` / `deletedAt` when applicable.

DTOs use `class-validator` decorators; updates use `PartialType(CreateDto)`.

---

## Validation

Global `ValidationPipe` in `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
```

---

## Error handling

Use Nest HTTP exceptions (`NotFoundException`, `BadRequestException`, etc.) and optional global exception filters for consistent JSON errors.

---

## Authentication and authorization

- JWT access tokens; refresh tokens per project auth module
- `JwtAuthGuard` on protected routes
- `RolesGuard` + `@Roles()` for role-based access

Example:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'coordinator')
@Post()
create(@Body() dto: CreateDto) {
  return this.service.create(dto)
}
```

---

## Database and migrations

- **`synchronize: false`** in production
- Migrations versioned under `apps/api/src/migrations`
- Commands: `migration:run`, `migration:revert` (see [MIGRATIONS](./MIGRATIONS.md))

---

## Naming conventions

| Kind | Convention |
| ---- | ------------ |
| Files | `resource.controller.ts`, `create-resource.dto.ts` |
| Classes | PascalCase |
| Methods / fields | camelCase |
| Booleans | `isActive`, `hasPermission`, `shouldNotify` |

---

## Best practices

**Performance:** indexes on filtered columns, pagination on large lists, avoid N+1 queries.

**Security:** validate all input, never return password hashes, rate-limit auth endpoints, configure CORS and security headers.

**Logging:** use Nest `Logger` in services for important business events.

**Testing:** unit tests for services; integration tests for HTTP flows; target ≥ 80% coverage on critical modules.

---

## Related documentation

- [API Endpoints](./API_ENDPOINTS.md)
- [API Response Contract](./API_RESPONSE_CONTRACT.md)
- [Database Schema](../architecture/DATABASE_SCHEMA.md)
- [Migrations Guide](./MIGRATIONS.md)

## Changelog

- **2026-01-10:** Initial backend standards document
