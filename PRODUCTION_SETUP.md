# 🚀 Production Setup Guide - ucebnice.praut.cz

Tento návod popisuje kompletní nasazení aplikace na produkční Kubernetes cluster s PostgreSQL.

---

## 📋 Předpoklady

### Lokální nástroje:
- ✅ `kubectl` - Kubernetes CLI
- ✅ `helm` - Helm package manager
- ✅ `docker` - Docker pro build images
- ✅ Přístup k `harbor.praut.cz` registry

### Kubernetes cluster:
- ✅ Kubernetes cluster s Longhorn storage
- ✅ Nginx Ingress Controller
- ✅ Cert-Manager pro SSL certifikáty
- ✅ ArgoCD (volitelné, pro GitOps)

---

## 🔐 Krok 1: Vytvoření Secrets

### Vygeneruj silné heslo pro PostgreSQL:

```bash
# Vygeneruj PostgreSQL heslo
POSTGRES_PASSWORD=$(openssl rand -base64 32)
echo "PostgreSQL Password: $POSTGRES_PASSWORD"
# ULOŽ SI TOTO HESLO BEZPEČNĚ!

# Vygeneruj NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "NextAuth Secret: $NEXTAUTH_SECRET"
# ULOŽ SI TOTO HESLO BEZPEČNĚ!
```

### Vytvoř Kubernetes Secret:

```bash
# Vytvoř secret s databázovými credentials
kubectl create secret generic ucebnice-secret \
  --from-literal=DATABASE_URL="postgresql://ucebnice_user:${POSTGRES_PASSWORD}@ucebnice-postgres:5432/ucebnice_db" \
  --from-literal=NEXTAUTH_SECRET="${NEXTAUTH_SECRET}" \
  --from-literal=NEXTAUTH_URL="https://ucebnice.praut.cz" \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Aktualizuj PostgreSQL heslo v values:

```bash
# Edituj argocd/values-production.yaml
nano argocd/values-production.yaml

# Nastav postgresql.auth.password na stejné heslo jako v DATABASE_URL
```

---

## 🐳 Krok 2: Build a Push Docker Image

### Build image:

```bash
# Build Docker image
docker build -t harbor.praut.cz/ucebnice/ucebnice-app:v1.0.4 .

# Alternativně s build args:
docker build \
  --build-arg NEXT_PUBLIC_APP_URL=https://ucebnice.praut.cz \
  -t harbor.praut.cz/ucebnice/ucebnice-app:v1.0.4 .
```

### Push do Harbor registry:

```bash
# Login do Harbor
docker login harbor.praut.cz

# Push image
docker push harbor.praut.cz/ucebnice/ucebnice-app:v1.0.4
```

### Aktualizuj tag v production values:

```bash
# Edituj argocd/values-production.yaml
nano argocd/values-production.yaml

# Změň image.tag na "v1.0.4"
```

---

## 📦 Krok 3: Deploy do Kubernetes

### Metoda A: Pomocí deployment scriptu (doporučeno)

```bash
# Spusť deployment script
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

### Metoda B: Manuální Helm install

```bash
# Přidat nebo aktualizovat Helm release
helm upgrade --install ucebnice ./helm/ucebnice \
  -f argocd/values-production.yaml \
  --namespace default \
  --wait \
  --timeout 10m
```

### Metoda C: ArgoCD (GitOps)

```bash
# Aplikuj ArgoCD Application
kubectl apply -f argocd/application.yaml

# Sync aplikace
argocd app sync ucebnice

# Sleduj status
argocd app get ucebnice
```

---

## 🔍 Krok 4: Ověření Deployme ntu

### Zkontroluj PostgreSQL:

```bash
# Zkontroluj PostgreSQL pod
kubectl get pods -l app.kubernetes.io/component=database

# Připoj se do PostgreSQL
POSTGRES_POD=$(kubectl get pods -l app.kubernetes.io/component=database -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $POSTGRES_POD -- psql -U ucebnice_user -d ucebnice_db

# V PostgreSQL shellu:
\l                    # List databases
\dt                   # List tables
SELECT COUNT(*) FROM "User";  # Check if migrations ran
\q                    # Exit
```

### Zkontroluj aplikační pody:

```bash
# Zobraz všechny pody
kubectl get pods

# Zkontroluj logy aplikace
kubectl logs -l app.kubernetes.io/name=ucebnice -f

# Zkontroluj logy PostgreSQL
kubectl logs $POSTGRES_POD -f
```

### Zkontroluj Ingress a SSL:

```bash
# Zobraz ingress
kubectl get ingress

# Zkontroluj certifikát
kubectl get certificate

# Test SSL
curl -I https://ucebnice.praut.cz
```

---

