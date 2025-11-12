# 🧪 Lokální Test Plan - PŘED NAHRÁNÍM NA SERVER

Tento test plan ti pomůže ověřit, že všechno funguje správně **PŘED** pushnutím na main branch.

---

## ✅ Test 1: Build Test (HOTOVO ✓)

```bash
npm run build
```

**✅ PASSED** - Build proběhl úspěšně bez chyb

---

## ✅ Test 2: TypeScript Check

```bash
npm run type-check
# nebo
npx tsc --noEmit
```

**Očekáváno:** Žádné TypeScript chyby

---

## ✅ Test 3: Lokální PostgreSQL a Aplikace

### 3.1 Ověř, že PostgreSQL běží:

```bash
docker ps | grep postgres
```

**Očekáváno:** Vidíš `ucebnice-postgres` container

### 3.2 Spusť dev server:

```bash
npm run dev
```

**Očekáváno:** Server běží na http://localhost:3000

### 3.3 Test Health Endpoint:

V browseru nebo curl:
```bash
curl http://localhost:3000/api/health
```

**Očekáváno:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected",
  "environment": "development"
}
```

### 3.4 Test Registrace:

1. Otevři http://localhost:3000
2. Zaregistruj nového testovacího uživatele
3. Zkontroluj, že registrace proběhla bez chyb

**Očekáváno:** ✅ Registrace úspěšná, uživatel vytvořen

### 3.5 Test Přihlášení:

1. Přihlas se s testovacím uživatelem
2. Zkontroluj, že se dostaneš na dashboard

**Očekáváno:** ✅ Přihlášení funguje, zobrazuje se profil

### 3.6 Test Databáze - Prisma Studio:

```bash
npx prisma studio
```

Otevři http://localhost:5555

**Očekáváno:** 
- Vidíš všechny tabulky (User, Chapter, Progress, atd.)
- Vidíš testovacího uživatele v tabulce User

---

## ✅ Test 4: Docker Build Test

### 4.1 Build Docker image:

```bash
docker build -t ucebnice-test:local .
```

**Očekáváno:** Build proběhne bez chyb (může trvat 5-10 minut)

### 4.2 (Volitelné) Test Docker image:

```bash
# Spusť container
docker run -d \
  --name ucebnice-test \
  -p 3001:3000 \
  -e DATABASE_URL="postgresql://ucebnice_user:changeme123@host.docker.internal:5433/ucebnice_db" \
  -e NEXTAUTH_URL="http://localhost:3001" \
  -e NEXTAUTH_SECRET="test-secret-key" \
  ucebnice-test:local

# Test health
curl http://localhost:3001/api/health

# Cleanup
docker stop ucebnice-test
docker rm ucebnice-test
docker rmi ucebnice-test:local
```

**Očekáváno:** 
- Container běží
- Health endpoint odpovídá
- Database connection funguje

---

## ✅ Test 5: Prisma Migrations Test

```bash
# Zkontroluj migrations
npx prisma migrate status

# Test migration deploy (produkční command)
npx prisma migrate deploy
```

**Očekáváno:** 
```
Database schema is up to date!
```

---

## ✅ Test 6: Helm Chart Validation (Dry Run)

### 6.1 Validace Helm syntaxe:

```bash
helm lint ./helm/ucebnice
```

**Očekáváno:** No errors, možná warnings (to je OK)

### 6.2 Dry-run s production values:

```bash
helm template ucebnice ./helm/ucebnice \
  -f argocd/values-production.yaml \
  --dry-run > /tmp/helm-output.yaml

# Zkontroluj output
cat /tmp/helm-output.yaml | grep -A 5 "kind: Deployment"
```

**Očekáváno:** 
- Helm template se vygeneruje bez chyb
- Vidíš PostgreSQL Deployment
- Vidíš Application Deployment

---

## ✅ Test 7: Environment Variables Check

### 7.1 Zkontroluj .env soubory:

```bash
# Tyto soubory NESMÍ být v gitu:
git ls-files | grep "^\.env$\|\.env\.local$"
# Output: (nic - dobře!)

# Tyto soubory MUSÍ být v gitu:
git ls-files | grep "\.env\.example"
# Output: .env.example a .env.production.example
```

### 7.2 Zkontroluj, že .env.local má správný port:

```bash
cat .env.local | grep DATABASE_URL
```

**Očekáváno:** 
```
DATABASE_URL="postgresql://ucebnice_user:changeme123@localhost:5433/ucebnice_db"
```
(port **5433**, ne 5432)

---

## ✅ Test 8: Git Safety Check

```bash
# Zkontroluj, co půjde na GitHub
git diff origin/main --name-only

