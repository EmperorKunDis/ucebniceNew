# Kubernetes Deployment Checklist

Complete checklist for deploying Učebnice to Kubernetes with Argo CD.

## ✅ Current Status

Based on what you've completed:

- [x] Docker image tested locally and working
- [x] `values-production.yaml` configured for `ucebnice.praut.cz`
- [x] Sealed secrets created (`make sealed-secrets-production`)
- [ ] GitHub secrets configured
- [ ] First deployment to Kubernetes

## 📋 Deployment Steps

### Step 1: Harbor Robot Accounts ⚠️ DO THIS FIRST

You need **TWO** robot accounts in Harbor:

#### 1.1 Robot Account for Kubernetes (Pull Only)

In Harbor (harbor.praut.cz):

- [ ] Go to `ucebnice` project
- [ ] Create robot account: `k8s-puller`
  - Permissions: ☑️ Pull only
  - Expiration: Never
- [ ] Save credentials:
  ```
  Username: robot$k8s-puller
  Token: [save this!]
  ```

#### 1.2 Robot Account for GitHub Actions (Push + Pull)

In Harbor (harbor.praut.cz):

- [ ] Go to `ucebnice` project
- [ ] Create robot account: `github-actions-pusher`
  - Permissions: ☑️ Pull + ☑️ Push
  - Expiration: 1 year
- [ ] Save credentials:
  ```
  Username: robot$github-actions-pusher
  Token: [save this!]
  ```

**Documentation**: See `.github/HARBOR_ROBOT_ACCOUNT.md`

---

### Step 2: Create Sealed Secrets

**Note**: You mentioned you already ran this. If the sealed secret files exist in `argocd/`, skip to Step 3.

```bash
make sealed-secrets-production
```

When prompted, use the **k8s-puller** robot account:

```
Harbor URL: harbor.praut.cz
Harbor username: robot$k8s-puller
Harbor password: [paste k8s-puller token]

Database URL: [your Neon/Supabase URL]
NextAuth Secret: [leave empty to auto-generate]
Google Client ID: [your Google OAuth ID]
Google Client Secret: [your Google OAuth secret]
Upstash Redis URL: [your Upstash URL]
Upstash Redis Token: [your Upstash token]
Sentry DSN: [optional]
```

This creates:

- [ ] `argocd/harbor-registry-sealed-secret.yaml`
- [ ] `argocd/ucebnice-sealed-secret.yaml`

**Documentation**: See `SEALED_SECRETS_QUICKSTART.md`

---

### Step 3: Configure GitHub Secrets

In your GitHub repository settings:

- [ ] Go to `Settings` → `Secrets and variables` → `Actions`
- [ ] Add secret `HARBOR_USERNAME`:
  ```
  robot$github-actions-pusher
  ```
- [ ] Add secret `HARBOR_PASSWORD`:
  ```
  [paste github-actions-pusher token]
  ```

**Documentation**: See `.github/GITHUB_SECRETS_SETUP.md`

---

### Step 4: Commit and Push Everything

```bash
# Check what will be committed
git status

# You should see:
# - argocd/harbor-registry-sealed-secret.yaml (safe - encrypted!)
# - argocd/ucebnice-sealed-secret.yaml (safe - encrypted!)
# - argocd/values-production.yaml
# - argocd/application.yaml
# - All Helm chart files
# - Updated .github/workflows/docker-build.yml

# Commit sealed secrets (they're encrypted, safe to commit!)
git add argocd/*-sealed-secret.yaml
git add argocd/values-production.yaml
git add argocd/application.yaml
git add .github/workflows/docker-build.yml
git add helm/
git add Dockerfile .dockerignore
git add Makefile
git add scripts/kubernetes/
git add KUBERNETES_DEPLOYMENT.md
git add DEPLOYMENT_SUMMARY.md

git commit -m "feat: Add Kubernetes deployment with Helm, Argo CD, and Sealed Secrets"
git push origin main
```

Checklist:

- [ ] Sealed secrets committed to Git
- [ ] GitHub Actions workflow updated
- [ ] Pushed to `main` branch

---

### Step 5: Verify GitHub Actions Build

After pushing:

- [ ] Go to GitHub → `Actions` tab
- [ ] Watch the "Build and Push Docker Image" workflow
- [ ] Verify it completes successfully
- [ ] Check Harbor for new image: `harbor.praut.cz/ucebnice/ucebnice-app:main`

If workflow fails, check `.github/GITHUB_SECRETS_SETUP.md` troubleshooting section.

---

### Step 6: Install Sealed Secrets Controller (One-time)

In your Kubernetes cluster:

```bash
# Install Sealed Secrets controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Verify it's running
kubectl get pods -n kube-system | grep sealed-secrets
```

Checklist:

- [ ] Sealed Secrets controller installed
- [ ] Controller pod is running

**Documentation**: See `SEALED_SECRETS_QUICKSTART.md`

---

### Step 7: Apply Sealed Secrets to Cluster

