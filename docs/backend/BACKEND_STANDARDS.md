# Backend Standards

> **Last Updated**: 2026-01-10  
> **Status**: Active

## Overview

Este documento define os padrões de desenvolvimento do backend do MINC Teams, construído com NestJS, TypeScript e PostgreSQL. O objetivo é garantir consistência, manutenibilidade e escalabilidade do código.

## Table of Contents

- [Arquitetura](#arquitetura)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Padrões de API](#padrões-de-api)
- [Controllers](#controllers)
- [Services](#services)
- [Entities e DTOs](#entities-e-dtos)
- [Validação](#validação)
- [Tratamento de Erros](#tratamento-de-erros)
- [Autenticação e Autorização](#autenticação-e-autorização)
- [Database e Migrations](#database-e-migrations)
- [Convenções de Nomenclatura](#convenções-de-nomenclatura)
- [Boas Práticas](#boas-práticas)

---

## Arquitetura

### Padrão Adotado

O backend segue a arquitetura **modular do NestJS**, com separação clara de responsabilidades:

```
Controller → Service → Repository (TypeORM)
```

### Princípios SOLID

- **Single Responsibility**: Cada classe tem uma única responsabilidade
- **Dependency Injection**: Uso extensivo de DI do NestJS
- **Interface Segregation**: DTOs específicos para cada operação
- **Dependency Inversion**: Dependência de abstrações, não implementações

### Camadas da Aplicação

1. **Controllers**: Recebem requisições HTTP, validam entrada, delegam para services
2. **Services**: Contêm lógica de negócio, orquestram operações
3. **Repositories**: Acesso a dados via TypeORM
4. **Entities**: Modelos de dados do banco
5. **DTOs**: Objetos de transferência de dados
6. **Guards**: Autenticação e autorização
7. **Interceptors**: Transformação de resposta, logging
8. **Pipes**: Validação e transformação de dados

---

## Estrutura de Pastas

```
apps/api/src/
├── auth/                    # Módulo de autenticação
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── dto/
│   ├── guards/
│   └── strategies/
├── users/                   # Módulo de usuários
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   ├── entities/
│   │   └── user.entity.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
├── common/                  # Código compartilhado
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/                  # Configurações
│   ├── database.config.ts
│   └── jwt.config.ts
├── migrations/              # Migrações do banco
└── main.ts                  # Entry point
```

### Organização por Módulo

Cada módulo deve conter:

- Controller (rotas)
- Service (lógica de negócio)
- Module (configuração do módulo)
- Entities (modelos de dados)
- DTOs (validação de entrada/saída)

---

## Padrões de API

### REST API

Seguimos os princípios REST com versionamento de API:

```
Base URL: http://localhost:3001
Versão: Sem prefixo de versão (v1 implícito)
```

### Endpoints Padrão

| Método | Endpoint        | Descrição              |
| ------ | --------------- | ---------------------- |
| GET    | `/resource`     | Listar todos           |
| GET    | `/resource/:id` | Obter por ID           |
| POST   | `/resource`     | Criar novo             |
| PATCH  | `/resource/:id` | Atualizar parcialmente |
| DELETE | `/resource/:id` | Remover (soft delete)  |

### Query Parameters

```typescript
// Filtros
GET /persons?ministryId=uuid&teamId=uuid

// Paginação (quando aplicável)
GET /resource?page=1&limit=10

// Ordenação (quando aplicável)
GET /resource?sortBy=name&order=asc
```

### Response Format

**Sucesso:**

```json
{
  "id": "uuid",
  "name": "Nome",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Erro:**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Status Codes

- `200 OK`: Sucesso
- `201 Created`: Recurso criado
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Não autorizado
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Conflito (duplicação)
- `422 Unprocessable Entity`: Erro de validação
- `500 Internal Server Error`: Erro interno

---

## Controllers

### Estrutura Padrão

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

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
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id)
  }
}
```

### Boas Práticas

- **Responsabilidade única**: Controller apenas roteia e valida
- **Delegação**: Toda lógica de negócio no Service
- **DTOs**: Sempre usar DTOs para validação
- **Decorators**: Usar `@UseGuards()`, `@UseInterceptors()` quando necessário

---

## Services

### Estrutura Padrão

```typescript
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto)
    return this.usersRepository.save(user)
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id) // Verifica se existe
    await this.usersRepository.update(id, updateUserDto)
    return this.findOne(id)
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id)
    await this.usersRepository.softDelete(id) // Soft delete
  }
}
```

### Boas Práticas

- **Async/Await**: Sempre usar async/await para operações assíncronas
- **Validação**: Validar dados antes de salvar
- **Erros**: Lançar exceções apropriadas (NotFoundException, BadRequestException)
- **Transações**: Usar transações para operações complexas
- **Soft Delete**: Preferir soft delete a delete físico

---

## Entities e DTOs

### Entity (TypeORM)

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Ministry } from '../ministries/entities/ministry.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ unique: true })
  email: string

  @Column({ select: false }) // Não retornar por padrão
  password: string

  @Column({
    type: 'enum',
    enum: ['admin', 'coordinator', 'leader', 'member'],
    default: 'member',
  })
  role: string

  @Column({ default: true })
  isActive: boolean

  @Column({ nullable: true })
  personId?: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt?: Date

  // Relações
  @ManyToOne(() => Ministry, { nullable: true })
  @JoinColumn({ name: 'ministryId' })
  ministry?: Ministry
}
```

### Create DTO

```typescript
import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsBoolean } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsEnum(['admin', 'coordinator', 'leader', 'member'])
  role: string

  @IsOptional()
  @IsString()
  personId?: string

  @IsOptional()
  @IsBoolean()
  canCheckIn?: boolean
}
```

### Update DTO

```typescript
import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

---

## Validação

### Class Validator

Usar decorators do `class-validator` nos DTOs:

```typescript
import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator'

export class CreatePersonDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string

  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  phone?: string
}
```

### Validation Pipe

Configurar globalmente em `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Remove propriedades não definidas no DTO
    forbidNonWhitelisted: true, // Lança erro se houver propriedades extras
    transform: true, // Transforma tipos automaticamente
  })
)
```

---

## Tratamento de Erros

### Exception Filters

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const status = exception.getStatus()

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.name,
    })
  }
}
```

### Exceções Comuns

```typescript
// Não encontrado
throw new NotFoundException('User not found')

// Dados inválidos
throw new BadRequestException('Invalid data')

// Não autorizado
throw new UnauthorizedException('Invalid credentials')

// Conflito
throw new ConflictException('Email already exists')
```

---

## Autenticação e Autorização

### JWT Strategy

```typescript
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role }
  }
}
```

### Guards

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler())
    if (!requiredRoles) {
      return true
    }
    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.some(role => user.role === role)
  }
}
```

