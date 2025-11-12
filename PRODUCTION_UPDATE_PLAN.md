# 🔄 Plán Update Produkce - Bezpečně

**Současný stav:**
- ✅ Produkce běží: https://ucebnice.praut.cz/
- ❌ Problém: Databáze nefunguje
- 🔧 Řešení: Update na nový branch s PostgreSQL

---

## 📊 Co Je Špatně v Produkci

### Pravděpodobné příčiny:
1. **SQLite v produkci** (není vhodné pro více podů)
2. **DATABASE_URL chybí** nebo je špatně
3. **PostgreSQL není nasazený** v Kubernetes
4. **Migrations neběžely**

---

## ✅ Co Tvůj Branch Opraví

### Změny v `filip-bugsrepair-and-databaze-migration`:

1. **PostgreSQL v Kubernetes**
   - Deployment, Service, PVC
   - Persistent storage
   - Healthchecks

2. **Automatické Migrations**
   - Init container s `prisma migrate deploy`
   - Spustí se před každým deploymentem

3. **Správná konfigurace**
   - DATABASE_URL z Kubernetes secrets
   - Port mapping
   - Connection pooling

4. **Health endpoint**
   - `/api/health` pro monitoring
   - Ověřuje database connection

---

## 🎯 BEZPEČNÝ PLÁN UPDATU

### Fáze 1: Zjisti Co Běží v Produkci (5 minut)

```bash
# Připoj se na server
ssh user@server.praut.cz

# Zkontroluj, co běží
kubectl get pods -l app.kubernetes.io/name=ucebnice
kubectl get deployments
kubectl get services

# Zkontroluj, jestli PostgreSQL už běží
kubectl get pods | grep postgres

# Zkontroluj secrets
kubectl get secrets | grep ucebnice
```

**Co zjistíš:**
- [ ] Kolik podů běží
- [ ] Jestli PostgreSQL existuje
- [ ] Jestli secret existuje
- [ ] Jaká verze image běží

---

### Fáze 2: Backup (Pokud Jsou Nějaká Data) (5 minut)

```bash
# Pokud máš SQLite, backup ji:
APP_POD=$(kubectl get pods -l app.kubernetes.io/name=ucebnice -o jsonpath='{.items[0].metadata.name}')

# Zkontroluj, jestli existuje dev.db
kubectl exec $APP_POD -- ls -la prisma/ 2>/dev/null || echo "No SQLite"

# Pokud existuje, backup:
kubectl cp $APP_POD:prisma/dev.db ./backup-$(date +%Y%m%d).db

# Pokud už máš PostgreSQL, backup databázi:
POSTGRES_POD=$(kubectl get pods | grep postgres | awk '{print $1}')
if [ ! -z "$POSTGRES_POD" ]; then
  kubectl exec $POSTGRES_POD -- pg_dump -U ucebnice_user ucebnice_db > backup-$(date +%Y%m%d).sql
fi
```

---

### Fáze 3: Test v Separátním Namespace NEJDŘÍV (30 minut)

**DŮLEŽITÉ: Netestuj rovnou na produkci!**

```bash
# Vytvoř test namespace
kubectl create namespace ucebnice-test

# Test podle SERVER_TEST_GUIDE.md
# ...

# Když test projde, pokračuj na Fázi 4
```

**✅ Povinné testy:**
- [ ] PostgreSQL běží
- [ ] Migrations proběhly
- [ ] Health endpoint OK
- [ ] Registrace funguje
- [ ] Přihlášení funguje

---

### Fáze 4: Update Produkce (15 minut)

#### A) Merge do Main

```bash
# Lokálně na tvém počítači
cd /Users/filiphirt/Desktop/ucebnicehirt/ucebniceNew

git checkout main
git pull origin main
git merge filip-bugsrepair-and-databaze-migration
git push origin main
```

#### B) Na Serveru - Příprava

```bash
# Na serveru
cd /path/to/ucebnice
git checkout main
git pull origin main

# Ověř, že máš nové změny
git log --oneline -3
# Měl bys vidět PostgreSQL commits
```

#### C) Vytvoř Produkční Secrets (pokud neexistují)

```bash
# Zkontroluj, jestli secret existuje
kubectl get secret ucebnice-secret

# Pokud NE, vytvoř ho:
POSTGRES_PASSWORD=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# ULOŽ SI JE BEZPEČNĚ!
echo "POSTGRES_PASSWORD: $POSTGRES_PASSWORD" > ~/prod-secrets.txt
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET" >> ~/prod-secrets.txt
chmod 600 ~/prod-secrets.txt

# Vytvoř secret
kubectl create secret generic ucebnice-secret \
  --from-literal=DATABASE_URL="postgresql://ucebnice_user:${POSTGRES_PASSWORD}@ucebnice-postgres:5432/ucebnice_db" \
  --from-literal=NEXTAUTH_SECRET="${NEXTAUTH_SECRET}" \
  --from-literal=NEXTAUTH_URL="https://ucebnice.praut.cz"
```

#### D) Update PostgreSQL Password v Values

```bash
# Edituj produkční values
nano argocd/values-production.yaml

# Najdi a změň:
postgresql:
  auth:
    password: "USE_YOUR_POSTGRES_PASSWORD_HERE"
```