## 🧪 Krok 5: Testování Aplikace

### Test registrace a přihlášení:

```bash
# Test health endpoint
curl https://ucebnice.praut.cz/api/health

# Test v browseru:
# 1. Otevři https://ucebnice.praut.cz
# 2. Registruj nového uživatele
# 3. Přihlas se
# 4. Zkontroluj, že databáze funguje
```

### Spusť Prisma Studio (pro debug):

```bash
# Port-forward do aplikace
kubectl port-forward deployment/ucebnice 5555:5555 &

# V jiném terminálu:
kubectl exec -it deployment/ucebnice -- npx prisma studio

# Otevři http://localhost:5555
```

---

## 🔄 Krok 6: Prisma Migrations

Migrace se spouští automaticky jako init container, ale můžeš je spustit i manuálně:

```bash
# Získej název podu
APP_POD=$(kubectl get pods -l app.kubernetes.io/name=ucebnice -o jsonpath='{.items[0].metadata.name}')

# Spusť migrations
kubectl exec -it $APP_POD -- npx prisma migrate deploy

# Alternativně: Spusť jako Job
kubectl create job prisma-migrate-manual --from=cronjob/ucebnice-prisma-migrate
```

---

## 🗄️ Správa Databáze

### Backup databáze:

```bash
# Vytvořit backup
kubectl exec $POSTGRES_POD -- pg_dump -U ucebnice_user ucebnice_db > backup-$(date +%Y%m%d).sql

# Komprimovat backup
gzip backup-$(date +%Y%m%d).sql

# Nahrát do storage (např. S3, GCS)
# aws s3 cp backup-$(date +%Y%m%d).sql.gz s3://my-backups/
```

### Restore databáze:

```bash
# Kopírovat backup do podu
kubectl cp backup.sql $POSTGRES_POD:/tmp/backup.sql

# Restore
kubectl exec $POSTGRES_POD -- psql -U ucebnice_user -d ucebnice_db -f /tmp/backup.sql
```

### Automatické backups (CronJob):

Vytvoř `helm/ucebnice/templates/backup-cronjob.yaml`:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
spec:
  schedule: "0 2 * * *"  # Každý den ve 2:00
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: postgres-backup
            image: postgres:16-alpine
            command:
            - sh
            - -c
            - |
              pg_dump -h ucebnice-postgres -U ucebnice_user ucebnice_db | \
              gzip > /backups/backup-$(date +%Y%m%d-%H%M%S).sql.gz
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: ucebnice-postgres-secret
                  key: postgres-password
            volumeMounts:
            - name: backups
              mountPath: /backups
          restartPolicy: OnFailure
          volumes:
          - name: backups
            persistentVolumeClaim:
              claimName: postgres-backups-pvc
```

---

## 📊 Monitoring a Logging

### Zobrazit metriky:

```bash
# CPU a Memory usage
kubectl top pods

# Detailní popis podu
kubectl describe pod $APP_POD

# Events
kubectl get events --sort-by='.lastTimestamp'
```

### Logy:

```bash
# Real-time logs aplikace
kubectl logs -l app.kubernetes.io/name=ucebnice -f --tail=100

# Logy konkrétního podu
kubectl logs $APP_POD -f

# Logy PostgreSQL
kubectl logs $POSTGRES_POD -f

# Previous pod logs (pokud crashoval)
kubectl logs $APP_POD --previous
```

---

## 🔄 Update Aplikace

### Rolling update:

```bash
# Build novou verzi
docker build -t harbor.praut.cz/ucebnice/ucebnice-app:v1.0.5 .
docker push harbor.praut.cz/ucebnice/ucebnice-app:v1.0.5

# Update tag v values-production.yaml
sed -i 's/tag: "v1.0.4"/tag: "v1.0.5"/' argocd/values-production.yaml

# Deploy novou verzi
helm upgrade ucebnice ./helm/ucebnice -f argocd/values-production.yaml

# Nebo s ArgoCD
git add argocd/values-production.yaml
git commit -m "Update to v1.0.5"
git push
argocd app sync ucebnice
```

### Rollback:

```bash
# Rollback na předchozí verzi
helm rollback ucebnice

# Rollback na konkrétní revizi
helm history ucebnice
helm rollback ucebnice 3  # Rollback na revizi 3
```

---

## 🐛 Troubleshooting

### Aplikace nefunguje:

```bash
# 1. Zkontroluj stav podů
kubectl get pods
kubectl describe pod $APP_POD

# 2. Zkontroluj logy
kubectl logs $APP_POD --tail=200

# 3. Zkontroluj environment variables
kubectl exec $APP_POD -- env | grep DATABASE