### Uso

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'coordinator')
@Post()
create(@Body() createDto: CreateDto) {
  return this.service.create(createDto);
}
```

---

## Database e Migrations

### TypeORM Configuration

```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // NUNCA true em produção
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: true,
}
```

### Migrations

```bash
# Criar migration
npm run migration:create -- src/migrations/CreateUsersTable

# Rodar migrations
npm run migration:run

# Reverter migration
npm run migration:revert
```

### Exemplo de Migration

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateUsersTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          // ... outros campos
        ],
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users')
  }
}
```

---

## Convenções de Nomenclatura

### Arquivos

- Controllers: `resource.controller.ts`
- Services: `resource.service.ts`
- Entities: `resource.entity.ts`
- DTOs: `create-resource.dto.ts`, `update-resource.dto.ts`
- Modules: `resource.module.ts`

### Classes

- **PascalCase**: `UsersController`, `UsersService`, `User`
- Sufixos descritivos: `CreateUserDto`, `JwtAuthGuard`

### Métodos

- **camelCase**: `findAll()`, `findOne()`, `create()`
- Verbos descritivos: `findByEmail()`, `updatePassword()`

### Variáveis

- **camelCase**: `userId`, `isActive`, `createdAt`
- Booleans: prefixo `is`, `has`, `should`

---

## Boas Práticas

### Performance

- **Eager Loading**: Evitar, preferir lazy loading
- **Índices**: Criar índices para campos frequentemente consultados
- **Paginação**: Implementar para listas grandes
- **Caching**: Usar Redis para dados frequentemente acessados

### Segurança

- **Validação**: Sempre validar entrada do usuário
- **Sanitização**: Remover dados sensíveis das respostas
- **Rate Limiting**: Implementar para prevenir abuso
- **CORS**: Configurar corretamente
- **Helmet**: Usar para headers de segurança

### Logging

```typescript
import { Logger } from '@nestjs/common'

export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  async create(dto: CreateUserDto) {
    this.logger.log(`Creating user: ${dto.email}`)
    // ...
  }
}
```

### Testing

- **Unit Tests**: Testar services isoladamente
- **Integration Tests**: Testar controllers com banco de dados de teste
- **E2E Tests**: Testar fluxos completos

---

## Related Documentation

- [API Endpoints](./API_ENDPOINTS.md)
- [API Response Contract](./API_RESPONSE_CONTRACT.md)
- [Database Schema](../architecture/DATABASE_SCHEMA.md)
- [Migrations Guide](./MIGRATIONS.md)

## Changelog

- 2026-01-10: Versão inicial dos Backend Standards
