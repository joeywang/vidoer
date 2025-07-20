# Makefile for Vidoer Project
# Variables
NODE_VERSION = 18
DOCKER_IMAGE = vidoer
DOCKER_TAG = latest
REGISTRY = ghcr.io
NAMESPACE = $(shell whoami)
IMAGE_FULL_NAME = $(REGISTRY)/$(NAMESPACE)/$(DOCKER_IMAGE):$(DOCKER_TAG)

# Colors for output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

.PHONY: help setup install clean test lint build docker-build docker-run docker-stop docker-clean dev start logs fmt check all debug debug-frontend debug-backend debug-fullstack debug-utils

# Default target
all: setup test build

# Help target
help: ## Show this help message
	@echo "$(GREEN)Available targets:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Setup and Installation
setup: ## Setup the entire project (install dependencies)
	@echo "$(GREEN)Setting up project...$(NC)"
	@$(MAKE) install
	@echo "$(GREEN)Setup complete!$(NC)"

install: ## Install all dependencies
	@echo "$(GREEN)Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)Installing backend dependencies...$(NC)"
	cd backend && npm install

install-frontend: ## Install frontend dependencies only
	@echo "$(GREEN)Installing frontend dependencies...$(NC)"
	cd frontend && npm install

install-backend: ## Install backend dependencies only
	@echo "$(GREEN)Installing backend dependencies...$(NC)"
	cd backend && npm install

# Cleaning
clean: ## Clean all node_modules and build artifacts
	@echo "$(YELLOW)Cleaning project...$(NC)"
	rm -rf frontend/node_modules frontend/.next frontend/dist
	rm -rf backend/node_modules backend/dist
	@echo "$(GREEN)Clean complete!$(NC)"

clean-frontend: ## Clean frontend build artifacts
	@echo "$(YELLOW)Cleaning frontend...$(NC)"
	rm -rf frontend/node_modules frontend/.next frontend/dist

clean-backend: ## Clean backend build artifacts
	@echo "$(YELLOW)Cleaning backend...$(NC)"
	rm -rf backend/node_modules backend/dist

# Development
dev: ## Start development servers for both frontend and backend
	@echo "$(GREEN)Starting development servers...$(NC)"
	@echo "$(YELLOW)Frontend will be available at http://localhost:3000$(NC)"
	@echo "$(YELLOW)Backend will be available at http://localhost:3001$(NC)"
	@trap 'kill %1 %2; wait' INT; \
	(cd backend && npm start) & \
	(cd frontend && npm run dev) & \
	wait

dev-frontend: ## Start frontend development server only
	@echo "$(GREEN)Starting frontend development server...$(NC)"
	cd frontend && npm run dev

dev-backend: ## Start backend development server only
	@echo "$(GREEN)Starting backend development server...$(NC)"
	cd backend && npm start

# Testing
test: ## Run all tests
	@echo "$(GREEN)Running all tests...$(NC)"
	@$(MAKE) test-frontend
	@$(MAKE) test-backend
	@echo "$(GREEN)All tests completed!$(NC)"

test-frontend: ## Run frontend tests
	@echo "$(GREEN)Running frontend tests...$(NC)"
	cd frontend && npm test --if-present

test-backend: ## Run backend tests
	@echo "$(GREEN)Running backend tests...$(NC)"
	cd backend && npm test

test-watch: ## Run tests in watch mode
	@echo "$(GREEN)Running tests in watch mode...$(NC)"
	@trap 'kill %1 %2; wait' INT; \
	(cd backend && npm run test:watch --if-present) & \
	(cd frontend && npm run test:watch --if-present) & \
	wait

test-coverage: ## Run tests with coverage report
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	cd backend && npm run test:coverage

test-backend-watch: ## Run backend tests in watch mode
	@echo "$(GREEN)Running backend tests in watch mode...$(NC)"
	cd backend && npm run test:watch

test-backend-coverage: ## Run backend tests with coverage
	@echo "$(GREEN)Running backend tests with coverage...$(NC)"
	cd backend && npm run test:coverage

test-backend-debug: ## Debug backend tests
	@echo "$(GREEN)Starting backend tests in debug mode...$(NC)"
	cd backend && npm run test:debug

# Linting and Formatting
lint: ## Run linting for all projects
	@echo "$(GREEN)Running linting...$(NC)"
	@$(MAKE) lint-frontend
	@$(MAKE) lint-backend

lint-frontend: ## Run frontend linting
	@echo "$(GREEN)Running frontend linting...$(NC)"
	cd frontend && npm run lint

lint-backend: ## Run backend linting (if available)
	@echo "$(GREEN)Running backend linting...$(NC)"
	cd backend && npm run lint --if-present

lint-fix: ## Fix linting issues automatically
	@echo "$(GREEN)Fixing linting issues...$(NC)"
	cd frontend && npm run lint -- --fix --if-present
	cd backend && npm run lint:fix --if-present

fmt: ## Format code
	@echo "$(GREEN)Formatting code...$(NC)"
	cd frontend && npm run format --if-present
	cd backend && npm run format --if-present

# Building
build: ## Build all projects
	@echo "$(GREEN)Building all projects...$(NC)"
	@$(MAKE) build-frontend
	@$(MAKE) build-backend
	@echo "$(GREEN)Build completed!$(NC)"

build-frontend: ## Build frontend only
	@echo "$(GREEN)Building frontend...$(NC)"
	cd frontend && npm run build

build-backend: ## Build backend only (if build script exists)
	@echo "$(GREEN)Building backend...$(NC)"
	cd backend && npm run build --if-present

