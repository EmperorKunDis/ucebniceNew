# Sealed Secrets Setup for Argo CD

Guide for encrypting secrets using Bitnami Sealed Secrets that can be safely committed to Git.

## Prerequisites

### 1. Install Sealed Secrets Controller in Cluster

```bash
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml
```

Verify installation:

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

### Harbor Registry Secret (imagePullSecrets)

```bash
# Create namespace first
kubectl create namespace ucebnice --dry-run=client -o yaml | kubectl apply -f -

# Create the secret (don't apply yet)
kubectl create secret docker-registry harbor-registry-secret \
  --docker-server=harbor.YOUR-DOMAIN.com \
  --docker-username=YOUR-USERNAME \
  --docker-password=YOUR-PASSWORD \
  --namespace=ucebnice \
  --dry-run=client -o yaml > /tmp/harbor-secret.yaml

# Seal the secret
kubeseal -f /tmp/harbor-secret.yaml -w argocd/harbor-registry-sealed-secret.yaml

# Clean up temporary file
rm /tmp/harbor-secret.yaml
```

### Application Secrets

```bash
# Create application secrets
kubectl create secret generic ucebnice-secret \
  --from-literal=DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require" \
  --from-literal=NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  --from-literal=GOOGLE_CLIENT_ID="your-google-client-id" \
  --from-literal=GOOGLE_CLIENT_SECRET="your-google-client-secret" \
  --from-literal=UPSTASH_REDIS_REST_URL="your-upstash-url" \
  --from-literal=UPSTASH_REDIS_REST_TOKEN="your-upstash-token" \
  --from-literal=NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn" \
  --namespace=ucebnice \
  --dry-run=client -o yaml > /tmp/app-secret.yaml

# Seal the secret
kubeseal -f /tmp/app-secret.yaml -w argocd/ucebnice-sealed-secret.yaml

# Clean up
rm /tmp/app-secret.yaml
```

## Apply Sealed Secrets

Once created, you can safely commit these to Git:

```bash
# Add to Git
git add argocd/harbor-registry-sealed-secret.yaml
git add argocd/ucebnice-sealed-secret.yaml
git commit -m "Add sealed secrets for production"
git push

# Apply directly (or let Argo CD sync)
kubectl apply -f argocd/harbor-registry-sealed-secret.yaml
kubectl apply -f argocd/ucebnice-sealed-secret.yaml
```

## Verify Secrets

The Sealed Secrets controller will automatically decrypt and create the actual secrets:

```bash
# Check sealed secrets
kubectl get sealedsecrets -n ucebnice

# Check actual secrets (created by controller)
kubectl get secrets -n ucebnice

# Verify harbor secret
kubectl get secret harbor-registry-secret -n ucebnice -o yaml

# Verify app secret
kubectl get secret ucebnice-secret -n ucebnice -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```

## Update Values Files

Once sealed secrets are created, they don't need to be referenced in values.yaml since they're applied separately. Just remove the secrets section from values files.

## Updating Secrets

To update a sealed secret:

```bash
# 1. Create new secret yaml
kubectl create secret generic ucebnice-secret \
  --from-literal=DATABASE_URL="new-database-url" \
  --from-literal=NEXTAUTH_SECRET="new-secret" \
  --namespace=ucebnice \
  --dry-run=client -o yaml > /tmp/app-secret.yaml

# 2. Seal it (overwrite existing)
kubeseal -f /tmp/app-secret.yaml -w argocd/ucebnice-sealed-secret.yaml

# 3. Commit and push
git add argocd/ucebnice-sealed-secret.yaml
git commit -m "Update sealed secrets"
git push

# 4. Apply (or let Argo CD sync)
kubectl apply -f argocd/ucebnice-sealed-secret.yaml

# 5. Restart pods to use new secrets
kubectl rollout restart deployment/ucebnice -n ucebnice
```

## Backup Controller Key

**IMPORTANT**: Backup the sealed secrets controller private key. If you lose it, you won't be able to decrypt your sealed secrets!

```bash
# Backup the key
kubectl get secret -n kube-system sealed-secrets-key -o yaml > sealed-secrets-key-backup.yaml

# Store this file securely (NOT in Git!)
```

To restore on a new cluster:

```bash
kubectl apply -f sealed-secrets-key-backup.yaml
kubectl delete pod -n kube-system -l name=sealed-secrets-controller
```

## Troubleshooting

### Secret not being decrypted

```bash
# Check controller logs
kubectl logs -n kube-system -l name=sealed-secrets-controller

# Check sealed secret status
kubectl describe sealedsecret harbor-registry-secret -n ucebnice
```

### Re-encrypt for different cluster

If you need to encrypt for a different cluster:

```bash
# Fetch public key from target cluster
kubeseal --fetch-cert \
  --controller-name=sealed-secrets-controller \
  --controller-namespace=kube-system \
  > pub-cert.pem

# Seal using specific cert
kubeseal --cert=pub-cert.pem -f secret.yaml -w sealed-secret.yaml
```

## Security Notes

1. ✅ Sealed secrets are safe to commit to Git
2. ✅ Only your cluster can decrypt them (using controller's private key)
3. ❌ Never commit unsealed secrets (original yaml files)
4. ✅ Backup the controller's private key securely
5. ✅ Rotate secrets periodically
6. ✅ Use different sealed secrets for staging/production
