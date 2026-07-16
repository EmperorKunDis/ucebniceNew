# Prisma v2 consolidation baseline runbook

This runbook separates two materially different database states:

- a new, empty PostgreSQL database, where both active migrations are applied;
- an existing database, where the baseline may be marked resolved only after
  an approved backup, restore test, schema inventory, and drift review.

The active migration chain is:

1. `20260716000000_baseline`: empty database to the archived
   pre-consolidation datamodel;
2. `20260716010000_v2_consolidation`: additive v2 content, progress,
   attempts, milestones, and reward-ledger structures.

The old SQL is preserved unchanged under
`migration_archive/pre_v2_consolidation/`. It is not part of the active Prisma
chain. Do not modify an already applied migration in place.

## Safety boundary

No command in the existing-database section is authorization to touch
production. Backup, restore, `migrate resolve`, `migrate deploy`, content
import, and progress backfill against production each require Martin's
explicit approval and an identified target database. Never use an unverified
shell environment for these commands.

Release A is additive. Do not drop legacy tables, remove their data, rewrite
Git history, or rotate credentials as part of this procedure. Those are
separate approved operations.

## Common preflight

Use Node 22 and npm from the repository root:

```bash
nvm use
npm ci
npx prisma validate
npx tsx scripts/import-v2-content.ts --check
```

The content check is offline and must report 40 chapters, 40 lessons, 400
exercises, 400 legacy question projections, and four milestones for chapters
10, 20, 30, and 40.

## New empty database

1. Confirm that the target is disposable or a newly provisioned empty
   non-production database.
2. Set `DATABASE_URL` explicitly for that target. Print only the host/database
   identity; never print credentials.
3. Confirm that it contains no application tables and no
   `_prisma_migrations` rows.
4. Apply the active chain:

   ```bash
   npx prisma migrate deploy
   npx prisma migrate status
   ```

5. Import and verify canonical content:

   ```bash
   npx tsx scripts/import-v2-content.ts --dry-run
   npx tsx scripts/import-v2-content.ts --apply
   npx tsx scripts/import-v2-content.ts --dry-run
   npm run validate:content
   ```

6. For a migration-matrix fixture containing legacy users, dry-run and then
   apply the progress backfill twice. Both applies must preserve balances and
   the second run must produce no lower progress or additional rewards:

   ```bash
   npx tsx scripts/backfill-v2-progress.ts --dry-run
   npx tsx scripts/backfill-v2-progress.ts --apply
   npx tsx scripts/backfill-v2-progress.ts --apply
   ```

For a genuinely empty database the backfill should have zero users.

## Existing database: inventory and resolve

Stop unless the backup/restore and database operations in this section have
been explicitly approved.

### 1. Record and protect the starting state

- Record the application Git SHA, target host/database name, PostgreSQL
  version, timestamp, and operator.
- Create an immutable database backup using the approved production process.
- Restore that backup into an isolated database and complete a restore smoke
  test before modifying the source database.
- Snapshot user invariants before any write: `User.xp`, `gems`, streak fields,
  role/admin state, projects, certificates, test attempts, and aggregate
  chapter progress.

### 2. Read-only inventory

Capture the migration table before changing it:

```sql
SELECT migration_name, checksum, started_at, finished_at, rolled_back_at,
       applied_steps_count
FROM "_prisma_migrations"
ORDER BY started_at, migration_name;
```

Also capture a schema-only dump, table/column/index/constraint inventory, row
counts for learning tables, and an export of content that has no repository
source key. A schema-only dump can contain internal names, so store it in the
approved operations location, not in this repository.

Run the application-level read-only inventory:

```bash
npx prisma migrate status
npx tsx scripts/import-v2-content.ts --dry-run
npx tsx scripts/backfill-v2-progress.ts --dry-run
```

Compare the live schema to the archived pre-consolidation datamodel. This
command is read-only and writes SQL for human review; it must not be piped into
`prisma db execute`:

```bash
npx prisma migrate diff \
  --from-config-datasource \
  --to-schema prisma/migration_archive/pre_v2_consolidation/schema.prisma \
  --script \
  --output /approved/inventory/pre-baseline-drift.sql
```

The reviewed diff must be empty. If it is not empty, **do not resolve the
baseline**. Reconcile the actual schema and any DB-only content with a separate,
reviewed roll-forward plan, repeat the backup/restore test, and rerun the diff.
This protects existing installations whose real schema may not match either
the old migration ordering or the repository datamodel.

