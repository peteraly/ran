# Deployment Guide

## Frontend (Vercel) - ✅ DEPLOYED
- **Live URL**: https://ran-rdu3wvsel-peteralys-projects.vercel.app
- **Status**: Successfully deployed and running

## Backend Deployment Options

### Option 1: Render.com (Recommended)
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `deliverable-dashboard-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

### Option 2: Railway
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set environment variables:
   - `NODE_ENV=production`
   - `PORT=10000`

### Option 3: Heroku
1. Install Heroku CLI: `npm install -g heroku`
2. Run: `heroku create deliverable-dashboard-backend`
3. Run: `git push heroku main`

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://ran-rdu3wvsel-peteralys-projects.vercel.app
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

## Update Frontend API URL

After deploying the backend, update the frontend to use the new API URL:

1. In `src/services/connections.js`, update the `API_BASE_URL`
2. Redeploy frontend: `npx vercel --prod`

## Testing Deployment

1. **Frontend**: Visit https://ran-rdu3wvsel-peteralys-projects.vercel.app
2. **Backend Health Check**: Visit `https://your-backend-url.com/api/health`
3. **Test Connection**: Try adding a new source in the dashboard

## Troubleshooting

### Common Issues:
- **CORS Errors**: Ensure backend CORS includes frontend URL
- **API Timeouts**: Check backend logs for errors
- **Build Failures**: Verify all dependencies are in package.json

### Logs:
- **Vercel**: Check deployment logs in Vercel dashboard
- **Backend**: Check service logs in your hosting platform 