# Docker Operations
docker-build: ## Build Docker image
	@echo "$(GREEN)Building Docker image: $(DOCKER_IMAGE):$(DOCKER_TAG)$(NC)"
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	@echo "$(GREEN)Docker image built successfully!$(NC)"

docker-build-no-cache: ## Build Docker image without cache
	@echo "$(GREEN)Building Docker image without cache: $(DOCKER_IMAGE):$(DOCKER_TAG)$(NC)"
	docker build --no-cache -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

docker-run: ## Run Docker container
	@echo "$(GREEN)Running Docker container...$(NC)"
	@echo "$(YELLOW)Application will be available at http://localhost:3001$(NC)"
	docker run -d --name $(DOCKER_IMAGE) -p 3001:3001 $(DOCKER_IMAGE):$(DOCKER_TAG)

docker-run-dev: ## Run Docker container with volume mounts for development
	@echo "$(GREEN)Running Docker container in development mode...$(NC)"
	docker run -d --name $(DOCKER_IMAGE)-dev \
		-p 3001:3001 \
		-v $(PWD)/frontend:/app/frontend \
		-v $(PWD)/backend:/app/backend \
		$(DOCKER_IMAGE):$(DOCKER_TAG)

docker-stop: ## Stop Docker container
	@echo "$(YELLOW)Stopping Docker container...$(NC)"
	docker stop $(DOCKER_IMAGE) 2>/dev/null || true
	docker rm $(DOCKER_IMAGE) 2>/dev/null || true

docker-logs: ## Show Docker container logs
	@echo "$(GREEN)Showing Docker container logs...$(NC)"
	docker logs -f $(DOCKER_IMAGE)

docker-shell: ## Get shell access to running container
	@echo "$(GREEN)Opening shell in Docker container...$(NC)"
	docker exec -it $(DOCKER_IMAGE) sh

docker-clean: ## Clean Docker images and containers
	@echo "$(YELLOW)Cleaning Docker images and containers...$(NC)"
	docker stop $(DOCKER_IMAGE) 2>/dev/null || true
	docker rm $(DOCKER_IMAGE) 2>/dev/null || true
	docker rmi $(DOCKER_IMAGE):$(DOCKER_TAG) 2>/dev/null || true

docker-push: ## Push Docker image to registry
	@echo "$(GREEN)Pushing Docker image to registry...$(NC)"
	docker tag $(DOCKER_IMAGE):$(DOCKER_TAG) $(IMAGE_FULL_NAME)
	docker push $(IMAGE_FULL_NAME)

# Utility targets
check: ## Check project health (install, lint, test, build)
	@echo "$(GREEN)Running project health check...$(NC)"
	@$(MAKE) install
	@$(MAKE) lint
	@$(MAKE) test
	@$(MAKE) build
	@echo "$(GREEN)Project health check completed!$(NC)"

logs: ## Show logs for development servers
	@echo "$(GREEN)Use Ctrl+C to stop watching logs$(NC)"
	tail -f frontend/logs/*.log backend/logs/*.log 2>/dev/null || echo "No log files found"

start: ## Start production build locally
	@echo "$(GREEN)Starting production build...$(NC)"
	@$(MAKE) build
	cd frontend && npm start &
	cd backend && npm start

status: ## Show project status
	@echo "$(GREEN)Project Status:$(NC)"
	@echo "Node.js version: $(shell node --version 2>/dev/null || echo 'Not installed')"
	@echo "NPM version: $(shell npm --version 2>/dev/null || echo 'Not installed')"
	@echo "Docker version: $(shell docker --version 2>/dev/null || echo 'Not installed')"
	@echo "Frontend dependencies: $(shell test -d frontend/node_modules && echo 'Installed' || echo 'Not installed')"
	@echo "Backend dependencies: $(shell test -d backend/node_modules && echo 'Installed' || echo 'Not installed')"
	@echo "Docker image: $(shell docker images -q $(DOCKER_IMAGE):$(DOCKER_TAG) 2>/dev/null && echo 'Built' || echo 'Not built')"

# Debugging
debug: ## Start full-stack debugging (same as debug-fullstack)
	@$(MAKE) debug-fullstack

debug-frontend: ## Debug frontend with enhanced logging
	@echo "$(GREEN)Starting frontend in debug mode...$(NC)"
	./scripts/debug-frontend.sh

debug-backend: ## Debug backend with inspector enabled
	@echo "$(GREEN)Starting backend in debug mode...$(NC)"
	./scripts/debug-backend.sh

debug-fullstack: ## Debug both frontend and backend
	@echo "$(GREEN)Starting full-stack debugging...$(NC)"
	./scripts/debug-fullstack.sh

debug-utils: ## Show debug utilities help
	@echo "$(GREEN)Debug Utilities:$(NC)"
	./scripts/debug-utils.sh help

debug-logs: ## Show application logs
	@echo "$(GREEN)Showing debug logs...$(NC)"
	./scripts/debug-utils.sh logs

debug-ports: ## Check port usage
	@echo "$(GREEN)Checking ports...$(NC)"
	./scripts/debug-utils.sh ports

debug-health: ## Check service health
	@echo "$(GREEN)Checking service health...$(NC)"
	./scripts/debug-utils.sh health

debug-kill: ## Kill all development processes
	@echo "$(YELLOW)Killing development processes...$(NC)"
	./scripts/debug-utils.sh kill

debug-clean: ## Clean debug artifacts
	@echo "$(YELLOW)Cleaning debug artifacts...$(NC)"
	./scripts/debug-utils.sh clean

# Shortcuts
i: install ## Shortcut for install
t: test ## Shortcut for test
l: lint ## Shortcut for lint
b: build ## Shortcut for build
d: dev ## Shortcut for dev
c: clean ## Shortcut for clean
