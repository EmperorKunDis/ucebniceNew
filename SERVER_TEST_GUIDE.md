# 🧪 Jak Otestovat Na Serveru - Krok za Krokem

**Tento návod ti ukáže, jak bezpečně otestovat změny na serveru PŘED nasazením do produkce.**

---

## 📋 Předpoklady

- ✅ Máš SSH přístup na server
- ✅ Máš přístup do Kubernetes clusteru
- ✅ Máš přístup k Harbor registry
- ✅ Changes jsou pushnuté na branch `filip-bugsrepair-and-databaze-migration`

---

## 🎯 PLÁN: Test v izolovaném prostředí

Nejdřív vytvoříme **testovací namespace** v Kubernetes, abychom neovlivnili produkci.

---

## Krok 1: Připoj se na server

```bash
ssh user@tvuj-server.praut.cz
```

---

## Krok 2: Pull změny z GitHubu

```bash
# Přejdi do projektu
cd /path/to/ucebnice

# Pull nový branch
git fetch origin
git checkout filip-bugsrepair-and-databaze-migration
git pull origin filip-bugsrepair-and-databaze-migration
```

**Zkontroluj:**
```bash
git log --oneline -3
# Měl bys vidět:
# 5efc7c6 Add testing scripts and production readiness documentation
# 50794e3 Add production PostgreSQL setup and Kubernetes deployment
# 332d330 fix: Oprava kritických bugů a migrace na PostgreSQL
```

---

## Krok 3: Vytvoř testovací namespace

```bash
# Vytvoř namespace pro test
kubectl create namespace ucebnice-test

# Nastav jako výchozí (volitelné)
kubectl config set-context --current --namespace=ucebnice-test
```

---

## Krok 4: Vygeneruj testovací secrets

```bash
# Vygeneruj hesla
POSTGRES_PASSWORD=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Ulož si je (pro případ potřeby)
echo "POSTGRES_PASSWORD: $POSTGRES_PASSWORD" > /tmp/test-secrets.txt
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET" >> /tmp/test-secrets.txt
cat /tmp/test-secrets.txt

# Vytvoř Kubernetes Secret v test namespace
kubectl create secret generic ucebnice-secret \
  --namespace ucebnice-test \
  --from-literal=DATABASE_URL="postgresql://ucebnice_user:${POSTGRES_PASSWORD}@ucebnice-postgres:5432/ucebnice_db" \
  --from-literal=NEXTAUTH_SECRET="${NEXTAUTH_SECRET}" \
  --from-literal=NEXTAUTH_URL="https://ucebnice-test.praut.cz"

# Ověř, že secret existuje
kubectl get secret ucebnice-secret -n ucebnice-test
```

---

## Krok 5: Build Docker image

```bash
# Build image s test tagem
docker build -t harbor.praut.cz/ucebnice/ucebnice-app:test-v1.0.4 .

# Push do registry
docker push harbor.praut.cz/ucebnice/ucebnice-app:test-v1.0.4
```

**Očekáváno:** Build proběhne úspěšně (3-5 minut)

---

## Krok 6: Vytvoř testovací values file

```bash
# Vytvoř kopii production values
cp argocd/values-production.yaml /tmp/values-test.yaml

# Edituj pro test
nano /tmp/values-test.yaml
```

**Změň v `/tmp/values-test.yaml`:**
```yaml
image:
  tag: "test-v1.0.4"  # Test tag

ingress:
  hosts:
    - host: ucebnice-test.praut.cz  # Test domain
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: ucebnice-test-tls
      hosts:
        - ucebnice-test.praut.cz

config:
  NEXTAUTH_URL: "https://ucebnice-test.praut.cz"
  NEXT_PUBLIC_APP_URL: "https://ucebnice-test.praut.cz"

postgresql:
  enabled: true
  auth:
    username: ucebnice_user
    password: ""  # Bude z secretu
    database: ucebnice_db
  persistence:
    size: 5Gi  # Menší pro test
```

---

## Krok 7: Deploy do testovacího namespace

```bash
# Deploy s Helm do test namespace
helm upgrade --install ucebnice-test ./helm/ucebnice \
  --namespace ucebnice-test \
  -f /tmp/values-test.yaml \
  --wait \
  --timeout 10m
```

**Sleduj deployment:**
```bash
# Watch pods
watch kubectl get pods -n ucebnice-test

# Nebo v jiném terminálu
kubectl get pods -n ucebnice-test -w
```

**Očekáváno:**
```
NAME                              READY   STATUS    RESTARTS   AGE
ucebnice-test-postgres-xxx        1/1     Running   0          2m
ucebnice-test-xxx-yyy             1/1     Running   0          1m
ucebnice-test-xxx-zzz             1/1     Running   0          1m
```

