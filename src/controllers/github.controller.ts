import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GitHubAppService } from '../services/github-app.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('github')
@Controller('github')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GitHubController {
  constructor(private readonly githubAppService: GitHubAppService) {}

  @Get('app/info')
  @ApiOperation({ summary: 'Get GitHub App information' })
  @ApiResponse({ 
    status: 200, 
    description: 'App information retrieved',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        slug: { type: 'string' },
        owner: { type: 'object' },
      },
    },
  })
  async getAppInfo() {
    return this.githubAppService.getAppInfo();
  }

  @Get('installations')
  @ApiOperation({ summary: 'List GitHub App installations' })
  @ApiResponse({ 
    status: 200, 
    description: 'Installations retrieved',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          account: { type: 'object' },
          repositories_url: { type: 'string' },
        },
      },
    },
  })
  async getInstallations() {
    return this.githubAppService.getInstallations();
  }

  @Get('installations/:id/repositories')
  @ApiOperation({ summary: 'Get repositories for an installation' })
  @ApiResponse({ 
    status: 200, 
    description: 'Repositories retrieved',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          full_name: { type: 'string' },
          private: { type: 'boolean' },
        },
      },
    },
  })
  async getInstallationRepositories(@Param('id') installationId: number) {
    return this.githubAppService.getInstallationRepositories(installationId);
  }

  @Post('installations/:id/repositories/:repo/dispatch')
  @ApiOperation({ summary: 'Trigger repository dispatch event' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dispatch event triggered',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  async dispatchRepositoryEvent(
    @Param('id') installationId: number,
    @Param('repo') repository: string,
    @Body() payload: { event_type: string; client_payload?: any },
  ) {
    return this.githubAppService.dispatchRepositoryEvent(
      installationId,
      repository,
      payload.event_type,
      payload.client_payload,
    );
  }

  @Get('installations/:id/token')
  @ApiOperation({ summary: 'Get installation access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token generated',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        expires_at: { type: 'string' },
      },
    },
  })
  async getInstallationToken(@Param('id') installationId: number) {
    return this.githubAppService.getInstallationTokenInfo(installationId);
  }
}
