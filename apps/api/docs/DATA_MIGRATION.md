# Data Migration - Local to Supabase

This document describes how to migrate data from the local database (PostgreSQL) to Supabase.

## 📋 Prerequisites

1. **Local database running**: Ensure local PostgreSQL is running via Docker Compose
2. **Supabase configured**: `DATABASE_URL` must be set in `.env` pointing to Supabase
3. **Migrations executed**: Migrations must be run on Supabase (they run automatically on startup)

## 🔧 Configuration

### 1. Verify environment variables

Ensure `apps/api/.env` contains:

```env
# Local database (source)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=minc_teams
DATABASE_PASSWORD=password
DATABASE_NAME=minc_teams

# Supabase (destination)
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
DATABASE_SSL=true
```

### 2. Run migrations on Supabase

Migrations run automatically when the application starts. To run manually:

```bash
cd apps/api
pnpm migration:run
```

## 🚀 Run Migration

### Full migration

To migrate all data from the local database to Supabase:

```bash
cd apps/api
pnpm migrate:data
```

The script will:

1. Connect à local database (source)
2. Connect to Supabase (destination)
3. Migrate data from all tables in the correct order (respecting foreign keys)
4. Skip duplicate records automatically
5. Show detailed progress

### Migration order

Data is migrated in this order (respecting foreign key dependencies):

1. `churches` - Churches
2. `ministries` - Ministries
3. `persons` - Persons
4. `useres` - Users
5. `teams` - Teams
6. `team_members` - Team members
7. `services` - Worship services
8. `schedules` - Schedules
9. `schedule_teams` - Teams assigned to schedules
10. `attendances` - Check-ins/Attendance
11. `refresh_tokens` - Refresh tokens
12. `password_reset_tokens` - Password reset tokens
13. `schedule_planning_configs` - Planning configurations
14. `team_planning_configs` - Team configurations
15. `schedule_planning_templates` - Planning templates

## 📊 Script Output

The script shows detailed progress:

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

## ⚠️ Conflict Behavior

The script handles conflicts automatically:

- **Duplicate records**: Skipped silently using `ON CONFLICT DO NOTHING`
- **Invalid foreign keys**: Script stops on the failing table but continues with the rest
- **Empty tables**: Skipped automatically

### Tables with special conflict handling:

- `useres`: Conflict on `email`
- `refresh_tokens`: Conflict on `token`
- `password_reset_tokens`: Conflict on `token`
- `team_members`: Conflict on `(team_id, person_id)`
- `schedule_teams`: Conflict on `(schedule_id, team_id)`
- `attendances`: Conflict on `(schedule_id, person_id)`
- Other tables: Conflict on `id`

## 🔍 Verify Migration

After migration, verify data in Supabase:

1. Open the Supabase dashboard
2. Go to **Table Editor**
3. Check tables and record counts

Or via SQL:

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

### Error: "DATABASE_URL is required"

Ensure `DATABASE_URL` is set in `.env`.

### Error: "Connection refused" (local database)

Ensure local PostgreSQL is running:

```bash
docker-compose up -d postgres
```

### Error: "password authentication failed" (Supabase)

Verify `DATABASE_URL` is correct and the password is URL-encoded properly.

### Data does not appear in Supabase

1. Verify migrations were run on Supabase
2. Check script logs for specific errors
3. Ensure local data does not have `deleted_at IS NOT NULL` (soft delete)

### Partial migration

If migration fails mid-process:

- Already migrated data remains in Supabase
- Run the script again—it will skip duplicate records
- The script is idempotent and can be run multiple times

## 📝 Important Notes

1. **Soft Delete**: The script migrates only records where `deleted_at IS NULL`
2. **Transactions**: Each table is migrated in a separate transaction
3. **Batch Processing**: Data is inserted in batches of 100 records
4. **Idempotency**: The script can be run multiple times without duplicating data

## 🔄 Reverse Migration

To migrate data from Supabase to local (not implemented), you would need to:

1. Swap source and destination connections in the script
2. Or create a separate `migrate-data-reverse.ts` script

## 📚 References

- [TypeORM Migrations](https://typeorm.io/migrations)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
