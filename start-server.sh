#!/bin/bash

# Deliverable Dashboard Server Startup Script
# This script helps manage server processes and avoid port conflicts

echo "🚀 Starting Deliverable Dashboard Server..."

# Kill any existing node processes on port 3001
echo "🔧 Checking for existing processes on port 3001..."
pkill -f "node server.js" 2>/dev/null || true
sleep 2

# Check if port 3001 is still in use
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3001 is still in use. Attempting to kill processes..."
    sudo lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 3
fi

# Navigate to server directory
cd server

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🚀 Starting server on port 3001..."
npm start

echo "✅ Server startup complete!" 