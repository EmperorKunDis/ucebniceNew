# Manual Deployment Testing Guide

Test the complete deployment workflow manually before enabling GitHub Actions automation.

## Overview

This guide walks you through:

1. Building Docker image locally
2. Pushing to Harbor manually
3. Installing Sealed Secrets controller
4. Applying sealed secrets
5. Deploying with Argo CD (manual sync)
6. Verifying everything works

## Prerequisites

- [x] Docker installed and running
- [x] kubectl configured for your cluster
- [x] Harbor robot accounts created (both k8s-puller and github-actions-pusher)
- [x] Sealed secrets created (`argocd/*-sealed-secret.yaml`)
- [ ] kubeseal CLI installed
- [ ] Argo CD installed in cluster

## Step-by-Step Manual Testing

### Step 1: Login to Harbor

```bash
# Login with your GitHub Actions robot account (has push permission)
docker login harbor.praut.cz

# Username: robot$github-actions-pusher
# Password: [paste robot token]
```

Verify login:

```
Login Succeeded
```

---

### Step 2: Build and Push Image

Using Makefile (recommended):

```bash
# Build and push in one command
make push

# This will:
# 1. Build: harbor.praut.cz/ucebnice/ucebnice-app:<git-version>
# 2. Tag: harbor.praut.cz/ucebnice/ucebnice-app:latest
# 3. Push both tags to Harbor
```

Or manually:

```bash
# Build
docker build -t harbor.praut.cz/ucebnice/ucebnice-app:test .

# Tag as latest
docker tag harbor.praut.cz/ucebnice/ucebnice-app:test \
           harbor.praut.cz/ucebnice/ucebnice-app:latest

# Push both
docker push harbor.praut.cz/ucebnice/ucebnice-app:test
docker push harbor.praut.cz/ucebnice/ucebnice-app:latest
```

Verify in Harbor:

- Go to `https://harbor.praut.cz`
- Navigate to `ucebnice/ucebnice-app` repository
- See the new image tags

---

### Step 3: Install Sealed Secrets Controller

Only needed once per cluster:

```bash
# Install controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Wait for pod to be ready
kubectl wait --for=condition=Ready pod \
  -l name=sealed-secrets-controller \
  -n kube-system \
  --timeout=60s

# Verify it's running
kubectl get pods -n kube-system | grep sealed-secrets
```

Expected output:

```
sealed-secrets-controller-xxxxx   1/1     Running   0          30s
```

---

### Step 4: Apply Sealed Secrets

```bash
# Apply sealed secrets to cluster
make apply-sealed-secrets

# Or manually:
kubectl apply -f argocd/harbor-registry-sealed-secret.yaml
kubectl apply -f argocd/ucebnice-sealed-secret.yaml
```

Wait a few seconds for controller to decrypt them, then verify:

```bash
# Check sealed secrets were created
kubectl get sealedsecrets -n ucebnice

# Check actual secrets were decrypted
kubectl get secrets -n ucebnice
```

Expected output:

```
NAME                     TYPE                             DATA   AGE
harbor-registry-secret   kubernetes.io/dockerconfigjson   1      10s
ucebnice-secret          Opaque                           7      10s
```

Verify secret content (optional):

```bash
# Verify harbor secret exists
kubectl get secret harbor-registry-secret -n ucebnice -o yaml

# Verify app secret has all keys
kubectl get secret ucebnice-secret -n ucebnice -o jsonpath='{.data}' | jq keys
```

Should show: `["DATABASE_URL", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "NEXTAUTH_SECRET", ...]`

---

### Step 5: Test Helm Chart (Dry Run)

Before deploying with Argo CD, test the Helm chart:

```bash
# Lint the chart
make helm-lint

# Generate manifests (dry run)
make helm-template > /tmp/manifests.yaml

# Review the generated manifests
less /tmp/manifests.yaml
```

Check for:

- ✅ Deployment with correct image
- ✅ Service configured
- ✅ Ingress with your domain
- ✅ ConfigMap with environment variables
- ✅ References to secrets

---

