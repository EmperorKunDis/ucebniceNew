#!/bin/bash
set -e

# Script to create sealed secrets for Kubernetes
# Usage: ./create-sealed-secrets.sh [namespace]

NAMESPACE=${1:-ucebnice}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "Creating sealed secrets for namespace: $NAMESPACE"

# Check if kubeseal is installed
if ! command -v kubeseal &> /dev/null; then
    echo "Error: kubeseal is not installed"
    echo "Install it from: https://github.com/bitnami-labs/sealed-secrets#installation"
    exit 1
fi

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo "Creating namespace $NAMESPACE..."
    kubectl create namespace "$NAMESPACE"
fi

# Create Harbor registry secret
echo ""
echo "=== Creating Harbor Registry Secret ==="
read -p "Harbor registry URL (e.g., harbor.example.com): " HARBOR_URL
read -p "Harbor username: " HARBOR_USERNAME
read -sp "Harbor password: " HARBOR_PASSWORD
echo

kubectl create secret docker-registry harbor-registry-secret \
  --docker-server="$HARBOR_URL" \
  --docker-username="$HARBOR_USERNAME" \
  --docker-password="$HARBOR_PASSWORD" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml > /tmp/harbor-secret.yaml

echo "Sealing Harbor registry secret..."
kubeseal -f /tmp/harbor-secret.yaml \
  -w "$PROJECT_ROOT/argocd/harbor-registry-sealed-secret.yaml" \
  --controller-namespace=kube-system \
  --controller-name=sealed-secrets-controller

rm /tmp/harbor-secret.yaml
echo "✓ Created: argocd/harbor-registry-sealed-secret.yaml"

# Create application secrets
echo ""
echo "=== Creating Application Secrets ==="
read -p "Database URL: " DATABASE_URL
read -sp "NextAuth Secret (leave empty to generate): " NEXTAUTH_SECRET
echo

if [ -z "$NEXTAUTH_SECRET" ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "Generated NextAuth Secret: $NEXTAUTH_SECRET"
fi

read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -sp "Google Client Secret: " GOOGLE_CLIENT_SECRET
echo

read -p "Upstash Redis URL: " UPSTASH_REDIS_REST_URL
read -sp "Upstash Redis Token: " UPSTASH_REDIS_REST_TOKEN
echo

read -p "Sentry DSN (optional, press Enter to skip): " NEXT_PUBLIC_SENTRY_DSN

# Create the secret
kubectl create secret generic ucebnice-secret \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
  --from-literal=GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
  --from-literal=GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
  --from-literal=UPSTASH_REDIS_REST_URL="$UPSTASH_REDIS_REST_URL" \
  --from-literal=UPSTASH_REDIS_REST_TOKEN="$UPSTASH_REDIS_REST_TOKEN" \
  --from-literal=NEXT_PUBLIC_SENTRY_DSN="$NEXT_PUBLIC_SENTRY_DSN" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml > /tmp/app-secret.yaml

echo "Sealing application secrets..."
kubeseal -f /tmp/app-secret.yaml \
  -w "$PROJECT_ROOT/argocd/ucebnice-sealed-secret.yaml" \
  --controller-namespace=kube-system \
  --controller-name=sealed-secrets-controller

rm /tmp/app-secret.yaml
echo "✓ Created: argocd/ucebnice-sealed-secret.yaml"

echo ""
echo "=== Summary ==="
echo "Created sealed secrets:"
echo "  1. argocd/harbor-registry-sealed-secret.yaml"
echo "  2. argocd/ucebnice-sealed-secret.yaml"
echo ""
echo "These files are encrypted and safe to commit to Git!"
echo ""
echo "Next steps:"
echo "  1. Review the sealed secret files"
echo "  2. Commit to Git:"
echo "     git add argocd/*-sealed-secret.yaml"
echo "     git commit -m 'Add sealed secrets for $NAMESPACE'"
echo "     git push"
echo ""
echo "  3. Apply to cluster (or let Argo CD sync):"
echo "     kubectl apply -f argocd/harbor-registry-sealed-secret.yaml"
echo "     kubectl apply -f argocd/ucebnice-sealed-secret.yaml"
echo ""
echo "  4. Verify secrets were created:"
echo "     kubectl get secrets -n $NAMESPACE"