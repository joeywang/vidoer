#!/bin/bash

# Debug Frontend Script
# Usage: ./scripts/debug-frontend.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🐛 Starting frontend in debug mode..."
echo "📍 Project root: $PROJECT_ROOT"
echo "🌐 Frontend URL: http://localhost:3000"
echo ""
echo "💡 Browser DevTools: F12 or right-click -> Inspect"
echo "💡 React DevTools: Install React Developer Tools extension"
echo "💡 Next.js debugging: Automatic source maps enabled"
echo ""

cd "$PROJECT_ROOT/frontend"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "🚀 Starting frontend development server..."
echo "⏹️  Press Ctrl+C to stop"
echo ""

# Set debugging environment variables
export NODE_OPTIONS="--inspect"
export NEXT_TELEMETRY_DISABLED=1

# Start Next.js in development mode
npm run dev
