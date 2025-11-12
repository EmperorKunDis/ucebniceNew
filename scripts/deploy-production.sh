#!/bin/bash

# Production Deployment Script for ucebnice.praut.cz
# This script deploys the application to Kubernetes with PostgreSQL

set -e

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="default"
RELEASE_NAME="ucebnice"
CHART_PATH="./helm/ucebnice"
VALUES_FILE="./argocd/values-production.yaml"

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if helm is available
if ! command -v helm &> /dev/null; then
    print_error "helm is not installed. Please install helm first."
    exit 1
fi

# Check if we can connect to the cluster
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

print_success "Connected to Kubernetes cluster"

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    print_warning "Namespace $NAMESPACE does not exist. Creating..."
    kubectl create namespace "$NAMESPACE"
    print_success "Namespace $NAMESPACE created"
fi

# Check if sealed secret exists
if ! kubectl get secret ucebnice-secret -n "$NAMESPACE" &> /dev/null; then
    print_error "Secret 'ucebnice-secret' does not exist in namespace $NAMESPACE"
    echo ""
    echo "Please create the sealed secret first with the following keys:"
    echo "  - DATABASE_URL: postgresql://ucebnice_user:STRONG_PASSWORD@ucebnice-postgres:5432/ucebnice_db"
    echo "  - NEXTAUTH_SECRET: (generate with: openssl rand -base64 32)"
    echo "  - NEXTAUTH_URL: https://ucebnice.praut.cz"
    echo ""
    echo "Example command to create the secret:"
    echo "kubectl create secret generic ucebnice-secret -n $NAMESPACE \\"
    echo "  --from-literal=DATABASE_URL='postgresql://ucebnice_user:YOUR_PASSWORD@ucebnice-postgres:5432/ucebnice_db' \\"
    echo "  --from-literal=NEXTAUTH_SECRET='YOUR_SECRET' \\"
    echo "  --from-literal=NEXTAUTH_URL='https://ucebnice.praut.cz'"
    echo ""
    exit 1
fi

print_success "Secret 'ucebnice-secret' found"

# Install or upgrade the Helm release
echo ""
echo "📦 Deploying Helm chart..."

if helm list -n "$NAMESPACE" | grep -q "$RELEASE_NAME"; then
    echo "Upgrading existing release..."
    helm upgrade "$RELEASE_NAME" "$CHART_PATH" \
        -n "$NAMESPACE" \
        -f "$VALUES_FILE" \
        --wait \
        --timeout 10m
    print_success "Helm release upgraded"
else
    echo "Installing new release..."
    helm install "$RELEASE_NAME" "$CHART_PATH" \
        -n "$NAMESPACE" \
        -f "$VALUES_FILE" \
        --wait \
        --timeout 10m
    print_success "Helm release installed"
fi

# Wait for PostgreSQL to be ready
echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod \
    -l app.kubernetes.io/component=database \
    -n "$NAMESPACE" \
    --timeout=300s || true

# Check PostgreSQL status
POSTGRES_POD=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/component=database -o jsonpath='{.items[0].metadata.name}')
if [ -n "$POSTGRES_POD" ]; then
    print_success "PostgreSQL pod: $POSTGRES_POD"
    
    # Test PostgreSQL connection
    echo "Testing PostgreSQL connection..."
    if kubectl exec -n "$NAMESPACE" "$POSTGRES_POD" -- pg_isready -U ucebnice_user -d ucebnice_db &> /dev/null; then
        print_success "PostgreSQL is ready"
    else
        print_warning "PostgreSQL is not ready yet"
    fi
else
    print_warning "Could not find PostgreSQL pod"
fi

# Wait for application pods to be ready
echo ""
echo "⏳ Waiting for application pods to be ready..."
kubectl wait --for=condition=ready pod \
    -l app.kubernetes.io/name=ucebnice \
    -n "$NAMESPACE" \
    --timeout=300s || true

# Get deployment status
echo ""
echo "📊 Deployment Status:"
kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=ucebnice
kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/component=database

# Get service and ingress info
echo ""
echo "🌐 Network Information:"
kubectl get svc -n "$NAMESPACE" -l app.kubernetes.io/name=ucebnice
kubectl get ingress -n "$NAMESPACE"

# Check if all pods are running
RUNNING_PODS=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=ucebnice --field-selector=status.phase=Running --no-headers | wc -l)
TOTAL_PODS=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=ucebnice --no-headers | wc -l)

echo ""
if [ "$RUNNING_PODS" -eq "$TOTAL_PODS" ] && [ "$TOTAL_PODS" -gt 0 ]; then
    print_success "All application pods are running ($RUNNING_PODS/$TOTAL_PODS)"
else
    print_warning "Some pods are not running yet ($RUNNING_PODS/$TOTAL_PODS)"
fi

# Final message
echo ""
echo "═══════════════════════════════════════════════════════════"
print_success "Deployment completed!"
echo ""
echo "🌐 Your application should be available at:"
echo "   https://ucebnice.praut.cz"
echo ""
echo "📝 Useful commands:"
echo "   View logs:       kubectl logs -n $NAMESPACE -l app.kubernetes.io/name=ucebnice -f"
echo "   View pods:       kubectl get pods -n $NAMESPACE"
echo "   View events:     kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp'"
echo "   Restart:         kubectl rollout restart deployment/$RELEASE_NAME -n $NAMESPACE"
echo "   Shell access:    kubectl exec -it -n $NAMESPACE \$(kubectl get pod -n $NAMESPACE -l app.kubernetes.io/name=ucebnice -o jsonpath='{.items[0].metadata.name}') -- sh"
echo ""
echo "🗄️  PostgreSQL commands:"
echo "   Connect to DB:   kubectl exec -it -n $NAMESPACE $POSTGRES_POD -- psql -U ucebnice_user -d ucebnice_db"
echo "   View DB logs:    kubectl logs -n $NAMESPACE $POSTGRES_POD -f"
echo "   Backup DB:       kubectl exec -n $NAMESPACE $POSTGRES_POD -- pg_dump -U ucebnice_user ucebnice_db > backup.sql"
echo "═══════════════════════════════════════════════════════════"
