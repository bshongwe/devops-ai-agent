#!/bin/bash

# GitOps + ArgoCD Setup Script
# This script sets up a complete GitOps workflow with ArgoCD for the CI/CD Agent

set -e

echo "🚀 Setting up GitOps + ArgoCD for CI/CD Agent..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Kind cluster exists
print_status "Checking Kind cluster..."
if ! kind get clusters | grep -q "argocd-local"; then
    print_error "Kind cluster 'argocd-local' not found!"
    echo "Please run the ArgoCD setup first:"
    echo "  kubectl create namespace argocd"
    echo "  kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml"
    exit 1
fi

print_success "Kind cluster 'argocd-local' found"

# Check if ArgoCD is running
print_status "Checking ArgoCD installation..."
if ! kubectl get namespace argocd &>/dev/null; then
    print_error "ArgoCD namespace not found!"
    echo "Installing ArgoCD..."
    kubectl create namespace argocd
    kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
    
    print_status "Waiting for ArgoCD to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
fi

print_success "ArgoCD is installed and running"

# Deploy the ArgoCD Application
print_status "Deploying CI/CD Agent ArgoCD Application..."
kubectl apply -f gitops/argocd-application.yaml

print_success "ArgoCD Application deployed"

# Get ArgoCD admin password
print_status "Retrieving ArgoCD admin password..."
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d 2>/dev/null || echo "")

if [ -z "$ARGOCD_PASSWORD" ]; then
    print_warning "Could not retrieve ArgoCD password automatically"
    echo "Get it manually with: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath=\"{.data.password}\" | base64 -d"
else
    print_success "ArgoCD admin password retrieved"
fi

# Setup port forwarding
print_status "Setting up port forwarding..."
kubectl port-forward svc/argocd-server -n argocd 8080:443 >/dev/null 2>&1 &
PORT_FORWARD_PID=$!

# Wait a moment for port forwarding to establish
sleep 3

print_success "GitOps + ArgoCD setup complete!"

echo ""
echo "========================================================================================"
echo "🎉 GitOps + ArgoCD Setup Complete!"
echo "========================================================================================"
echo ""
echo "📍 ArgoCD UI Access:"
echo "   URL: https://localhost:8080"
echo "   Username: admin"
if [ -n "$ARGOCD_PASSWORD" ]; then
    echo "   Password: $ARGOCD_PASSWORD"
else
    echo "   Password: (run command above to retrieve)"
fi
echo ""
echo "🏗️  GitOps Repository Structure:"
echo "   📁 gitops/"
echo "   ├── 📁 applications/ci-cd-agent/     # Base Kubernetes manifests"
echo "   ├── 📁 environments/staging/         # Staging-specific configs"
echo "   ├── 📁 environments/production/      # Production-specific configs"
echo "   └── 📄 argocd-application.yaml       # ArgoCD Application definition"
echo ""
echo "🔄 GitOps Workflow:"
echo "   1. CI builds Docker image"
echo "   2. CD updates image tags in GitOps manifests" 
echo "   3. ArgoCD auto-syncs from GitOps repository"
echo "   4. Application deploys to Kubernetes cluster"
echo ""
echo "🎯 Useful Commands:"
echo "   kubectl get applications -n argocd"
echo "   kubectl describe application ci-cd-agent -n argocd"
echo "   kubectl get pods -n ci-cd-agent"
echo "   kubectl logs -f deployment/ci-cd-agent -n ci-cd-agent"
echo ""
echo "🛠️  Manual Sync (if needed):"
echo "   argocd app sync ci-cd-agent --server localhost:8080 --username admin --password $ARGOCD_PASSWORD --insecure"
echo ""
echo "🔗 Application URLs (once deployed):"
echo "   Application: http://localhost:3000 (via kubectl port-forward)"
echo "   Metrics: http://localhost:3000/metrics"
echo "   Health: http://localhost:3000/health"
echo ""

# Keep the script running to maintain port forwarding
print_status "Port forwarding active (PID: $PORT_FORWARD_PID)"
print_warning "Press Ctrl+C to stop port forwarding and exit"

trap "kill $PORT_FORWARD_PID 2>/dev/null; exit 0" INT

# Wait for interrupt
wait $PORT_FORWARD_PID 2>/dev/null
