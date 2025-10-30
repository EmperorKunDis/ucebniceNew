#!/bin/bash
set -e

# Script to create Kubernetes secrets for ucebnice application
# Usage: ./create-secrets.sh [namespace]

NAMESPACE=${1:-ucebnice}

echo "Creating secrets in namespace: $NAMESPACE"

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo "Creating namespace $NAMESPACE..."
    kubectl create namespace "$NAMESPACE"
fi

# Create Harbor registry secret
echo "Creating Harbor registry secret..."
read -p "Harbor username: " HARBOR_USERNAME
read -sp "Harbor password: " HARBOR_PASSWORD
echo

kubectl create secret docker-registry harbor-registry-secret \
  --docker-server=harbor.example.com \
  --docker-username="$HARBOR_USERNAME" \
  --docker-password="$HARBOR_PASSWORD" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

# Create application secrets
echo "Creating application secrets..."
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

read -p "Sentry DSN (optional): " NEXT_PUBLIC_SENTRY_DSN

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
  --dry-run=client -o yaml | kubectl apply -f -

echo "Secrets created successfully!"