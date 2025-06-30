#!/bin/bash

echo "🚀 Starting deployment process..."

# Frontend deployment
echo "📱 Deploying frontend to Vercel..."
npx vercel --prod --yes

echo "✅ Frontend deployed successfully!"
echo "🌐 Frontend URL: https://ran-rdu3wvsel-peteralys-projects.vercel.app"

echo ""
echo "🔧 Backend deployment instructions:"
echo "1. Go to https://render.com"
echo "2. Sign up/login and create a new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Configure:"
echo "   - Name: deliverable-dashboard-backend"
echo "   - Environment: Node"
echo "   - Build Command: cd server && npm install"
echo "   - Start Command: cd server && npm start"
echo "   - Plan: Free"
echo ""
echo "5. After backend deployment, update REACT_APP_API_URL in Vercel environment variables"
echo "6. Redeploy frontend: npx vercel --prod --yes"

echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions" 