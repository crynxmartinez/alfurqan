# Database rollout and recovery

The academic-safety migration was applied to the configured live database on 10 October 2026 after backup, isolated restore rehearsal, and baseline comparison. All original rows and fields were verified unchanged afterward. The instructions below remain the procedure for other installations.

## Existing installations (previously managed with db push)

1. Take a provider backup/snapshot. Restore it into a separate staging database and verify that student, enrollment, subject, item and entry counts match. Keep production and staging connection strings separate.
2. Confirm the existing schema matches `prisma/baseline.prisma` using `prisma migrate diff --from-url <staging-direct-url> --to-schema-datamodel prisma/baseline.prisma --exit-code`. Supply the URL from the environment; do not paste credentials into logs. Resolve any reported drift before marking a baseline.
3. Check for more than one active school year: `SELECT id, label FROM "SchoolYear" WHERE "isActive" = true;`. The safety migration intentionally fails if duplicates exist. Choose the correct active year explicitly before retrying; the migration does not guess.
4. With DATABASE_URL and DIRECT_URL pointing to that staging copy, run `npx prisma migrate resolve --applied 00000000000000_baseline`, then `npm run prisma:deploy`. Never run the baseline CREATE TABLE statements against an existing installation.
5. Run the app against staging. Verify teacher login, own/unrelated class access, student create/enroll, score saving and conflict handling, public reports, archive/restore, and history. Confirm existing scores and counts remain unchanged.
6. Repeat the reviewed baseline/migration procedure against production in a maintenance window after a fresh backup, then deploy the application. The migration changes foreign keys and takes table locks; measure duration on staging first.

## Empty local databases

`npm run prisma:deploy` applies both baseline and safety migrations. Use a local database with a name ending `_test` or `_dev` for demo data. The seed additionally requires SEED_DEMO=1, SEED_ADMIN_PASSWORD and SEED_TEACHER_PASSWORD (at least 12 characters). Never seed a school database.

## What changes

Nullable archival/creator fields and an AuditLog table are added. Existing rows stay active, with unknown creators left null; ownership is not guessed. Existing teachers still own their assigned subjects and can manage their enrolled students. Cascading deletes become RESTRICT. A partial unique index enforces one active year. Application activation uses a transaction and a PostgreSQL advisory lock.

`npm test` applies both SQL migrations to an isolated in-memory PostgreSQL engine with synthetic pre-existing school records, then verifies preservation, archive/restore and constraints. This does not substitute for staging tests against the hosted PostgreSQL deployment.

## Recovery

Use Dashboard > Recovery & History as an administrator. Restore parent years/classes before child subjects/items/enrollments. Restoring a school year leaves it inactive. Archiving a login disables its access while preserving its teaching records. No password hashes are returned or placed in history.

The history view includes previous/new values for scores and profile changes. To correct a score, review its prior value, then enter that value in the grade editor; this produces another history record. History is append-only through the app, but direct database administrator writes are outside this audit trail.

For a database incident, restore the provider backup to a separate database first, reconcile changes made since the snapshot, and switch connections only after validation. Prefer a forward fix to blindly deploying old code, because old code does not understand archives. Do not drop audit tables/columns to undo an application release.

Preserve the custom SchoolYear_one_active partial index when generating future migrations.
