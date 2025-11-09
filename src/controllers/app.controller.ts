import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Application Info')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Application welcome page' })
  @ApiResponse({ 
    status: 200, 
    description: 'Welcome message with application information',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        name: { type: 'string' },
        version: { type: 'string' },
        status: { type: 'string' },
        documentation: { type: 'string' },
        endpoints: {
          type: 'object',
          properties: {
            health: { type: 'string' },
            api_docs: { type: 'string' },
            metrics: { type: 'string' }
          }
        }
      }
    }
  })
  getRoot() {
    return {
      message: '🚀 Welcome to CI-CD Agent API',
      name: 'ci-cd-agent',
      version: '1.0.0',
      status: 'running',
      description: 'Automated CI/CD pipeline generation and GitHub integration service',
      documentation: '/api',
      endpoints: {
        health: '/webhooks/health',
        api_docs: '/api',
        metrics: '/metrics',
        github: '/github/app/info',
        pipelines: '/pipelines'
      },
      features: [
        'GitHub App Integration',
        'Automated Pipeline Generation', 
        'Webhook Processing',
        'ArgoCD GitOps Integration',
        'Prometheus Metrics Collection'
      ],
      links: {
        swagger_ui: '/api',
        health_check: '/webhooks/health',
        prometheus_metrics: '/metrics',
        github_integrations: '/github',
        pipeline_management: '/pipelines'
      }
    };
  }

  @Get('info')
  @ApiOperation({ summary: 'Application information and status' })
  @ApiResponse({ status: 200, description: 'Detailed application information' })
  getInfo() {
    return {
      application: {
        name: 'CI-CD Agent',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      },
      features: {
        github_integration: true,
        pipeline_generation: true,
        webhook_processing: true,
        argocd_sync: true,
        prometheus_metrics: true,
        swagger_documentation: true
      },
      configuration: {
        cors_origin: process.env.CORS_ORIGIN,
        database_configured: !!process.env.DATABASE_URL,
        redis_configured: !!process.env.REDIS_URL,
        github_app_id: process.env.GITHUB_APP_ID ? 'configured' : 'not configured',
        argocd_server: process.env.ARGOCD_SERVER ? 'configured' : 'not configured'
      }
    };
  }
}
