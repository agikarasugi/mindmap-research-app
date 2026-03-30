# Database Layer

## Stack

- **Database**: PostgreSQL 16
- **Migrations**: `golang-migrate` (SQL files, up/down pairs)
- **Connection pooling**: PgBouncer in transaction mode, max 100 server connections
- **ORM**: None — raw SQL via `sqlc` (type-safe generated Go code)

## Schema conventions

- All tables have `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
- Timestamps: `created_at TIMESTAMPTZ NOT NULL DEFAULT now()` and `updated_at` (trigger-maintained).
- Soft deletes: `deleted_at TIMESTAMPTZ` — never hard-delete user data.
- Foreign keys always have an index on the referencing column.

## Migration workflow

```bash
# Create a new migration
migrate create -ext sql -dir db/migrations -seq add_notifications_table

# Apply all pending migrations
migrate -path db/migrations -database $DATABASE_URL up

# Roll back one step
migrate -path db/migrations -database $DATABASE_URL down 1
```

Migrations run automatically on deployment via an init container before the app starts.

## Connection pooling

PgBouncer config (`pgbouncer.ini`):
```ini
pool_mode = transaction
max_client_conn = 500
default_pool_size = 20
```

Application connection string points to PgBouncer (port 5432), not Postgres directly (port 5433). Do not use `LISTEN/NOTIFY` or advisory locks — they require session-mode pooling.

## Backup

- Continuous WAL archiving to S3 via `pgBackRest`.
- Daily base backup, 30-day retention.
- Recovery time objective: < 1 hour. Recovery point objective: < 5 minutes.
