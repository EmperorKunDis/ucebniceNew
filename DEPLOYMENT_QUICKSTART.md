# 🚀 Quick Deployment Guide

## Pre-deployment Checklist

### ✅ Co je připraveno:
- ✅ PostgreSQL v Kubernetes (Helm charts)
- ✅ Automatic Prisma migrations
- ✅ Docker image build configuration
- ✅ Health check endpoint (`/api/health`)
- ✅ SSL/TLS with Let's Encrypt
- ✅ Horizontal Pod Autoscaling
- ✅ Persistent storage (Longhorn)

### 📝 Co musíš udělat:

## 1️⃣ Vygeneruj Secrets

```bash
# PostgreSQL password
POSTGRES_PASSWORD=$(openssl rand -base64 32)
echo "Save this: $POSTGRES_PASSWORD"

# NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "Save this: $NEXTAUTH_SECRET"
```

## 2️⃣ Vytvoř Kubernetes Secret

```bash
kubectl create secret generic ucebnice-secret \
  --from-literal=DATABASE_URL="postgresql://ucebnice_user:${POSTGRES_PASSWORD}@ucebnice-postgres:5432/ucebnice_db" \
  --from-literal=NEXTAUTH_SECRET="${NEXTAUTH_SECRET}" \
  --from-literal=NEXTAUTH_URL="https://ucebnice.praut.cz"
```

## 3️⃣ Build & Push Docker Image

```bash
# Build
docker build -t harbor.praut.cz/ucebnice/ucebnice-app:v1.0.4 .

# Push
docker push harbor.praut.cz/ucebnice/ucebnice-app:v1.0.4
```

## 4️⃣ Update Production Values

Edit `argocd/values-production.yaml`:
```yaml
image:
  tag: "v1.0.4"  # Your version

postgresql:
  auth:
    password: "USE_YOUR_POSTGRES_PASSWORD_HERE"
```

## 5️⃣ Deploy

```bash
./scripts/deploy-production.sh
```

## 6️⃣ Verify

```bash
# Check pods
kubectl get pods

# Check health
curl https://ucebnice.praut.cz/api/health

# View logs
kubectl logs -l app.kubernetes.io/name=ucebnice -f
```

---

## 📚 Full Documentation

For detailed instructions, see:
- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** - Complete production setup guide
- **[QUICK_POSTGRES_SETUP.md](./QUICK_POSTGRES_SETUP.md)** - Local PostgreSQL setup

---

## 🐛 Troubleshooting

### Problem: Pods not starting
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Problem: Database connection failed
```bash
# Check PostgreSQL
kubectl get pods -l app.kubernetes.io/component=database
kubectl logs <postgres-pod>

# Verify secret
kubectl get secret ucebnice-secret -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```

### Problem: SSL certificate not working
```bash
kubectl get certificate
kubectl describe certificate ucebnice-production-tls
```

---

## 📞 Support

For issues, check:
1. Kubernetes events: `kubectl get events --sort-by='.lastTimestamp'`
2. Application logs: `kubectl logs -l app.kubernetes.io/name=ucebnice`
3. PostgreSQL logs: `kubectl logs -l app.kubernetes.io/component=database`
