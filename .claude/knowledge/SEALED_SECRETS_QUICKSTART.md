# Sealed Secrets Quick Start Guide

Quick guide to using Sealed Secrets with your Kubernetes deployment.

## What are Sealed Secrets?

Sealed Secrets allow you to encrypt Kubernetes secrets so they can be safely stored in Git. Only your Kubernetes cluster can decrypt them.

## Prerequisites

### 1. Install Sealed Secrets Controller (One-time setup)

```bash
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml
```

Verify:

```bash
kubectl get pods -n kube-system | grep sealed-secrets
```

### 2. Install kubeseal CLI

**Linux:**

```bash
wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/kubeseal-0.24.0-linux-amd64.tar.gz
tar xfz kubeseal-0.24.0-linux-amd64.tar.gz
sudo install -m 755 kubeseal /usr/local/bin/kubeseal
```

**macOS:**

```bash
brew install kubeseal
```

Verify:

```bash
kubeseal --version
```

## Creating Sealed Secrets

### Easy Way: Use the Script

```bash
# For production
make sealed-secrets-production

# For staging
make sealed-secrets-staging
```

This interactive script will:

1. Prompt for Harbor registry credentials
2. Prompt for application secrets (DATABASE_URL, NEXTAUTH_SECRET, etc.)
3. Create sealed secret files in `argocd/` directory
4. Files created:
   - `argocd/harbor-registry-sealed-secret.yaml`
   - `argocd/ucebnice-sealed-secret.yaml`

### Manual Way

**Harbor Registry Secret:**

```bash
kubectl create secret docker-registry harbor-registry-secret \
  --docker-server=harbor.praut.cz \
  --docker-username=YOUR-USERNAME \
  --docker-password=YOUR-PASSWORD \
  --namespace=ucebnice \
  --dry-run=client -o yaml | \
kubeseal -w argocd/harbor-registry-sealed-secret.yaml
```

**Application Secrets:**

```bash
kubectl create secret generic ucebnice-secret \
  --from-literal=DATABASE_URL="postgresql://..." \
  --from-literal=NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  --from-literal=GOOGLE_CLIENT_ID="..." \
  --from-literal=GOOGLE_CLIENT_SECRET="..." \
  --from-literal=UPSTASH_REDIS_REST_URL="..." \
  --from-literal=UPSTASH_REDIS_REST_TOKEN="..." \
  --from-literal=NEXT_PUBLIC_SENTRY_DSN="..." \
  --namespace=ucebnice \
  --dry-run=client -o yaml | \
kubeseal -w argocd/ucebnice-sealed-secret.yaml
```

## Deploying Sealed Secrets

### Option 1: Apply Directly

```bash
# Apply to cluster
make apply-sealed-secrets

# Or manually:
kubectl apply -f argocd/harbor-registry-sealed-secret.yaml
kubectl apply -f argocd/ucebnice-sealed-secret.yaml
```

The Sealed Secrets controller will automatically decrypt and create the actual secrets.

### Option 2: Commit to Git (Recommended with Argo CD)

```bash
# Sealed secrets are safe to commit
git add argocd/*-sealed-secret.yaml
git commit -m "Add sealed secrets for production"
git push

# Argo CD will automatically sync and apply them
```

## Verify Secrets

```bash
# Check sealed secrets (encrypted, safe to view)
kubectl get sealedsecrets -n ucebnice

# Check actual secrets (decrypted by controller)
kubectl get secrets -n ucebnice

# View secret content (base64 encoded)
kubectl get secret ucebnice-secret -n ucebnice -o yaml

# Decode a specific value
kubectl get secret ucebnice-secret -n ucebnice \
  -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```

## Complete Workflow

### Initial Setup

```bash
# 1. Install controller (one-time)
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# 2. Create sealed secrets
make sealed-secrets-production

# 3. Commit to Git
git add argocd/*-sealed-secret.yaml
git commit -m "Add sealed secrets"
git push

# 4. Deploy application via Argo CD
kubectl apply -f argocd/application.yaml
```

### Updating Secrets

```bash
# 1. Re-run the script with new values
make sealed-secrets-production

# 2. Commit and push
git add argocd/*-sealed-secret.yaml
git commit -m "Update sealed secrets"
git push

# 3. Apply (or let Argo CD sync)
make apply-sealed-secrets

# 4. Restart pods to use new secrets
kubectl rollout restart deployment/ucebnice -n ucebnice
```

## File Structure

After creating sealed secrets, you'll have:

```
argocd/
├── application.yaml                    # Argo CD application
├── values-production.yaml              # Helm values (no secrets)
├── harbor-registry-sealed-secret.yaml  # Encrypted registry credentials ✅ Safe for Git
└── ucebnice-sealed-secret.yaml         # Encrypted app secrets ✅ Safe for Git
```

## Important Notes

✅ **Safe to commit**: `*-sealed-secret.yaml` files are encrypted and safe to commit to Git

❌ **Never commit**: Regular `*-secret.yaml` files (these contain plain secrets)

🔐 **Backup**: Backup the controller's private key:

```bash
kubectl get secret -n kube-system sealed-secrets-key -o yaml > sealed-secrets-key-backup.yaml
# Store this file securely (NOT in Git!)
```

🔄 **Rotation**: Sealed secrets are specific to your cluster. If you rebuild the cluster, you'll need the backup key or re-create all sealed secrets.

## Troubleshooting

### Secret not being created

Check controller logs:

```bash
kubectl logs -n kube-system -l name=sealed-secrets-controller
```

Check sealed secret status:

```bash
kubectl describe sealedsecret harbor-registry-secret -n ucebnice
```

### Wrong namespace

Sealed secrets are namespace-scoped. Make sure you're creating them for the correct namespace (`ucebnice`).

### Controller not running

```bash
# Check if controller is running
kubectl get pods -n kube-system | grep sealed-secrets

# If not, reinstall
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml
```

## Next Steps

Once sealed secrets are set up:

1. ✅ Commit sealed secrets to Git
2. ✅ Deploy via Argo CD
3. ✅ Verify secrets were created
4. ✅ Deploy your application

See `KUBERNETES_DEPLOYMENT.md` for complete deployment guide.