---

## Krok 8: Zkontroluj PostgreSQL

```bash
# Najdi PostgreSQL pod
POSTGRES_POD=$(kubectl get pods -n ucebnice-test -l app.kubernetes.io/component=database -o jsonpath='{.items[0].metadata.name}')
echo "PostgreSQL pod: $POSTGRES_POD"

# Zkontroluj logy
kubectl logs -n ucebnice-test $POSTGRES_POD --tail=50

# Test připojení
kubectl exec -n ucebnice-test $POSTGRES_POD -- pg_isready -U ucebnice_user -d ucebnice_db

# Připoj se do PostgreSQL (volitelné)
kubectl exec -it -n ucebnice-test $POSTGRES_POD -- psql -U ucebnice_user -d ucebnice_db

# V PostgreSQL shellu:
# \l              -- List databases
# \dt             -- List tables (měly by být po migrations)
# SELECT COUNT(*) FROM "User";  -- Test query
# \q              -- Exit
```

**Očekáváno:** Tabulky existují (User, Chapter, Progress, atd.)

---

## Krok 9: Zkontroluj aplikaci

```bash
# Najdi app pod
APP_POD=$(kubectl get pods -n ucebnice-test -l app.kubernetes.io/name=ucebnice -o jsonpath='{.items[0].metadata.name}')
echo "App pod: $APP_POD"

# Zkontroluj logy
kubectl logs -n ucebnice-test $APP_POD --tail=100 -f

# V jiném terminálu - zkontroluj environment
kubectl exec -n ucebnice-test $APP_POD -- env | grep -E "DATABASE|NEXTAUTH"
```

**Očekáváno v logech:**
```
✓ Ready in 2.3s
○ Local:   http://localhost:3000
✓ Compiling...
```

**Žádné chyby typu:**
- ❌ "Authentication failed"
- ❌ "Cannot connect to database"

---

## Krok 10: Test Health Endpoint

```bash
# Port-forward pro test (v novém terminálu)
kubectl port-forward -n ucebnice-test svc/ucebnice-test 8080:80 &

# Test health
curl http://localhost:8080/api/health

# Nebo přes ingress (pokud je DNS nastavené)
curl https://ucebnice-test.praut.cz/api/health
```

**Očekávaný output:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-12T...",
  "database": "connected",
  "environment": "production"
}
```

---

## Krok 11: Test Registrace a Přihlášení

### Option A: Port-forward (rychlejší)

```bash
# Port-forward
kubectl port-forward -n ucebnice-test svc/ucebnice-test 8080:80

# V browseru otevři:
http://localhost:8080
```

### Option B: Přes Ingress (vyžaduje DNS)

```bash
# Nastav /etc/hosts (dočasně)
echo "$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}') ucebnice-test.praut.cz" | sudo tee -a /etc/hosts

# V browseru:
https://ucebnice-test.praut.cz
```

### Test kroky:

1. **Registrace:**
   - Otevři aplikaci
   - Zaregistruj testovacího uživatele
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `TestPassword123`

2. **Ověř v databázi:**
   ```bash
   kubectl exec -it -n ucebnice-test $POSTGRES_POD -- psql -U ucebnice_user -d ucebnice_db -c "SELECT id, email, username FROM \"User\";"
   ```
   
   **Očekáváno:** Vidíš testovacího uživatele

3. **Přihlášení:**
   - Odhlás se
   - Přihlas se s testovacím účtem
   - Zkontroluj, že se dostaneš na dashboard

4. **Test funkcí:**
   - Otevři kapitolu
   - Zkontroluj, že se data načítají
   - Zkus odpovědět na otázku
   - Zkontroluj XP

---

## Krok 12: Zkontroluj Prisma Migrations

```bash
# Exec do app podu
kubectl exec -it -n ucebnice-test $APP_POD -- sh

# V podu spusť:
npx prisma migrate status

# Měl bys vidět:
# Database schema is up to date!
# No pending migrations

# Exit
exit
```

---

## Krok 13: Zátěžový test (volitelné)

```bash
# Install Apache Bench (pokud nemáš)
# apt-get install apache2-utils  # Linux
# brew install httpd              # macOS

# Test 100 requestů, 10 současně
ab -n 100 -c 10 http://localhost:8080/api/health

