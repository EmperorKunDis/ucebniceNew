#!/bin/bash
set -e

# Script to create sealed secrets for Kubernetes
# Usage: ./create-sealed-secrets.sh [namespace]

NAMESPACE=${1:-ucebnice}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Derive release name from namespace (matches Helm chart fullname logic)
# For namespace "ucebnice-production" or "ucebnice-staging", use full namespace as release name
# For namespace "ucebnice", use "ucebnice" as release name
RELEASE_NAME="$NAMESPACE"
SECRET_NAME="${RELEASE_NAME}-secret"

echo "Creating sealed secrets for namespace: $NAMESPACE"
echo "Secret name will be: $SECRET_NAME"

# Check if kubeseal is installed
if ! command -v kubeseal &> /dev/null; then
    echo "Error: kubeseal is not installed"
    echo "Install it from: https://github.com/bitnami-labs/sealed-secrets#installation"
    exit 1
fi

# Check if namespace existsca
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

# Create PostgreSQL secret (if using in-cluster PostgreSQL)
echo ""
read -p "Create PostgreSQL sealed secret? (y/n, default: n): " CREATE_POSTGRES
if [ "$CREATE_POSTGRES" = "y" ] || [ "$CREATE_POSTGRES" = "Y" ]; then
    echo ""
    echo "=== Creating PostgreSQL Secret ==="
    read -p "PostgreSQL username (default: ucebnice): " POSTGRES_USER
    POSTGRES_USER=${POSTGRES_USER:-ucebnice}

    read -sp "PostgreSQL password (leave empty to generate): " POSTGRES_PASSWORD
    echo

    if [ -z "$POSTGRES_PASSWORD" ]; then
        POSTGRES_PASSWORD=$(openssl rand -base64 32)
        echo "Generated PostgreSQL password: $POSTGRES_PASSWORD"
        echo "⚠️  SAVE THIS PASSWORD! You'll need it for:"
        echo "   - Updating argocd/values-production.yaml"
        echo "   - Database access and maintenance"
    fi

    # Secret name matches Helm chart naming: <release-name>-postgres-secret
    POSTGRES_SECRET_NAME="${NAMESPACE}-postgres-secret"

    kubectl create secret generic $POSTGRES_SECRET_NAME \
      --from-literal=username="$POSTGRES_USER" \
      --from-literal=password="$POSTGRES_PASSWORD" \
      --namespace="$NAMESPACE" \
      --dry-run=client -o yaml > /tmp/postgres-secret.yaml

    echo "Sealing PostgreSQL secret..."
    kubeseal -f /tmp/postgres-secret.yaml \
      -w "$PROJECT_ROOT/argocd/postgres-sealed-secret.yaml" \
      --controller-namespace=kube-system \
      --controller-name=sealed-secrets-controller

    rm /tmp/postgres-secret.yaml
    echo "✓ Created: argocd/postgres-sealed-secret.yaml"

    # Store password for later use
    SAVED_POSTGRES_PASSWORD="$POSTGRES_PASSWORD"
fi

# Create application secrets
echo ""
echo "=== Creating Application Secrets ==="
echo "Note: If using in-cluster PostgreSQL, DATABASE_URL will be auto-generated."
read -p "Database URL (leave empty if using in-cluster PostgreSQL): " DATABASE_URL
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
SECRET_CMD="kubectl create secret generic \"$SECRET_NAME\""

# Only add DATABASE_URL if provided (otherwise it's auto-generated from PostgreSQL config)
if [ -n "$DATABASE_URL" ]; then
    SECRET_CMD="$SECRET_CMD --from-literal=DATABASE_URL=\"$DATABASE_URL\""
fi

SECRET_CMD="$SECRET_CMD \
  --from-literal=NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\" \
  --from-literal=GOOGLE_CLIENT_ID=\"$GOOGLE_CLIENT_ID\" \
  --from-literal=GOOGLE_CLIENT_SECRET=\"$GOOGLE_CLIENT_SECRET\" \
  --from-literal=UPSTASH_REDIS_REST_URL=\"$UPSTASH_REDIS_REST_URL\" \
  --from-literal=UPSTASH_REDIS_REST_TOKEN=\"$UPSTASH_REDIS_REST_TOKEN\" \
  --from-literal=NEXT_PUBLIC_SENTRY_DSN=\"$NEXT_PUBLIC_SENTRY_DSN\" \
  --namespace=\"$NAMESPACE\" \
  --dry-run=client -o yaml"

eval $SECRET_CMD > /tmp/app-secret.yaml

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
SEALED_COUNT=1
echo "  $SEALED_COUNT. argocd/harbor-registry-sealed-secret.yaml"
if [ "$CREATE_POSTGRES" = "y" ] || [ "$CREATE_POSTGRES" = "Y" ]; then
    SEALED_COUNT=$((SEALED_COUNT + 1))
    echo "  $SEALED_COUNT. argocd/postgres-sealed-secret.yaml"
fi
SEALED_COUNT=$((SEALED_COUNT + 1))
echo "  $SEALED_COUNT. argocd/ucebnice-sealed-secret.yaml"
echo ""
echo "These files are encrypted and safe to commit to Git!"
echo ""

if [ -n "$SAVED_POSTGRES_PASSWORD" ]; then
    echo "⚠️  PostgreSQL Password: $SAVED_POSTGRES_PASSWORD"
    echo "   IMPORTANT: Save this password securely!"
    echo "   DO NOT add it to values-production.yaml (it would be exposed in git)"
    echo "   The sealed secret will automatically create the secret in the cluster."
    echo ""
fi

if [ -z "$DATABASE_URL" ]; then
    echo "ℹ️  DATABASE_URL not set. It will be auto-generated from PostgreSQL config."
    echo "   Make sure postgresql.enabled=true in your values.yaml"
    echo ""
fi

echo "Next steps:"
echo "  1. Review the sealed secret files"
if [ -n "$SAVED_POSTGRES_PASSWORD" ]; then
    echo "  2. Update argocd/values-production.yaml with PostgreSQL password"
    echo "  3. Commit to Git:"
else
    echo "  2. Commit to Git:"
fi
echo "     git add argocd/*-sealed-secret.yaml"
echo "     git commit -m 'Add sealed secrets for $NAMESPACE'"
echo "     git push"
echo ""
if [ -n "$SAVED_POSTGRES_PASSWORD" ]; then
    echo "  4. Apply to cluster (or let Argo CD sync):"
else
    echo "  3. Apply to cluster (or let Argo CD sync):"
fi
echo "     kubectl apply -f argocd/harbor-registry-sealed-secret.yaml"
if [ "$CREATE_POSTGRES" = "y" ] || [ "$CREATE_POSTGRES" = "Y" ]; then
    echo "     kubectl apply -f argocd/postgres-sealed-secret.yaml"
fi
echo "     kubectl apply -f argocd/ucebnice-sealed-secret.yaml"
echo ""
if [ -n "$SAVED_POSTGRES_PASSWORD" ]; then
    echo "  5. Verify secrets were created:"
else
    echo "  4. Verify secrets were created:"
fi
echo "     kubectl get secrets -n $NAMESPACE"