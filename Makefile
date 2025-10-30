# Makefile for Ucebnice Kubernetes Deployment

.PHONY: help build push deploy-staging deploy-production secrets clean

# Variables
REGISTRY ?= harbor.praut.cz
IMAGE_NAME ?= ucebnice/ucebnice-app
VERSION ?= $(shell git describe --tags --always --dirty)
NAMESPACE_STAGING ?= ucebnice-staging
NAMESPACE_PROD ?= ucebnice-production

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Docker commands
build: ## Build Docker image
	@echo "Building image $(REGISTRY)/$(IMAGE_NAME):$(VERSION)"
	docker build -t $(REGISTRY)/$(IMAGE_NAME):$(VERSION) .
	docker tag $(REGISTRY)/$(IMAGE_NAME):$(VERSION) $(REGISTRY)/$(IMAGE_NAME):latest

push: build ## Build and push Docker image to registry
	@echo "Pushing image $(REGISTRY)/$(IMAGE_NAME):$(VERSION)"
	docker push $(REGISTRY)/$(IMAGE_NAME):$(VERSION)
	docker push $(REGISTRY)/$(IMAGE_NAME):latest

# Kubernetes commands
secrets-staging: ## Create secrets for staging environment (plain)
	./scripts/kubernetes/create-secrets.sh $(NAMESPACE_STAGING)

secrets-production: ## Create secrets for production environment (plain)
	./scripts/kubernetes/create-secrets.sh $(NAMESPACE_PROD)

sealed-secrets-staging: ## Create sealed secrets for staging environment
	./scripts/kubernetes/create-sealed-secrets.sh $(NAMESPACE_STAGING)

sealed-secrets-production: ## Create sealed secrets for production environment
	./scripts/kubernetes/create-sealed-secrets.sh $(NAMESPACE_PROD)

apply-sealed-secrets: ## Apply sealed secrets to cluster
	@echo "Applying sealed secrets..."
	kubectl apply -f argocd/harbor-registry-sealed-secret.yaml
	kubectl apply -f argocd/ucebnice-sealed-secret.yaml
	@echo "Sealed secrets applied. Secrets will be automatically decrypted by the controller."

# Helm commands
helm-lint: ## Lint Helm chart
	helm lint helm/ucebnice

helm-template: ## Generate Kubernetes manifests from Helm chart
	helm template ucebnice helm/ucebnice -n $(NAMESPACE_PROD)

helm-install-staging: ## Install Helm chart to staging
	helm install ucebnice helm/ucebnice \
		-n $(NAMESPACE_STAGING) \
		--create-namespace \
		-f argocd/values-staging.yaml \
		--set image.tag=$(VERSION)

helm-upgrade-staging: ## Upgrade Helm chart in staging
	helm upgrade ucebnice helm/ucebnice \
		-n $(NAMESPACE_STAGING) \
		-f argocd/values-staging.yaml \
		--set image.tag=$(VERSION)

helm-install-production: ## Install Helm chart to production
	helm install ucebnice helm/ucebnice \
		-n $(NAMESPACE_PROD) \
		--create-namespace \
		-f argocd/values-production.yaml \
		--set image.tag=$(VERSION)

helm-upgrade-production: ## Upgrade Helm chart in production
	helm upgrade ucebnice helm/ucebnice \
		-n $(NAMESPACE_PROD) \
		-f argocd/values-production.yaml \
		--set image.tag=$(VERSION)

# Argo CD commands
argocd-apply: ## Apply Argo CD Application
	kubectl apply -f argocd/application.yaml

argocd-sync: ## Trigger Argo CD sync
	argocd app sync ucebnice

argocd-status: ## Check Argo CD application status
	argocd app get ucebnice

# Deployment commands
deploy-staging: push ## Deploy to staging (build, push, update ArgoCD)
	@echo "Deploying version $(VERSION) to staging"
	./scripts/kubernetes/deploy.sh staging $(VERSION)

deploy-production: push ## Deploy to production (build, push, update ArgoCD)
	@echo "Deploying version $(VERSION) to production"
	./scripts/kubernetes/deploy.sh production $(VERSION)

# Monitoring commands
logs-staging: ## Show logs from staging pods
	kubectl -n $(NAMESPACE_STAGING) logs -l app.kubernetes.io/name=ucebnice --tail=100 -f

