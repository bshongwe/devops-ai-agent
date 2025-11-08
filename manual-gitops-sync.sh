#!/bin/bash

# Manual GitOps Sync Script
# Use this script to manually apply GitOps changes when automatic push fails

set -e

echo "🔄 Manual GitOps Sync for CI/CD Agent"

# Colors for output
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

# Check if we're in the right directory
if [ ! -d "gitops" ]; then
    echo "❌ Error: gitops directory not found. Are you in the project root?"
    exit 1
fi

print_status "Checking cluster connection..."
if ! kubectl cluster-info >/dev/null 2>&1; then
    echo "❌ Error: Cannot connect to Kubernetes cluster"
    echo "Make sure your cluster is running and kubectl is configured"
    exit 1
fi

print_success "Connected to Kubernetes cluster"

# Get current image tag from CI if available
CURRENT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "latest")

print_status "Current commit SHA: $CURRENT_SHA"

# Update image tags if requested
if [ "$1" = "--update-image" ]; then
    print_status "Updating image tags to: $CURRENT_SHA"
    
    # Update base application
    sed -i '' "s|newTag: .*|newTag: $CURRENT_SHA|" gitops/applications/ci-cd-agent/kustomization.yaml
    
    # Update staging
    if [ -f "gitops/environments/staging/kustomization.yaml" ]; then
        sed -i '' "s|newTag: .*|newTag: staging-$CURRENT_SHA|" gitops/environments/staging/kustomization.yaml
    fi
    
    print_success "Image tags updated"
fi

# Validate Kustomize configuration
print_status "Validating Kustomize configuration..."
if kubectl kustomize gitops/applications/ci-cd-agent >/dev/null; then
    print_success "Kustomize configuration is valid"
else
    echo "❌ Error: Invalid Kustomize configuration"
    exit 1
fi

# Apply GitOps manifests
print_status "Applying GitOps manifests..."
kubectl apply -k gitops/applications/ci-cd-agent

print_success "GitOps manifests applied successfully"

# Check deployment status
print_status "Checking deployment status..."
kubectl get all -n ci-cd-agent

# Wait for rollout if deployment exists
if kubectl get deployment ci-cd-agent-ci-cd-agent -n ci-cd-agent >/dev/null 2>&1; then
    print_status "Waiting for deployment rollout..."
    kubectl rollout status deployment/ci-cd-agent-ci-cd-agent -n ci-cd-agent --timeout=300s
    print_success "Deployment rolled out successfully"
fi

echo ""
echo "========================================================================================"
echo "🎉 Manual GitOps Sync Complete!"
echo "========================================================================================"
echo ""
echo "📊 Current Status:"
kubectl get pods -n ci-cd-agent
echo ""
echo "🔗 Access Application:"
echo "   kubectl port-forward svc/ci-cd-agent-ci-cd-agent 3000:80 -n ci-cd-agent"
echo ""
echo "📋 Useful Commands:"
echo "   kubectl logs -f deployment/ci-cd-agent-ci-cd-agent -n ci-cd-agent"
echo "   kubectl describe pods -n ci-cd-agent"
echo "   kubectl get events -n ci-cd-agent --sort-by='.lastTimestamp'"
echo ""
echo "🔄 To update image tags and sync:"
echo "   $0 --update-image"