# Sleduj pod metrics
kubectl top pods -n ucebnice-test
```

---

## ✅ Checklist - Všechno Funguje?

Po testech zkontroluj:

- [ ] PostgreSQL pod je Running a Healthy
- [ ] App pods jsou Running (všechny replicas)
- [ ] Health endpoint vrací `"status": "ok"`
- [ ] Registrace funguje (uživatel se uloží do DB)
- [ ] Přihlášení funguje
- [ ] Databázové migrace jsou aktuální
- [ ] Žádné error logy v aplikaci
- [ ] Žádné error logy v PostgreSQL
- [ ] Data persistence funguje (restartuj pod a zkontroluj)

---

## Krok 14: Stress Test - Restart Pods

```bash
# Restart aplikačních podů
kubectl rollout restart deployment/ucebnice-test -n ucebnice-test

# Watch
kubectl get pods -n ucebnice-test -w

# Počkej, až jsou všechny Running

# Test health znovu
curl http://localhost:8080/api/health

# Test přihlášení
# Browser: Přihlas se - data by měla zůstat
```

**Očekáváno:** Po restartu vše funguje, data jsou zachována

---

## 🎉 Když Všechno Funguje

### Teď víš, že:
✅ PostgreSQL běží správně v Kubernetes  
✅ Aplikace se připojuje k databázi  
✅ Migrations fungují  
✅ Registrace a přihlášení funguje  
✅ Data se ukládají správně  
✅ Health check funguje  
✅ Restart podů neovlivní data  

### Můžeš nasadit do PRODUKCE:

1. **Vytvoř produkční secrets** (stejně jako test, ale jiná hesla!)
2. **Build produkční image:**
   ```bash
   docker build -t harbor.praut.cz/ucebnice/ucebnice-app:v1.0.4 .
   docker push harbor.praut.cz/ucebnice/ucebnice-app:v1.0.4
   ```

3. **Deploy do produkce:**
   ```bash
   # Merge branch do main
   git checkout main
   git merge filip-bugsrepair-and-databaze-migration
   git push origin main
   
   # Deploy
   ./scripts/deploy-production.sh
   ```

---

## 🗑️ Cleanup Test Prostředí

Když skončíš s testováním:

```bash
# Smaž test namespace (smaže všechno)
kubectl delete namespace ucebnice-test

# Nebo jen aplikaci (nechá namespace)
helm uninstall ucebnice-test -n ucebnice-test

# Smaž test secrets
rm /tmp/test-secrets.txt
rm /tmp/values-test.yaml

# Odstraň test image (volitelné)
# docker rmi harbor.praut.cz/ucebnice/ucebnice-app:test-v1.0.4

# Odeeber /etc/hosts entry (pokud jsi přidal)
sudo nano /etc/hosts
# Smaž řádek s ucebnice-test.praut.cz
```

---

## 🐛 Troubleshooting

### Pods neběží:

```bash
# Detailní info
kubectl describe pod $APP_POD -n ucebnice-test

# Zkontroluj events
kubectl get events -n ucebnice-test --sort-by='.lastTimestamp'
```

### Database connection failed:

```bash
# Zkontroluj secret
kubectl get secret ucebnice-secret -n ucebnice-test -o yaml

# Decode DATABASE_URL
kubectl get secret ucebnice-secret -n ucebnice-test -o jsonpath='{.data.DATABASE_URL}' | base64 -d

# Ověř, že heslo sedí
```

### Image pull failed:

```bash
# Zkontroluj image pull secret
kubectl get secret harbor-registry-secret -n ucebnice-test

# Re-create pokud chybí
kubectl create secret docker-registry harbor-registry-secret \
  --docker-server=harbor.praut.cz \
  --docker-username=your-user \
  --docker-password=your-password \
  --namespace=ucebnice-test
```

### SSL certifikát nefunguje:

```bash
# Zkontroluj cert-manager
kubectl get certificate -n ucebnice-test
kubectl describe certificate ucebnice-test-tls -n ucebnice-test

# Check ingress
kubectl get ingress -n ucebnice-test
kubectl describe ingress ucebnice-test -n ucebnice-test
```

---

## 📞 Další Pomoc

Pokud něco nefunguje:

1. **Check logs:**
   ```bash
   kubectl logs -n ucebnice-test -l app.kubernetes.io/name=ucebnice --tail=200
   ```

2. **Check PostgreSQL:**
   ```bash
   kubectl logs -n ucebnice-test -l app.kubernetes.io/component=database
   ```

3. **Check events:**
   ```bash
   kubectl get events -n ucebnice-test
   ```

4. **Dokumentace:**
   - `PRODUCTION_SETUP.md` - Troubleshooting section
   - `DEPLOYMENT_QUICKSTART.md` - Quick commands

---

**Hodně štěstí s testováním! 🚀**

Po úspěšném testu můžeš s klidem nasadit do produkce na https://ucebnice.praut.cz
