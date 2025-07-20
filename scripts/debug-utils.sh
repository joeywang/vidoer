#!/bin/bash

# Debug Utilities Script
# Usage: ./scripts/debug-utils.sh [command]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

show_help() {
    echo "🔧 Debug Utilities"
    echo ""
    echo "Usage: ./scripts/debug-utils.sh [command]"
    echo ""
    echo "Commands:"
    echo "  logs       Show logs from running services"
    echo "  ports      Check which ports are in use"
    echo "  processes  Show Node.js processes"
    echo "  kill       Kill all Node.js development processes"
    echo "  health     Check service health"
    echo "  env        Show environment information"
    echo "  network    Test network connectivity"
    echo "  clean      Clean debug artifacts"
    echo ""
}

show_logs() {
    echo "📋 Showing application logs..."
    echo ""
    
    if [ -f "$PROJECT_ROOT/logs/backend.log" ]; then
        echo "🔧 Backend logs:"
        tail -20 "$PROJECT_ROOT/logs/backend.log"
        echo ""
    fi
    
    if [ -f "$PROJECT_ROOT/logs/frontend.log" ]; then
        echo "⚛️  Frontend logs:"
        tail -20 "$PROJECT_ROOT/logs/frontend.log"
        echo ""
    fi
    
    echo "💡 For real-time logs, use: tail -f logs/*.log"
}

check_ports() {
    echo "🔍 Checking port usage..."
    echo ""
    
    ports=(3000 3001 9229 9230)
    
    for port in "${ports[@]}"; do
        if lsof -i ":$port" >/dev/null 2>&1; then
            echo "✅ Port $port is in use:"
            lsof -i ":$port" | head -2
        else
            echo "❌ Port $port is free"
        fi
        echo ""
    done
}

show_processes() {
    echo "🔍 Node.js processes:"
    echo ""
    ps aux | grep -E "(node|npm)" | grep -v grep || echo "No Node.js processes found"
}

kill_processes() {
    echo "🛑 Killing Node.js development processes..."
    
    # Kill by port
    for port in 3000 3001 9229 9230; do
        if lsof -ti ":$port" >/dev/null 2>&1; then
            echo "🔫 Killing process on port $port"
            kill -9 $(lsof -ti ":$port") 2>/dev/null || true
        fi
    done
    
    # Kill by process name
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "ts-node" 2>/dev/null || true
    
    echo "✅ All processes killed"
}

check_health() {
    echo "🏥 Checking service health..."
    echo ""
    
    # Check frontend
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo "✅ Frontend (http://localhost:3000) is responding"
    else
        echo "❌ Frontend is not responding"
    fi
    
    # Check backend
    if curl -s http://localhost:3001 >/dev/null 2>&1; then
        echo "✅ Backend (http://localhost:3001) is responding"
    else
        echo "❌ Backend is not responding"
    fi
    
    # Check debug port
    if nc -z localhost 9229 2>/dev/null; then
        echo "✅ Debug port (9229) is open"
    else
        echo "❌ Debug port is not available"
    fi
}

show_env() {
    echo "🌍 Environment Information:"
    echo ""
    echo "Node.js: $(node --version 2>/dev/null || echo 'Not installed')"
    echo "NPM: $(npm --version 2>/dev/null || echo 'Not installed')"
    echo "Docker: $(docker --version 2>/dev/null | cut -d' ' -f3 | cut -d',' -f1 || echo 'Not installed')"
    echo "OS: $(uname -s)"
    echo "Architecture: $(uname -m)"
    echo "Working Directory: $PROJECT_ROOT"
    echo ""
    echo "Environment Variables:"
    echo "NODE_ENV: ${NODE_ENV:-not set}"
    echo "DEBUG: ${DEBUG:-not set}"
    echo "PORT: ${PORT:-not set}"
}

test_network() {
    echo "🌐 Testing network connectivity..."
    echo ""
    
    # Test localhost connections
    echo "Testing localhost connections:"
    for port in 3000 3001; do
        if nc -z localhost $port 2>/dev/null; then
            echo "✅ localhost:$port - Connected"
        else
            echo "❌ localhost:$port - Failed"
        fi
    done
    
    echo ""
    echo "Testing external connectivity:"
    if ping -c 1 google.com >/dev/null 2>&1; then
        echo "✅ Internet connection - OK"
    else
        echo "❌ Internet connection - Failed"
    fi
}

clean_debug() {
    echo "🧹 Cleaning debug artifacts..."
    
    # Remove log files
    rm -rf "$PROJECT_ROOT/logs"
    
    # Remove debug files
    find "$PROJECT_ROOT" -name "*.log" -type f -delete 2>/dev/null || true
    find "$PROJECT_ROOT" -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
    find "$PROJECT_ROOT" -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
    
    echo "✅ Debug artifacts cleaned"
}

# Main script logic
case "${1:-help}" in
    logs)
        show_logs
        ;;
    ports)
        check_ports
        ;;
    processes)
        show_processes
        ;;
    kill)
        kill_processes
        ;;
    health)
        check_health
        ;;
    env)
        show_env
        ;;
    network)
        test_network
        ;;
    clean)
        clean_debug
        ;;
    help|*)
        show_help
        ;;
esac
