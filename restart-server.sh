#!/bin/bash

# Deliverable Dashboard Server Restart Script

echo "🔄 Restarting Deliverable Dashboard Server..."

# Stop the server first
./stop-server.sh

# Wait a moment for cleanup
sleep 3

# Start the server
./start-server.sh

echo "🔄 Server restart complete!" 