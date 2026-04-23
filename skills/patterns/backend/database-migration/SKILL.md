---
name: database-migration
description: Author a zero-downtime database migration using the expand/contract pattern — additive change, backfill, code cutover, drop old. Use when the user asks to "add a column", "rename a field", or any schema change on a live production DB.
tags: [backend, database, migration, postgres, prisma]
version: 1.0.0
---

# database-migration

Ship schema changes without breaking running code.

## The expand/contract pattern

Every risky migration is three deploys, not one:

1. **Expand** — add new structure alongside old. Backwards compatible.
2. **Migrate + cut over** — backfill data, switch reads/writes to the new structure.
3. **Contract** — drop the old structure.

## Worked example: rename `email` → `email_address`

### Deploy 1 (expand)
- Add column `email_address` nullable.
- Code writes to both `email` and `email_address`. Reads from `email`.

### Deploy 2 (backfill + flip)
- Run backfill: `UPDATE users SET email_address = email WHERE email_address IS NULL`.
- Code reads from `email_address` (falls back to `email` for safety). Still writes to both.

### Deploy 3 (contract)
- Set `email_address` NOT NULL.
- Code writes only to `email_address`.
- Drop column `email` in a separate migration (one more deploy if extra-paranoid).

## Operations that are NOT safe on large tables

| Operation                          | Why dangerous                      | Safer approach                                  |
| ---------------------------------- | ---------------------------------- | ----------------------------------------------- |
| `ADD COLUMN ... DEFAULT <value>`   | Full table rewrite (Postgres < 11) | Add nullable → backfill → set default + NOT NULL |
| `ALTER COLUMN TYPE`                | Full rewrite + lock                | New column, backfill, swap, drop                |
| `CREATE INDEX` on big table        | Locks writes                       | `CREATE INDEX CONCURRENTLY` (Postgres)          |
| `DROP COLUMN` on actively-read col | Reads start failing mid-deploy     | Remove from code first, drop in next deploy     |

## Conventions

- **Every migration has an up AND a down.** Down doesn't need to be perfect — it needs to get you out of a bad deploy.
- **Never edit an applied migration.** Add a new one.
- **Backfill in batches** (`WHERE id BETWEEN ...` with LIMIT) — a single UPDATE on 50M rows locks the table. Batch sizes of 1k–10k, sleep between.
- **Make the migration idempotent**: `IF NOT EXISTS`, `IF EXISTS` guards. Re-running should be a no-op.
- **Test the migration on a prod-sized snapshot** before merging. Timing on 1M rows ≠ timing on 50M rows.
- **Feature-flag the code path** that reads/writes the new column so you can roll back instantly if the backfill goes wrong.

## Anti-patterns to refuse

- Shipping schema + code change in one deploy on a live DB with >1k rows. Separate the expand from the cutover.
- Backfilling inside the migration transaction — wrap it in a separate script that can be re-run.
- Renaming a table or column in place (`ALTER TABLE ... RENAME`) on a hot table — writers will see errors during the deploy gap.

## After writing

- Dry-run on staging with production-scale data; measure lock duration.
- Confirm the old code path still works against the new schema (for rollback safety).
