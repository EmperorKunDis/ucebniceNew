# ✅ GitHub Push Checklist - PŘED PUSHNUTÍM ZKONTROLUJ

## 🔒 Bezpečnostní kontrola

### ✅ Zkontrolováno:
- [x] `.env.local` je v `.gitignore` a není tracked
- [x] `.env` je v `.gitignore` a není tracked  
- [x] Žádná skutečná hesla v kódu (jen placeholders)
- [x] `.env.example` obsahuje jen placeholder hodnoty
- [x] `.env.production.example` obsahuje jen placeholders
- [x] `postgres-secret.yaml` je Helm template (bezpečné)
- [x] Všechny secrets se načítají z Kubernetes Secrets

### 🚨 NIKDY necommituj:
- ❌ Soubory `.env.local`, `.env.production`
- ❌ Skutečná hesla nebo API klíče
- ❌ Database credentials
- ❌ `ucebnice-secret.yaml` (jen sealed secrets jsou OK)

## 📦 Co se pushne na GitHub

### Nové soubory:
```
✅ helm/ucebnice/templates/postgres-deployment.yaml
✅ helm/ucebnice/templates/postgres-service.yaml
✅ helm/ucebnice/templates/postgres-pvc.yaml
✅ helm/ucebnice/templates/postgres-secret.yaml (template, safe)
✅ helm/ucebnice/templates/prisma-migrate-job.yaml
✅ scripts/deploy-production.sh
✅ src/app/api/health/route.ts
✅ PRODUCTION_SETUP.md
✅ DEPLOYMENT_QUICKSTART.md
✅ .env.production.example
```

### Upravené soubory:
```
✅ helm/ucebnice/values.yaml (PostgreSQL enabled)
✅ argocd/values-production.yaml (production config)
✅ .env.local (port 5433) - NENÍ V GITU
```

## 🚀 Ready pro produkci

### Na serveru budeš muset:

1. **Vytvořit Kubernetes Secret** s:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `NEXTAUTH_SECRET` (vygenerované)
   - `NEXTAUTH_URL` (https://ucebnice.praut.cz)

2. **Build & push Docker image**:
   ```bash
   docker build -t harbor.praut.cz/ucebnice/ucebnice-app:v1.0.4 .
   docker push harbor.praut.cz/ucebnice/ucebnice-app:v1.0.4
   ```

3. **Deploy**:
   ```bash
   ./scripts/deploy-production.sh
   ```

## 📝 Dokumentace připravená

- ✅ `PRODUCTION_SETUP.md` - kompletní deployment návod
- ✅ `DEPLOYMENT_QUICKSTART.md` - rychlý start
- ✅ `QUICK_POSTGRES_SETUP.md` - lokální PostgreSQL setup

## ✅ Vše je připravené k pushu na GitHub!

Po pushu:
1. Server si pullne změny
2. Vytvoří secrets podle návodu
3. Spustí deployment script
4. Aplikace poběží na https://ucebnice.praut.cz
