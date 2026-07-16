# Makefile for Ucebnice v2.0 Docker Compose operations

.PHONY: help build compose-config up down restart logs status shell migrate backup restore video-list clean test lint type-check format-check

COMPOSE ?= docker compose
COMPOSE_FILES ?= -f docker-compose.yml
PROD_COMPOSE_FILES ?= -f docker-compose.yml -f docker-compose.prod.yml
APP_SERVICE ?= app
DB_SERVICE ?= postgres
BACKUP_DIR ?= backups
BACKUP_FILE ?=

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the application image
	$(COMPOSE) $(COMPOSE_FILES) build $(APP_SERVICE)

compose-config: ## Validate local Docker Compose configuration
	$(COMPOSE) $(COMPOSE_FILES) config --quiet

compose-config-prod: ## Validate production Docker Compose configuration
	$(COMPOSE) $(PROD_COMPOSE_FILES) config --quiet

up: ## Start local Docker Compose stack
	$(COMPOSE) $(COMPOSE_FILES) up -d --build

up-prod: ## Start production Docker Compose stack on the VPS
	$(COMPOSE) $(PROD_COMPOSE_FILES) up -d --build

down: ## Stop local Docker Compose stack
	$(COMPOSE) $(COMPOSE_FILES) down

restart: ## Restart app service
	$(COMPOSE) $(COMPOSE_FILES) restart $(APP_SERVICE)

logs: ## Follow application logs
	$(COMPOSE) $(COMPOSE_FILES) logs -f --tail=100 $(APP_SERVICE)

status: ## Show Docker Compose service status
	$(COMPOSE) $(COMPOSE_FILES) ps

shell: ## Open a shell in the app container
	$(COMPOSE) $(COMPOSE_FILES) exec $(APP_SERVICE) sh

migrate: ## Run Prisma migrations against the Compose database
	$(COMPOSE) $(COMPOSE_FILES) exec $(APP_SERVICE) npx prisma migrate deploy

backup: ## Back up the Compose PostgreSQL database
	@mkdir -p $(BACKUP_DIR)
	$(COMPOSE) $(COMPOSE_FILES) exec -T $(DB_SERVICE) pg_dump -U $${POSTGRES_USER:-ucebnice_user} $${POSTGRES_DB:-ucebnice_db} > $(BACKUP_DIR)/ucebnice-$$(date +%Y%m%d-%H%M%S).sql

restore: ## Restore PostgreSQL database from BACKUP_FILE=path.sql
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "Error: BACKUP_FILE is required"; \
		exit 1; \
	fi
	@read -p "Restore database from $(BACKUP_FILE)? Type yes: " confirm; [ "$$confirm" = "yes" ]
	$(COMPOSE) $(COMPOSE_FILES) exec -T $(DB_SERVICE) psql -U $${POSTGRES_USER:-ucebnice_user} -d $${POSTGRES_DB:-ucebnice_db} < $(BACKUP_FILE)

video-list: ## List mounted runtime videos
	$(COMPOSE) $(COMPOSE_FILES) exec $(APP_SERVICE) ls -lh /data/videa

clean: ## Remove stopped Compose resources for this project
	$(COMPOSE) $(COMPOSE_FILES) down --remove-orphans

format-check: ## Run Prettier check
	npm run format:check

type-check: ## Run TypeScript check
	npm run type-check

lint: ## Run ESLint
	npm run lint

test: ## Run Jest tests
	npm test -- --runInBand
