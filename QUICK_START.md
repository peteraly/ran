# 🚀 Quick Start Guide

## System Status
Both servers are now running properly! ✅

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## Quick Commands

### Monitor System
```bash
./monitor.sh
```
Shows status of both servers and process information.

### Restart Servers
```bash
# Restart backend only
./start-server.sh

# Restart frontend only  
./start-frontend.sh

# Kill all processes (if needed)
pkill -f "node server.js" && pkill -f "react-scripts"
```

### Test System
```bash
# Test backend health
curl http://localhost:3001/api/health

# Test frontend
curl http://localhost:3000
```

## Common Issues & Solutions

### Port Conflicts (EADDRINUSE)
**Problem**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solution**: Use the startup scripts
```bash
./start-server.sh
./start-frontend.sh
```

### Server Process Killed
**Problem**: Server terminates with "zsh: killed" or "zsh: terminated"

**Solution**: 
1. Check memory usage: `./monitor.sh`
2. Restart with scripts: `./start-server.sh`
3. If persistent, increase Node.js memory: Add `--max-old-space-size=4096` to package.json

### Frontend Not Loading
**Problem**: White screen or compilation errors

**Solution**:
1. Check if React is running: `./monitor.sh`
2. Restart frontend: `./start-frontend.sh`
3. Clear cache: `rm -rf node_modules/.cache && npm start`

## Development Workflow

1. **Start Development**:
   ```bash
   ./start-server.sh    # Terminal 1
   ./start-frontend.sh  # Terminal 2
   ```

2. **Monitor Status**:
   ```bash
   ./monitor.sh
   ```

3. **Test Changes**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001/api/health

4. **Troubleshoot Issues**:
   - Check logs in terminal
   - Use `./monitor.sh` for status
   - Restart with startup scripts

## Production Deployment

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render
- **Environment Variables**: Set in Vercel dashboard

## Emergency Procedures

### Complete Reset
```bash
# Kill all processes
pkill -f "node server.js" && pkill -f "react-scripts"

# Clear caches
rm -rf node_modules/.cache
rm -rf server/node_modules/.cache

# Restart
./start-server.sh
./start-frontend.sh
```

### Memory Issues
```bash
# Check memory usage
ps aux | grep node

# Increase Node.js memory limit
# Add to server/package.json scripts:
# "start": "node --max-old-space-size=4096 server.js"
```

---

**Last Updated**: January 2025
**Status**: ✅ All systems operational 