#!/bin/bash
# Server Test Commands - Příkazy pro testování na serveru
# Spusť TYTO PŘÍKAZY NA SERVERU (ne lokálně!)

echo "🧪 SERVER TEST COMMANDS"
echo "======================="
echo ""
echo "DŮLEŽITÉ: Tyto příkazy spusť NA SERVERU, ne lokálně!"
echo ""
echo "Krok 1: SSH na server"
echo "---------------------"
echo "ssh user@tvuj-server.praut.cz"
echo ""

echo "Krok 2: Pull změny z GitHubu"
echo "----------------------------"
cat << 'EOF'
cd /path/to/ucebnice
git fetch origin
git checkout filip-bugsrepair-and-databaze-migration
git pull origin filip-bugsrepair-and-databaze-migration
git log --oneline -3
EOF
echo ""

echo "Krok 3: Vytvoř testovací namespace"
echo "----------------------------------"
cat << 'EOF'
kubectl create namespace ucebnice-test
kubectl config set-context --current --namespace=ucebnice-test
kubectl get namespaces | grep ucebnice
EOF
echo ""

echo "Krok 4: Vygeneruj testovací secrets"
echo "------------------------------------"
cat << 'EOF'
# Vygeneruj hesla
POSTGRES_PASSWORD=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Ulož si je (DŮLEŽITÉ!)
echo "POSTGRES_PASSWORD: $POSTGRES_PASSWORD" > ~/test-secrets.txt
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET" >> ~/test-secrets.txt
cat ~/test-secrets.txt

# Vytvoř Kubernetes Secret
kubectl create secret generic ucebnice-secret \
  --namespace ucebnice-test \
  --from-literal=DATABASE_URL="postgresql://ucebnice_user:${POSTGRES_PASSWORD}@ucebnice-postgres:5432/ucebnice_db" \
  --from-literal=NEXTAUTH_SECRET="${NEXTAUTH_SECRET}" \
  --from-literal=NEXTAUTH_URL="https://ucebnice-test.praut.cz"

# Ověř
kubectl get secret ucebnice-secret -n ucebnice-test
EOF
echo ""

echo "Krok 5: Build Docker image"
echo "---------------------------"
cat << 'EOF'
cd /path/to/ucebnice

# Build
docker build -t harbor.praut.cz/ucebnice/ucebnice-app:test-v1.0.4 .

# Push (může trvat několik minut)
docker push harbor.praut.cz/ucebnice/ucebnice-app:test-v1.0.4

# Ověř, že image je v registry
docker images | grep ucebnice
EOF
echo ""

echo "Krok 6: Připrav testovací values"
echo "---------------------------------"
cat << 'EOF'
# Vytvoř kopii
cp argocd/values-production.yaml /tmp/values-test.yaml

# Edituj pro test (změň tyto hodnoty):
nano /tmp/values-test.yaml

# ZMĚŇ:
#   image.tag: "test-v1.0.4"
#   ingress.hosts[0].host: "ucebnice-test.praut.cz"
#   config.NEXTAUTH_URL: "https://ucebnice-test.praut.cz"
#   postgresql.persistence.size: "5Gi"
EOF
echo ""

echo "Krok 7: Deploy do test namespace"
echo "---------------------------------"
cat << 'EOF'
helm upgrade --install ucebnice-test ./helm/ucebnice \
  --namespace ucebnice-test \
  -f /tmp/values-test.yaml \
  --wait \
  --timeout 10m

# Sleduj deployment
kubectl get pods -n ucebnice-test -w
EOF
echo ""

echo "Krok 8: Zkontroluj PostgreSQL"
echo "------------------------------"
cat << 'EOF'
# Najdi PostgreSQL pod
POSTGRES_POD=$(kubectl get pods -n ucebnice-test -l app.kubernetes.io/component=database -o jsonpath='{.items[0].metadata.name}')
echo "PostgreSQL pod: $POSTGRES_POD"

# Zkontroluj status
kubectl get pod $POSTGRES_POD -n ucebnice-test

# Logy
kubectl logs -n ucebnice-test $POSTGRES_POD --tail=50

# Test připojení
kubectl exec -n ucebnice-test $POSTGRES_POD -- pg_isready -U ucebnice_user -d ucebnice_db