```bash
# Apply sealed secrets (they will be auto-decrypted by controller)
make apply-sealed-secrets

# Or manually:
kubectl apply -f argocd/harbor-registry-sealed-secret.yaml
kubectl apply -f argocd/ucebnice-sealed-secret.yaml

# Verify secrets were created
kubectl get secrets -n ucebnice
```

You should see:

- `harbor-registry-secret`
- `ucebnice-secret`

Checklist:

- [ ] Sealed secrets applied
- [ ] Regular secrets auto-created
- [ ] Namespace `ucebnice` exists

---

### Step 8: Deploy with Argo CD

```bash
# Apply Argo CD Application
kubectl apply -f argocd/application.yaml

# Check Argo CD application status
argocd app get ucebnice

# Or via UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Visit: https://localhost:8080
```

Checklist:

- [ ] Argo CD Application created
- [ ] Application status is "Healthy" and "Synced"
- [ ] Pods are running

---

### Step 9: Verify Deployment

```bash
# Check pods
kubectl -n ucebnice get pods

# Check services
kubectl -n ucebnice get svc

# Check ingress
kubectl -n ucebnice get ingress

# Check logs
kubectl -n ucebnice logs -l app.kubernetes.io/name=ucebnice --tail=50

# Test health endpoint
kubectl -n ucebnice port-forward svc/ucebnice 3000:80
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

Checklist:

- [ ] All pods are running (2-3 replicas)
- [ ] Health check returns "ok"
- [ ] Database is connected
- [ ] Ingress is configured

---

### Step 10: Configure DNS

Point your domain to the Kubernetes ingress:

```bash
# Get ingress IP
kubectl -n ucebnice get ingress ucebnice -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

Then create DNS A record:

```
ucebnice.praut.cz → [Ingress IP]
```

Checklist:

- [ ] DNS A record created
- [ ] DNS propagated (check with `nslookup ucebnice.praut.cz`)
- [ ] cert-manager created TLS certificate
- [ ] HTTPS working: `https://ucebnice.praut.cz`

---

### Step 11: Test the Application

- [ ] Visit `https://ucebnice.praut.cz`
- [ ] Application loads successfully
- [ ] Can register/login
- [ ] Database queries work
- [ ] OAuth login works (if configured)
- [ ] Test various features

---

## 🎯 Summary of What You Have

### Files Ready:

- ✅ `Dockerfile` - Multi-stage Next.js build
- ✅ `helm/ucebnice/` - Complete Helm chart
- ✅ `argocd/application.yaml` - Argo CD config
- ✅ `argocd/values-production.yaml` - Production values
- ✅ `argocd/*-sealed-secret.yaml` - Encrypted secrets (if created)
- ✅ `.github/workflows/docker-build.yml` - CI/CD pipeline

### Ready to Create:

- ⏳ Harbor robot accounts (2 needed)
- ⏳ GitHub secrets (2 needed)
- ⏳ Deploy to Kubernetes

## 🚀 Quick Start (TL;DR)

If you want to skip the detailed steps:

```bash
# 1. Create Harbor robot accounts (see Step 1)

# 2. Create sealed secrets (if not done)
make sealed-secrets-production

# 3. Add GitHub secrets (see Step 3)

# 4. Commit and push
git add argocd/ helm/ .github/ Dockerfile Makefile
git commit -m "feat: Add Kubernetes deployment"
git push origin main

# 5. Install Sealed Secrets controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# 6. Apply sealed secrets
make apply-sealed-secrets

# 7. Deploy with Argo CD
kubectl apply -f argocd/application.yaml

# 8. Verify
kubectl -n ucebnice get pods
argocd app get ucebnice
```

## 📚 Documentation References

- **Harbor Robot Accounts**: `argocd/HARBOR_ROBOT_ACCOUNT.md`
- **Sealed Secrets**: `SEALED_SECRETS_QUICKSTART.md`
- **GitHub Secrets**: `.github/GITHUB_SECRETS_SETUP.md`
- **Full Deployment Guide**: `KUBERNETES_DEPLOYMENT.md`
- **Docker Testing**: `DOCKER_LOCAL_TESTING.md`

## 🆘 Troubleshooting

If something goes wrong, check:

1. **Pods not starting**: `kubectl -n ucebnice describe pod <pod-name>`
2. **Image pull errors**: Verify `harbor-registry-secret` exists
3. **Database errors**: Check `DATABASE_URL` in `ucebnice-secret`
4. **GitHub Actions fails**: Check GitHub Secrets are set correctly
5. **Argo CD sync issues**: `argocd app get ucebnice` for details

See `KUBERNETES_DEPLOYMENT.md` for comprehensive troubleshooting.

## ✅ Next Steps After Deployment

Once deployed successfully:

- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure backups
- [ ] Set up alerting
- [ ] Test auto-scaling
- [ ] Test rolling updates
- [ ] Document runbook
- [ ] Train team on deployment process

---

**Current Status**: You have everything configured, now you need to:

1. Create Harbor robot accounts
2. Set GitHub secrets
3. Push to Git
4. Deploy to Kubernetes

Good luck! 🚀
