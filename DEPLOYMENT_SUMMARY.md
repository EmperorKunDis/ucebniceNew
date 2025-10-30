# Kubernetes Deployment Package - Summary

Complete Helm chart and Argo CD configuration for deploying Učebnice to Kubernetes.

## 📦 What's Been Created

### Docker Configuration

- ✅ `Dockerfile` - Multi-stage Docker build for Next.js
- ✅ `.dockerignore` - Optimized build context
- ✅ `next.config.js` - Updated with `output: 'standalone'`

### Helm Chart (`helm/ucebnice/`)

```
helm/ucebnice/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default configuration values
├── .helmignore             # Files to ignore in package
├── README.md               # Helm chart documentation
└── templates/
    ├── _helpers.tpl        # Template helpers
    ├── deployment.yaml     # Main application deployment
    ├── service.yaml        # ClusterIP service
    ├── ingress.yaml        # Nginx ingress with TLS
    ├── configmap.yaml      # Non-sensitive environment variables
    ├── secret.yaml         # Sensitive environment variables
    ├── serviceaccount.yaml # Service account
    ├── hpa.yaml            # Horizontal Pod Autoscaler
    └── pdb.yaml            # Pod Disruption Budget
```

### Argo CD Configuration (`argocd/`)

- ✅ `application.yaml` - Argo CD Application manifest
- ✅ `values-production.yaml` - Production environment overrides
- ✅ `values-staging.yaml` - Staging environment overrides

### CI/CD Pipeline

- ✅ `.github/workflows/docker-build.yml` - Automated Docker builds on Git push

### Helper Scripts (`scripts/kubernetes/`)

- ✅ `create-secrets.sh` - Interactive secret creation
- ✅ `deploy.sh` - Deployment automation script

### Application Code

- ✅ `src/app/api/health/route.ts` - Health check endpoint for K8s probes

### Documentation

- ✅ `KUBERNETES_DEPLOYMENT.md` - Comprehensive deployment guide
- ✅ `helm/ucebnice/README.md` - Helm chart quick reference
- ✅ `Makefile` - Common deployment commands

## 🚀 Quick Start Commands

### Prerequisites Checklist

- [ ] Kubernetes cluster with Argo CD installed
- [ ] Longhorn storage class configured
- [ ] Harbor container registry accessible
- [ ] PostgreSQL database (Neon, Supabase, or in-cluster)
- [ ] Upstash Redis account
- [ ] Google OAuth credentials
- [ ] Domain name with DNS configured

### 1. Update Configuration

Edit these files with your actual values:

```bash
# Update Git repository URL
vim argocd/application.yaml
# Change: repoURL to your Git repo

# Update Harbor registry and domain
vim argocd/values-production.yaml
# Change: image.repository and ingress.hosts

# Update GitHub Actions
vim .github/workflows/docker-build.yml
# Change: REGISTRY and IMAGE_NAME
```

### 2. Create Secrets

```bash
# Interactive secret creation
make secrets-production

# Or manually:
kubectl create namespace ucebnice

kubectl create secret docker-registry harbor-registry-secret \
  --docker-server=harbor.YOUR-DOMAIN.com \
  --docker-username=YOUR-USERNAME \
  --docker-password=YOUR-PASSWORD \
  --namespace=ucebnice
```

### 3. Build and Deploy

```bash
# Option A: Using Makefile
make deploy-production VERSION=v1.0.0

# Option B: Manual steps
make build VERSION=v1.0.0
make push VERSION=v1.0.0
kubectl apply -f argocd/application.yaml
```

### 4. Monitor Deployment

```bash
# Watch Argo CD
argocd app get ucebnice

# Watch pods
kubectl -n ucebnice get pods -w

# Check logs
make logs-production

# Check status
make status-production
```

### 5. Verify

```bash
# Test health endpoint
make port-forward-production
# In another terminal:
curl http://localhost:3000/api/health

# Access your application
# https://ucebnice.YOUR-DOMAIN.com
```

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    GitHub Repo                       │
│              (Git Push to main/develop)              │
└────────────────┬─────────────────────────────────────┘
                 │
                 ├─────────────────┐
                 │                 │
                 ▼                 ▼
┌────────────────────────┐  ┌──────────────────────┐
│   GitHub Actions       │  │     Argo CD          │
│   (Build & Push)       │  │  (GitOps Sync)       │
└──────┬─────────────────┘  └──────┬───────────────┘
       │                            │
       ▼                            ▼
┌────────────────────────┐  ┌──────────────────────┐
│  Harbor Registry       │  │   Helm Chart         │
│  (Docker Images)       │  │  (Kubernetes YAML)   │
└────────────────────────┘  └──────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │    Kubernetes Cluster        │
                    │  ┌────────────────────────┐  │
                    │  │  Deployment (2-10 Pods)│  │
                    │  └────────┬───────────────┘  │
                    │           │                  │
                    │  ┌────────▼───────────────┐  │
                    │  │  Service (ClusterIP)   │  │
                    │  └────────┬───────────────┘  │
                    │           │                  │
                    │  ┌────────▼───────────────┐  │
                    │  │  Ingress (Nginx+TLS)   │  │
                    │  └────────────────────────┘  │
                    └──────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  External Users  │
                    └──────────────────┘
