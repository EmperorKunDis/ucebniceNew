# scripts/ - AI Context

## 🎯 PURPOSE
Utility scripts for deployment, migration, and maintenance tasks. Includes Kubernetes helpers and database migration tools.

## 📦 EXPORTS
Shell scripts and TypeScript utilities executed via npm scripts or directly.

## 🔗 DEPENDENCIES
- `kubectl` - Kubernetes CLI
- `helm` - Kubernetes package manager
- `kubeseal` - Sealed secrets CLI
- `tsx` - TypeScript execution
- `prisma` - Database migrations

## 🏗️ PATTERNS

### Kubernetes Scripts
```bash
# Deploy to environment
./scripts/kubernetes/deploy.sh production v1.0.37

# Create sealed secrets
./scripts/kubernetes/create-sealed-secrets.sh ucebnice-production
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

1. **Makefile preferred**: Use `make deploy-production` instead of direct scripts
2. **Environment variables**: Scripts expect certain env vars set
3. **Migration one-time**: SQLite → PostgreSQL migration already done
4. **Kubectl context**: Ensure correct cluster context before running

## 📁 STRUCTURE
```
scripts/
├── kubernetes/
│   ├── deploy.sh              # Deployment script
│   ├── create-secrets.sh      # Plain secrets
│   ├── create-sealed-secrets.sh # Sealed secrets
│   └── create-postgres-sealed-secret.sh
└── migration/
    ├── export-sqlite-data.ts  # SQLite export (legacy)
    ├── import-postgres-data.ts # PostgreSQL import
    └── verify-migration.ts    # Migration verification
```

## 🔄 RELATED
- `Makefile` - High-level deployment commands
- `argocd/` - Deployment configurations
- `helm/` - Helm charts
- `prisma/` - Database schema

---
<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: all -->
<!-- CRITICAL: kubernetes/deploy.sh -->
