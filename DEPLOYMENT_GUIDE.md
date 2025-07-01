# 🚀 Enhanced RAG Deployment Guide

## 📋 Overview

This guide walks you through deploying the Enhanced RAG system to production. The system includes:

- **Backend**: Node.js server with Enhanced RAG features (Render.com)
- **Frontend**: React application with tabbed interface (Vercel)
- **Enhanced RAG**: Multi-representation indexing, Active RAG, hallucination detection

## 🛠️ Prerequisites

### Required Accounts
- [GitHub](https://github.com) - Code repository
- [Render.com](https://render.com) - Backend hosting
- [Vercel](https://vercel.com) - Frontend hosting
- [Pinecone](https://pinecone.io) - Vector database
- [OpenAI](https://openai.com) - AI services

### Required API Keys
- OpenAI API Key
- Pinecone API Key
- Pinecone Index Name

## 🔧 Backend Deployment (Render.com)

### Step 1: Prepare Backend
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Test locally
npm start
```

### Step 2: Deploy to Render

#### Option A: Using Render Dashboard
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ran-enhanced-rag-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Starter` (or your preferred plan)

#### Option B: Using render.yaml (Recommended)
1. The `render.yaml` file is already configured
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect and use the `render.yaml` configuration

### Step 3: Set Environment Variables
In your Render service dashboard, add these environment variables:

```bash
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=rag-index
ENHANCED_RAG_ENABLED=true
ACTIVE_RAG_ENABLED=true
MAX_DOCUMENTS_PER_QUERY=5
```

### Step 4: Verify Backend Deployment
1. Wait for deployment to complete
2. Test the health endpoint: `https://your-app-name.onrender.com/api/health`
3. You should see: `{"status":"healthy","timestamp":"...","contentIndexSize":0}`

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
```bash
# Navigate to project root
cd /path/to/your/project

# Install dependencies
npm install

# Build for production
npm run build
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Create React App`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### Step 3: Set Environment Variables
In your Vercel project dashboard, add this environment variable:

```bash
REACT_APP_API_URL=https://your-backend-name.onrender.com
```

### Step 4: Verify Frontend Deployment
1. Wait for deployment to complete
2. Visit your Vercel URL
3. Test the Enhanced RAG tab functionality

## 🔄 Automated Deployment

### Using the Deployment Script
```bash
# Make script executable (if not already)
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

The script will:
1. Check dependencies
2. Build the frontend
3. Guide you through backend deployment
4. Guide you through frontend deployment
5. Create environment variable templates

## 🧪 Testing the Deployment

### 1. Test Backend Health
```bash
curl https://your-backend-name.onrender.com/api/health
```

### 2. Test Enhanced RAG Endpoints
```bash
# Test enhanced documents endpoint
curl https://your-backend-name.onrender.com/api/enhanced-documents

# Test enhanced query endpoint
curl -X POST https://your-backend-name.onrender.com/api/enhanced-query \
  -H "Content-Type: application/json" \
  -d '{"query":"test query","useActiveRAG":true}'
```

### 3. Test Frontend Integration
1. Open your Vercel URL
2. Navigate to the Enhanced RAG tab
3. Upload a test document
4. Try a query to test the full system

## 🔍 Monitoring & Debugging

### Backend Logs (Render)
1. Go to your Render service dashboard
2. Click "Logs" tab
3. Look for Enhanced RAG processing messages:
   ```
   🔄 Enhanced RAG: Processing document "test.pdf"
   ✅ Enhanced RAG: Successfully stored document "test.pdf"
   📝 Generated 3 queries for retrieval
   🎯 Grading document relevance...
   ```

### Frontend Logs (Vercel)
1. Go to your Vercel project dashboard
2. Click "Functions" tab
3. Check for any build or runtime errors

### Common Issues

#### Backend Issues
1. **Pinecone Connection Error**
   - Verify `PINECONE_API_KEY` and `PINECONE_INDEX` are correct
   - Check Pinecone dashboard for index status

2. **OpenAI API Error**
   - Verify `OPENAI_API_KEY` is valid
   - Check OpenAI dashboard for quota/usage

3. **Enhanced RAG Not Working**
   - Ensure `ENHANCED_RAG_ENABLED=true`
   - Check server logs for initialization errors

#### Frontend Issues
1. **API Connection Error**
   - Verify `REACT_APP_API_URL` points to correct backend
   - Check CORS settings in backend

2. **Build Errors**
   - Check Vercel build logs
   - Ensure all dependencies are in `package.json`

## 🔧 Environment Variables Reference

### Backend (Render)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `PORT` | Server port | Yes | `3001` |
| `OPENAI_API_KEY` | OpenAI API key | Yes | - |
| `PINECONE_API_KEY` | Pinecone API key | Yes | - |
| `PINECONE_INDEX` | Pinecone index name | Yes | `rag-index` |
| `ENHANCED_RAG_ENABLED` | Enable Enhanced RAG | No | `true` |
| `ACTIVE_RAG_ENABLED` | Enable Active RAG | No | `true` |
| `MAX_DOCUMENTS_PER_QUERY` | Max docs per query | No | `5` |

### Frontend (Vercel)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `REACT_APP_API_URL` | Backend API URL | Yes | - |

## 🚀 Production Checklist

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set
- [ ] Health endpoints responding
- [ ] Enhanced RAG endpoints working
- [ ] Document upload tested
- [ ] Query processing tested
- [ ] Active RAG features verified
- [ ] Hallucination detection working
- [ ] Multi-query generation tested

## 🔄 Updates & Maintenance

### Backend Updates
1. Push changes to GitHub
2. Render will auto-deploy if connected
3. Monitor logs for any issues

### Frontend Updates
1. Push changes to GitHub
2. Vercel will auto-deploy if connected
3. Test new features in production

### Environment Variable Updates
1. Update in Render/Vercel dashboard
2. Redeploy if necessary
3. Test affected functionality

## 📞 Support

If you encounter issues:

1. **Check Logs**: Review Render and Vercel logs
2. **Verify Configuration**: Ensure all environment variables are set
3. **Test Locally**: Reproduce issues in local environment
4. **Check Documentation**: Review `ENHANCED_RAG_INTEGRATION.md`

## 🎉 Success!

Once deployed, you'll have a production-ready Enhanced RAG system with:

- ✅ Multi-representation document indexing
- ✅ Active RAG with relevance grading
- ✅ Hallucination detection
- ✅ Multi-query generation
- ✅ Modern, responsive UI
- ✅ Real-time processing feedback
- ✅ Production-grade error handling

Your Enhanced RAG system is now ready for production use! 🚀 