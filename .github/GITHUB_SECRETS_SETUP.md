# GitHub Secrets Setup Guide

Guide for configuring GitHub repository secrets for CI/CD pipeline.

## Required Secrets

Your GitHub Actions workflow needs these secrets to push Docker images to Harbor:

1. **HARBOR_USERNAME** - Harbor robot account username (with push permission)
2. **HARBOR_PASSWORD** - Harbor robot account token

## Step 1: Create Harbor Robot Account for CI/CD

**Important**: This is a **different** robot account from the one used by Kubernetes!

### In Harbor (harbor.praut.cz):

1. Log into Harbor
2. Go to your `ucebnice` project
3. Click **"Robot Accounts"** → **"+ NEW ROBOT ACCOUNT"**

4. Configure:

   ```
   Name: github-actions-pusher
   Expiration: 1 year (or Never)
   Description: GitHub Actions CI/CD - builds and pushes images

   Permissions:
   ☑️ Pull   (needed to use cache layers)
   ☑️ Push   (needed to push new images)
   ```

5. Click **"ADD"**

6. **Save the credentials** (shown only once!):
   ```
   Username: robot$github-actions-pusher
   Token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 2: Add Secrets to GitHub Repository

### Via GitHub Web UI:

1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. In the left sidebar, click **"Secrets and variables"** → **"Actions"**
4. Click **"New repository secret"**

### Add HARBOR_USERNAME:

```
Name: HARBOR_USERNAME
Value: robot$github-actions-pusher
```

Click **"Add secret"**

### Add HARBOR_PASSWORD:

```
Name: HARBOR_PASSWORD
Value: [paste the robot token from Harbor]
```

Click **"Add secret"**

## Step 3: Verify Secrets

After adding both secrets, you should see:

```
HARBOR_USERNAME
HARBOR_PASSWORD
```

in your repository secrets list.

**Note**: You cannot view the secret values after creation, only update them.

## Step 4: Test the Workflow

### Option 1: Push to main branch

```bash
git add .
git commit -m "feat: Add Kubernetes deployment configuration"
git push origin main
```

GitHub Actions will automatically:

1. Build Docker image
2. Push to `harbor.praut.cz/ucebnice/ucebnice-app:main`
3. Push to `harbor.praut.cz/ucebnice/ucebnice-app:latest`
4. Push to `harbor.praut.cz/ucebnice/ucebnice-app:main-<commit-sha>`

### Option 2: Create a version tag

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will push:

- `harbor.praut.cz/ucebnice/ucebnice-app:v1.0.0`
- `harbor.praut.cz/ucebnice/ucebnice-app:1.0.0`
- `harbor.praut.cz/ucebnice/ucebnice-app:1.0`
- `harbor.praut.cz/ucebnice/ucebnice-app:1`
- `harbor.praut.cz/ucebnice/ucebnice-app:latest`

### Check Workflow Status

1. Go to your repository on GitHub
2. Click **"Actions"** tab
3. See the running workflow
4. Click on the workflow run to see details

## Image Tagging Strategy

The workflow automatically tags images based on the trigger:

| Trigger           | Image Tags                              |
| ----------------- | --------------------------------------- |
| Push to `main`    | `main`, `latest`, `main-abc123`         |
| Push to `develop` | `develop`, `develop-abc123`             |
| Tag `v1.0.0`      | `v1.0.0`, `1.0.0`, `1.0`, `1`, `latest` |
| Pull Request      | `pr-123` (not pushed to registry)       |

## Troubleshooting

### Error: Invalid credentials

```
Error: buildx failed with: ERROR: failed to solve: failed to push
harbor.praut.cz/ucebnice/ucebnice-app:latest: unexpected status from
POST request to https://harbor.praut.cz/v2/ucebnice/ucebnice-app/blobs/uploads/:
403 Forbidden
```

**Solutions:**

1. Verify robot account has **Push** permission (not just Pull)
2. Check robot account is not disabled in Harbor
3. Verify secrets are correct:
   - Username includes `robot$` prefix
   - Password is the full token
4. Re-create robot account if needed

### Error: Project not found

```
Error: denied: requested access to the resource is denied
```

**Solutions:**

1. Verify project `ucebnice` exists in Harbor
2. Check robot account has access to the project
3. Ensure robot account is created within the project

### Workflow doesn't run

**Solutions:**

1. Check workflow file is in `.github/workflows/docker-build.yml`
2. Verify workflow is enabled in repository settings
3. Check branch protection rules aren't blocking workflow

### Secrets not found

```
Error: Username and password required
```

**Solutions:**

1. Verify secrets are named exactly:
   - `HARBOR_USERNAME` (not Harbor_Username)
   - `HARBOR_PASSWORD` (not Harbor_Password)
2. Check secrets are set at repository level (not environment level)
3. Re-add secrets if needed

## Security Best Practices

✅ **Use robot account** - Never use personal Harbor credentials
✅ **Minimal permissions** - Pull + Push only for CI/CD project
✅ **Separate accounts** - Different robot for K8s pull vs CI/CD push
✅ **Regular rotation** - Rotate robot tokens annually
✅ **Monitor usage** - Check Harbor audit logs
❌ **Never commit secrets** - Secrets stay in GitHub settings only

## Robot Account Summary

You should have **two** Harbor robot accounts:

### 1. Kubernetes Pull (for cluster)

```
Name: k8s-puller
Username: robot$k8s-puller
Permissions: Pull only
Used in: Sealed Secret (harbor-registry-sealed-secret.yaml)
Purpose: Kubernetes pulls images from Harbor
```

### 2. GitHub Actions Push (for CI/CD)

```
Name: github-actions-pusher
Username: robot$github-actions-pusher
Permissions: Pull + Push
Used in: GitHub Secrets (HARBOR_USERNAME, HARBOR_PASSWORD)
Purpose: GitHub Actions builds and pushes images to Harbor
```

## Complete Deployment Flow

```
1. Developer pushes code to GitHub
   ↓
2. GitHub Actions workflow triggers
   ↓
3. Workflow logs into Harbor using HARBOR_USERNAME/PASSWORD
   ↓
4. Builds Docker image
   ↓
5. Pushes image to harbor.praut.cz/ucebnice/ucebnice-app:TAG
   ↓
6. Argo CD detects new image or Git change
   ↓
7. Argo CD pulls image using harbor-registry-secret (from sealed secret)
   ↓
8. Deployment updated in Kubernetes
```

## Next Steps

After setting up GitHub secrets:

1. ✅ Commit and push your code
2. ✅ Verify workflow runs successfully
3. ✅ Check Harbor for new images
4. ✅ Deploy to Kubernetes via Argo CD

## Quick Reference

```bash
# Test locally before pushing
make docker-test

# Push to trigger CI/CD
git push origin main

# Create version tag
git tag v1.0.0
git push origin v1.0.0

# Check workflow status
# Visit: https://github.com/YOUR-ORG/ucebnice/actions

# Check images in Harbor
# Visit: https://harbor.praut.cz/harbor/projects/1/repositories/ucebnice/ucebnice-app
```

## Links

- GitHub Repository Settings: `https://github.com/YOUR-ORG/ucebnice/settings/secrets/actions`
- Harbor Robot Accounts: `https://harbor.praut.cz/harbor/projects/1/robot-accounts`
- GitHub Actions: `https://github.com/YOUR-ORG/ucebnice/actions`
