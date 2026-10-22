# Migrations - MINC Teams API

This document explains how to work with TypeORM migrations in the project.

## What Are Migrations?

Migrations are files that describe database schema changes in a versioned, controlled way. They allow you to:

- Version database changes
- Apply changes consistently across environments
- Revert changes when needed
- Collaborate as a team with a history of changes

## Available Commands

### Create a New Migration

To create an empty migration (you write the SQL manually):

```bash
pnpm migration:create src/migrations/NomeDaMigration
```

**Example:**
```bash
pnpm migration:create src/migrations/AddEmailToPersons
```

### Generate Migration Automatically

To generate a migration based on entity changes:

```bash
pnpm migration:generate src/migrations/NomeDaMigration
```

**Example:**
```bash
pnpm migration:generate src/migrations/AddEmailToPersons
```

⚠️ **Note**: This command compstates entities with the current database. Make sure the database is up to date before using it.

### Run Migrations

To apply all pending migrations:

```bash
pnpm migration:run
```

### Revert Last Migration

To revert the last executed migration:

```bash
pnpm migration:revert
```

### View Migration Status

To see which migrations have been run and which are pending:

```bash
pnpm migration:show
```

## Migration Structure

A typical migration has this structure:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class NomeDaMigration1234567890123 implements MigrationInterface {
  name = 'NomeDaMigration1234567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Code to apply the migration
    await queryRunner.query(`CREATE TABLE ...`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Code to revert the migration
    await queryRunner.query(`DROP TABLE ...`);
  }
}
```

### Methods

- **`up()`**: Run when the migration is applied. Contains the changes to make.
- **`down()`**: Run when the migration is reverted. Must undo what `up()` did.

## Initial Migration

The initial migration (`1700000000000-InitialSchema.ts`) creates all base system tables:

1. **churches** - Churches
2. **ministries** - Ministries/Teams
3. **persons** - Persons/Volunteers
4. **users** - System users
5. **teams** - Teams
6. **team_members** - N:N relationship between teams and persons
7. **services** - Worship services
8. **schedules** - Schedules
9. **schedule_teams** - N:N relationship between schedules and teams
10. **attendances** - Check-ins/Attendance
11. **refresh_tokens** - Refresh tokens
12. **password_reset_tokens** - Password reset tokens

It also creates:
- ENUMs: `service_type`, `attendance_method`
- Índicees for performance
- Triggers for automatic `updated_at`
- Referential integrity constraints

## Creation Order

The initial migration follows the correct order respecting foreign key dependencies:

1. First creates tables without dependencies (churches)
2. Then creates tables that depend on previous ones
3. Finally creates N:N relationships and auxiliary tables

## Best Practices

### 1. Naming

Use descriptive names that explain what the migration does:

- ✅ `AddEmailToPersons`
- ✅ `CreateAuditLogsTable`
- ✅ `AddÍndiceToUsersEmail`
- ❌ `Migration1`
- ❌ `Update`

### 2. Always Implement `down()`

Every migration must have a `down()` method that reverts the changes:

```typescript
public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`DROP TABLE IF EXISTS audit_logs;`);
}
```

### 3. Use Transactions

TypeORM runs migrations in transactions automatically, but you can create custom transactions if needed.

### 4. Test in Development First

Always test migrations in development before applying in production:

```bash
# 1. Test locally
pnpm migration:run

# 2. Verify it worked
pnpm migration:show

# 3. If needed, revert
pnpm migration:revert
```

### 5. Do Not Modify Already Executed Migrations

If a migration has already been run in production, **do not modify it**. Create a new migration for adjustments.

### 6. Backup Before Important Migrations

Always back up the database before running migrations in production:

```bash
# PostgreSQL backup example
pg_dump -U minc_teams -d minc_teams > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Troubleshooting

### Error: "Migration already executed"

If you try to run a migration that has already been executed, TypeORM will skip it. This is normal.

### Error: "Migration failed"

If a migration fails:

1. Check the error logs
2. Fix the issue in the migration
3. If needed, revert: `pnpm migration:revert`
4. Fix and run again: `pnpm migration:run`

### Error: "Cannot find migration"

Make sure:
- The file is in the `src/migrations/` folder
- The class name matches the file name
- The timestamp in the name is correct

### Clear All Migrations (Development Only)

⚠️ **WARNING**: Use only in development!

```bash
# Connect to database
docker-compose exec postgres psql -U minc_teams -d minc_teams

# Delete migrations table
DROP TABLE IF EXISTS migrations;

# Exit
\q
```

Then run migrations again:
```bash
pnpm migration:run
```

## Upcoming Migrations

Future migrations may include:

- [ ] `schedule_reassignments` table (reassignments)
- [ ] `messages` and `message_recipients` tables (communication)
- [ ] `notifications` and `notification_preferences` tables (notifications)
- [ ] `qr_code_logs` table (QR Code logs)
- [ ] `audit_logs` table (audit)
- [ ] `draw_history` table (assignment draw history)

## References

- [TypeORM Migrations](https://typeorm.io/migrations)
- [PostgreSQL documentation](https://www.postgresql.org/docs/)
