# Kubernetes Deployment Guide

Complete guide for deploying the Učebnice application to Kubernetes using Helm and Argo CD.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring and Troubleshooting](#monitoring-and-troubleshooting)
- [Scaling and Performance](#scaling-and-performance)

## Prerequisites

### Required Infrastructure

- **Kubernetes Cluster** (v1.24+)
- **Argo CD** (installed and configured)
- **Longhorn** (for persistent storage)
- **Harbor** (container registry)
- **Nginx Ingress Controller** (or Traefik)
- **cert-manager** (for TLS certificates)

### Required Tools

```bash
# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Install Argo CD CLI (optional but recommended)
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd-linux-amd64
sudo mv argocd-linux-amd64 /usr/local/bin/argocd
```

### External Services Required

1. **PostgreSQL Database** (Neon, Supabase, or in-cluster)
2. **Upstash Redis** (for rate limiting)
3. **Google OAuth** credentials
4. **Sentry** (optional - for error tracking)

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Argo CD                           │
│  (GitOps - Automatic Deployment)                    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              Helm Chart (ucebnice)                  │
│  ┌──────────┬──────────┬──────────┬──────────────┐ │
│  │Deployment│ Service  │ Ingress  │ ConfigMap/   │ │
│  │  (2-20   │          │ (Nginx)  │ Secret       │ │
│  │  Pods)   │          │          │              │ │
│  └──────────┴──────────┴──────────┴──────────────┘ │
└─────────────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌────────┐  ┌─────────┐  ┌─────────┐
│ Harbor │  │Postgres │  │ Upstash │
│Registry│  │   DB    │  │  Redis  │
└────────┘  └─────────┘  └─────────┘
```

## Quick Start

### 1. Configure Your Environment

Update the following files with your actual values:

**`argocd/application.yaml`**:

```yaml
source:
  repoURL: https://github.com/YOUR-ORG/ucebnice.git # Your Git repo
```

**`argocd/values-production.yaml`**:

```yaml
image:
  repository: harbor.YOUR-DOMAIN.com/ucebnice/ucebnice-app

ingress:
  hosts:
    - host: ucebnice.YOUR-DOMAIN.com
```

**`.github/workflows/docker-build.yml`**:

```yaml
env:
  REGISTRY: harbor.YOUR-DOMAIN.com
```

### 2. Create Namespace and Secrets

```bash
# Create namespace
kubectl create namespace ucebnice

# Create Harbor registry secret
kubectl create secret docker-registry harbor-registry-secret \
  --docker-server=harbor.YOUR-DOMAIN.com \
  --docker-username=YOUR-USERNAME \
  --docker-password=YOUR-PASSWORD \
  --namespace=ucebnice

# Create application secrets
./scripts/kubernetes/create-secrets.sh ucebnice
```

Or use the interactive script:

```bash
chmod +x scripts/kubernetes/create-secrets.sh
./scripts/kubernetes/create-secrets.sh ucebnice
```

### 3. Build and Push Docker Image

```bash
# Build the image locally
docker build -t harbor.YOUR-DOMAIN.com/ucebnice/ucebnice-app:v1.0.0 .

# Login to Harbor
docker login harbor.YOUR-DOMAIN.com

# Push the image
docker push harbor.YOUR-DOMAIN.com/ucebnice/ucebnice-app:v1.0.0
```

Or let GitHub Actions do it automatically (see [CI/CD Pipeline](#cicd-pipeline)).

### 4. Deploy with Argo CD

```bash
# Apply the Argo CD Application
kubectl apply -f argocd/application.yaml

# Check status
kubectl get application -n argocd ucebnice

# Watch the deployment
kubectl -n ucebnice get pods -w
```

### 5. Verify Deployment

```bash
# Check pods
kubectl -n ucebnice get pods

# Check services
kubectl -n ucebnice get svc

# Check ingress
kubectl -n ucebnice get ingress

# Test health endpoint
kubectl -n ucebnice port-forward svc/ucebnice 3000:80
curl http://localhost:3000/api/health
```

## Detailed Setup

### Setting Up PostgreSQL

#### Option 1: External PostgreSQL (Recommended)

Use a managed PostgreSQL service like:

- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Supabase](https://supabase.com) - PostgreSQL with additional features
- [Railway](https://railway.app) - Simple cloud deployment

Get the connection string and add it to secrets:

```bash
kubectl create secret generic ucebnice-secret \
  --from-literal=DATABASE_URL="postgresql://user:password@host:5432/ucebnice?sslmode=require" \
  --namespace=ucebnice
```

#### Option 2: In-Cluster PostgreSQL with Longhorn

Enable PostgreSQL in `values.yaml`:

```yaml
postgresql:
  enabled: true
  auth:
    username: ucebnice
    password: CHANGE-ME
    database: ucebnice
  primary:
    persistence:
      enabled: true
      storageClass: 'longhorn'
      size: 10Gi
```

Then update the DATABASE_URL secret:

```bash
DATABASE_URL="postgresql://ucebnice:CHANGE-ME@ucebnice-postgresql:5432/ucebnice"
```

### Configuring Secrets

#### Method 1: Manual Kubernetes Secrets (Development)

```bash
kubectl create secret generic ucebnice-secret \
  --from-literal=DATABASE_URL="postgresql://..." \
  --from-literal=NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  --from-literal=GOOGLE_CLIENT_ID="..." \
  --from-literal=GOOGLE_CLIENT_SECRET="..." \
  --from-literal=UPSTASH_REDIS_REST_URL="..." \
  --from-literal=UPSTASH_REDIS_REST_TOKEN="..." \
  --from-literal=NEXT_PUBLIC_SENTRY_DSN="..." \
  --namespace=ucebnice
```

#### Method 2: Sealed Secrets (Recommended for Production)

Install Sealed Secrets controller:

```bash
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml
```

Create and seal a secret:

```bash
# Create a secret file
kubectl create secret generic ucebnice-secret \
  --from-literal=DATABASE_URL="postgresql://..." \
  --dry-run=client -o yaml > secret.yaml

# Seal it
kubeseal -f secret.yaml -w sealed-secret.yaml

# Apply sealed secret
kubectl apply -f sealed-secret.yaml -n ucebnice

# Commit sealed-secret.yaml to Git (it's encrypted)
git add sealed-secret.yaml
```

#### Method 3: External Secrets Operator

Install External Secrets Operator and configure it to sync from your secret store (Vault, AWS Secrets Manager, etc.).

### Setting Up Ingress and TLS

#### Install cert-manager (if not already installed)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

#### Create ClusterIssuer for Let's Encrypt

```yaml
# letsencrypt-prod.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
```

Apply it:

```bash
kubectl apply -f letsencrypt-prod.yaml
```

The ingress is already configured in `values.yaml` to use cert-manager:

```yaml
ingress:
  annotations:
    cert-manager.io/cluster-issuer: 'letsencrypt-prod'
```

## CI/CD Pipeline

### GitHub Actions Workflow

The `.github/workflows/docker-build.yml` workflow automatically:

1. Builds Docker image on push to main/develop
2. Pushes to Harbor registry
3. Tags images with version, branch, and commit SHA
4. Triggers Argo CD sync

### Required GitHub Secrets

Add these secrets to your GitHub repository:

```
HARBOR_USERNAME      - Harbor registry username
HARBOR_PASSWORD      - Harbor registry password
```

### Automatic Deployment Flow

```
1. Developer pushes code to main branch
   ↓
2. GitHub Actions builds Docker image
   ↓
3. Image pushed to Harbor with tag (e.g., main-abc123)
   ↓
4. Argo CD detects change in Git
   ↓
5. Argo CD syncs and deploys new version
   ↓
6. Kubernetes rolls out update with zero downtime
```

### Manual Deployment

To deploy a specific version:

```bash
# Update image tag in argocd/application.yaml
# Or use the deployment script
./scripts/kubernetes/deploy.sh production v1.0.0
```

### Argo CD Image Updater (Optional)

Install Argo CD Image Updater to automatically update image tags:

```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml
```

Add annotation to your Application:

```yaml
metadata:
  annotations:
    argocd-image-updater.argoproj.io/image-list: ucebnice=harbor.example.com/ucebnice/ucebnice-app
    argocd-image-updater.argoproj.io/ucebnice.update-strategy: latest
```

## Monitoring and Troubleshooting

### View Application in Argo CD

```bash
# CLI
argocd app get ucebnice

# Or access the UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Visit https://localhost:8080
```

### Check Pod Status

```bash
# List pods
kubectl -n ucebnice get pods

# Describe pod
kubectl -n ucebnice describe pod <pod-name>

# View logs
kubectl -n ucebnice logs <pod-name>

# Follow logs
kubectl -n ucebnice logs -f <pod-name>

# View previous container logs (if crashed)
kubectl -n ucebnice logs <pod-name> --previous
```

### Database Migration Issues

If Prisma migrations fail:

```bash
# Check init container logs
kubectl -n ucebnice logs <pod-name> -c prisma-migrate

# Run migration manually
kubectl -n ucebnice exec -it <pod-name> -- npx prisma migrate deploy
```

### Health Check

```bash
# Port forward to service
kubectl -n ucebnice port-forward svc/ucebnice 3000:80

# Test health endpoint
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-01-30T12:00:00.000Z",
  "uptime": 123.456,
  "database": "connected"
}
```

### Common Issues

#### Pods in ImagePullBackOff

```bash
# Check secret exists
kubectl -n ucebnice get secret harbor-registry-secret

# Verify image exists in Harbor
docker pull harbor.example.com/ucebnice/ucebnice-app:latest
```

#### Pods in CrashLoopBackOff

```bash
# Check logs
kubectl -n ucebnice logs <pod-name>

# Common causes:
# 1. Missing environment variables
# 2. Database connection issues
# 3. Invalid NEXTAUTH_SECRET
```

#### Database Connection Errors

```bash
# Test database connectivity from pod
kubectl -n ucebnice exec -it <pod-name> -- sh
# Inside pod:
npx prisma db pull
```

## Scaling and Performance

### Horizontal Pod Autoscaler (HPA)

HPA is enabled by default in `values.yaml`:

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80
```

Monitor HPA:

```bash
kubectl -n ucebnice get hpa
kubectl -n ucebnice describe hpa ucebnice
```

### Manual Scaling

```bash
# Scale to 5 replicas
kubectl -n ucebnice scale deployment ucebnice --replicas=5
```

### Resource Limits

Adjust in `values.yaml`:

```yaml
resources:
  limits:
    cpu: 2000m
    memory: 2Gi
  requests:
    cpu: 500m
    memory: 1Gi
```

### Pod Disruption Budget

Ensures at least 1 pod is always running during updates:

```yaml
podDisruptionBudget:
  enabled: true
  minAvailable: 1
```

### Performance Monitoring

```bash
# View resource usage
kubectl -n ucebnice top pods

# View node resource usage
kubectl top nodes
```

## Rollback

### Using Argo CD

```bash
# View history
argocd app history ucebnice

# Rollback to previous version
argocd app rollback ucebnice <revision-number>
```

### Using kubectl

```bash
# View rollout history
kubectl -n ucebnice rollout history deployment/ucebnice

# Rollback to previous version
kubectl -n ucebnice rollout undo deployment/ucebnice

# Rollback to specific revision
kubectl -n ucebnice rollout undo deployment/ucebnice --to-revision=2
```

## Maintenance

### Updating Helm Chart

```bash
# Make changes to helm/ucebnice/values.yaml
# Commit and push
git add helm/ucebnice/
git commit -m "Update Helm chart configuration"
git push

# Argo CD will automatically sync
```

### Database Backup

```bash
# If using in-cluster PostgreSQL with Longhorn
# Longhorn provides automatic snapshots

# For external database, use provider's backup tools
# Example for manual backup:
kubectl -n ucebnice exec -it ucebnice-postgresql-0 -- \
  pg_dump -U ucebnice ucebnice > backup.sql
```

### Updating Dependencies

```bash
# Update Next.js and dependencies
npm update

# Rebuild and push new image
docker build -t harbor.example.com/ucebnice/ucebnice-app:v1.1.0 .
docker push harbor.example.com/ucebnice/ucebnice-app:v1.1.0

# Update image tag in Argo CD Application
```

## Security Best Practices

1. **Use Sealed Secrets** or External Secrets Operator for sensitive data
2. **Enable Network Policies** (set `networkPolicy.enabled: true`)
3. **Run as non-root user** (already configured in Dockerfile)
4. **Use read-only root filesystem** where possible
5. **Keep images updated** and scan for vulnerabilities
6. **Enable TLS** for all ingress routes
7. **Rotate secrets** regularly

## Additional Resources

- [Helm Documentation](https://helm.sh/docs/)
- [Argo CD Documentation](https://argo-cd.readthedocs.io/)
- [Longhorn Documentation](https://longhorn.io/docs/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Support

For issues:

1. Check logs: `kubectl -n ucebnice logs <pod-name>`
2. Check Argo CD UI for sync errors
3. Verify all secrets are created correctly
4. Test database connectivity
5. Review this guide for common issues
