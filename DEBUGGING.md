# Debugging Guide for Vidoer

This comprehensive guide covers debugging strategies, tools, and troubleshooting techniques for the Vidoer application.

## Table of Contents

- [Quick Reference](#quick-reference)
- [Setup and Configuration](#setup-and-configuration)
- [Frontend Debugging](#frontend-debugging)
- [Backend Debugging](#backend-debugging)
- [Full-Stack Debugging](#full-stack-debugging)
- [Docker Debugging](#docker-debugging)
- [Production Debugging](#production-debugging)
- [Troubleshooting Common Issues](#troubleshooting-common-issues)
- [Advanced Debugging Techniques](#advanced-debugging-techniques)
- [Performance Debugging](#performance-debugging)

## Quick Reference

### Essential Commands
```bash
# Start debugging
make debug                    # Full-stack debugging
make debug-frontend          # Frontend only
make debug-backend           # Backend only

# Debug utilities
make debug-health            # Check service health
make debug-ports             # Check port usage
make debug-logs              # Show logs
make debug-kill              # Kill all processes
./scripts/debug-utils.sh     # All utilities
```

### Debug URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Backend Debug: chrome://inspect (port 9229)
- VSCode Debug: F5 or Run and Debug panel

## Setup and Configuration

### VSCode Configuration

The project includes pre-configured debug settings:

#### `.vscode/launch.json` Configurations:
1. **Debug Backend** - Direct TypeScript debugging
2. **Debug Backend (Attach)** - Attach to running process
3. **Debug Frontend** - Next.js debugging
4. **Debug Full Stack** - Both services simultaneously
5. **Debug Tests** - Test debugging with Jest

#### `.vscode/settings.json` Features:
- Auto-import suggestions
- ESLint integration
- File exclusions for better performance
- TypeScript configuration
- Debug console settings

### Environment Setup

```bash
# Development environment variables
export NODE_ENV=development
export DEBUG="*"
export LOG_LEVEL=debug
export NEXT_TELEMETRY_DISABLED=1
```

## Frontend Debugging

### Browser DevTools Setup

1. **Chrome/Edge DevTools**:
   - F12 to open DevTools
   - Sources tab for breakpoints
   - Console for logging
   - Network tab for API monitoring
   - Performance tab for profiling

2. **Firefox DevTools**:
   - F12 to open DevTools
   - Debugger tab for breakpoints
   - Console for logging
   - Network tab for requests

### React DevTools

Install the React Developer Tools browser extension:
- Chrome: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- Firefox: [React Developer Tools](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Next.js Debugging

#### Source Maps
Next.js automatically generates source maps in development mode, allowing you to debug TypeScript directly in the browser.

#### Debug Configuration
```javascript
// next.config.js
const nextConfig = {
  // Enable source maps in production (if needed)
  productionBrowserSourceMaps: true,
  
  // Webpack configuration for debugging
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.devtool = 'eval-source-map';
    }
    return config;
  }
};
```

### Frontend Debug Techniques

#### Console Debugging
```javascript
// Structured logging
console.group('🔍 Component Debug');
console.log('Props:', props);
console.log('State:', state);
console.table(data);
console.groupEnd();

// Conditional logging
if (process.env.NODE_ENV === 'development') {
  console.debug('Development info:', debugInfo);
}

// Performance timing
console.time('API Call');
await fetchData();
console.timeEnd('API Call');
```

#### React Hooks Debugging
```javascript
import { useEffect, useDebugValue } from 'react';

function useCustomHook(value) {
  // Show debug info in React DevTools
  useDebugValue(value ? 'Active' : 'Inactive');
  
  useEffect(() => {
    console.log('Hook effect triggered:', value);
  }, [value]);
}
```

#### Component Error Boundaries
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## Backend Debugging

### Node.js Inspector

#### Starting with Inspector
```bash
# Standard inspector
node --inspect=0.0.0.0:9229 src/index.js

# Break on start (waits for debugger)
node --inspect-brk=0.0.0.0:9229 src/index.js

# With TypeScript
node --inspect=0.0.0.0:9229 --loader ts-node/esm src/index.ts
```

#### Chrome DevTools Connection
1. Open Chrome
2. Navigate to `chrome://inspect`
3. Click "Configure" and add `localhost:9229`
4. Click "inspect" under your Node.js target

### VSCode Node Debugging

#### Breakpoint Types
- **Line Breakpoints**: Click in gutter or F9
- **Conditional Breakpoints**: Right-click breakpoint, add condition
- **Logpoints**: Right-click breakpoint, add log message
- **Exception Breakpoints**: Break on thrown exceptions

#### Debug Console Usage
```javascript
// Evaluate expressions
variableName
JSON.stringify(object, null, 2)

// Call functions
functionName(param1, param2)

// Modify variables
variableName = newValue
```

### Express.js Debugging

#### Request/Response Logging
```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  // Log response
  const originalSend = res.send;
  res.send = function(data) {
    console.log('Response:', data);
    originalSend.call(this, data);
  };
  
  next();
});
```

#### Error Handling Middleware
```javascript
app.use((err, req, res, next) => {
  console.error('Error caught by middleware:', err);
  console.error('Stack trace:', err.stack);
  console.error('Request details:', {
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body
  });
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

### TypeScript Debugging

#### Source Map Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSourceMap": false,
    "mapRoot": "./",
    "sourceRoot": "./"
  }
}
```

## Full-Stack Debugging

### Debugging API Communication

#### Frontend API Client
```javascript
// api/client.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.group(`🌐 API Call: ${options.method || 'GET'} ${endpoint}`);
  console.log('URL:', url);
  console.log('Options:', options);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers));
    
    const data = await response.json();
    console.log('Response Data:', data);
    console.groupEnd();
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    console.groupEnd();
    throw error;
  }
}
```

#### Backend Request Logging
```javascript
// middleware/requestLogger.js
function requestLogger(req, res, next) {
  const start = Date.now();
  
  console.log(`📨 ${req.method} ${req.path}`);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📤 ${res.statusCode} ${req.method} ${req.path} (${duration}ms)`);
  });
  
  next();
}
```

### Cross-Origin Debugging

#### CORS Configuration
```javascript
// backend/src/middleware/cors.js
import cors from 'cors';

const corsOptions = {
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'http://127.0.0.1:3000']
    : process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
  optionsSuccessStatus: 200
};

export default cors(corsOptions);
```

## Docker Debugging

### Development Container Debugging

#### Dockerfile for Debugging
```dockerfile
# Development stage with debugging tools
FROM node:18-alpine AS development

# Install debugging tools
RUN apk add --no-cache curl netcat-openbsd

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY . .

# Expose debug port
EXPOSE 3001 9229

# Start with debugging enabled
CMD ["node", "--inspect=0.0.0.0:9229", "src/index.js"]
```

#### Docker Compose for Debugging
```yaml
# docker-compose.debug.yml
version: '3.8'
services:
  backend:
    build:
      context: ./backend
      target: development
    ports:
      - "3001:3001"
      - "9229:9229"  # Debug port
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DEBUG=*
    command: ["node", "--inspect=0.0.0.0:9229", "src/index.js"]
  
  frontend:
    build:
      context: ./frontend
      target: development
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
```

### Container Debugging Commands

```bash
# Build debug image
docker build -t vidoer:debug .

# Run with debug ports
docker run -p 3001:3001 -p 9229:9229 vidoer:debug

# Shell into running container
docker exec -it container_name sh

# View container logs
docker logs -f container_name

# Inspect container
docker inspect container_name

# Check container processes
docker exec container_name ps aux
```

## Production Debugging

### Logging Strategy

#### Structured Logging
```javascript
// utils/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'vidoer-backend' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export default logger;
```

#### Application Monitoring
```javascript
// middleware/monitoring.js
import logger from '../utils/logger.js';

function monitoring(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    if (res.statusCode >= 400) {
      logger.error('HTTP Error', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        error: res.locals.error
      });
    }
  });
  
  next();
}
```

## Troubleshooting Common Issues

### Port Conflicts
```bash
# Find process using port
lsof -i :3000
lsof -i :3001
lsof -i :9229

# Kill process using port
kill -9 $(lsof -ti :3000)

# Or use the debug utility
./scripts/debug-utils.sh ports
./scripts/debug-utils.sh kill
```

### Module Resolution Issues
```bash
# Clear Node.js cache
rm -rf node_modules
npm install

# Clear Next.js cache
rm -rf .next

# Clear TypeScript cache
rm -rf .tsbuildinfo
```

### EADDRINUSE Errors
```javascript
// backend/src/server.js
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
  throw err;
});
```

### Memory Leaks
```bash
# Start with memory profiling
node --inspect --expose-gc src/index.js

# Force garbage collection
node --eval "global.gc()"

# Memory usage monitoring
node --inspect --trace-gc src/index.js
```

## Advanced Debugging Techniques

### CPU Profiling
```bash
# Start with CPU profiling
node --inspect --prof src/index.js

# Process profile after stopping
node --prof-process isolate-*.log > profile.txt
```

### Heap Snapshots
```javascript
// Take heap snapshot programmatically
const v8 = require('v8');
const fs = require('fs');

function takeHeapSnapshot() {
  const snapshotStream = v8.getHeapSnapshot();
  const fileName = `heap-${Date.now()}.heapsnapshot`;
  const fileStream = fs.createWriteStream(fileName);
  snapshotStream.pipe(fileStream);
  console.log(`Heap snapshot saved to ${fileName}`);
}

// Expose endpoint for heap snapshots
app.get('/debug/heap-snapshot', (req, res) => {
  takeHeapSnapshot();
  res.json({ message: 'Heap snapshot taken' });
});
```

### Async Stack Traces
```javascript
// Enable async stack traces
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});
```

### Network Debugging
```javascript
// Monitor network requests in Node.js
const originalRequest = require('http').request;
require('http').request = function(...args) {
  console.log('HTTP Request:', args[0]);
  return originalRequest.apply(this, args);
};
```

## Performance Debugging

### Frontend Performance

#### Bundle Analysis
```bash
# Analyze Next.js bundle
npm run build -- --analyze

# Webpack bundle analyzer
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

#### Performance Monitoring
```javascript
// Performance observer
if (typeof window !== 'undefined' && window.PerformanceObserver) {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      console.log(`${entry.name}: ${entry.duration}ms`);
    });
  });
  
  observer.observe({ entryTypes: ['measure', 'navigation'] });
}
```

### Backend Performance

#### Request Timing
```javascript
// middleware/timing.js
function timing(req, res, next) {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    if (duration > 1000) { // Log slow requests
      console.warn(`Slow request: ${req.method} ${req.url} took ${duration}ms`);
    }
  });
  
  next();
}
```

#### Database Query Profiling
```javascript
// If using a database, profile queries
const queryStart = Date.now();
const result = await db.query(sql, params);
const queryTime = Date.now() - queryStart;

if (queryTime > 100) {
  console.warn(`Slow query (${queryTime}ms):`, sql);
}
```

This debugging guide should help you efficiently identify and resolve issues in your Vidoer application. Remember to use the appropriate debugging level for your environment and always clean up debug code before production deployment.
