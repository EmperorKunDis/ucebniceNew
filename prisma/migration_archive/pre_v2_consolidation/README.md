# Pre-v2 consolidation migration archive

This directory preserves the migration history that was active before the
Duolingo v2 consolidation baseline was created on 2026-07-16. The SQL files
were moved here without modification because their historical ordering cannot
reliably create the schema represented by the application.

These files are evidence, not active Prisma migrations. Never edit or execute
them as a replacement for the new baseline. `schema.prisma` is the exact
pre-consolidation datamodel used to generate the active baseline.

## Archived SQL checksums

```text
d286b1316be36b814969d58d947390d3c7103c3595be055af363860a8dd71f2a  20250206090000_duolingo_features/migration.sql
6b8d0b68de66f8fbe899c58dba2badfaf0ee61ec0330dba59352465864cd0eea  20251112134602_init_postgresql/migration.sql
5b50ce8666d57ec920bdf1e7f2c3281b8b125a540b867844fb8d5e1b6c4c2a20  20251124231751_rename_leson_to_chapter/migration.sql
b530b69852f47387d2f24221883a874fdd8dd635d2142afb8ec2a18bf84857c4  20260108194757_adds_questions_table/migration.sql
e7cff005da69ff3a6f4588505d8dd43d484c7ffda13f11c0d025b7886874f750  20260119101401_add_arena_system/migration.sql
9c21b9b4d7bd52c15fbf6f5aae8091055511bda7ad1d9efd66f51b18d04c974f  20260629090000_ai_review_observability/migration.sql
```

The operational procedure for fresh and existing databases is in
[`../../MIGRATION_BASELINE_RUNBOOK.md`](../../MIGRATION_BASELINE_RUNBOOK.md).
