# Vidoer

Vidoer is a web application that allows users to upload an image and an audio file to generate a video. The generated video can then be uploaded to YouTube.

## Project Structure

- `frontend/`: Contains the Next.js frontend application.
- `backend/`: Contains the Node.js backend application.
- `k8s/`: Contains the Kubernetes deployment and service files.
- `helm/`: Contains the Helm chart for deploying the application.

## Requirements

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [Kubernetes](https://kubernetes.io/)
- [Helm](https://helm.sh/)

## Quick Start

The easiest way to get started with Vidoer is using the provided Makefile:

```bash
# Setup the entire project
make setup

# Start development servers for both frontend and backend
make dev
```

That's it! The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:3001`.

## Makefile Commands

This project includes a comprehensive Makefile to simplify development tasks. Here are the available commands:

### Getting Started
```bash
make setup          # Setup the entire project (install dependencies)
make help           # Show all available commands
make status         # Show project status and installed tools
```

### Development
```bash
make dev            # Start both frontend and backend dev servers
make dev-frontend   # Start frontend development server only
make dev-backend    # Start backend development server only
```

### Dependencies
```bash
make install           # Install all dependencies
make install-frontend  # Install frontend dependencies only
make install-backend   # Install backend dependencies only
```

### Testing
```bash
make test           # Run all tests
make test-frontend  # Run frontend tests
make test-backend   # Run backend tests
make test-watch     # Run tests in watch mode
```

### Code Quality
```bash
make lint           # Run linting for all projects
make lint-frontend  # Run frontend linting
make lint-backend   # Run backend linting
make lint-fix       # Fix linting issues automatically
make fmt            # Format code
```

### Building
```bash
make build           # Build all projects
make build-frontend  # Build frontend only
make build-backend   # Build backend only
```

### Docker Operations
```bash
make docker-build        # Build Docker image
make docker-run          # Run Docker container
make docker-run-dev      # Run container with volume mounts for development
make docker-stop         # Stop Docker container
make docker-logs         # Show Docker container logs
make docker-shell        # Get shell access to running container
make docker-clean        # Clean Docker images and containers
make docker-push         # Push Docker image to registry
```

### Utilities
```bash
make check          # Run complete project health check (install, lint, test, build)
make clean          # Clean all node_modules and build artifacts
make clean-frontend # Clean frontend build artifacts
make clean-backend  # Clean backend build artifacts
make start          # Start production build locally
```

### Shortcuts
For convenience, short aliases are available:
```bash
make i  # install
make t  # test
make l  # lint
make b  # build
make d  # dev
make c  # clean
```

## Manual Development (Alternative)

If you prefer to run commands manually without the Makefile:

### Frontend

To start the frontend development server:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Backend

To start the backend server:

```bash
cd backend
npm install
npm start
```

The backend will be available at `http://localhost:3001`.

## Debugging

To debug the application, you can use the browser's developer tools for the frontend and the Node.js inspector for the backend.

### Frontend

To debug the frontend, open the browser's developer tools and go to the "Sources" tab. You can set breakpoints and inspect the code from there.

### Backend

To debug the backend, you can start the server with the `--inspect` flag:

```bash
node --inspect src/index.js
```

You can then use a debugger like the Chrome DevTools for Node.js to connect to the inspector and debug the code.

## Deployment

To deploy the application to a Kubernetes cluster, you can use the provided Helm chart.

### Using Makefile (Recommended)

Build and push the Docker image:

```bash
make docker-build    # Build the Docker image
make docker-push     # Push to registry (configure registry in Makefile)
```

### Manual Deployment

Alternatively, you can build and deploy manually:

```bash
# Build the Docker image
docker build -t vidoer .

# Deploy using Helm
helm install vidoer ./helm
```

This will deploy the application to your Kubernetes cluster. You can then access the application through the NodePort service.

## CI/CD

This project includes GitHub Actions workflows for automated testing and deployment. The workflows are triggered on:
- Push to `main` or `develop` branches
- Pull requests to `main` branch

The CI/CD pipeline:
1. Runs tests and linting
2. Builds Docker images
3. Pushes images to GitHub Container Registry
4. Deploys to staging (develop branch) or production (main branch)