### Step 6: Deploy with Argo CD (Manual Sync)

Create a temporary Argo CD Application without auto-sync:

```bash
# Copy and edit application.yaml for manual testing
cp argocd/application.yaml /tmp/application-manual.yaml
```

Edit `/tmp/application-manual.yaml` and **remove** the `syncPolicy.automated` section:

```yaml
spec:
  syncPolicy:
    # Remove automated section for manual testing
    # automated:
    #   prune: true
    #   selfHeal: true

    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
```

Apply the application:

```bash
# Apply Argo CD Application
kubectl apply -f /tmp/application-manual.yaml

# Check status
kubectl get application -n argocd ucebnice
```

---

### Step 7: Manually Sync via Argo CD

#### Option A: Using Argo CD CLI

```bash
# Sync the application manually
argocd app sync ucebnice

# Watch the sync progress
argocd app wait ucebnice

# Check status
argocd app get ucebnice
```

#### Option B: Using Argo CD UI

```bash
# Port forward to Argo CD server
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d; echo
```

1. Visit `https://localhost:8080`
2. Login with `admin` / [password from above]
3. Find `ucebnice` application
4. Click **"SYNC"** button
5. Click **"SYNCHRONIZE"**
6. Watch deployment progress

---

### Step 8: Monitor Deployment

```bash
# Watch pods being created
kubectl -n ucebnice get pods -w

# In another terminal, check deployment status
kubectl -n ucebnice get deployment

# Check replica sets
kubectl -n ucebnice get rs

# Check events
kubectl -n ucebnice get events --sort-by='.lastTimestamp'
```

Wait for pods to be `Running`:

```
NAME                        READY   STATUS    RESTARTS   AGE
ucebnice-xxx-yyy            1/1     Running   0          30s
ucebnice-xxx-zzz            1/1     Running   0          30s
```

---

### Step 9: Check Logs

```bash
# View logs from all pods
make logs-production

# Or specific pod
kubectl -n ucebnice logs -f <pod-name>

# Check init container logs (Prisma migrations)
kubectl -n ucebnice logs <pod-name> -c prisma-migrate
```

Look for:

- ✅ "Next.js ready"
- ✅ "Ready in XXXms"
- ✅ No database connection errors
- ✅ Prisma migrations completed (if enabled)

---

### Step 10: Verify Services

```bash
# Check all resources
make status-production

# Or manually:
kubectl -n ucebnice get all
```

Verify:

- ✅ Deployment: 2-3 replicas ready
- ✅ Service: ClusterIP with port 80
- ✅ Ingress: Configured with your domain
- ✅ HPA: Created (if enabled)
- ✅ PDB: Created (if enabled)

---

### Step 11: Test Health Endpoint

```bash
# Port forward to service
kubectl -n ucebnice port-forward svc/ucebnice 3000:80

# In another terminal, test health
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-10-30T...",
  "uptime": 123.456,
  "database": "connected"
}
```

---

### Step 12: Check Ingress and TLS

```bash
# Get ingress details
kubectl -n ucebnice describe ingress ucebnice

# Check if cert-manager created certificate
kubectl -n ucebnice get certificate

# Check certificate status
kubectl -n ucebnice describe certificate ucebnice-tls
```

If cert-manager is working:

```
Status:
  Conditions:
    Type:    Ready
    Status:  True
```

---

### Step 13: Test Application

If DNS is configured:

```bash
# Test HTTPS endpoint
curl https://ucebnice.praut.cz/api/health

# Or visit in browser
# https://ucebnice.praut.cz
```

If DNS not yet configured, use port-forward:

```bash
# Port forward to pod
kubectl -n ucebnice port-forward svc/ucebnice 3000:80

# Test in browser
# http://localhost:3000
```

---

### Step 14: Test Scaling

```bash
# Check current HPA status
kubectl -n ucebnice get hpa

# Manually scale (if HPA disabled)
kubectl -n ucebnice scale deployment ucebnice --replicas=5

# Watch scaling
kubectl -n ucebnice get pods -w

# Scale back down
kubectl -n ucebnice scale deployment ucebnice --replicas=2
```