# Zkontroluj, že nejsou hesla v commitech
git log -p -1 | grep -i "password\|secret" | grep -v "CHANGE_THIS\|placeholder\|example"
```

**Očekáváno:** 
- Žádná skutečná hesla
- Jen placeholder hodnoty
- `.env.local` není v tracked files

---

## 📊 Test Scorecard

Vyplň po dokončení testů:

- [ ] ✅ Test 1: Build test - PASSED
- [ ] ✅ Test 2: TypeScript check - PASSED  
- [ ] ✅ Test 3: Lokální app + PostgreSQL - PASSED
- [ ] ✅ Test 4: Docker build - PASSED
- [ ] ✅ Test 5: Prisma migrations - PASSED
- [ ] ✅ Test 6: Helm validation - PASSED
- [ ] ✅ Test 7: Environment vars - PASSED
- [ ] ✅ Test 8: Git safety - PASSED

---

## 🚀 Když všechny testy prošly:

### Bezpečný postup pro upload:

1. **Push na feature branch** (ne main):
   ```bash
   git push origin filip-bugsrepair-and-databaze-migration
   ```

2. **Vytvoř Pull Request na GitHubu**:
   - Review changes na GitHubu
   - Zkontroluj diff ještě jednou
   - Ujisti se, že žádné secrets nejsou v kódu

3. **Merge do main** (až po review):
   ```bash
   # Na GitHubu: Merge Pull Request
   # Nebo lokálně:
   git checkout main
   git merge filip-bugsrepair-and-databaze-migration
   git push origin main
   ```

4. **Na serveru:**
   ```bash
   # Pull změny
   git pull origin main
   
   # Následuj DEPLOYMENT_QUICKSTART.md
   ```

---

## 🐛 Když něco selže:

### Build selhává:
```bash
# Zkontroluj chyby
npm run build 2>&1 | grep "error"

# Oprav a zkus znovu
```

### PostgreSQL connection failed:
```bash
# Zkontroluj, že Docker běží
docker ps

# Restart PostgreSQL
docker-compose restart postgres

# Zkontroluj port v .env.local
cat .env.local | grep DATABASE_URL
```

### Docker build selhává:
```bash
# Zkontroluj Dockerfile syntax
docker build --no-cache -t test .

# Zkontroluj logs
docker logs <container-id>
```

### Helm validation failed:
```bash
# Detail error
helm lint ./helm/ucebnice --debug

# Zkontroluj YAML syntax
yamllint helm/ucebnice/values.yaml
```

---

## ⚠️ RED FLAGS - Nestahuj na server pokud:

❌ Build selhává  
❌ TypeScript má errors  
❌ Registrace/přihlášení nefunguje lokálně  
❌ Health endpoint vrací "error"  
❌ Vidíš skutečná hesla v git diff  
❌ Docker build selhává  
❌ Helm lint má errors (warnings jsou OK)  

---

## ✅ GREEN LIGHT - Můžeš nahrát pokud:

✅ Všechny testy prošly  
✅ Aplikace funguje lokálně s PostgreSQL  
✅ Build je úspěšný  
✅ Žádné secrets v gitu  
✅ Docker image se builduje  
✅ Helm chart je validní  

---

## 🎯 Quick Test Script

Můžeš spustit všechny testy najednou:

```bash
#!/bin/bash
echo "🧪 Running tests..."

echo "1️⃣ TypeScript check..."
npx tsc --noEmit || exit 1

echo "2️⃣ Build test..."
npm run build || exit 1

echo "3️⃣ Prisma check..."
npx prisma validate || exit 1

echo "4️⃣ Helm lint..."
helm lint ./helm/ucebnice || exit 1

echo "5️⃣ Git safety check..."
git diff HEAD | grep -i "password.*=.*[^CHANGE_THIS]" && echo "❌ Found passwords!" && exit 1

echo "✅ All tests passed!"
```

Ulož jako `scripts/test-before-deploy.sh` a spusť:
```bash
chmod +x scripts/test-before-deploy.sh
./scripts/test-before-deploy.sh
```

---

**Teď jsi ready! Projdi testy a pak s klidem nahraj na server.** 🚀
