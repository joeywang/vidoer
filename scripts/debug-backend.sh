#!/bin/bash

# Debug Backend Script
# Usage: ./scripts/debug-backend.sh [port]

set -e

DEBUG_PORT=${1:-9229}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🐛 Starting backend in debug mode..."
echo "📍 Project root: $PROJECT_ROOT"
echo "🔍 Debug port: $DEBUG_PORT"
echo "🌐 Backend URL: http://localhost:3001"
echo ""
echo "💡 Connect your debugger to localhost:$DEBUG_PORT"
echo "💡 Chrome DevTools: chrome://inspect"
echo "💡 VSCode: Use 'Debug Backend (Attach)' configuration"
echo ""

cd "$PROJECT_ROOT/backend"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

echo "🚀 Starting backend with debugging enabled..."
echo "⏹️  Press Ctrl+C to stop"
echo ""

# Start with inspect mode
NODE_OPTIONS="--inspect=0.0.0.0:$DEBUG_PORT" npm start
