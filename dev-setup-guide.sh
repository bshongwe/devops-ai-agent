#!/bin/bash

# CI-CD Agent Development Environment Setup
echo "🚀 CI-CD Agent Development Setup Guide"
echo "========================================"

# Check prerequisites
echo ""
echo "📋 Checking Prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 18+"
    echo "   Download from: https://nodejs.org/"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not found"
fi

# Check Docker
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        echo "✅ Docker: $DOCKER_VERSION (Running)"
    else
        echo "⚠️  Docker installed but not running"
        echo "   Please start Docker Desktop or Docker daemon"
    fi
else
    echo "❌ Docker not found. Please install Docker"
    echo "   Download from: https://docker.com/get-started"
fi

# Check kubectl
if command -v kubectl &> /dev/null; then
    KUBECTL_VERSION=$(kubectl version --client --short 2>/dev/null || kubectl version --client=true --short=true 2>/dev/null || echo "kubectl installed")
    echo "✅ kubectl: $KUBECTL_VERSION"
    
    # Check if cluster is accessible
    if kubectl cluster-info &> /dev/null; then
        echo "✅ Kubernetes cluster: Connected"
    else
        echo "⚠️  kubectl installed but no cluster connected"
    fi
else
    echo "⚠️  kubectl not found (optional for local development)"
fi

echo ""
echo "🎯 Available Setup Options:"
echo ""

echo "1. 🖥️  LOCAL DEVELOPMENT (Recommended)"
echo "   - Uses Node.js directly"
echo "   - No Docker/Kubernetes needed"
echo "   - Perfect for API development and testing"
echo ""
echo "   Steps:"
echo "   → cp .env.example .env"
echo "   → Edit .env with your GitHub App credentials"
echo "   → npm install"
echo "   → npm run start:dev"
echo "   → Visit http://localhost:3000/api for docs"
echo ""

echo "2. 🐳 DOCKER COMPOSE (Full Stack)"
echo "   - Requires Docker Desktop running"
echo "   - Includes PostgreSQL, Redis, Monitoring"
echo "   - Best for full integration testing"
echo ""
echo "   Steps:"
echo "   → Start Docker Desktop"
echo "   → cp .env.example .env"
echo "   → Edit .env with your credentials"
echo "   → docker-compose up -d"
echo ""

echo "3. ☸️  KUBERNETES + ARGOCD (Production-like)"
echo "   - Requires local Kubernetes cluster"
echo "   - Options: minikube, kind, Docker Desktop K8s"
echo "   - Full GitOps workflow"
echo ""
echo "   Steps:"
echo "   → Setup local Kubernetes (see options below)"
echo "   → kubectl apply -f argocd/application.yaml"
echo ""

echo "📚 Kubernetes Setup Options:"
echo ""
echo "A) Docker Desktop Kubernetes:"
echo "   → Open Docker Desktop → Settings → Kubernetes → Enable"
echo ""
echo "B) Minikube:"
echo "   → brew install minikube"
echo "   → minikube start"
echo ""
echo "C) Kind:"
echo "   → brew install kind"
echo "   → kind create cluster"
echo ""

echo "🔧 Quick Start Commands:"
echo ""
echo "# For immediate testing (Option 1):"
echo "cp .env.example .env && npm install && npm run start:dev"
echo ""
echo "# For Docker setup (Option 2):"
echo "# (Start Docker Desktop first, then:)"
echo "docker-compose up -d"
echo ""
echo "# For Kubernetes setup (Option 3):"
echo "# (Setup K8s cluster first, then:)"
echo "kubectl create namespace argocd"
echo "kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml"
echo ""

echo "💡 Recommendation: Start with Option 1 for immediate development!"
