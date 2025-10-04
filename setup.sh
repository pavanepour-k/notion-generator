#!/bin/bash

# Notionify Setup Script
echo "🚀 Setting up Notionify - AI-powered Notion template generator..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    print_info "Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    print_info "Please upgrade Node.js from: https://nodejs.org/"
    exit 1
fi

print_status "Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "npm version: $(npm -v)"

# Install dependencies
print_info "Installing dependencies..."
if npm install; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    print_warning ".env.local not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env.local
        print_status ".env.local created from .env.example"
    else
        print_error ".env.example not found"
        exit 1
    fi
    
    echo ""
    print_info "Please edit .env.local with your API keys:"
    echo "   📝 HF_API_KEY: Get from https://huggingface.co/settings/tokens"
    echo "   📝 GITHUB_TOKEN: Get from https://github.com/settings/tokens (optional)"
    echo ""
    print_warning "After setting up your API keys, run: npm run dev"
else
    print_status ".env.local already exists"
fi

# Run type check
print_info "Running type check..."
if npm run type-check; then
    print_status "Type check passed"
else
    print_warning "Type check failed - please fix TypeScript errors"
fi

# Run linting
print_info "Running linting..."
if npm run lint; then
    print_status "Linting passed"
else
    print_warning "Linting failed - please fix linting errors"
fi

echo ""
print_status "Setup complete! 🎉"
echo ""
print_info "Next steps:"
echo "   1. Edit .env.local with your API keys"
echo "   2. Run 'npm run dev' to start the development server"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
print_info "Available commands:"
echo "   npm run dev      - Start development server"
echo "   npm run build    - Build for production"
echo "   npm run start    - Start production server"
echo "   npm run lint     - Run ESLint"
echo "   npm run type-check - Run TypeScript type check"
echo ""
print_info "For deployment:"
echo "   - Vercel: Connect your GitHub repo to Vercel"
echo "   - Docker: Run 'docker-compose up'"
echo ""
