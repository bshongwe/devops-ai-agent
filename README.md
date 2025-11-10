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

### API Endpoints Overview

```mermaid
mindmap
  root((CI-CD Agent API))
    Dashboard
      GET /dashboard/overview
        Real-time metrics
        System performance
      GET /dashboard/health
        Service health status
        Centralized monitoring
      GET /dashboard/metrics/prometheus
        Prometheus queries
        Custom metrics
    Pipelines
      POST /pipelines/generate
        Create new pipeline
        Auto-configuration
      GET /pipelines/:id
        Pipeline details
        Execution status
      PUT /pipelines/:id/status
        Update pipeline
        Status management
    GitHub
      POST /webhooks/github
        Webhook processing
        Event handling
      GET /github/installations
        App installations
        Repository access
      GET /webhooks/health
        Webhook health
        Service status
    Documentation
      GET /api
        Swagger UI
        Interactive docs
      GET /api-json
        OpenAPI spec
        JSON format
```

### Key Endpoints

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/dashboard/overview` | GET | Real-time system metrics and performance data | JSON with CPU, memory, requests |
| `/dashboard/health` | GET | Centralized health status of all services | Array of service health objects |
| `/dashboard/metrics/prometheus` | GET | Prometheus metrics with custom queries | Prometheus query results |
| `/pipelines/generate` | POST | Generate new CI/CD pipeline configuration | Pipeline configuration object |
| `/webhooks/github` | POST | Process GitHub webhook events | Webhook processing status |
| `/github/installations` | GET | List GitHub App installations | Array of installation objects |

## 🏗️ Architecture

### System Architecture

```mermaid
graph TB
    subgraph "External Services"
        GH[GitHub]
        DEV[Developer]
    end

    subgraph "Docker Network (ci-cd-network)"
        subgraph "Frontend Layer"
            DASH[Dashboard<br/>Next.js:8080]
            NGINX[Nginx Proxy<br/>:80/443]
        end

        subgraph "Application Layer"
            API[CI-CD Agent<br/>NestJS:3000]
            ARGO_PROXY[ArgoCD Proxy<br/>:8081]
        end

        subgraph "Data Layer"
            REDIS[(Redis<br/>Cache:6379)]
            POSTGRES[(PostgreSQL<br/>Database:5432)]
        end

        subgraph "Monitoring Layer"
            PROM[Prometheus<br/>Metrics:9090]
            GRAF[Grafana<br/>Dashboards:3001]
        end
    end

    subgraph "Kubernetes (Kind Cluster)"
        ARGOCD[ArgoCD Server<br/>:30080]
        K8S_APPS[Deployed Applications]
    end

    %% External connections
    GH -->|Webhooks| API
    DEV -->|Access| DASH
    DEV -->|API Calls| API

    %% Frontend connections
    DASH -->|API Calls| API
    NGINX -->|Proxy| API

    %% Application connections
    API -->|Cache| REDIS
    API -->|Persist| POSTGRES
    API -->|Metrics| PROM
    ARGO_PROXY -->|Forward| ARGOCD

    %% Monitoring connections
    PROM -->|Scrape| API
    PROM -->|Scrape| REDIS
    PROM -->|Scrape| POSTGRES
    GRAF -->|Query| PROM
    DASH -->|Health Checks| PROM
    DASH -->|Health Checks| GRAF

    %% GitOps flow
    API -->|Deploy| ARGOCD
    ARGOCD -->|Sync| K8S_APPS

    classDef frontend fill:#e1f5fe
    classDef application fill:#f3e5f5
    classDef data fill:#e8f5e8
    classDef monitoring fill:#fff3e0
    classDef k8s fill:#fce4ec
    classDef external fill:#f5f5f5

    class DASH,NGINX frontend
    class API,ARGO_PROXY application
    class REDIS,POSTGRES data
    class PROM,GRAF monitoring
    class ARGOCD,K8S_APPS k8s
    class GH,DEV external
