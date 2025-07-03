# 🚨 Quick Debug Reference

## ⚡ Immediate Actions

### 1. Check System Status
```bash
# Backend health
curl http://localhost:3001/api/health

# Frontend (open browser)
http://localhost:3000
```

### 2. Kill Port Conflicts
```bash
pkill -f "node server.js"
sleep 2
cd server && npm start
```

### 3. Check Error Logs
```bash
# Backend errors
curl http://localhost:3001/api/error-log

# Frontend errors (browser console)
F12 → Console
```

## 🔍 Debug Panel (Development)

**Location**: Bottom-right corner of page
**Features**:
- Real-time system status
- Error log viewer
- Quick actions
- Export logs

## ⏱️ Wait Times

| Operation | Development | Production |
|-----------|-------------|------------|
| Backend start | 10-30s | 30-60s |
| File upload | 10-60s | 30-120s |
| AI generation | 15-45s | 30-90s |
| Frontend deploy | 5-15s | 2-5min |

## 🚨 Common Errors

### EADDRINUSE
```bash
pkill -f "node server.js" && sleep 2 && npm start
```

### Failed to retrieve chunks
- Check backend is running
- Verify API endpoints
- Check CORS settings

### PineconeBadRequestError
- Check filename sanitization
- Verify API key
- Check index exists

## 📞 Emergency Reset
```bash
pkill -f "node"
sleep 5
cd server && npm start
# New terminal: cd .. && npm start
```

## 🎯 Pro Tips
1. **Debug panel first** - shows real-time status
2. **Browser console** - most errors logged there
3. **Backend logs** - processing status and errors
4. **Clear cache** - after code changes
5. **Small files first** - verify system working 