logs-production: ## Show logs from production pods
	kubectl -n $(NAMESPACE_PROD) logs -l app.kubernetes.io/name=ucebnice --tail=100 -f

status-staging: ## Check status in staging
	@echo "=== Pods ==="
	kubectl -n $(NAMESPACE_STAGING) get pods
	@echo "\n=== Services ==="
	kubectl -n $(NAMESPACE_STAGING) get svc
	@echo "\n=== Ingress ==="
	kubectl -n $(NAMESPACE_STAGING) get ingress

status-production: ## Check status in production
	@echo "=== Pods ==="
	kubectl -n $(NAMESPACE_PROD) get pods
	@echo "\n=== Services ==="
	kubectl -n $(NAMESPACE_PROD) get svc
	@echo "\n=== Ingress ==="
	kubectl -n $(NAMESPACE_PROD) get ingress

# Debugging commands
debug-pod-staging: ## Get shell in staging pod
	kubectl -n $(NAMESPACE_STAGING) exec -it $(shell kubectl -n $(NAMESPACE_STAGING) get pod -l app.kubernetes.io/name=ucebnice -o jsonpath='{.items[0].metadata.name}') -- sh

debug-pod-production: ## Get shell in production pod
	kubectl -n $(NAMESPACE_PROD) exec -it $(shell kubectl -n $(NAMESPACE_PROD) get pod -l app.kubernetes.io/name=ucebnice -o jsonpath='{.items[0].metadata.name}') -- sh

port-forward-staging: ## Port forward to staging service
	kubectl -n $(NAMESPACE_STAGING) port-forward svc/ucebnice 3000:80

port-forward-production: ## Port forward to production service
	kubectl -n $(NAMESPACE_PROD) port-forward svc/ucebnice 3000:80

# Database commands
db-migrate-staging: ## Run database migrations in staging
	kubectl -n $(NAMESPACE_STAGING) exec -it $(shell kubectl -n $(NAMESPACE_STAGING) get pod -l app.kubernetes.io/name=ucebnice -o jsonpath='{.items[0].metadata.name}') -- npx prisma migrate deploy

db-migrate-production: ## Run database migrations in production
	kubectl -n $(NAMESPACE_PROD) exec -it $(shell kubectl -n $(NAMESPACE_PROD) get pod -l app.kubernetes.io/name=ucebnice -o jsonpath='{.items[0].metadata.name}') -- npx prisma migrate deploy

# Cleanup commands
clean: ## Remove local Docker images
	docker rmi $(REGISTRY)/$(IMAGE_NAME):$(VERSION) || true
	docker rmi $(REGISTRY)/$(IMAGE_NAME):latest || true

uninstall-staging: ## Uninstall from staging
	helm uninstall ucebnice -n $(NAMESPACE_STAGING)

uninstall-production: ## Uninstall from production
	helm uninstall ucebnice -n $(NAMESPACE_PROD)

# Local Docker testing
docker-run: ## Run Docker image locally with env file
	@echo "Starting Docker container locally..."
	docker run --rm -it \
		--name ucebnice-test \
		-p 3000:3000 \
		--env-file .env.docker \
		$(REGISTRY)/$(IMAGE_NAME):$(VERSION)

docker-run-detached: ## Run Docker image in background
	@echo "Starting Docker container in background..."
	docker run -d \
		--name ucebnice-test \
		-p 3000:3000 \
		--env-file .env.docker \
		$(REGISTRY)/$(IMAGE_NAME):$(VERSION)
	@echo "Container started. View logs with: docker logs -f ucebnice-test"
	@echo "Stop with: docker stop ucebnice-test && docker rm ucebnice-test"

docker-logs: ## View logs from local Docker container
	docker logs -f ucebnice-test

docker-stop: ## Stop and remove local Docker container
	docker stop ucebnice-test && docker rm ucebnice-test

docker-shell: ## Get shell in local Docker container
	docker exec -it ucebnice-test sh

docker-test: build docker-run ## Build and run Docker image locally
	@echo "Testing Docker image locally"

# Development commands
dev: ## Run development server locally
	npm run dev

build-local: ## Build Next.js app locally
	npm run build

test: ## Run tests
	npm test

test-e2e: ## Run E2E tests
	npm run test:e2e