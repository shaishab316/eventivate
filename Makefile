PRISMA = pnpm exec prisma

.PHONY: install dev build start typecheck generate migrate deploy studio reset_db help

install: ## Install dependencies and generate Prisma client
	pnpm install
	$(PRISMA) generate

dev: ## Start development server
	pnpm dev

build: ## Build for production
	pnpm build

start: ## Start production server
	pnpm start

typecheck: ## Run TypeScript type checking
	pnpm typecheck

new-module: ## Create a new module (e.g., make new-module name=users)
	pnpm new-module

generate: ## Generate Prisma client
	$(PRISMA) generate

migrate: ## Create and apply migration
	$(PRISMA) migrate dev

deploy: ## Deploy migrations to production
	$(PRISMA) migrate deploy

studio: ## Open Prisma Studio
	$(PRISMA) studio

reset_db: ## Reset database (deletes all data!)
	$(PRISMA) migrate reset --force

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-12s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Usage: make [target]"
	@echo "Example: make migrate"