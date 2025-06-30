#!/bin/bash

echo "🚀 Starting deployment process..."

# Build frontend
echo "📦 Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

# Deploy frontend to Vercel
echo "📱 Deploying frontend to Vercel..."
npx vercel --prod --yes

if [ $? -eq 0 ]; then
    echo "✅ Frontend deployed successfully!"
    echo "🌐 Frontend URL: https://ran-9s53094xu-peteralys-projects.vercel.app"
else
    echo "❌ Frontend deployment failed!"
    exit 1
fi

# Commit and push changes
echo "📝 Committing and pushing changes..."
git add .
git commit -m "Deploy: $(date)"
git push origin main

echo ""
echo "🔧 Backend deployment instructions:"
echo "1. Go to https://render.com"
echo "2. Sign up/login and click 'New +' → 'Blueprint'"
echo "3. Connect your GitHub repository: https://github.com/peteraly/ran.git"
echo "4. Render will automatically detect render.yaml configuration"
echo "5. Click 'Apply' to deploy"
echo ""
echo "6. After backend deployment, set environment variables in Render.com:"
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo "   - FRONTEND_URL=https://ran-9s53094xu-peteralys-projects.vercel.app"
echo "   - PINECONE_API_KEY=your_pinecone_api_key"
echo "   - PINECONE_INDEX=rag-index"
echo "   - OPENAI_API_KEY=your_openai_api_key"
echo ""
echo "7. Update frontend API URL in Vercel environment variables"
echo "8. Redeploy frontend: npx vercel --prod --yes"

echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo "🔗 Current Frontend: https://ran-9s53094xu-peteralys-projects.vercel.app" 