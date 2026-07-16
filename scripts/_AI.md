# scripts/ - AI Context

## 🎯 PURPOSE

Utility scripts for content validation/import, progress backfill, VPS deployment, migration, and maintenance tasks.

## 📦 EXPORTS

Shell scripts and TypeScript utilities executed via npm scripts or directly.

## 🔗 DEPENDENCIES

- `docker compose` - VPS runtime orchestration
- `ssh`/`curl` - production deploy and health checks
- `tsx` - TypeScript execution
- `prisma` - Database migrations

## 🏗️ PATTERNS

### VPS Deploy

```bash
APP_DIR=/opt/ucebnice \
RELEASE_REF=main \
HEALTH_URL=https://ucebnice.example.com/api/health \
./scripts/deploy-vps.sh
```

### Migration Scripts

```bash
# Export from SQLite (legacy)
npm run migrate:export

# Import to PostgreSQL
npm run migrate:import

# Verify migration
npm run migrate:verify
```

### Canonical v2 content

```bash
# Parse and validate repository inputs only; default and safest mode
tsx scripts/import-v2-content.ts --check

# Inventory canonical and DB-only content in a configured database; no writes
tsx scripts/import-v2-content.ts --dry-run

# Idempotent upsert after an approved backup/inventory
tsx scripts/import-v2-content.ts --apply

# Read-only legacy progress merge plan; this is the default mode
tsx scripts/backfill-v2-progress.ts --dry-run
```

Run the content import before the progress backfill. The import upserts chapters, one published lesson per chapter, 400 exercises, compatibility questions, and four milestones without deleting DB-only rows. The backfill indexes only public chapters `01`-`40` and exact canonical exercise keys `01`-`10`, so DB-only chapters/exercises remain preserved without changing the 40/400 invariant. It merges legacy completion/answer/admin evidence, never lowers existing progress, and never updates balances. Historical lesson, correct-answer, project, test, and achievement rewards receive zero-value `RewardLedger` claims solely to block duplicate runtime rewards. If old v2 progress contains only an `exercisesCorrect` count, identities are reserved conservatively in stable canonical order, capped at the ten canonical exercises, and materialized as completed `ExerciseProgress`; 10/10 sets the independent `exercisesCompleted` second-star flag without inventing content completion. The final transaction step refreshes monotonic `ChapterCompletion`/`CompletedChapter` rollback projections.

Legacy module tests used boundaries `1 -> 10`, `2 -> 20`, `3 -> 30`, and `4 -> 40`. Backfill selects the deterministic best completed attempt for each module and maps it to `MilestoneTest`; the append-only `ModuleTestAttempt` rows remain audit history. The repository shipped assessment content only for module 1, although the API admitted module numbers 1-4. There is no valid legacy equivalent of `FinalTest` because that canonical test requires a whole-course project, so backfill must not fabricate a final-test pass or certificate eligibility.

## ⚠️ GOTCHAS

1. **Approval required**: Production deploys and migrations require explicit Martin approval
2. **Environment variables**: Deploy script expects `APP_DIR`, `RELEASE_REF`, and `HEALTH_URL`
3. **Migration one-time**: SQLite → PostgreSQL migration already done
4. **Rollback**: `deploy-vps.sh` rolls back to `.last-good-release` when health check fails
5. **Database writes**: `--apply` modes need a verified backup and schema/content inventory. Production use requires a separately approved runbook.
6. **Content invariants**: `validate-content.ts` and `import-v2-content.ts --check` require exactly 40 lessons, 400 multiple-choice exercises, 38 videos, 38 NotebookLM links, and 40 Colab links.
7. **Legacy test history**: Do not drop `ModuleTestAttempt` in Release A. One canonical milestone row cannot represent every legacy attempt, abandoned attempt, or unsupported module number.

## 📁 STRUCTURE

```
scripts/
├── import-v2-content.ts       # Deterministic 40/400 content check/dry-run/upsert
├── backfill-v2-progress.ts    # Idempotent legacy-to-canonical progress backfill
├── validate-content.ts        # Manifest, Markdown, assessment and media validation
├── deploy-vps.sh              # VPS Docker Compose deploy with healthcheck/rollback
└── migration/
    ├── export-sqlite-data.ts  # SQLite export (legacy)
    ├── import-postgres-data.ts # PostgreSQL import
    └── verify-migration.ts    # Migration verification
```

## 🔄 RELATED

- `Makefile` - High-level Docker Compose commands
- `docker-compose.yml` - App/PostgreSQL/media runtime
- `docker-compose.prod.yml` - Caddy TLS production override
- `prisma/` - Database schema

---

<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: all -->
<!-- CRITICAL: deploy-vps.sh -->
