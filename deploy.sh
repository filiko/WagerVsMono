#!/bin/bash

# WagerVS Supabase + Vercel Deployment Script
# This script helps automate the deployment process

set -e

echo "🚀 WagerVS Migration to Supabase + Vercel"
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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    cd wager-backend
    npm install
    cd ..
    
    print_success "Dependencies installed"
}

# Build the project
build_project() {
    print_status "Building project..."
    
    cd wager-backend
    npm run build
    cd ..
    
    print_success "Project built successfully"
}

# Check environment variables
check_env_vars() {
    print_status "Checking environment variables..."
    
    if [ ! -f "wager-backend/.env" ]; then
        print_warning "Environment file not found. Please create wager-backend/.env from env.supabase.template"
        print_status "Copying template..."
        cp wager-backend/env.supabase.template wager-backend/.env
        print_warning "Please edit wager-backend/.env with your Supabase credentials"
        return 1
    fi
    
    # Check for required variables
    source wager-backend/.env
    
    if [ -z "$SUPABASE_URL" ]; then
        print_error "SUPABASE_URL is not set in .env file"
        return 1
    fi
    
    if [ -z "$SUPABASE_ANON_KEY" ]; then
        print_error "SUPABASE_ANON_KEY is not set in .env file"
        return 1
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        print_error "SUPABASE_SERVICE_ROLE_KEY is not set in .env file"
        return 1
    fi
    
    print_success "Environment variables are configured"
}

# Test local connection
test_connection() {
    print_status "Testing local connection..."
    
    cd wager-backend
    npm run dev &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 5
    
    # Test health endpoint
    if curl -s http://localhost:5000/api/health > /dev/null; then
        print_success "Local server is running"
    else
        print_error "Local server failed to start"
        kill $SERVER_PID 2>/dev/null || true
        return 1
    fi
    
    # Stop server
    kill $SERVER_PID 2>/dev/null || true
    cd ..
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Login to Vercel (if not already logged in)
    if ! vercel whoami &> /dev/null; then
        print_status "Please login to Vercel..."
        vercel login
    fi
    
    # Deploy
    cd wager-backend
    vercel --prod
    cd ..
    
    print_success "Deployed to Vercel"
}

# Main execution
main() {
    echo "Starting migration process..."
    
    check_dependencies
    install_dependencies
    build_project
    
    if check_env_vars; then
        test_connection
    else
        print_warning "Skipping connection test due to missing environment variables"
    fi
    
    echo ""
    print_status "Migration setup complete!"
    echo ""
    print_status "Next steps:"
    echo "1. Set up your Supabase project (see MIGRATION_GUIDE.md)"
    echo "2. Update wager-backend/.env with your Supabase credentials"
    echo "3. Run the database migration SQL in Supabase"
    echo "4. Deploy to Vercel: vercel --prod"
    echo ""
    print_status "For detailed instructions, see MIGRATION_GUIDE.md"
}

# Run main function
main "$@"
