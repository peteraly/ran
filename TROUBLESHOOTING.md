# 🔧 Troubleshooting Guide

## Quick Fixes

### Port Conflicts (EADDRINUSE)
**Problem**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solution**: Use the startup scripts
```bash
# For backend
./start-server.sh

# For frontend  
./start-frontend.sh
```

**Manual Fix**:
```bash
# Kill all node processes
pkill -f "node server.js"
pkill -f "react-scripts"

# Wait and restart
sleep 3
cd server && npm start
```

### Frontend Compilation Errors
**Problem**: `Module not found: Error: Can't resolve './App.css'`

**Solution**: The App.css file has been created. If you still get errors:
```bash
# Clear cache and restart
rm -rf node_modules/.cache
npm start
```

### Server Process Killed
**Problem**: Server terminates unexpectedly with "zsh: killed" or "zsh: terminated"

**Causes**:
- Memory issues (large file processing)
- Manual process kill
- System resource limits

**Solutions**:
1. **Use startup scripts** (recommended)
2. **Monitor memory usage**:
   ```bash
   # Check memory usage
   ps aux | grep node
   ```
3. **Increase Node.js memory limit**:
   ```bash
   # Add to package.json scripts
   "start": "node --max-old-space-size=4096 server.js"
   ```

## Common Issues & Solutions

### Pinecone Vector ID Errors
**Problem**: `PineconeBadRequestError: Vector ID must be ASCII`

**Status**: ✅ **FIXED** - Filename sanitization implemented

**Solution**: The system now automatically sanitizes filenames for Pinecone compatibility.

### Source Diversity Analyzer Errors
**Problem**: `TypeError: sourceDiversityAnalyzer.analyzeSources is not a function`

**Status**: ✅ **FIXED** - Method names corrected

**Solution**: All method calls have been updated to use correct function names.

### CORS Errors
**Problem**: Frontend can't connect to backend

**Status**: ✅ **FIXED** - CORS configuration updated

**Solution**: Backend now allows all origins in production and specific domains in development.

### 404 Errors
**Problem**: API endpoints return 404

**Status**: ✅ **FIXED** - Endpoint ordering corrected

**Solution**: 404 handler moved to end of file, all endpoints now accessible.

## Error Monitoring System

### Frontend Error Monitoring
- **Error Boundary**: Catches React component crashes
- **Global Error Handler**: Catches JavaScript errors
- **Debug Panel**: Real-time system status (development only)
- **Error Logging**: Sends errors to backend for analysis

### Backend Error Monitoring
- **Error Logging Endpoint**: `/api/log-error`
- **Error Retrieval Endpoint**: `/api/error-log`
- **Console Logging**: All errors logged with timestamps
- **Memory Storage**: Last 100 errors stored in memory

### Using the Debug Panel
1. **Visible in development mode only**
2. **Shows system status**: Backend health, storage, network, browser compatibility
3. **Error log**: Last 5 errors with details
4. **Quick actions**: Reload, clear console, clear storage, export logs

## Performance Optimization

### Memory Management
- **Chunk Processing**: Files processed in smaller chunks
- **Error Log Rotation**: Only last 100 errors kept
- **Garbage Collection**: Automatic cleanup of processed data

### Server Stability
- **Process Management**: Startup scripts handle port conflicts
- **Error Recovery**: Graceful error handling with fallbacks
- **Resource Monitoring**: Memory and CPU usage tracking

## Deployment Issues

### Vercel Deployment
**Problem**: White screen or 404 errors

**Solutions**:
1. **Check environment variables**:
   - `REACT_APP_BACKEND_URL` should point to your Render backend
2. **Clear Vercel cache**:
   - Force rebuild by updating App.js comment
3. **Check build logs**:
   - Verify all dependencies installed

### Render Backend
**Problem**: Backend not responding

**Solutions**:
1. **Check health endpoint**: `https://your-backend.onrender.com/api/health`
2. **Verify environment variables**:
   - `PINECONE_API_KEY`
   - `OPENAI_API_KEY`
   - `PINECONE_INDEX_NAME`
3. **Check logs**: Monitor Render dashboard for errors

## Emergency Procedures

### Complete System Reset
```bash
# Kill all processes
pkill -f "node"
pkill -f "react-scripts"

# Clear caches
rm -rf node_modules/.cache
rm -rf server/node_modules/.cache

# Restart with scripts
./start-server.sh
# In another terminal:
./start-frontend.sh
```

### Database Reset (Pinecone)
```bash
# Clear local content index
# (This will require re-uploading documents)
rm -rf server/contentIndex.json
```

### Environment Check
```bash
# Verify all required environment variables
echo "PINECONE_API_KEY: ${PINECONE_API_KEY:0:10}..."
echo "OPENAI_API_KEY: ${OPENAI_API_KEY:0:10}..."
echo "PINECONE_INDEX_NAME: $PINECONE_INDEX_NAME"
```

## Getting Help

### Debug Information
When reporting issues, include:
1. **Error messages** from console
2. **System status** from Debug Panel
3. **Environment**: Local vs Production
4. **Steps to reproduce**

### Log Locations
- **Frontend**: Browser console (F12)
- **Backend**: Terminal where server is running
- **Error Log**: `/api/error-log` endpoint
- **Debug Panel**: Bottom-right corner (development)

### Quick Status Check
```bash
# Backend health
curl http://localhost:3001/api/health

# Error log
curl http://localhost:3001/api/error-log

# Frontend status
curl http://localhost:3000
```

---

**Last Updated**: January 2025
**Version**: 2.0 - Enhanced Error Monitoring & Debugging 