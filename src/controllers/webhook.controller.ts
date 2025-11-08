import { Controller, Post, Body, Get, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { WebhookDto } from '../dto/webhook.dto';
import { GitHubAppService } from '../services/github-app.service';
import { OrchestratorService } from '../services/orchestrator.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly githubAppService: GitHubAppService,
    private readonly orchestratorService: OrchestratorService,
  ) {}

  @Post('github')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle GitHub webhook events' })
  @ApiHeader({ name: 'x-github-event', description: 'GitHub event type' })
  @ApiHeader({ name: 'x-hub-signature-256', description: 'GitHub webhook signature' })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook processed successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  async handleGitHubWebhook(
    @Body() payload: WebhookDto,
    @Headers('x-github-event') event: string,
    @Headers('x-hub-signature-256') signature: string,
  ) {
    return this.githubAppService.handleWebhook(payload, event, signature);
  }

  @Post('github/installation')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle GitHub App installation events' })
  @ApiResponse({ 
    status: 200, 
    description: 'Installation event processed',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        installationId: { type: 'number' },
      },
    },
  })
  async handleInstallation(@Body() payload: any) {
    return this.githubAppService.handleInstallation(payload);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string' },
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
