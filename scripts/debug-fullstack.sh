#!/bin/bash

# Debug Full Stack Script
# Usage: ./scripts/debug-fullstack.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🐛 Starting full-stack debugging..."
echo "📍 Project root: $PROJECT_ROOT"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🌐 Backend: http://localhost:3001"
echo "🔍 Backend Debug: localhost:9229"
echo ""
echo "💡 VSCode: Use 'Debug Full Stack' configuration"
echo "💡 Chrome DevTools: chrome://inspect"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    jobs -p | xargs -r kill
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

cd "$PROJECT_ROOT"

# Check if dependencies are installed
echo "📦 Checking dependencies..."
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

echo ""
echo "🚀 Starting services..."
echo "⏹️  Press Ctrl+C to stop all services"
echo ""

# Start backend with debug mode
echo "🔧 Starting backend..."
cd "$PROJECT_ROOT/backend"
NODE_OPTIONS="--inspect=0.0.0.0:9229" npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "⚛️  Starting frontend..."
cd "$PROJECT_ROOT/frontend"
NODE_OPTIONS="--inspect" NEXT_TELEMETRY_DISABLED=1 npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