# 4. Test připojení k PostgreSQL z aplikace
kubectl exec -it $APP_POD -- sh
nc -zv ucebnice-postgres 5432
```

### PostgreSQL nefunguje:

```bash
# 1. Zkontroluj PostgreSQL pod
kubectl describe pod $POSTGRES_POD

# 2. Zkontroluj PVC
kubectl get pvc

# 3. Zkontroluj secret
kubectl get secret ucebnice-postgres-secret -o yaml

# 4. Test připojení
kubectl exec -it $POSTGRES_POD -- psql -U ucebnice_user -d ucebnice_db
```

### SSL certifikát nefunguje:

```bash
# Zkontroluj cert-manager
kubectl get certificate
kubectl describe certificate ucebnice-production-tls

# Zkontroluj Let's Encrypt výzvu
kubectl get challenges

# Force renewal
kubectl delete certificate ucebnice-production-tls
```

### Migrace selhávají:

```bash
# Zkontroluj, zda DATABASE_URL je správné
kubectl get secret ucebnice-secret -o jsonpath='{.data.DATABASE_URL}' | base64 -d

# Spusť migrations manuálně s debug
kubectl exec -it $APP_POD -- sh
export DEBUG="prisma:*"
npx prisma migrate deploy
```

---

## 🔒 Bezpečnost

### Doporučení:

- ✅ **Silné hesla**: Použij minimálně 32 znaků pro PostgreSQL a NextAuth secret
- ✅ **Sealed Secrets**: Použij Sealed Secrets pro GitOps workflow
- ✅ **Network Policies**: Omezte síťový provoz mezi pody
- ✅ **RBAC**: Nastav správná oprávnění pro service accounts
- ✅ **Regular backups**: Automatické zálohy databáze
- ✅ **SSL/TLS**: Vždy používej HTTPS
- ✅ **Update dependencies**: Pravidelně aktualizuj Docker images a npm packages

### Sealed Secrets (pro ArgoCD):

```bash
# Install sealed-secrets controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Install kubeseal CLI
brew install kubeseal  # macOS
# nebo stáhni binary z GitHub releases

# Vytvoř sealed secret
kubectl create secret generic ucebnice-secret \
  --from-literal=DATABASE_URL="postgresql://..." \
  --dry-run=client -o yaml | \
  kubeseal -o yaml > argocd/ucebnice-sealed-secret.yaml

# Commitni sealed secret do Gitu
git add argocd/ucebnice-sealed-secret.yaml
git commit -m "Add production secrets"
git push
```

---

## 📞 Užitečné Příkazy

```bash
# Quick reference card

# Logs
kubectl logs -l app.kubernetes.io/name=ucebnice -f
kubectl logs $POSTGRES_POD -f

# Shell access
kubectl exec -it $APP_POD -- sh
kubectl exec -it $POSTGRES_POD -- psql -U ucebnice_user -d ucebnice_db

# Restart
kubectl rollout restart deployment/ucebnice

# Scale
kubectl scale deployment/ucebnice --replicas=5

# Port forward
kubectl port-forward deployment/ucebnice 3000:3000

# Debug
kubectl describe pod $APP_POD
kubectl get events --sort-by='.lastTimestamp'

# Metrics
kubectl top pods
kubectl top nodes

# Clean up
helm uninstall ucebnice
kubectl delete pvc ucebnice-postgres-pvc
```

---

## ✅ Checklist pro Produkci

Před nasazením do produkce zkontroluj:

- [ ] Silné heslo pro PostgreSQL nastaveno
- [ ] NextAuth secret vygenerován a nastaven
- [ ] SSL certifikát funguje (https://ucebnice.praut.cz)
- [ ] Registrace a přihlášení funguje
- [ ] Databázové migrace proběhly úspěšně
- [ ] Všechny pody jsou ve stavu Running
- [ ] PostgreSQL persistence je nakonfigurovaná
- [ ] Backups jsou nastavené (automatické nebo manuální)
- [ ] Monitoring a alerty nastaveny (volitelné)
- [ ] Health check endpoint odpovídá (https://ucebnice.praut.cz/api/health)
- [ ] Resources (CPU/Memory) jsou správně nastavené
- [ ] HPA (Horizontal Pod Autoscaler) funguje
- [ ] Longhorn storage class existuje
- [ ] Harbor registry credentials jsou správné

---

## 🎉 Hotovo!

Tvoje aplikace teď běží na produkčním Kubernetes clusteru s PostgreSQL!

**URL:** https://ucebnice.praut.cz

Pro další pomoc nebo otázky, kontaktuj DevOps team nebo se podívej do dokumentace:
- Kubernetes: https://kubernetes.io/docs
- Helm: https://helm.sh/docs
- Prisma: https://www.prisma.io/docs
- Next.js: https://nextjs.org/docs
