# DevOps AI CI-CD Agent

A comprehensive CI-CD orchestration agent built with NestJS, featuring GitHub App integration, automated pipeline generation, and ArgoCD GitOps deployment management with real-time monitoring.

## 🚀 Features

- **GitHub App Integration**: JWT-based authentication with installation token exchange
- **Pipeline Generation**: Automated CI/CD pipeline configuration based on project type
- **Webhook Handling**: Real-time GitHub event processing
- **Docker Support**: Containerized deployment with multi-stage builds
- **ArgoCD Integration**: GitOps-based deployment management in Kind cluster
- **Real-time Dashboard**: Live metrics and service health monitoring
- **Comprehensive API**: Full OpenAPI 3.0 specification with all endpoints
- **Monitoring Stack**: Prometheus metrics + Grafana dashboards
- **Security**: JWT authentication, webhook signature verification

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- Kind (Kubernetes in Docker)
- GitHub App (optional - see setup instructions below)

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd ci-cd-agent
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start All Services

```bash
# Start complete stack
docker-compose up -d

# Create Kind cluster for ArgoCD
kind create cluster --config kind-config.yaml
```

### 3. Access Services

- **Dashboard**: http://localhost:8080 - Real-time metrics and monitoring
- **CI-CD Agent API**: http://localhost:3000 - Main application API
- **API Documentation**: http://localhost:3000/api - Interactive OpenAPI docs
- **ArgoCD**: http://localhost:8081 - GitOps deployment management
- **Grafana**: http://localhost:3001 (admin/admin123) - Monitoring dashboards
- **Prometheus**: http://localhost:9090 - Metrics collection

## 🔧 GitHub App Setup (Optional)

### 1. Create GitHub App

1. Go to GitHub Settings > Developer settings > GitHub Apps
2. Click "New GitHub App"
3. Configure with these permissions:

**Repository Permissions:**
- Actions: Write
- Contents: Write
- Deployments: Write
- Pull requests: Write
- Workflows: Write

**Webhook Events:**
- Push, Pull request, Installation, Workflow run

### 2. Configure Environment

```bash
# Add to .env file
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
Your private key content here
-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

## 📚 API Documentation

The API is fully documented with OpenAPI 3.0:
- **Swagger UI**: http://localhost:3000/api
- **OpenAPI JSON**: http://localhost:3000/api-json
- **OpenAPI YAML**: Available in `openapi.yaml`

### Key Endpoints

- `GET /dashboard/overview` - Get dashboard metrics
- `GET /dashboard/health` - System health status
- `GET /dashboard/metrics/prometheus` - Prometheus metrics
- `POST /pipelines/generate` - Generate new CI/CD pipeline
- `POST /webhooks/github` - Handle GitHub webhooks
- `GET /github/installations` - List GitHub App installations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │────│  CI-CD Agent    │────│     ArgoCD      │
│  (Next.js)      │    │   (NestJS)      │    │  (Kind K8s)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Grafana       │    │   Prometheus    │    │   PostgreSQL    │
│  Monitoring     │    │   Metrics       │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

1. **Dashboard Service**: Real-time metrics and health monitoring
2. **Pipeline Service**: Dynamic pipeline generation and execution
3. **GitHub Service**: Webhook processing and repository management
4. **Monitoring Stack**: Prometheus + Grafana for observability
5. **ArgoCD**: GitOps deployment management in Kind cluster

## 🚀 Deployment

### Local Development

```bash
# Start all services
docker-compose up -d

# Create Kind cluster for ArgoCD
kind create cluster --config kind-config.yaml

# Install ArgoCD in cluster
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### Production Deployment

```bash
# Build and deploy
docker-compose up -d --build

# Monitor services
docker-compose ps
kubectl get applications -n argocd
```

### Configuration

1. **Environment Variables**: Configure in `.env` file
2. **Secrets Management**: Use environment variables for sensitive data
3. **Monitoring**: Prometheus/Grafana automatically configured
4. **Health Checks**: Built-in health monitoring for all services

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests  
npm run test:e2e

# Coverage
npm run test:cov

# Test service health
curl http://localhost:3000/dashboard/health
```

## 📊 Monitoring

### Real-time Dashboard
- **Main Dashboard**: http://localhost:8080 - Live system metrics
- **Service Health**: Real-time status of all components
- **Performance Metrics**: CPU, memory, response times

### Monitoring Stack
- **Prometheus**: http://localhost:9090 - Metrics collection
- **Grafana**: http://localhost:3001 (admin/admin123) - Visualization
- **Health Checks**: Built-in monitoring for all services
- **Application Logs**: `docker-compose logs -f ci-cd-agent`

### ArgoCD Management
- **ArgoCD UI**: http://localhost:8081 - GitOps deployments
- **Admin Password**: Get with `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`

## 🔒 Security

- **Authentication**: JWT-based API authentication
- **Webhook Security**: GitHub signature verification  
- **Container Security**: Non-root user, minimal base images
- **Network Security**: Docker network isolation
- **Secrets Management**: Environment-based configuration
- **Health Monitoring**: Real-time security status checks

See [SECURITY.md](SECURITY.md) for detailed security policies and reporting procedures.

## 📖 Development

### Project Structure

```
src/
├── controllers/          # API controllers (Dashboard, Pipeline, GitHub)
├── services/            # Business logic (Dashboard, Pipeline, GitHub)
├── auth/                # Authentication (JWT, GitHub App)
├── dto/                 # Data transfer objects
└── main.ts              # Application entry point

dashboard/               # Next.js real-time dashboard
argocd/                  # ArgoCD configurations and manifests
monitoring/              # Prometheus and Grafana configs
k8s/                     # Kubernetes deployment manifests
docker-compose.yml       # Complete service orchestration
```

### Development Workflow

1. **Start Services**: `docker-compose up -d`
2. **Create Kind Cluster**: `kind create cluster --config kind-config.yaml`
3. **Install ArgoCD**: Follow ArgoCD setup in deployment section
4. **Access Dashboards**: Use URLs in Quick Start section
5. **Monitor Logs**: `docker-compose logs -f [service-name]`

### Code Style

- ESLint + Prettier for code formatting
- NestJS decorators for dependency injection
- Real-time data updates via API polling
- Comprehensive health checks and monitoring

## 🎯 Current Status

### ✅ Working Services
- **Dashboard**: http://localhost:8080 - Real-time metrics and monitoring
- **CI-CD Agent**: http://localhost:3000 - Main API with live health checks
- **ArgoCD**: http://localhost:8081 - GitOps deployment management
- **Grafana**: http://localhost:3001 - Monitoring dashboards with real data
- **Prometheus**: http://localhost:9090 - Metrics collection

### 🔧 Features Implemented
- Real-time service health monitoring
- Live system metrics (CPU, memory, response times)
- ArgoCD GitOps deployment in Kind cluster
- Comprehensive API documentation
- Automated container orchestration
- Security best practices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Interactive API docs at http://localhost:3000/api
- **Issues**: Create GitHub issues for bug reports
- **Security**: See [SECURITY.md](SECURITY.md) for security policies

---

Made with ❤️ by the DevOps AI Team
