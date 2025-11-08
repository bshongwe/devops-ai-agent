import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GitHubAuthService } from '../auth/github-auth.service';

@Injectable()
export class GitHubAppService {
  private readonly logger = new Logger(GitHubAppService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly githubAuthService: GitHubAuthService,
  ) {}

  async handleWebhook(payload: any, event: string, signature: string): Promise<any> {
    try {
      // Verify webhook signature
      const isValid = this.githubAuthService.verifyWebhookSignature(
        JSON.stringify(payload),
        signature,
      );

      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

      this.logger.log(`Received GitHub webhook: ${event}`);

      switch (event) {
        case 'push':
          return this.handlePushEvent(payload);
        case 'pull_request':
          return this.handlePullRequestEvent(payload);
        case 'installation':
          return this.handleInstallationEvent(payload);
        case 'installation_repositories':
          return this.handleInstallationRepositoriesEvent(payload);
        default:
          this.logger.log(`Unhandled webhook event: ${event}`);
          return { status: 'ignored', message: `Event ${event} not handled` };
      }
    } catch (error) {
      this.logger.error(`Webhook handling failed: ${error.message}`);
      throw error;
    }
  }

  async handleInstallation(payload: any): Promise<any> {
    const { action, installation } = payload;
    
    this.logger.log(`GitHub App installation ${action}: ${installation.id}`);

    switch (action) {
      case 'created':
        return this.onInstallationCreated(installation);
      case 'deleted':
        return this.onInstallationDeleted(installation);
      case 'suspend':
        return this.onInstallationSuspended(installation);
      case 'unsuspend':
        return this.onInstallationUnsuspended(installation);
      default:
        return { status: 'ignored', action };
    }
  }

  async getAppInfo(): Promise<any> {
    try {
      return await this.githubAuthService.getAppInfo();
    } catch (error) {
      this.logger.error(`Failed to get app info: ${error.message}`);
      throw error;
    }
  }

  async getInstallations(): Promise<any> {
    try {
      // This would typically require app-level authentication
      // For now, return empty array - this would need proper implementation
      this.logger.warn('getInstallations not fully implemented');
      return [];
    } catch (error) {
      this.logger.error(`Failed to get installations: ${error.message}`);
      throw error;
    }
  }

  async getInstallationRepositories(installationId: number): Promise<any> {
    try {
      const octokit = await this.githubAuthService.getInstallationOctokit(installationId);
      const { data } = await octokit.rest.apps.listReposAccessibleToInstallation();
      
      return data.repositories;
    } catch (error) {
      this.logger.error(`Failed to get installation repositories: ${error.message}`);
      throw error;
    }
  }

  async dispatchRepositoryEvent(
    installationId: number,
    repository: string,
    eventType: string,
    clientPayload?: any,
  ): Promise<any> {
    try {
      const octokit = await this.githubAuthService.getInstallationOctokit(installationId);
      const [owner, repo] = repository.split('/');
      
      await octokit.rest.repos.createDispatchEvent({
        owner,
        repo,
        event_type: eventType,
        client_payload: clientPayload || {},
      });

      this.logger.log(`Dispatched event ${eventType} to ${repository}`);
      return { status: 'success', message: 'Event dispatched successfully' };
    } catch (error) {
      this.logger.error(`Failed to dispatch repository event: ${error.message}`);
      throw error;
    }
  }

  async getInstallationTokenInfo(installationId: number): Promise<any> {
    try {
      const token = await this.githubAuthService.getInstallationToken(installationId);
      
      // Note: In a real implementation, you'd want to be careful about exposing tokens
      return {
        token: token.substring(0, 8) + '...', // Truncated for security
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      };
    } catch (error) {
      this.logger.error(`Failed to get installation token: ${error.message}`);
      throw error;
    }
  }

  private async handlePushEvent(payload: any): Promise<any> {
    const { repository, ref, commits, installation } = payload;
    
    this.logger.log(`Push to ${repository.full_name} on ${ref} with ${commits?.length || 0} commits`);

    // Here you could trigger pipeline generation or execution
    if (installation?.id) {
      // Trigger CI/CD pipeline based on push event
      this.logger.log(`Triggering pipeline for installation ${installation.id}`);
    }

    return { 
      status: 'processed', 
      message: `Processed push event for ${repository.full_name}`,
      installationId: installation?.id,
    };
  }

  private async handlePullRequestEvent(payload: any): Promise<any> {
    const { action, pull_request, repository } = payload;
    
    this.logger.log(`Pull request ${action} in ${repository.full_name}: #${pull_request.number}`);

    if (action === 'opened' || action === 'synchronize') {
      // Trigger PR validation pipeline
      this.logger.log(`Triggering PR validation for #${pull_request.number}`);
    }

    return { 
      status: 'processed', 
      message: `Processed PR ${action} for ${repository.full_name}#${pull_request.number}`,
    };
  }

  private async handleInstallationEvent(payload: any): Promise<any> {
    return this.handleInstallation(payload);
  }

  private async handleInstallationRepositoriesEvent(payload: any): Promise<any> {
    const { action, installation, repositories_added, repositories_removed } = payload;
    
    this.logger.log(`Installation repositories ${action}: ${installation.id}`);
    
    if (repositories_added?.length) {
      this.logger.log(`Added repositories: ${repositories_added.map(r => r.name).join(', ')}`);
    }
    
    if (repositories_removed?.length) {
      this.logger.log(`Removed repositories: ${repositories_removed.map(r => r.name).join(', ')}`);
    }

    return { status: 'processed', action, installation: installation.id };
  }

  private async onInstallationCreated(installation: any): Promise<any> {
    this.logger.log(`New GitHub App installation created: ${installation.id}`);
    
    // Initialize installation-specific settings
    // Store installation details, setup webhooks, etc.
    
    return { 
      status: 'installation_created', 
      installationId: installation.id,
      account: installation.account?.login,
    };
  }

  private async onInstallationDeleted(installation: any): Promise<any> {
    this.logger.log(`GitHub App installation deleted: ${installation.id}`);
    
    // Cleanup installation-specific data
    // Remove stored tokens, configurations, etc.
    
    return { 
      status: 'installation_deleted', 
      installationId: installation.id 
    };
  }

  private async onInstallationSuspended(installation: any): Promise<any> {
    this.logger.log(`GitHub App installation suspended: ${installation.id}`);
    return { status: 'installation_suspended', installationId: installation.id };
  }

  private async onInstallationUnsuspended(installation: any): Promise<any> {
    this.logger.log(`GitHub App installation unsuspended: ${installation.id}`);
    return { status: 'installation_unsuspended', installationId: installation.id };
  }
}
