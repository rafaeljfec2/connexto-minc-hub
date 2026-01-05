# Setup do Backend - MINC Teams API

Este guia irá ajudá-lo a configurar o backend do zero.

## Pré-requisitos

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker e Docker Compose

## Passo a Passo

### 1. Instalar Dependências

Na raiz do projeto (connexto-minc-hub):

```bash
pnpm install
```

### 2. Subir o PostgreSQL

Na raiz do projeto, execute:

```bash
docker-compose up -d
```

Isso irá:
- Criar um container PostgreSQL
- Criar o banco de dados `minc_teams`
- Configurar usuário e senha padrão

Para verificar se está rodando:

```bash
docker-compose ps
```

Para ver os logs:

```bash
docker-compose logs -f postgres
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` em `apps/api/`:

```bash
cd apps/api
cp .env.example .env
```

Edite o arquivo `.env` e ajuste as variáveis conforme necessário:

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

**IMPORTANTE**: 
- Altere o `JWT_SECRET` para um valor seguro em produção
- Nunca commite o arquivo `.env` no repositório

### 4. Testar a Conexão

Execute o servidor em modo desenvolvimento:

```bash
# Na raiz do projeto
pnpm dev

# Ou diretamente em apps/api
cd apps/api
pnpm dev
```

A API estará disponível em:
- **API**: http://localhost:3001
- **Swagger**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/health

### 5. Verificar se Está Funcionando

Acesse http://localhost:3001/health no navegador ou use curl:

```bash
curl http://localhost:3001/health
```

Você deve receber:

```json
{
  "status": "ok",
  "timestamp": "2024-01-XX..."
}
```

## Comandos Úteis

### Docker Compose

```bash
# Subir o banco
docker-compose up -d

# Parar o banco
docker-compose down

# Parar e remover volumes (limpar dados)
docker-compose down -v

# Ver logs
docker-compose logs -f postgres

# Ver status
docker-compose ps
```

### Desenvolvimento

```bash
# Rodar em modo desenvolvimento (watch mode)
pnpm dev

# Build para produção
pnpm build

# Rodar em produção
pnpm start:prod

# Lint
pnpm lint

# Lint e corrigir
pnpm lint:fix
```

### Migrations (quando implementadas)

```bash
# Criar nova migration
pnpm migration:create src/migrations/NomeDaMigration

# Gerar migration a partir das entidades
pnpm migration:generate src/migrations/NomeDaMigration

# Executar migrations
pnpm migration:run

# Reverter última migration
pnpm migration:revert

# Ver status das migrations
pnpm migration:show
```

## Troubleshooting

### Erro de Conexão com o Banco

1. Verifique se o PostgreSQL está rodando:
   ```bash
   docker-compose ps
   ```

2. Verifique as variáveis de ambiente no `.env`

3. Teste a conexão manualmente:
   ```bash
   docker-compose exec postgres psql -U minc_teams -d minc_teams
   ```

### Porta já em uso

Se a porta 3001 estiver em uso, altere no `.env`:
```env
PORT=3002
```

### Erro de CORS

Certifique-se de que `FRONTEND_URL` e `CORS_ORIGIN` no `.env` correspondem à URL do frontend.

## Próximos Passos

Após o setup básico:

1. ✅ Criar migrations do banco de dados
2. ✅ Implementar endpoints CRUD para cada módulo
3. ✅ Adicionar testes
4. ✅ Configurar CI/CD

## Estrutura do Projeto

```
apps/api/
├── src/
│   ├── main.ts                 # Entry point
│   ├── app.module.ts           # Módulo principal
│   ├── auth/                   # Autenticação
│   ├── users/                  # Usuários
│   ├── churches/               # Igrejas
│   ├── ministries/            # Ministérios
│   ├── teams/                  # Equipes
│   ├── persons/                # Pessoas/Servos
│   ├── services/               # Cultos/Serviços
│   ├── schedules/              # Escalas
│   ├── attendances/            # Check-ins
│   └── config/                 # Configurações
├── .env                        # Variáveis de ambiente (não commitado)
├── .env.example                # Exemplo de variáveis
└── package.json
```

## Suporte

Em caso de problemas, verifique:
- Logs do Docker: `docker-compose logs postgres`
- Logs da aplicação: console onde o `pnpm dev` está rodando
- Documentação do NestJS: https://docs.nestjs.com
- Documentação do TypeORM: https://typeorm.io