# Připoj se a zkontroluj tabulky
kubectl exec -it -n ucebnice-test $POSTGRES_POD -- psql -U ucebnice_user -d ucebnice_db
# V PostgreSQL: \dt
# Měl bys vidět: User, Chapter, Progress, atd.
# Exit: \q
EOF
echo ""

echo "Krok 9: Zkontroluj aplikaci"
echo "----------------------------"
cat << 'EOF'
# Najdi app pod
APP_POD=$(kubectl get pods -n ucebnice-test -l app.kubernetes.io/name=ucebnice -o jsonpath='{.items[0].metadata.name}')
echo "App pod: $APP_POD"

# Zkontroluj status
kubectl get pods -n ucebnice-test -l app.kubernetes.io/name=ucebnice

# Logy (sleduj chyby)
kubectl logs -n ucebnice-test $APP_POD --tail=100

# Ověř environment variables
kubectl exec -n ucebnice-test $APP_POD -- env | grep -E "DATABASE|NEXTAUTH"
EOF
echo ""

echo "Krok 10: Test Health Endpoint"
echo "------------------------------"
cat << 'EOF'
# Port-forward
kubectl port-forward -n ucebnice-test svc/ucebnice-test 8080:80 &

# Test (v jiném terminálu nebo po pár sekundách)
curl http://localhost:8080/api/health

# Očekávaný output:
# {"status":"ok","timestamp":"...","database":"connected","environment":"production"}
EOF
echo ""

echo "Krok 11: Test v browseru"
echo "-------------------------"
cat << 'EOF'
# Port-forward běží z předchozího kroku
# Otevři browser: http://localhost:8080

# Test registrace:
# - Email: test@example.com
# - Username: testuser
# - Password: TestPassword123

# Ověř v databázi:
POSTGRES_POD=$(kubectl get pods -n ucebnice-test -l app.kubernetes.io/component=database -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it -n ucebnice-test $POSTGRES_POD -- psql -U ucebnice_user -d ucebnice_db -c 'SELECT id, email, username FROM "User";'

# Test přihlášení:
# - Odhlás se
# - Přihlas se s testovacím účtem
# - Zkontroluj dashboard
EOF
echo ""

echo "Krok 12: Zkontroluj migrations"
echo "-------------------------------"
cat << 'EOF'
APP_POD=$(kubectl get pods -n ucebnice-test -l app.kubernetes.io/name=ucebnice -o jsonpath='{.items[0].metadata.name}')

kubectl exec -it -n ucebnice-test $APP_POD -- sh -c "npx prisma migrate status"

# Očekáváno:
# Database schema is up to date!
EOF
echo ""

echo "Krok 13: Restart test"
echo "---------------------"
cat << 'EOF'
# Restart aplikace
kubectl rollout restart deployment/ucebnice-test -n ucebnice-test

# Sleduj
kubectl get pods -n ucebnice-test -w

# Po restartu test health
curl http://localhost:8080/api/health

# Test v browseru - data by měla zůstat
EOF
echo ""

echo "✅ CHECKLIST - Všechno funguje?"
echo "--------------------------------"
cat << 'EOF'
Zkontroluj:
[ ] PostgreSQL pod je Running a Healthy
[ ] App pods jsou Running (všechny replicas)
[ ] Health endpoint vrací "status": "ok"
[ ] Registrace funguje (uživatel v DB)
[ ] Přihlášení funguje
[ ] Migrations jsou aktuální
[ ] Žádné error logy
[ ] Data persistence po restartu
EOF
echo ""

echo "🗑️  CLEANUP (po dokončení testů)"
echo "--------------------------------"
cat << 'EOF'
# Zastav port-forward
pkill -f "port-forward"

# Smaž test namespace (smaže všechno)
kubectl delete namespace ucebnice-test

# Smaž test soubory
rm ~/test-secrets.txt
rm /tmp/values-test.yaml

# Vrať se na default namespace
kubectl config set-context --current --namespace=default
EOF
echo ""

echo "🎉 Po úspěšném testu:"
echo "---------------------"
echo "1. Zkontroluj, že všechny testy prošly ✅"
echo "2. Smaž test namespace"
echo "3. POTOM můžeš nasadit do produkce"
echo ""
echo "PRO PRODUKCI (až po úspěšném testu):"
echo "git checkout main"
echo "git merge filip-bugsrepair-and-databaze-migration"
echo "git push origin main"
echo "./scripts/deploy-production.sh"
echo ""
