#!/bin/bash

# Deliverable Dashboard Frontend Startup Script
# This script helps manage the React development server

echo "🎨 Starting Deliverable Dashboard Frontend..."

# Kill any existing React processes on port 3000
echo "🔧 Checking for existing React processes on port 3000..."
pkill -f "react-scripts" 2>/dev/null || true
sleep 2

# Check if port 3000 is still in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is still in use. Attempting to kill processes..."
    sudo lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 3
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the React development server
echo "🎨 Starting React development server on port 3000..."
npm start

echo "✅ Frontend startup complete!" 