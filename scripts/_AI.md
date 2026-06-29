# scripts/ - AI Context

## 🎯 PURPOSE

Utility scripts for VPS deployment, migration, and maintenance tasks.

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

## ⚠️ GOTCHAS

1. **Approval required**: Production deploys and migrations require explicit Martin approval
2. **Environment variables**: Deploy script expects `APP_DIR`, `RELEASE_REF`, and `HEALTH_URL`
3. **Migration one-time**: SQLite → PostgreSQL migration already done
4. **Rollback**: `deploy-vps.sh` rolls back to `.last-good-release` when health check fails

## 📁 STRUCTURE

```
scripts/
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
