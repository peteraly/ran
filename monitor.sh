#!/bin/bash

# Deliverable Dashboard Monitoring Script
# This script monitors both frontend and backend servers

echo "🔍 Monitoring Deliverable Dashboard Servers..."

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is not in use
    fi
}

# Function to check server health
check_backend_health() {
    if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
        return 0  # Backend is healthy
    else
        return 1  # Backend is not responding
    fi
}

# Check backend
echo "📊 Checking backend (port 3001)..."
if check_port 3001; then
    if check_backend_health; then
        echo "✅ Backend is running and healthy"
    else
        echo "⚠️  Backend is running but not responding"
    fi
else
    echo "❌ Backend is not running"
fi

# Check frontend
echo "🎨 Checking frontend (port 3000)..."
if check_port 3000; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not running"
fi

# Show process info
echo ""
echo "📋 Process Information:"
echo "Backend processes:"
ps aux | grep "node server.js" | grep -v grep || echo "  No backend processes found"

echo "Frontend processes:"
ps aux | grep "react-scripts" | grep -v grep || echo "  No frontend processes found"

echo ""
echo "🌐 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Health:   http://localhost:3001/api/health"

echo ""
echo "💡 Quick Commands:"
echo "  Restart backend:  ./start-server.sh"
echo "  Restart frontend: ./start-frontend.sh"
echo "  Kill all:         pkill -f 'node server.js' && pkill -f 'react-scripts'" 