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

This project includes comprehensive debugging tools and configurations for both frontend and backend development.

### Quick Start Debugging

Use the Makefile for easy debugging:

```bash
make debug              # Debug both frontend and backend
make debug-frontend     # Debug frontend only
make debug-backend      # Debug backend only
make debug-health       # Check service health
make debug-ports        # Check which ports are in use
```

### VSCode Debugging

The project includes VSCode debug configurations in `.vscode/launch.json`:

1. **Debug Backend** - Launch backend with TypeScript debugging
2. **Debug Backend (Attach)** - Attach to running backend (port 9229)
3. **Debug Frontend** - Launch Next.js with debugging enabled
4. **Debug Full Stack** - Debug both frontend and backend simultaneously
5. **Debug Tests** - Debug backend tests with Jest

**To use:**
1. Open the project in VSCode
2. Go to Run and Debug panel (Ctrl+Shift+D)
3. Select your desired debug configuration
4. Press F5 or click the green play button

### Frontend Debugging

#### Browser DevTools
```bash
# Start frontend in debug mode
make debug-frontend
# Or manually:
cd frontend && NODE_OPTIONS="--inspect" npm run dev
```

**Features:**
- Automatic source maps for TypeScript
- React DevTools support
- Next.js built-in debugging
- Hot reload with debug preservation

**Browser Tools:**
- **F12** - Open DevTools
- **Sources Tab** - Set breakpoints, step through code
- **Console Tab** - View logs and run JavaScript
- **Network Tab** - Monitor API calls
- **React DevTools** - Inspect React components (install extension)

#### Frontend Debug Tips
```javascript
// Add debug breakpoints in code
debugger;

// Console logging
console.log('Debug info:', variable);
console.table(arrayData);
console.group('API Call');
console.log('Request:', request);
console.log('Response:', response);
console.groupEnd();

// Next.js specific debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Development only debug info');
}
```

### Backend Debugging

#### Node.js Inspector
```bash
# Start backend in debug mode
make debug-backend
# Or manually:
cd backend && NODE_OPTIONS="--inspect=0.0.0.0:9229" npm start

# For break-on-start debugging:
cd backend && npm run debug
```

**Chrome DevTools:**
1. Open Chrome and go to `chrome://inspect`
2. Click "Configure" and add `localhost:9229`
3. Click "inspect" under your Node.js process
4. Use the Sources tab to set breakpoints

#### VSCode Node Debugging
1. Use "Debug Backend" configuration to launch
2. Or use "Debug Backend (Attach)" to attach to running process
3. Set breakpoints directly in VSCode
4. Use the Debug Console for evaluation

#### Backend Debug Scripts
```bash
# Available npm scripts in backend/
npm run start:debug     # Start with inspector
npm run start:dev       # Start with nodemon + inspector
npm run debug           # Start with break-on-start
```

### Debug Utilities

The project includes helpful debug utilities:

```bash
# Show debug utilities help
make debug-utils

# Available utilities:
./scripts/debug-utils.sh logs       # Show application logs
./scripts/debug-utils.sh ports      # Check port usage
./scripts/debug-utils.sh processes  # Show Node.js processes
./scripts/debug-utils.sh health     # Check service health
./scripts/debug-utils.sh kill       # Kill development processes
./scripts/debug-utils.sh env        # Show environment info
./scripts/debug-utils.sh network    # Test connectivity
./scripts/debug-utils.sh clean      # Clean debug artifacts
```

### Debugging Docker Containers

```bash
# Build and run container in debug mode
make docker-build
make docker-run-dev     # With volume mounts

# Access running container
make docker-shell       # Get shell access
make docker-logs        # View container logs

# Debug container issues
docker ps                           # Check running containers
docker logs vidoer                  # View container logs
docker exec -it vidoer sh          # Shell into container
```

### Common Debugging Scenarios

#### Port Conflicts
```bash
# Check what's using your ports
make debug-ports

# Kill processes on specific ports
lsof -ti :3000 | xargs kill -9     # Kill frontend
lsof -ti :3001 | xargs kill -9     # Kill backend
lsof -ti :9229 | xargs kill -9     # Kill debug port

# Or use the utility
make debug-kill
```

#### Service Not Starting
```bash
# Check service health
make debug-health

# View logs
make debug-logs

# Check environment
./scripts/debug-utils.sh env
```

#### API Issues
```bash
# Test backend directly
curl http://localhost:3001/api/health

# Check network connectivity
./scripts/debug-utils.sh network

# Monitor API calls in browser DevTools Network tab
```

#### Build Issues
```bash
# Clean everything and rebuild
make clean
make setup
make build

# Check dependencies
npm ls                  # Check for dependency issues
npm audit              # Security audit
```

### Debug Environment Variables

Set these environment variables for enhanced debugging:

```bash
# Backend debugging
export DEBUG="*"                    # Enable all debug output
export NODE_ENV="development"       # Development mode
export LOG_LEVEL="debug"            # Detailed logging

# Frontend debugging
export NEXT_TELEMETRY_DISABLED=1    # Disable Next.js telemetry
export NODE_OPTIONS="--inspect"     # Enable inspector
```

### Debugging Tips

1. **Use meaningful console.log messages** with context
2. **Set breakpoints** rather than relying only on console.log
3. **Use the debugger statement** for dynamic breakpoints
4. **Monitor network requests** in browser DevTools
5. **Check browser console** for client-side errors
6. **Use React DevTools** for component debugging
7. **Test API endpoints** independently with curl/Postman
8. **Check Docker logs** when running in containers
9. **Use git bisect** to find when issues were introduced
10. **Clean and reinstall dependencies** if behavior is strange

### Performance Debugging

```bash
# Frontend performance
# Use Chrome DevTools Performance tab
# Check Lighthouse scores
# Monitor bundle sizes

# Backend performance
NODE_OPTIONS="--inspect --expose-gc" npm start
# Use Chrome DevTools Memory tab
# Profile CPU usage
# Monitor memory leaks
```

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
