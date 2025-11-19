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

# Create PostgreSQL secret (if using in-cluster PostgreSQL)
echo ""
read -p "Create PostgreSQL secret? (y/n, default: n): " CREATE_POSTGRES
if [ "$CREATE_POSTGRES" = "y" ] || [ "$CREATE_POSTGRES" = "Y" ]; then
    echo "Creating PostgreSQL secret..."
    read -p "PostgreSQL username (default: ucebnice): " POSTGRES_USER
    POSTGRES_USER=${POSTGRES_USER:-ucebnice}

    read -sp "PostgreSQL password (leave empty to generate): " POSTGRES_PASSWORD
    echo

    if [ -z "$POSTGRES_PASSWORD" ]; then
        POSTGRES_PASSWORD=$(openssl rand -base64 32)
        echo "Generated PostgreSQL password: $POSTGRES_PASSWORD"
        echo "⚠️  SAVE THIS PASSWORD! You'll need it for database access."
    fi

    kubectl create secret generic ucebnice-postgres-secret \
      --from-literal=username="$POSTGRES_USER" \
      --from-literal=password="$POSTGRES_PASSWORD" \
      --namespace="$NAMESPACE" \
      --dry-run=client -o yaml | kubectl apply -f -

    echo "PostgreSQL secret created!"
fi

# Create application secrets
echo ""
echo "Creating application secrets..."
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

read -p "Sentry DSN (optional): " NEXT_PUBLIC_SENTRY_DSN

# Create the secret
SECRET_CMD="kubectl create secret generic ucebnice-secret"

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

eval $SECRET_CMD | kubectl apply -f -

echo ""
echo "Secrets created successfully!"
echo ""
if [ -z "$DATABASE_URL" ]; then
    echo "ℹ️  DATABASE_URL not set. It will be auto-generated from PostgreSQL config."
    echo "   Make sure postgresql.enabled=true in your values.yaml"
fi