#!/bin/bash
set -e

# Script to create sealed secret for PostgreSQL credentials
# Usage: ./create-postgres-sealed-secret.sh [namespace]

NAMESPACE=${1:-ucebnice}
SECRET_NAME="ucebnice-postgres-secret"

echo "Creating PostgreSQL sealed secret for namespace: $NAMESPACE"
echo ""

# Generate a secure password
POSTGRES_PASSWORD=$(openssl rand -base64 32)

echo "Generated PostgreSQL password (save this securely!):"
echo "Password: $POSTGRES_PASSWORD"
echo ""

# Create the secret
kubectl create secret generic $SECRET_NAME \
  --from-literal=username=ucebnice \
  --from-literal=password="$POSTGRES_PASSWORD" \
  --namespace=$NAMESPACE \
  --dry-run=client -o yaml > /tmp/postgres-secret.yaml

# Seal the secret
echo "Sealing secret..."
kubeseal -f /tmp/postgres-secret.yaml -w argocd/postgres-sealed-secret.yaml

# Clean up
rm /tmp/postgres-secret.yaml

echo ""
echo "✅ Sealed secret created: argocd/postgres-sealed-secret.yaml"
echo ""
echo "⚠️  IMPORTANT: Save the password securely!"
echo "   Password: $POSTGRES_PASSWORD"
echo "   You'll need it for:"
echo "   - Direct database access (psql, pgAdmin, etc.)"
echo "   - Database backups and restores"
echo "   - Emergency recovery"
echo ""
echo "⚠️  DO NOT add this password to values-production.yaml!"
echo "   The sealed secret will automatically create the secret in the cluster."
echo ""
echo "Next steps:"
echo "1. Commit the sealed secret to Git:"
echo "   git add argocd/postgres-sealed-secret.yaml"
echo "   git commit -m 'Add PostgreSQL sealed secret'"
echo "   git push"
echo ""
echo "2. Apply the sealed secret to the cluster:"
echo "   kubectl apply -f argocd/postgres-sealed-secret.yaml"
echo ""
echo "3. Verify the secret was created:"
echo "   kubectl get secret -n $NAMESPACE ucebnice-postgres-secret"
echo ""
echo "4. The PostgreSQL pod will use this secret automatically when it starts."