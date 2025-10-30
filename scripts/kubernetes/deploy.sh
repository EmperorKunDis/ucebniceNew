#!/bin/bash
set -e

# Deployment script for ucebnice application
# Usage: ./deploy.sh [environment] [image-tag]

ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-latest}
NAMESPACE="ucebnice-${ENVIRONMENT}"

echo "Deploying ucebnice to $ENVIRONMENT environment"
echo "Namespace: $NAMESPACE"
echo "Image tag: $IMAGE_TAG"

# Apply Argo CD Application
if [ "$ENVIRONMENT" = "production" ]; then
    VALUES_FILE="argocd/values-production.yaml"
elif [ "$ENVIRONMENT" = "staging" ]; then
    VALUES_FILE="argocd/values-staging.yaml"
else
    VALUES_FILE="helm/ucebnice/values.yaml"
fi

# Update image tag in Argo CD Application
cat argocd/application.yaml | \
    sed "s|namespace: ucebnice|namespace: $NAMESPACE|g" | \
    sed "s|name: ucebnice|name: ucebnice-$ENVIRONMENT|g" | \
    sed "s|releaseName: ucebnice|releaseName: ucebnice-$ENVIRONMENT|g" | \
    sed "s|value: \"latest\"|value: \"$IMAGE_TAG\"|g" | \
    kubectl apply -f -

echo "Argo CD Application updated successfully!"
echo "Monitor deployment: kubectl -n $NAMESPACE get pods -w"