### 3. Mark only the baseline resolved

After the inventory proves exact pre-baseline schema parity, record the
approval and mark the baseline as already applied:

```bash
npx prisma migrate resolve --applied 20260716000000_baseline
npx prisma migrate status
```

Do not resolve `20260716010000_v2_consolidation`; it must remain pending until
its SQL has actually been applied. Preserve the pre-existing
`_prisma_migrations` rows as audit evidence.

### 4. Apply the additive migration

Review `migrations/20260716010000_v2_consolidation/migration.sql` against the
inventory. It must contain no drop, truncate, data rewrite, or destructive
type change. In the approved change window:

```bash
npx prisma migrate deploy
npx prisma migrate status
```

Re-run the schema diff, now against the current schema:

```bash
npx prisma migrate diff \
  --from-config-datasource \
  --to-schema prisma/schema.prisma \
  --exit-code
```

An empty diff exits with code 0. Any other result stops the cutover.

### 5. Import, backfill, and prove idempotency

Inventory and preserve all DB-only lessons/exercises before canonical import.
Then, during the approved change window:

```bash
npx tsx scripts/import-v2-content.ts --dry-run
npx tsx scripts/import-v2-content.ts --apply
npx tsx scripts/import-v2-content.ts --dry-run
npx tsx scripts/backfill-v2-progress.ts --dry-run
npx tsx scripts/backfill-v2-progress.ts --apply
npx tsx scripts/backfill-v2-progress.ts --apply
```

Compare the before/after invariant snapshots. The backfill must never reduce
progress or change XP, gems, streak values, claimed rewards, project/review
history, certificates, or test history. Migrated correct answers create
zero-value reward-ledger claims so replay cannot grant XP again. It also:

- reserves `LESSON_COMPLETE` even when an older v2 row has
  `lessonsCompleted > 0` but no content star; this does not invent
  `contentCompleted`;
- reserves exact known exercise identities and deterministically fills any
  identity-less `ChapterProgress.exercisesCorrect` count in canonical exercise
  order, capped at ten, materializes matching completed `ExerciseProgress`, and
  sets the independent second-star flag at 10/10 so old v2 success is neither
  reset nor rewarded again;
- maps legacy modules 1/2/3/4 to milestones 10/20/30/40, keeping the best
  completed percentage and any existing canonical pass/reward fields;
- keeps every `ModuleTestAttempt` row as audit history because one
  `MilestoneTest` row cannot represent retries or abandoned attempts;
- does not create a `FinalTest` from module 4: the final test requires a
  whole-course project that the legacy module schema never captured;
- materializes pre-cutover `UserAchievement` visibility and zero-value
  `ACHIEVEMENT_UNLOCK` claims without changing XP or gems; and
- writes `ChapterCompletion`/`CompletedChapter` last as monotonic rollback
  projections from the merged canonical chapter state.

A passed migrated module test also reserves a zero-value `MILESTONE_PASS`
claim. Compare best score/pass state and all zero-value claims after the second
apply; row counts and balances must remain unchanged.

The 40/400 preflight deliberately ignores DB-only chapters and extra exercises
whose keys are not the exact canonical `01`-`40` / `exercise:<chapter>:01..10`
set. Inventory those rows separately and confirm they remain untouched.

`scripts/backfill-v2-progress.ts` intentionally refuses `--apply` when
`NODE_ENV=production`. Do not bypass that guard ad hoc. The separately approved
production operation must first add or select a reviewed, target-specific
confirmation mechanism and retain its audit log.

Validate per-user/per-chapter parity before Release A and continue parity/error
monitoring for at least seven days. Keep legacy progress tables read-only and
available for rollback comparison throughout that period.

## Failure handling

- Before `migrate resolve`: fix the inventory discrepancy; no database rollback
  is needed because only reads have occurred.
- After resolve but before deploy: a resolve changes only migration metadata.
  Stop and review `_prisma_migrations`; do not delete rows manually.
- After additive deploy or data import: stop writes, retain logs and snapshots,
  and use the tested restore procedure if rollback is required. Do not invent a
  destructive down migration during the incident.
- Release B table drops, production migration, deploy, and removal of legacy
  projections require a separate approval after parity is zero and restore has
  been reverified.
