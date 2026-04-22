.PHONY: help dev whisper backend frontend build test lint format typecheck clean

help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Print instructions to start all services
	@echo "Start each service in a separate terminal:"
	@echo "  Terminal 1:  make whisper"
	@echo "  Terminal 2:  make frontend"
	@echo "  Terminal 3:  make backend"

whisper: ## Start whisper-service on host :9000 (native, uses Metal)
	cd whisper-service && uv run uvicorn app.main:app --host 127.0.0.1 --port 9000 --reload

backend: ## Start backend via docker compose :8000
	docker compose up backend

frontend: ## Start frontend vite dev server on host :5173
	cd frontend && pnpm dev

build: ## Build docker images
	docker compose build

test: ## Run pytest (backend, whisper-service) and vitest (frontend)
	cd backend && uv run pytest
	cd whisper-service && uv run pytest
	cd frontend && pnpm test

lint: ## Lint all projects
	cd backend && uv run ruff check .
	cd whisper-service && uv run ruff check .
	cd frontend && pnpm lint

format: ## Format all projects
	cd backend && uv run ruff format .
	cd whisper-service && uv run ruff format .
	cd frontend && pnpm format

typecheck: ## Type check all projects
	cd backend && uv run mypy app
	cd whisper-service && uv run mypy app
	cd frontend && pnpm typecheck

clean: ## Remove build artifacts and caches
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type d -name .pytest_cache -exec rm -rf {} +
	find . -type d -name .ruff_cache -exec rm -rf {} +
	find . -type d -name .mypy_cache -exec rm -rf {} +
	rm -rf frontend/dist frontend/.vite
