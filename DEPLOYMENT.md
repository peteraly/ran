# Deployment Guide

## 🚀 Current Deployment Status

### Frontend (Vercel) - ✅ DEPLOYED
- **Live URL**: https://ran-kv7ph8yf4-peteralys-projects.vercel.app
- **Status**: Successfully deployed and running
- **Last Deployed**: June 30, 2025

### Backend (Render.com) - 🔄 READY TO DEPLOY
- **Configuration**: `render.yaml` is configured and ready
- **Repository**: Connected to GitHub
- **Status**: Ready for deployment

## Backend Deployment Instructions

### Option 1: Render.com (Recommended) - Use Blueprint
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository: `https://github.com/peteraly/ran.git`
4. Render will automatically detect the `render.yaml` configuration
5. Click "Apply" to deploy

### Option 2: Manual Render.com Setup
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `https://github.com/peteraly/ran.git`
4. Configure:
   - **Name**: `ran-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

## Environment Variables Setup

### Required Environment Variables (Set in Render.com)
```env
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://ran-kv7ph8yf4-peteralys-projects.vercel.app
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=rag-index
OPENAI_API_KEY=your_openai_api_key
```

### Frontend Environment Variables (Set in Vercel)
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

## Update Frontend API URL

After deploying the backend:

1. Get your backend URL from Render.com (e.g., `https://ran-backend.onrender.com`)
2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
3. Add/Update: `REACT_APP_API_URL` = `https://your-backend-url.onrender.com`
4. Redeploy frontend: `npx vercel --prod --yes`

## Testing Deployment

### 1. Frontend Test
- Visit: https://ran-kv7ph8yf4-peteralys-projects.vercel.app
- Should load the RAG dashboard interface

### 2. Backend Health Check
- Visit: `https://your-backend-url.onrender.com/api/health`
- Should return: `{"status":"healthy","timestamp":"...","contentIndexSize":0}`

### 3. API Connection Test
- Visit: `https://your-backend-url.onrender.com/api/debug/env`
- Should show environment variable status

### 4. Full System Test
1. Open the frontend
2. Click "Add Source" → "Local Files"
3. Upload a PDF or text file
4. Try generating a prompt with the uploaded content

## Troubleshooting

### Common Issues:

#### CORS Errors
- Ensure backend CORS includes frontend URL
- Check `FRONTEND_URL` environment variable in Render.com

#### API Timeouts
- Check backend logs in Render.com dashboard
- Verify all environment variables are set

#### Build Failures
- Check Render.com build logs
- Verify all dependencies are in `server/package.json`

#### Pinecone Errors
- Verify `PINECONE_API_KEY` and `PINECONE_INDEX` are set
- Check Pinecone dashboard for index status

### Logs Access:
- **Vercel**: Check deployment logs in Vercel dashboard
- **Render**: Check service logs in Render.com dashboard

## Quick Deploy Commands

```bash
# Deploy frontend
npx vercel --prod --yes

# Deploy backend (after setting up Render.com)
git push origin main  # Triggers automatic deployment if using Blueprint
```

## Current URLs
- **Frontend**: https://ran-kv7ph8yf4-peteralys-projects.vercel.app
- **Backend**: Will be available after Render.com deployment
- **Repository**: https://github.com/peteraly/ran.git 