---

### Step 15: Test Rolling Update

Test that updates work:

```bash
# Make a small change (e.g., add a comment to Dockerfile)
echo "# Test update" >> Dockerfile

# Rebuild and push
make push

# Update image in Argo CD
argocd app set ucebnice -p image.tag=<new-version>

# Sync
argocd app sync ucebnice

# Watch rolling update
kubectl -n ucebnice rollout status deployment/ucebnice
```

Verify:

- ✅ Old pods terminated gracefully
- ✅ New pods start successfully
- ✅ No downtime (if multiple replicas)

---

## Troubleshooting

### Pods in ImagePullBackOff

```bash
# Check pod events
kubectl -n ucebnice describe pod <pod-name>

# Verify harbor secret exists
kubectl -n ucebnice get secret harbor-registry-secret

# Test secret manually
kubectl -n ucebnice run test-pull \
  --image=harbor.praut.cz/ucebnice/ucebnice-app:latest \
  --restart=Never
```

**Solution**: Re-create sealed secret with correct robot account credentials.

---

### Pods in CrashLoopBackOff

```bash
# Check logs
kubectl -n ucebnice logs <pod-name>

# Common issues:
# - Missing DATABASE_URL
# - Invalid NEXTAUTH_SECRET
# - Database connection failed
```

**Solution**: Check `ucebnice-secret` has all required keys:

```bash
kubectl get secret ucebnice-secret -n ucebnice -o jsonpath='{.data}' | jq keys
```

---

### Argo CD Sync Failed

```bash
# Check application status
argocd app get ucebnice

# View detailed error
kubectl -n argocd describe application ucebnice
```

**Common issues**:

- Helm values file path incorrect
- Git repository not accessible
- Sealed secrets not decrypted yet

---

### Database Connection Error

```bash
# Get shell in pod
kubectl -n ucebnice exec -it <pod-name> -- sh

# Inside pod, test database
npx prisma db pull
```

**Solution**: Verify DATABASE_URL in sealed secret is correct.

---

## Success Criteria

After manual testing, verify:

- [x] ✅ Image builds successfully
- [x] ✅ Image pushes to Harbor
- [x] ✅ Sealed secrets decrypt correctly
- [x] ✅ Pods start and run (2-3 replicas)
- [x] ✅ Health endpoint returns "ok"
- [x] ✅ Database connection works
- [x] ✅ Ingress configured (TLS optional for now)
- [x] ✅ Application accessible
- [x] ✅ Rolling updates work
- [x] ✅ Scaling works

---

## After Manual Testing Success

Once everything works manually:

### 1. Enable Auto-Sync in Argo CD

Edit `argocd/application.yaml` and uncomment automated sync:

```yaml
syncPolicy:
  automated:
    prune: true
    selfHeal: true
    allowEmpty: false
```

### 2. Set up GitHub Secrets

Add to GitHub repository settings:

- `HARBOR_USERNAME`: `robot$github-actions-pusher`
- `HARBOR_PASSWORD`: [robot token]

### 3. Commit and Push

```bash
git add .
git commit -m "feat: Add Kubernetes deployment with Helm, Argo CD, and Sealed Secrets"
git push origin main
```

### 4. Verify GitHub Actions

- Go to GitHub → Actions tab
- Watch workflow run
- Verify image pushed to Harbor
- Argo CD should auto-sync and deploy

---

## Quick Commands Reference

```bash
# Build and push
make push

# Apply sealed secrets
make apply-sealed-secrets

# Deploy with Argo CD
argocd app sync ucebnice

# Check status
make status-production
argocd app get ucebnice

# View logs
make logs-production

# Port forward
kubectl -n ucebnice port-forward svc/ucebnice 3000:80

# Test health
curl http://localhost:3000/api/health

# Scale
kubectl -n ucebnice scale deployment ucebnice --replicas=3

# Rollback
kubectl -n ucebnice rollout undo deployment/ucebnice
```

Good luck with your manual testing! 🚀
