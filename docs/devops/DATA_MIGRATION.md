# Migração de Dados - Local para Supabase

Este documento descreve como migrar dados do banco de dados local (PostgreSQL) para o Supabase.

## 📋 Pré-requisitos

1. **Banco local rodando**: Certifique-se de que o PostgreSQL local está rodando via Docker Compose
2. **Supabase configurado**: A variável `DATABASE_URL` deve estar configurada no `.env` apontando para o Supabase
3. **Migrations executadas**: As migrations devem estar executadas no Supabase (elas são executadas automaticamente na inicialização)

## 🔧 Configuração

### 1. Verificar variáveis de ambiente

Certifique-se de que o arquivo `.env` em `apps/api/.env` contém:

```env
# Banco local (usado como origem)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=minc_teams
DATABASE_PASSWORD=password
DATABASE_NAME=minc_teams

# Supabase (usado como destino)
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
DATABASE_SSL=true
```

### 2. Executar migrations no Supabase

As migrations são executadas automaticamente quando a aplicação inicia. Se precisar executar manualmente:

```bash
cd apps/api
pnpm migration:run
```

## 🚀 Executar Migração

### Migração completa

Para migrar todos os dados do banco local para o Supabase:

```bash
cd apps/api
pnpm migrate:data
```

O script irá:
1. Conectar ao banco local (origem)
2. Conectar ao Supabase (destino)
3. Migrar dados de todas as tabelas na ordem correta (respeitando foreign keys)
4. Pular registros duplicados automaticamente
5. Mostrar progresso detalhado

### Ordem de migração

Os dados são migrados na seguinte ordem (respeitando dependências de foreign keys):

1. `churches` - Igrejas
2. `ministries` - Ministérios
3. `persons` - Pessoas
4. `users` - Usuários
5. `teams` - Equipes
6. `team_members` - Membros de equipes
7. `services` - Serviços/Cultos
8. `schedules` - Escalas
9. `schedule_teams` - Equipes atribuídas às escalas
10. `attendances` - Check-ins/Presenças
11. `refresh_tokens` - Tokens de refresh
12. `password_reset_tokens` - Tokens de reset de senha
13. `schedule_planning_configs` - Configurações de planejamento
14. `team_planning_configs` - Configurações de equipes
15. `schedule_planning_templates` - Templates de planejamento

## 📊 Saída do Script

O script mostra progresso detalhado:

```
🚀 Starting data migration from local database to Supabase...

📦 Connecting to local database...
✅ Connected to local database

📦 Connecting to Supabase...
✅ Connected to Supabase

📊 Migrating churches...
  📥 Found 2 records
  ✅ Migrated 2 records

📊 Migrating ministries...
  📥 Found 5 records
  ✅ Migrated 5 records

...

✅ Migration completed! Total records migrated: 150
```

## ⚠️ Comportamento de Conflitos

O script trata conflitos automaticamente:

- **Registros duplicados**: São pulados silenciosamente usando `ON CONFLICT DO NOTHING`
- **Foreign keys inválidas**: O script para na tabela com erro, mas continua com as próximas
- **Tabelas vazias**: São puladas automaticamente

### Tabelas com tratamento especial de conflitos:

- `users`: Conflito em `email`
- `refresh_tokens`: Conflito em `token`
- `password_reset_tokens`: Conflito em `token`
- `team_members`: Conflito em `(team_id, person_id)`
- `schedule_teams`: Conflito em `(schedule_id, team_id)`
- `attendances`: Conflito em `(schedule_id, person_id)`
- Outras tabelas: Conflito em `id`

## 🔍 Verificar Migração

Após a migração, você pode verificar os dados no Supabase:

1. Acesse o painel do Supabase
2. Vá em **Table Editor**
3. Verifique as tabelas e contagem de registros

Ou via SQL:

```sql
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

## 🛠️ Troubleshooting

### Erro: "DATABASE_URL is required"

Certifique-se de que a variável `DATABASE_URL` está configurada no `.env`.

### Erro: "Connection refused" (banco local)

Certifique-se de que o PostgreSQL local está rodando:

```bash
docker-compose up -d postgres
```

### Erro: "password authentication failed" (Supabase)

Verifique se a `DATABASE_URL` está correta e se a senha está URL-encoded corretamente.

### Dados não aparecem no Supabase

1. Verifique se as migrations foram executadas no Supabase
2. Verifique os logs do script para erros específicos
3. Certifique-se de que os dados no banco local não estão com `deleted_at IS NOT NULL` (soft delete)

### Migração parcial

Se a migração falhar no meio do processo:
- Os dados já migrados permanecerão no Supabase
- Execute o script novamente - ele pulará registros duplicados
- O script é idempotente e pode ser executado múltiplas vezes

## 📝 Notas Importantes

1. **Soft Delete**: O script migra apenas registros onde `deleted_at IS NULL`
2. **Transações**: Cada tabela é migrada em uma transação separada
3. **Batch Processing**: Os dados são inseridos em lotes de 100 registros
4. **Idempotência**: O script pode ser executado múltiplas vezes sem duplicar dados

## 🔄 Migração Reversa

Para migrar dados do Supabase para o local (não implementado), você precisaria:
1. Trocar as conexões de origem e destino no script
2. Ou criar um script separado `migrate-data-reverse.ts`

## 📚 Referências

- [TypeORM Migrations](https://typeorm.io/migrations)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
