# CI-CD Agent

A comprehensive CI-CD orchestration agent built with NestJS, featuring GitHub App integration, automated pipeline generation, and ArgoCD GitOps deployment management.

## 🚀 Features

- **GitHub App Integration**: JWT-based authentication with installation token exchange
- **Pipeline Generation**: Automated CI/CD pipeline configuration based on project type
- **Webhook Handling**: Real-time GitHub event processing
- **Docker Support**: Containerized deployment with multi-stage builds
- **ArgoCD Integration**: GitOps-based deployment management
- **Comprehensive API**: Full OpenAPI 3.0 specification with all endpoints
- **Monitoring**: Built-in health checks and metrics collection
- **Security**: JWT authentication, webhook signature verification

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- Kubernetes cluster (for ArgoCD deployment)
- GitHub App (see setup instructions below)

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd ci-cd-agent
cp .env.example .env
# Edit .env with your configuration
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Mode

```bash
# Start with Docker Compose (recommended)
docker-compose up -d

# Or run locally
npm run start:dev
```

### 4. Access Services

- **API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api
- **Grafana**: http://localhost:3001 (admin/admin123)
- **ArgoCD**: http://localhost:8080 (admin/admin)

## 🔧 GitHub App Setup

### 1. Create GitHub App

1. Go to GitHub Settings > Developer settings > GitHub Apps
2. Click "New GitHub App"
3. Use the manifest from `.github/apps/manifest.json`
4. Or manually configure with these permissions:

**Repository Permissions:**
- Actions: Write
- Contents: Write
- Deployments: Write
- Pull requests: Write
- Workflows: Write

**Organization Permissions:**
- Members: Read

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

### 3. Install App

Install the GitHub App on your target repositories via the GitHub marketplace or direct installation URL.

## 📚 API Documentation

The API is fully documented with OpenAPI 3.0. After starting the application, visit:
- Swagger UI: http://localhost:3000/api
- OpenAPI JSON: http://localhost:3000/api-json
- OpenAPI YAML: Available in `openapi.yaml`

### Key Endpoints

- `POST /pipelines/generate` - Generate new CI/CD pipeline
- `POST /pipelines/{id}/execute` - Execute pipeline  
- `GET /pipelines/{id}/status` - Get pipeline status
- `POST /webhooks/github` - Handle GitHub webhooks
- `GET /github/installations` - List GitHub App installations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub App    │────│  CI-CD Agent    │────│     ArgoCD      │
│   Integration   │    │   (NestJS)      │    │   (GitOps)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Webhooks      │    │   Pipeline      │    │   Kubernetes    │
│   Processing    │    │   Orchestrator  │    │   Deployment    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

1. **Authentication Module**: JWT + GitHub App token exchange
2. **Pipeline Service**: Dynamic pipeline generation based on project type
3. **Orchestrator Service**: Pipeline execution and monitoring
4. **GitHub Service**: Repository management and webhook processing
5. **Webhook Controllers**: Event handling and processing

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d --build

# Scale services
docker-compose up -d --scale ci-cd-agent=3
```

### Kubernetes Deployment

```bash
# Apply ArgoCD application
kubectl apply -f argocd/application.yaml

# Monitor deployment
kubectl get applications -n argocd
```

### Production Configuration

1. **Environment Variables**: Configure all required environment variables
2. **Secrets Management**: Use Kubernetes secrets for sensitive data
3. **TLS/SSL**: Configure HTTPS certificates
4. **Monitoring**: Set up Prometheus/Grafana dashboards
5. **Backup**: Configure database backups

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests  
npm run test:e2e

# Coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📊 Monitoring

### Health Checks
- Application: `GET /webhooks/health`
- Docker: Built-in health check every 30s
- Kubernetes: Readiness and liveness probes

### Metrics
- Prometheus metrics: http://localhost:9090
- Grafana dashboards: http://localhost:3001
- Application logs: `docker-compose logs -f ci-cd-agent`

## 🔒 Security

- **Authentication**: JWT-based API authentication
- **Webhook Security**: GitHub signature verification
- **Container Security**: Non-root user, minimal base image
- **Network Security**: Docker network isolation
- **Secrets**: Environment-based configuration

## 📖 Development

### Project Structure

```
src/
├── auth/                 # Authentication (JWT, GitHub App)
├── controllers/          # API controllers (Pipeline, GitHub, Webhook)
├── services/            # Business logic (Pipeline, Orchestrator, GitHub)
├── dto/                 # Data transfer objects
├── main.ts              # Application entry point
└── app.module.ts        # Root module

.github/
├── workflows/           # CI/CD workflows
└── apps/               # GitHub App manifest

argocd/                  # ArgoCD configuration
docker-compose.yml       # Local development setup
Dockerfile              # Multi-stage container build
openapi.yaml            # Complete API specification
```

### Adding New Features

1. Create DTO classes with validation decorators
2. Implement service logic with proper error handling
3. Add controller endpoints with OpenAPI documentation
4. Write unit tests for new functionality
5. Update API documentation

### Code Style

- ESLint + Prettier for code formatting
- NestJS decorators for dependency injection
- Class-validator for request validation
- Swagger decorators for API documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the `/api` endpoint for interactive API docs
- **Issues**: Create GitHub issues for bug reports
- **Discussions**: Use GitHub Discussions for questions
- **Security**: Report security vulnerabilities privately

## 🔗 Links

- [NestJS Documentation](https://docs.nestjs.com/)
- [GitHub Apps Documentation](https://docs.github.com/en/developers/apps)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

Made with ❤️ by the CI-CD Agent Team