Vlož tam **stejné heslo** jako v `POSTGRES_PASSWORD` výše!

#### E) Build Nové Image

```bash
# Build s novou verzí
docker build -t harbor.praut.cz/ucebnice/ucebnice-app:v1.0.7 .
docker push harbor.praut.cz/ucebnice/ucebnice-app:v1.0.7
```

#### F) Update Image Tag v Values

```bash
nano argocd/values-production.yaml

# Změň:
image:
  tag: "v1.0.7"
```

#### G) Deploy Update

```bash
# Použij deployment script
./scripts/deploy-production.sh

# Nebo Helm upgrade:
helm upgrade ucebnice ./helm/ucebnice \
  -f argocd/values-production.yaml \
  --namespace default \
  --wait \
  --timeout 10m
```

---

### Fáze 5: Ověření Po Update (10 minut)

```bash
# 1. Sleduj pody
kubectl get pods -w

# Měl bys vidět:
# - ucebnice-postgres-xxx (nový!)
# - ucebnice-xxx-yyy (updatované)

# 2. Zkontroluj PostgreSQL
POSTGRES_POD=$(kubectl get pods -l app.kubernetes.io/component=database -o jsonpath='{.items[0].metadata.name}')
kubectl logs $POSTGRES_POD --tail=20

# 3. Zkontroluj migrations
APP_POD=$(kubectl get pods -l app.kubernetes.io/name=ucebnice -o jsonpath='{.items[0].metadata.name}')
kubectl logs $APP_POD --tail=100 | grep -i "prisma\|migration"

# 4. Test health endpoint
curl https://ucebnice.praut.cz/api/health

# Měl bys vidět:
# {"status":"ok","database":"connected",...}

# 5. Test v browseru
# Otevři: https://ucebnice.praut.cz
# Zkus registraci
```

---

### Fáze 6: Rollback Plán (Pokud Selže)

**Pokud něco nefunguje:**

```bash
# Option 1: Helm rollback
helm rollback ucebnice

# Option 2: Git revert
git revert HEAD
git push origin main

# Option 3: Manuální fix
kubectl edit deployment ucebnice
# Změň image tag zpět na předchozí verzi

# Restartuj pody
kubectl rollout restart deployment/ucebnice
```

---

## ⚠️ DŮLEŽITÉ POZNÁMKY

### 1. **Downtime**
- Upgrade způsobí **krátký downtime** (1-2 minuty)
- Pody se restartují
- PostgreSQL se nasazuje (první start ~30s)

### 2. **Data Migration**
- Pokud měl SQLite s daty, musíš je migrovat ručně
- Pokud je databáze prázdná, není co migrovat

### 3. **DNS / Ingress**
- Ingress by měl zůstat stejný
- SSL certifikát by měl zůstat
- Pokud ne, přegeneruje se automaticky

---

## 📋 CHECKLIST PŘED UPDATEM

- [ ] Máš backup současných dat (pokud existují)
- [ ] Test v `ucebnice-test` namespace prošel úspěšně
- [ ] Produkční secrets jsou připravené
- [ ] Image je buildnutý a pushnutý
- [ ] Values jsou upravené (PostgreSQL password, image tag)
- [ ] Máš rollback plán
- [ ] Uživatelé jsou informovaní o krátkém downtime

---

## 🚨 CO KDYŽ JE PRODUKCE KRITICKÁ

### Bezpečnější postup:

1. **Blue/Green deployment:**
   ```bash
   # Nechej běžet starou verzi
   # Nasaď novou verzi do jiného namespace
   kubectl create namespace ucebnice-v2
   
   # Deploy nové verze
   helm install ucebnice-v2 ./helm/ucebnice \
     -f argocd/values-production.yaml \
     --namespace ucebnice-v2
   
   # Test na ucebnice-v2
   # Když funguje, přepni Ingress
   ```

2. **Canary deployment:**
   ```bash
   # Nasaď novou verzi s 1 replikou
   # Staré repliky nech běžet
   # Postupně přidávej nové repliky
   ```

---

## 🎯 DOPORUČENÍ

### Pro tvůj případ:

**Pokud produkce nemá důležitá data (nebo máš backup):**
→ **Rovnou update** podle Fází 4-5 (30 minut celkem)

**Pokud produkce má kritická data:**
→ **Test namespace nejdřív** podle Fáze 3, pak update (1 hodina celkem)

**Pokud si nejsi jistý:**
→ **Ptej se mě před každou fází!**

---

## 💬 OTÁZKY PRO TEBE

Před tím, než začneš, odpověz:

1. **Jsou v produkci nějaká důležitá data?**
   - Uživatelé, progress, atd.?

2. **Běží v produkci něco kritického?**
   - Používají to studenti aktivně?

3. **Můžeš si dovolit 5 minut downtime?**
   - Nebo potřebuješ zero-downtime deployment?

4. **Máš přístup k serveru a kubectl?**
   - SSH, kubectl commands fungují?

5. **Je PostgreSQL už nasazený v Kubernetes?**
   - Nebo používáte SQLite?

---

**Odpověz na tyto otázky a řeknu ti PŘESNĚ, jak postupovat!** 🎯