```

## 📋 Features Included

### High Availability

- ✅ 2-10 replicas with auto-scaling (HPA)
- ✅ Pod anti-affinity rules
- ✅ Pod Disruption Budget (min 1 pod always running)
- ✅ Rolling updates with zero downtime

### Security

- ✅ Non-root containers
- ✅ Security contexts applied
- ✅ TLS/HTTPS with cert-manager integration
- ✅ Secrets management ready
- ✅ Network policies support

### Observability

- ✅ Health check endpoint (`/api/health`)
- ✅ Liveness and readiness probes
- ✅ Resource limits and requests
- ✅ Metrics-ready for Prometheus

### Database

- ✅ Automatic Prisma migrations (init container)
- ✅ PostgreSQL support (external or in-cluster)
- ✅ Longhorn persistent storage

### DevOps

- ✅ GitOps with Argo CD
- ✅ Automated CI/CD pipeline
- ✅ Multi-environment support (staging/production)
- ✅ Easy rollback capabilities

## 🔧 Common Tasks

### Deploy New Version

```bash
# Tag your code
git tag v1.1.0
git push origin v1.1.0

# GitHub Actions will automatically build and push
# Argo CD will automatically deploy (if auto-sync enabled)

# Or manually:
make deploy-production VERSION=v1.1.0
```

### Scale Application

```bash
# Auto-scaling is enabled by default (2-10 replicas)
# To manually scale:
kubectl -n ucebnice scale deployment ucebnice --replicas=5
```

### Update Configuration

```bash
# Edit values
vim argocd/values-production.yaml

# Commit and push
git add argocd/values-production.yaml
git commit -m "Update production configuration"
git push

# Argo CD will auto-sync
```

### View Logs

```bash
make logs-production
# Or:
kubectl -n ucebnice logs -l app.kubernetes.io/name=ucebnice -f
```

### Rollback

```bash
# Via Argo CD
argocd app rollback ucebnice

# Via kubectl
kubectl -n ucebnice rollout undo deployment/ucebnice
```

### Run Database Migrations

```bash
make db-migrate-production
# Or:
kubectl -n ucebnice exec -it deployment/ucebnice -- npx prisma migrate deploy
```

## 📚 Documentation Files

- **`KUBERNETES_DEPLOYMENT.md`** - Complete deployment guide with troubleshooting
- **`helm/ucebnice/README.md`** - Helm chart quick reference
- **`Makefile`** - All available make commands
- **`argocd/application.yaml`** - Argo CD configuration reference

## ⚙️ Configuration Reference

### Required Secrets

| Secret Key                 | Description                  | Example                                       |
| -------------------------- | ---------------------------- | --------------------------------------------- |
| `DATABASE_URL`             | PostgreSQL connection string | `postgresql://user:pass@host:5432/db`         |
| `NEXTAUTH_SECRET`          | NextAuth.js secret key       | Auto-generated with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID`         | Google OAuth client ID       | From Google Cloud Console                     |
| `GOOGLE_CLIENT_SECRET`     | Google OAuth secret          | From Google Cloud Console                     |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis URL            | From Upstash dashboard                        |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token          | From Upstash dashboard                        |
| `NEXT_PUBLIC_SENTRY_DSN`   | Sentry DSN (optional)        | From Sentry project settings                  |

### Key Values (values.yaml)

| Parameter                   | Production Default | Description            |
| --------------------------- | ------------------ | ---------------------- |
| `replicaCount`              | `3`                | Initial replica count  |
| `autoscaling.minReplicas`   | `3`                | Minimum replicas       |
| `autoscaling.maxReplicas`   | `20`               | Maximum replicas       |
| `resources.requests.memory` | `1Gi`              | Memory request per pod |
| `resources.limits.memory`   | `2Gi`              | Memory limit per pod   |
| `ingress.enabled`           | `true`             | Enable ingress         |

## 🔐 Security Checklist

Before going to production:

- [ ] Update all placeholder domains and URLs
- [ ] Use strong, unique `NEXTAUTH_SECRET`
- [ ] Configure proper PostgreSQL user permissions
- [ ] Enable HTTPS/TLS with valid certificates
- [ ] Use Sealed Secrets or External Secrets Operator
- [ ] Review and adjust resource limits
- [ ] Enable network policies if needed
- [ ] Set up monitoring and alerting
- [ ] Configure database backups
- [ ] Test disaster recovery procedures

## 🆘 Troubleshooting

### Pods not starting

```bash
kubectl -n ucebnice describe pod <pod-name>
kubectl -n ucebnice logs <pod-name>
```

### Database connection issues

```bash
kubectl -n ucebnice exec -it <pod-name> -- sh
# Inside pod:
npx prisma db pull  # Test database connectivity
```

### Image pull issues

```bash
kubectl -n ucebnice get secret harbor-registry-secret
# Verify secret is correct
```

### Argo CD sync issues

```bash
argocd app get ucebnice
argocd app sync ucebnice --prune
```

See `KUBERNETES_DEPLOYMENT.md` for comprehensive troubleshooting guide.

## 📞 Support Resources

- **Full Documentation**: See `KUBERNETES_DEPLOYMENT.md`
- **Helm Chart**: See `helm/ucebnice/README.md`
- **Makefile Help**: Run `make help`
- **Argo CD UI**: `kubectl port-forward svc/argocd-server -n argocd 8080:443`

## ✅ Next Steps

1. **Update Configuration Files**
   - Edit `argocd/application.yaml` with your Git repo
   - Edit `argocd/values-production.yaml` with your domain
   - Edit `.github/workflows/docker-build.yml` with Harbor details

2. **Set Up Secrets**
   - Run `make secrets-production`
   - Or create secrets manually

3. **Build and Deploy**
   - Run `make deploy-production VERSION=v1.0.0`

4. **Configure DNS**
   - Point your domain to Kubernetes ingress IP

5. **Verify Deployment**
   - Access your application via HTTPS
   - Test health endpoint
   - Verify auto-scaling

6. **Set Up Monitoring**
   - Configure Prometheus/Grafana
   - Set up alerts
   - Monitor logs

---

**Generated**: 2025-10-30
**For**: Učebnice Next.js Application
**Cluster**: Kubernetes with Argo CD, Longhorn, Harbor
