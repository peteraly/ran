#!/bin/bash

echo "🧪 Enhanced RAG Deployment Testing Suite"
echo "========================================"

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

# Test URLs
FRONTEND_URL="https://ran-5w72cbgid-peteralys-projects.vercel.app"
BACKEND_URL="https://ran-enhanced-rag-backend.onrender.com"

# Test 1: Frontend Accessibility
test_frontend() {
    print_status "Testing Frontend Accessibility..."
    
    if command -v curl &> /dev/null; then
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
        if [ "$RESPONSE" = "200" ]; then
            print_success "Frontend is accessible (HTTP 200)"
        elif [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
            print_warning "Frontend requires authentication (HTTP $RESPONSE)"
            print_warning "Please disable password protection in Vercel settings"
        else
            print_error "Frontend returned HTTP $RESPONSE"
        fi
    else
        print_warning "curl not available, skipping frontend test"
    fi
}

# Test 2: Backend Health Check
test_backend_health() {
    print_status "Testing Backend Health Check..."
    
    if command -v curl &> /dev/null; then
        RESPONSE=$(curl -s "$BACKEND_URL/api/health")
        if [[ $RESPONSE == *"healthy"* ]]; then
            print_success "Backend health check passed"
            echo "Response: $RESPONSE"
        else
            print_error "Backend health check failed"
            print_warning "Backend may not be deployed yet"
            print_warning "Please deploy to Render.com first"
        fi
    else
        print_warning "curl not available, skipping backend test"
    fi
}

# Test 3: Backend API Endpoints
test_backend_endpoints() {
    print_status "Testing Backend API Endpoints..."
    
    if command -v curl &> /dev/null; then
        # Test enhanced documents endpoint
        RESPONSE=$(curl -s "$BACKEND_URL/api/enhanced-documents")
        if [[ $RESPONSE == *"documents"* ]] || [[ $RESPONSE == *"[]"* ]]; then
            print_success "Enhanced documents endpoint working"
        else
            print_warning "Enhanced documents endpoint may not be working"
        fi
        
        # Test enhanced query endpoint
        RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/enhanced-query" \
            -H "Content-Type: application/json" \
            -d '{"query":"test query","useActiveRAG":false}')
        if [[ $RESPONSE == *"error"* ]] || [[ $RESPONSE == *"result"* ]]; then
            print_success "Enhanced query endpoint responding"
        else
            print_warning "Enhanced query endpoint may not be working"
        fi
    else
        print_warning "curl not available, skipping API tests"
    fi
}

# Test 4: Local Development Setup
test_local_setup() {
    print_status "Testing Local Development Setup..."
    
    # Check if backend is running locally
    if curl -s "http://localhost:3001/api/health" > /dev/null 2>&1; then
        print_success "Local backend is running on port 3001"
    else
        print_warning "Local backend is not running"
        print_warning "Start with: cd server && npm start"
    fi
    
    # Check if frontend is running locally
    if curl -s "http://localhost:3000" > /dev/null 2>&1; then
        print_success "Local frontend is running on port 3000"
    else
        print_warning "Local frontend is not running"
        print_warning "Start with: npm start"
    fi
}

# Test 5: Environment Variables
test_environment() {
    print_status "Testing Environment Configuration..."
    
    # Check if .env file exists
    if [ -f ".env" ]; then
        print_success "Local .env file exists"
        if grep -q "REACT_APP_API_URL" .env; then
            print_success "REACT_APP_API_URL is configured"
        else
            print_warning "REACT_APP_API_URL not found in .env"
        fi
    else
        print_warning "Local .env file not found"
    fi
    
    # Check if .env.example exists
    if [ -f ".env.example" ]; then
        print_success "Environment template (.env.example) exists"
    else
        print_warning "Environment template not found"
    fi
}

# Test 6: Build Status
test_build_status() {
    print_status "Testing Build Status..."
    
    # Check if build directory exists
    if [ -d "build" ]; then
        print_success "Frontend build directory exists"
        BUILD_SIZE=$(du -sh build 2>/dev/null | cut -f1)
        print_status "Build size: $BUILD_SIZE"
    else
        print_warning "Frontend build directory not found"
        print_warning "Run: npm run build"
    fi
    
    # Check if server directory exists
    if [ -d "server" ]; then
        print_success "Server directory exists"
        if [ -f "server/package.json" ]; then
            print_success "Server package.json exists"
        else
            print_error "Server package.json not found"
        fi
    else
        print_error "Server directory not found"
    fi
}

# Test 7: Dependencies
test_dependencies() {
    print_status "Testing Dependencies..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js not installed"
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm installed: $NPM_VERSION"
    else
        print_error "npm not installed"
    fi
    
    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        print_success "Frontend dependencies installed"
    else
        print_warning "Frontend dependencies not installed"
        print_warning "Run: npm install"
    fi
    
    if [ -d "server/node_modules" ]; then
        print_success "Backend dependencies installed"
    else
        print_warning "Backend dependencies not installed"
        print_warning "Run: cd server && npm install"
    fi
}

# Main testing function
main() {
    echo ""
    print_status "Starting comprehensive deployment testing..."
    echo ""
    
    test_dependencies
    echo ""
    
    test_environment
    echo ""
    
    test_build_status
    echo ""
    
    test_frontend
    echo ""
    
    test_backend_health
    echo ""
    
    test_backend_endpoints
    echo ""
    
    test_local_setup
    echo ""
    
    print_status "Testing completed!"
    echo ""
    print_status "Next steps:"
    print_status "1. Deploy backend to Render.com if not done"
    print_status "2. Set environment variables in Render dashboard"
    print_status "3. Disable Vercel password protection if needed"
    print_status "4. Test file upload and Enhanced RAG features"
    echo ""
}

# Run main function
main "$@" 