```

### API Architecture

```mermaid
graph LR
    subgraph "API Endpoints (:3000)"
        subgraph "Dashboard Module"
            D1[GET /dashboard/overview]
            D2[GET /dashboard/health]
            D3[GET /dashboard/metrics/prometheus]
        end

        subgraph "Pipeline Module"
            P1[POST /pipelines/generate]
            P2[GET /pipelines/:id]
            P3[PUT /pipelines/:id/status]
        end

        subgraph "GitHub Module"
            G1[POST /webhooks/github]
            G2[GET /github/installations]
            G3[GET /webhooks/health]
        end

        subgraph "Documentation"
            DOC1[GET /api - Swagger UI]
            DOC2[GET /api-json - OpenAPI JSON]
        end
    end

    subgraph "Services Layer"
        DS[DashboardService]
        PS[PipelineService]
        GS[GitHubService]
    end

    subgraph "External Integrations"
        PROM_API[Prometheus API]
        GH_API[GitHub API]
        ARGOCD_API[ArgoCD API]
    end

    %% Dashboard connections
    D1 --> DS
    D2 --> DS
    D3 --> DS
    DS --> PROM_API

    %% Pipeline connections
    P1 --> PS
    P2 --> PS
    P3 --> PS
    PS --> ARGOCD_API

    %% GitHub connections
    G1 --> GS
    G2 --> GS
    G3 --> GS
    GS --> GH_API

    classDef endpoint fill:#e3f2fd
    classDef service fill:#f1f8e9
    classDef external fill:#fce4ec

    class D1,D2,D3,P1,P2,P3,G1,G2,G3,DOC1,DOC2 endpoint
    class DS,PS,GS service
    class PROM_API,GH_API,ARGOCD_API external
```

### Data Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant API as CI-CD Agent
    participant DB as PostgreSQL
    participant PROM as Prometheus
    participant ARGO as ArgoCD
    participant DASH as Dashboard

    %% Webhook flow
    Dev->>GH: Push code
    GH->>API: Webhook event
    API->>DB: Store pipeline data
    API->>ARGO: Trigger deployment
    ARGO->>ARGO: Sync application

    %% Monitoring flow
    API->>PROM: Export metrics
    DASH->>API: Request health status
    API->>PROM: Query metrics
    API->>DB: Check service status
    API-->>DASH: Return health data

    %% Pipeline generation
    Dev->>API: Request pipeline
    API->>DB: Store configuration
    API->>ARGO: Create application
    API-->>Dev: Return pipeline config
```

### Core Components

1. **Dashboard Service**: Real-time metrics and centralized health monitoring
2. **Pipeline Service**: Dynamic CI/CD pipeline generation and execution
3. **GitHub Service**: Webhook processing and repository management
4. **Monitoring Stack**: Prometheus metrics collection + Grafana visualization
5. **ArgoCD Integration**: GitOps deployment management in Kind cluster
6. **Health Monitoring**: Centralized health checks for all services

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

```mermaid
flowchart TD
    subgraph "Health Monitoring Flow"
        API[CI-CD Agent<br/>:3000]
        HEALTH[/dashboard/health]
        
        subgraph "Service Checks"
            PG_CHECK[PostgreSQL<br/>TCP:5432]
            REDIS_CHECK[Redis<br/>TCP:6379]
            PROM_CHECK[Prometheus<br/>HTTP:9090/-/healthy]
            GRAF_CHECK[Grafana<br/>HTTP:3000/api/health]
        end
        
        DASH[Dashboard<br/>:8080]
        
        API --> HEALTH
        HEALTH --> PG_CHECK
        HEALTH --> REDIS_CHECK
        HEALTH --> PROM_CHECK
        HEALTH --> GRAF_CHECK
        HEALTH --> DASH
    end
    
    subgraph "Metrics Collection"
        PROM[Prometheus<br/>:9090]
        GRAF[Grafana<br/>:3001]
        
        API -->|Export Metrics| PROM
        PROM -->|Query Data| GRAF
        DASH -->|Real-time Data| API
    end
    
    classDef service fill:#e1f5fe
    classDef check fill:#e8f5e8
    classDef monitor fill:#fff3e0
    
    class API,DASH service
    class PG_CHECK,REDIS_CHECK,PROM_CHECK,GRAF_CHECK check
    class PROM,GRAF monitor
```

**Services:**
- **Prometheus**: http://localhost:9090 - Metrics collection and storage
- **Grafana**: http://localhost:3001 (admin/admin123) - Data visualization and dashboards
- **Centralized Health**: http://localhost:3000/dashboard/health - All service status
- **Real-time Dashboard**: http://localhost:8080 - Live system monitoring
- **Application Logs**: `docker-compose logs -f ci-cd-agent`

**Health Check Commands:**
```bash
# Check all services centrally
curl http://localhost:3000/dashboard/health

# Check Docker container health
docker-compose ps

# Individual service checks
curl http://localhost:9090/-/healthy  # Prometheus
curl http://localhost:3001/api/health # Grafana
```

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
