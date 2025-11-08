#!/bin/bash

# CI-CD Agent Setup Script
echo "🚀 Setting up CI-CD Agent development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your GitHub App credentials"
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Run linting
echo "🔍 Running linter..."
npm run lint --silent || echo "⚠️  Linting warnings found (can be ignored for now)"

# Run tests
echo "🧪 Running tests..."
npm test --silent || echo "⚠️  Some tests failed (expected without proper configuration)"

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📚 Next steps:"
echo "1. Configure your GitHub App credentials in .env file"
echo "2. Start development: npm run start:dev"
echo "3. Visit API docs: http://localhost:3000/api"
echo "4. Start with Docker: docker-compose up -d"
echo ""
echo "🔗 Useful commands:"
echo "  npm run start:dev     - Start development server"
echo "  npm run build         - Build for production"
echo "  npm run test          - Run tests"
echo "  docker-compose up -d  - Start full stack with Docker"
echo ""
