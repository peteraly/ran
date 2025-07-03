# 🛠️ Troubleshooting Guide

## Quick Error Reference

### Frontend Errors

| Error | Cause | Solution | Wait Time |
|-------|-------|----------|-----------|
| `Failed to retrieve chunks` | Backend response format mismatch | Check backend retrieve endpoint | 30 seconds |
| `Cannot read properties of undefined` | Missing null checks | Add optional chaining (?.) | Immediate |
| `Network Error` | Backend server down | Restart backend server | 2-3 minutes |
| `CORS Error` | Cross-origin request blocked | Check CORS configuration | 1 minute |

### Backend Errors

| Error | Cause | Solution | Wait Time |
|-------|-------|----------|-----------|
| `EADDRINUSE` | Port 3001 already in use | Kill existing process | 30 seconds |
| `PineconeBadRequestError` | Non-ASCII characters in vector IDs | Check filename sanitization | 1 minute |
| `Cannot read properties of undefined` | Missing null checks in backend | Add error handling | Immediate |

## 🚀 System Readiness Checklist

### Before Testing
- [ ] Backend server running on port 3001
- [ ] Frontend running on port 3000
- [ ] Environment variables set correctly
- [ ] No port conflicts
- [ ] Internet connection stable

### How to Know It's Ready
1. **Backend Health Check**: Visit `http://localhost:3001/api/health`
   - Should return: `{"status":"healthy","timestamp":"...","contentIndexSize":X}`
   
2. **Frontend Loading**: Visit `http://localhost:3000`
   - Should load without console errors
   - Debug panel should show "healthy" status

3. **File Upload Test**: Try uploading a small PDF
   - Should show processing progress
   - Should appear in source list

## 🔧 Debug Tools

### 1. Debug Panel (Development Only)
- **Location**: Bottom-right corner of the page
- **Features**:
  - Real-time system status
  - Error log viewer
  - Quick actions (reload, clear console, etc.)
  - Export error logs

### 2. Browser Console
- **Open**: F12 or Right-click → Inspect → Console
- **Look for**:
  - 🚨 Error messages
  - 🔧 Debug information
  - 📋 Error logs

### 3. Backend Logs
- **Location**: Terminal running `npm start` in server directory
- **Key indicators**:
  - `🚀 Server running on port 3001` = Ready
  - `✅ Successfully indexed X chunks` = Working
  - `🚨 Frontend Error Report` = Frontend issues

## 🚨 Common Issues & Solutions

### 1. Port Conflicts (EADDRINUSE)

**Symptoms**: Backend won't start, shows "address already in use"

**Solution**:
```bash
# Kill existing processes
pkill -f "node server.js"
sleep 2
cd server && npm start
```

**Wait Time**: 30 seconds

### 2. Frontend Can't Connect to Backend

**Symptoms**: "Failed to retrieve chunks", network errors

**Solution**:
1. Check backend is running: `curl http://localhost:3001/api/health`
2. Verify environment variables in frontend
3. Check CORS configuration
4. Restart both frontend and backend

**Wait Time**: 2-3 minutes

### 3. Pinecone Indexing Failures

**Symptoms**: "PineconeBadRequestError: Vector ID must be ASCII"

**Solution**:
1. Check filename sanitization is working
2. Verify Pinecone API key is correct
3. Check Pinecone index exists and is accessible

**Wait Time**: 1 minute

### 4. React Component Errors

**Symptoms**: White screen, component crashes

**Solution**:
1. Check browser console for error details
2. Use Error Boundary for graceful handling
3. Add null checks to component props
4. Clear browser cache and reload

**Wait Time**: Immediate

## 📊 Monitoring & Diagnostics

### Automatic Monitoring
The system includes automatic error monitoring that:
- Catches JavaScript errors
- Monitors backend connectivity
- Tracks file processing status
- Provides suggested fixes

### Manual Diagnostics
Run these commands to check system health:

```bash
# Backend health
curl http://localhost:3001/api/health

# Check for port conflicts
lsof -i :3001
lsof -i :3000

# Check process status
ps aux | grep node

# Clear logs and restart
pkill -f "node server.js"
sleep 2
cd server && npm start
```

## ⏱️ Timing Guidelines

### Development
- **Backend startup**: 10-30 seconds
- **Frontend startup**: 5-15 seconds
- **File upload**: 10-60 seconds (depends on file size)
- **Deliverable generation**: 15-45 seconds

### Production (Vercel/Render)
- **Backend cold start**: 30-60 seconds
- **Frontend deployment**: 2-5 minutes
- **File processing**: 30-120 seconds
- **Deliverable generation**: 30-90 seconds

## 🔍 When to Wait vs. When to Act

### Wait For:
- ✅ Backend cold starts (30-60 seconds)
- ✅ File processing (10-60 seconds)
- ✅ AI generation (15-45 seconds)
- ✅ Network requests (5-15 seconds)

### Act Immediately:
- ❌ Port conflicts (EADDRINUSE)
- ❌ Missing environment variables
- ❌ CORS errors
- ❌ React component crashes
- ❌ Console errors with stack traces

## 🆘 Emergency Procedures

### Complete System Reset
```bash
# 1. Kill all Node processes
pkill -f "node"

# 2. Clear ports
sleep 5

# 3. Restart backend
cd server && npm start

# 4. Restart frontend (in new terminal)
cd .. && npm start
```

### Data Recovery
- Uploaded files are stored in `server/uploads/`
- Pinecone index persists across restarts
- Error logs are stored in memory (lost on restart)

## 📞 Getting Help

### Debug Information to Collect
1. **Error messages** from browser console
2. **Backend logs** from terminal
3. **System diagnostics** from debug panel
4. **Error log export** from debug panel
5. **Environment** (development/production)
6. **Browser** and **OS** information

### Common Debug Commands
```bash
# Check system status
curl http://localhost:3001/api/health
curl http://localhost:3001/api/uploaded-files

# Check error logs
curl http://localhost:3001/api/error-log

# Monitor backend logs
tail -f server/logs/app.log  # if logging is enabled
```

## 🎯 Pro Tips

1. **Always check the debug panel first** - it shows real-time system status
2. **Use browser console** - most errors are logged there with stack traces
3. **Monitor backend logs** - they show processing status and errors
4. **Clear cache regularly** - especially after code changes
5. **Test with small files first** - to verify system is working
6. **Keep error logs** - they help identify patterns and root causes

## 🔄 Maintenance Schedule

### Daily
- Check system health via debug panel
- Review error logs
- Monitor backend performance

### Weekly
- Clear old error logs
- Update dependencies
- Review system performance

### Monthly
- Full system diagnostics
- Performance optimization
- Security updates 