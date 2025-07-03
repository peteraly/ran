#!/bin/bash

# Deliverable Dashboard Server Startup Script
# Enhanced version with better process management and monitoring

echo "🚀 Starting Deliverable Dashboard Server (Enhanced)..."

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on port
kill_port_processes() {
    local port=$1
    echo "🔧 Killing processes on port $port..."
    
    # Try graceful kill first
    pkill -f "node.*server.js" 2>/dev/null || true
    sleep 2
    
    # Check if port is still in use
    if check_port $port; then
        echo "⚠️ Port $port still in use, attempting force kill..."
        sudo lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 3
    fi
}

# Kill any existing processes on port 3001
kill_port_processes 3001

# Navigate to server directory
cd server

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set Node.js memory limits and enable garbage collection
export NODE_OPTIONS="--max-old-space-size=2048 --expose-gc"

# Start the server with enhanced monitoring
echo "🚀 Starting server on port 3001 with enhanced monitoring..."
echo "📊 Memory limit: 2GB"
echo "🧹 Garbage collection: Enabled"
echo "🔍 Error monitoring: Active"

# Start server in background with logging
nohup node server.js > server.log 2>&1 &
SERVER_PID=$!

# Save PID for later use
echo $SERVER_PID > server.pid

# Wait a moment for server to start
sleep 3

# Check if server started successfully
if check_port 3001; then
    echo "✅ Server started successfully on port 3001"
    echo "📋 Process ID: $SERVER_PID"
    echo "📄 Log file: server/server.log"
    echo "🔗 Health check: http://localhost:3001/api/health"
    echo ""
    echo "💡 Tips:"
    echo "  - Use './stop-server.sh' to stop the server"
    echo "  - Use 'tail -f server/server.log' to monitor logs"
    echo "  - Use './restart-server.sh' to restart"
else
    echo "❌ Failed to start server on port 3001"
    echo "📄 Check server.log for details"
    exit 1
fi

# Monitor server health in background
(
    while true; do
        sleep 30
        if ! check_port 3001; then
            echo "⚠️ Server appears to have stopped. Attempting restart..."
            kill_port_processes 3001
            cd server
            nohup node server.js > server.log 2>&1 &
            echo $! > server.pid
            sleep 5
            if check_port 3001; then
                echo "✅ Server restarted successfully"
            else
                echo "❌ Failed to restart server"
            fi
        fi
    done
) &

MONITOR_PID=$!
echo $MONITOR_PID > monitor.pid

echo "🔄 Health monitoring started (PID: $MONITOR_PID)"
echo "✅ Server startup complete!" 