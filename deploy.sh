#!/bin/bash

echo "🚀 Starting Enhanced RAG Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    
    # Frontend is in root directory
    if [ ! -f "package.json" ]; then
        print_error "Frontend package.json not found in root directory"
        exit 1
    fi
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Build for production
    print_status "Building for production..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Frontend built successfully"
    else
        print_error "Frontend build failed"
        exit 1
    fi
}

# Deploy backend to Render
deploy_backend() {
    print_status "Deploying backend to Render..."
    
    cd server || {
        print_error "Server directory not found"
        exit 1
    }
    
    # Check if render.yaml exists
    if [ ! -f "render.yaml" ]; then
        print_error "render.yaml not found in server directory"
        exit 1
    fi
    
    print_warning "Please ensure you have:"
    print_warning "1. Render account and CLI installed"
    print_warning "2. Environment variables set in Render dashboard:"
    print_warning "   - OPENAI_API_KEY"
    print_warning "   - PINECONE_API_KEY"
    print_warning "   - PINECONE_INDEX"
    
    # Deploy using Render CLI (if available)
    if command -v render &> /dev/null; then
        print_status "Using Render CLI to deploy..."
        render deploy
    else
        print_warning "Render CLI not found. Please deploy manually:"
        print_warning "1. Go to https://dashboard.render.com"
        print_warning "2. Create new Web Service"
        print_warning "3. Connect your GitHub repository"
        print_warning "4. Set build command: npm install"
        print_warning "5. Set start command: npm start"
        print_warning "6. Add environment variables"
    fi
    
    cd ..
}

# Deploy frontend to Vercel
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    # Frontend is in root directory
    if [ ! -f "vercel.json" ]; then
        print_warning "vercel.json not found, creating..."
        # Create vercel.json if it doesn't exist
        cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/\$1"
    },
    {
      "src": "/favicon.ico",
      "dest": "/favicon.ico"
    },
    {
      "src": "/manifest.json",
      "dest": "/manifest.json"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://ran-enhanced-rag-backend.onrender.com"
  }
}
EOF
    fi
    
    # Deploy using Vercel CLI (if available)
    if command -v vercel &> /dev/null; then
        print_status "Using Vercel CLI to deploy..."
        vercel --prod
    else
        print_warning "Vercel CLI not found. Please deploy manually:"
        print_warning "1. Go to https://vercel.com"
        print_warning "2. Import your GitHub repository"
        print_warning "3. Set build command: npm run build"
        print_warning "4. Set output directory: build"
        print_warning "5. Add environment variable: REACT_APP_API_URL"
    fi
}

# Update environment variables
update_env_vars() {
    print_status "Updating environment variables..."
    
    # Create .env.example for reference
    cat > .env.example << EOF
# Backend Environment Variables
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=rag-index
ENHANCED_RAG_ENABLED=true
ACTIVE_RAG_ENABLED=true
MAX_DOCUMENTS_PER_QUERY=5

# Frontend Environment Variables
REACT_APP_API_URL=https://ran-enhanced-rag-backend.onrender.com
EOF
    
    print_success "Environment variables template created (.env.example)"
}

# Test the deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Test backend health
    print_status "Testing backend health endpoint..."
    if command -v curl &> /dev/null; then
        BACKEND_URL="https://ran-enhanced-rag-backend.onrender.com"
        HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/api/health" 2>/dev/null)
        if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
            print_success "Backend health check passed"
        else
            print_warning "Backend health check failed or backend not deployed yet"
        fi
    else
        print_warning "curl not available, skipping health check"
    fi
    
    print_status "Testing frontend build..."
    if [ -d "build" ]; then
        print_success "Frontend build directory exists"
    else
        print_warning "Frontend build directory not found"
    fi
}

# Main deployment function
main() {
    print_status "Starting Enhanced RAG deployment process..."
    
    # Check dependencies
    check_dependencies
    
    # Update environment variables
    update_env_vars
    
    # Build frontend
    build_frontend
    
    # Deploy backend
    deploy_backend
    
    # Deploy frontend
    deploy_frontend
    
    # Test deployment
    test_deployment
    
    print_success "Deployment process completed!"
    print_status "Next steps:"
    print_status "1. Set environment variables in Render dashboard"
    print_status "2. Set environment variables in Vercel dashboard"
    print_status "3. Test the deployed application"
    print_status "4. Upload documents and test Enhanced RAG features"
}

# Run main function
main "$@" 