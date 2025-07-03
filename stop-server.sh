#!/bin/bash

# Deliverable Dashboard Server Stop Script

echo "🛑 Stopping Deliverable Dashboard Server..."

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Stop monitoring process if PID file exists
if [ -f "monitor.pid" ]; then
    MONITOR_PID=$(cat monitor.pid)
    echo "🔄 Stopping health monitor (PID: $MONITOR_PID)..."
    kill $MONITOR_PID 2>/dev/null || true
    rm -f monitor.pid
    echo "✅ Health monitor stopped"
fi

# Stop server process if PID file exists
if [ -f "server/server.pid" ]; then
    SERVER_PID=$(cat server/server.pid)
    echo "🛑 Stopping server (PID: $SERVER_PID)..."
    
    # Try graceful shutdown first
    kill $SERVER_PID 2>/dev/null || true
    sleep 3
    
    # Check if process is still running
    if kill -0 $SERVER_PID 2>/dev/null; then
        echo "⚠️ Server not responding to graceful shutdown, forcing..."
        kill -9 $SERVER_PID 2>/dev/null || true
        sleep 2
    fi
    
    rm -f server/server.pid
    echo "✅ Server stopped"
fi

# Kill any remaining node processes on port 3001
if check_port 3001; then
    echo "🔧 Killing remaining processes on port 3001..."
    pkill -f "node.*server.js" 2>/dev/null || true
    sleep 2
    
    if check_port 3001; then
        echo "⚠️ Force killing processes on port 3001..."
        sudo lsof -ti:3001 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
fi

# Verify port is free
if check_port 3001; then
    echo "❌ Port 3001 is still in use"
    echo "📋 Active processes on port 3001:"
    lsof -i :3001
else
    echo "✅ Port 3001 is now free"
fi

echo "🛑 Server shutdown complete!" 