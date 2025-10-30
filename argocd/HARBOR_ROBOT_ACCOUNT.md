# Harbor Robot Account Guide

Guide for creating and using Harbor robot accounts for Kubernetes image pulls.

## Why Use Robot Accounts?

Robot accounts are service accounts designed for automated systems:

✅ **Limited scope** - Access only to specific projects
✅ **Limited permissions** - Read-only or push/pull as needed
✅ **Revocable** - Can be disabled independently
✅ **Auditable** - Separate access logs
✅ **Best practice** - Don't use personal credentials in production

## Creating a Robot Account in Harbor

### Step 1: Access Harbor

1. Log into Harbor: `https://harbor.praut.cz`
2. Navigate to your project (e.g., `ucebnice`)

### Step 2: Create Robot Account

1. Click on your project name
2. Click **"Robot Accounts"** in the left sidebar
3. Click **"+ NEW ROBOT ACCOUNT"** button

### Step 3: Configure Robot Account

**Name:** `k8s-puller` or `ucebnice-k8s`

- Will become: `robot$k8s-puller`

**Expiration:**

- `Never` (recommended for production)
- Or set to 1 year and renew annually

**Description:**

```
Kubernetes image pull for ucebnice production cluster
```

**Permissions:**

- ☑️ **Pull** (required for Kubernetes)
- ☐️ **Push** (not needed - CI/CD uses different account)

**Coverage:**

- Select the repository or leave as "All repositories" in the project

### Step 4: Save Credentials

⚠️ **IMPORTANT**: Credentials are shown **only once**!

Copy and save:

```
Username: robot$k8s-puller
Token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

Save these in a password manager or use immediately with sealed secrets.

## Using Robot Account with Sealed Secrets

### Method 1: Interactive Script (Recommended)

```bash
make sealed-secrets-production
```

When prompted:

```
Harbor registry URL: harbor.praut.cz
Harbor username: robot$k8s-puller
Harbor password: [paste robot token]
```

### Method 2: Manual Creation

```bash
kubectl create secret docker-registry harbor-registry-secret \
  --docker-server=harbor.praut.cz \
  --docker-username='robot$k8s-puller' \
  --docker-password='YOUR-ROBOT-TOKEN' \
  --namespace=ucebnice \
  --dry-run=client -o yaml | \
kubeseal -w argocd/harbor-registry-sealed-secret.yaml
```

**Note**: Use single quotes around username to prevent shell expansion of `$`

## Testing Robot Account

### Test Docker Login

```bash
docker login harbor.praut.cz
Username: robot$k8s-puller
Password: [paste robot token]
```

If successful:

```
Login Succeeded
```

### Test Image Pull

```bash
docker pull harbor.praut.cz/ucebnice/ucebnice-app:latest
```

### Test from Kubernetes

After creating the sealed secret:

```bash
# Apply sealed secret
kubectl apply -f argocd/harbor-registry-sealed-secret.yaml

# Verify secret was created
kubectl get secret harbor-registry-secret -n ucebnice

# Test by creating a test pod
kubectl run test-pull \
  --image=harbor.praut.cz/ucebnice/ucebnice-app:latest \
  --image-pull-policy=Always \
  --namespace=ucebnice \
  --restart=Never

# Check if pod starts
kubectl get pod test-pull -n ucebnice

# Clean up
kubectl delete pod test-pull -n ucebnice
```

## Managing Robot Accounts

### View Robot Accounts

1. Go to Harbor project
2. Click "Robot Accounts"
3. See all robot accounts and their status

### Disable Robot Account

1. Find the robot account
2. Click the "Disable" button
3. Kubernetes will no longer be able to pull images

### Refresh Token (Rotate Credentials)

1. Delete old robot account
2. Create new robot account with same name
3. Re-create sealed secret with new token
4. Apply to cluster
5. Restart deployments to use new secret

```bash
# Re-create sealed secret
make sealed-secrets-production

# Apply
make apply-sealed-secrets

# Restart deployment
kubectl rollout restart deployment/ucebnice -n ucebnice
```

## Multiple Environments

Create separate robot accounts for each environment:

### Production

```
Name: k8s-prod-puller
Username: robot$k8s-prod-puller
Used in: ucebnice namespace
```

### Staging

```
Name: k8s-staging-puller
Username: robot$k8s-staging-puller
Used in: ucebnice-staging namespace
```

## CI/CD Robot Account (Separate)

For GitHub Actions to **push** images, create a different robot account:

```
Name: github-actions-pusher
Permissions: ☑️ Pull, ☑️ Push
Used in: GitHub Actions workflow
```

Add to GitHub Secrets:

```
HARBOR_USERNAME: robot$github-actions-pusher
HARBOR_PASSWORD: [robot token]
```

## Security Best Practices

✅ **Use minimal permissions** - Pull-only for Kubernetes
✅ **One robot per use case** - Separate for K8s pull vs CI/CD push
✅ **Regular rotation** - Rotate tokens annually
✅ **Monitor usage** - Check Harbor logs for unauthorized access
✅ **Expiration** - Set expiration dates and renew before expiry
❌ **Never commit tokens** - Use sealed secrets
❌ **Don't share tokens** - Each cluster gets its own robot

## Troubleshooting

### Error: Invalid credentials

```
Failed to pull image "harbor.praut.cz/ucebnice/app:latest":
rpc error: code = Unknown desc = Error response from daemon:
unauthorized: unauthorized to access repository
```

**Solutions:**

1. Verify robot account has "Pull" permission
2. Check robot account is not disabled
3. Verify username includes `robot$` prefix
4. Re-create sealed secret with correct credentials

### Error: ImagePullBackOff

```bash
# Check if secret exists
kubectl get secret harbor-registry-secret -n ucebnice

# Check secret content
kubectl get secret harbor-registry-secret -n ucebnice -o yaml

# Check pod events
kubectl describe pod <pod-name> -n ucebnice
```

### Error: Secret not found

The sealed secret may not have been applied or decrypted:

```bash
# Check sealed secrets
kubectl get sealedsecrets -n ucebnice

# Check controller logs
kubectl logs -n kube-system -l name=sealed-secrets-controller

# Re-apply sealed secret
kubectl apply -f argocd/harbor-registry-sealed-secret.yaml
```

## Reference

- **Harbor Project**: `ucebnice`
- **Robot Username Format**: `robot$<name>`
- **Kubernetes Secret Name**: `harbor-registry-secret`
- **Sealed Secret File**: `argocd/harbor-registry-sealed-secret.yaml`
- **Namespace**: `ucebnice` (production) or `ucebnice-staging` (staging)

## Quick Commands

```bash
# Create sealed secret (interactive)
make sealed-secrets-production

# Apply sealed secret
make apply-sealed-secrets

# Verify secret exists
kubectl get secret harbor-registry-secret -n ucebnice

# Test with temporary pod
kubectl run test-pull \
  --image=harbor.praut.cz/ucebnice/ucebnice-app:latest \
  --namespace=ucebnice \
  --restart=Never
```
