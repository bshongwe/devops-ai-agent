import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class GitHubAuthService {
  private readonly app: App;

  constructor(private readonly configService: ConfigService) {
    const appId = this.configService.get<string>('GITHUB_APP_ID');
    const privateKey = this.configService.get<string>('GITHUB_PRIVATE_KEY');
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    
    // In development mode, allow missing credentials with warnings
    if (!appId || !privateKey || appId === 'your_github_app_id_here') {
      if (nodeEnv === 'development') {
        console.warn('⚠️  GitHub App credentials not configured - using mock auth for development');
        // Create a minimal mock app for development
        this.app = null; // We'll handle null checks in methods
        return;
      } else {
        throw new Error('GitHub App ID and Private Key are required in production');
      }
    }

    try {
      this.app = new App({
        appId: Number.parseInt(appId),
        privateKey: privateKey.replace(/\\n/g, '\n'),
      });
    } catch (error) {
      if (nodeEnv === 'development') {
        console.warn('⚠️  Invalid GitHub App credentials - using mock auth for development');
        this.app = null;
      } else {
        throw error;
      }
    }
  }

  /**
   * Generate JWT token for GitHub App authentication
   */
  generateJWT(): string {
    const appId = this.configService.get<string>('GITHUB_APP_ID');
    const privateKey = this.configService.get<string>('GITHUB_PRIVATE_KEY');
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    
    // Return mock JWT in development
    if (!this.app && nodeEnv === 'development') {
      return 'dev_mock_jwt_token_' + Date.now();
    }
    
    const now = Math.floor(Date.now() / 1000);
    
    const payload = {
      iat: now - 60, // Issued 60 seconds in the past
      exp: now + (10 * 60), // Expires in 10 minutes
      iss: Number.parseInt(appId),
    };

    return jwt.sign(payload, privateKey.replace(/\\n/g, '\n'), {
      algorithm: 'RS256',
    });
  }

  /**
   * Get installation access token
   */
  async getInstallationToken(installationId: number): Promise<string> {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    
    // Return mock token in development
    if (!this.app && nodeEnv === 'development') {
      return `dev_mock_installation_token_${installationId}_${Date.now()}`;
    }
    
    try {
      const octokit = new Octokit({
        auth: this.generateJWT(),
      });
      
      const { data } = await (octokit as any).rest.apps.createInstallationAccessToken({
        installation_id: installationId,
      });
      
      return data.token;
    } catch (error) {
      throw new Error(`Failed to get installation token: ${error.message}`);
    }
  }

  /**
   * Get authenticated Octokit instance for an installation
   */
  async getInstallationOctokit(installationId: number): Promise<any> {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    
    // Return mock octokit in development
    if (!this.app && nodeEnv === 'development') {
      return {
        rest: {
          repos: {
            createDispatchEvent: () => Promise.resolve({ data: { status: 'mocked' } }),
          },
          apps: {
            listReposAccessibleToInstallation: () => Promise.resolve({ 
              data: { repositories: [] } 
            }),
          },
        },
      };
    }
    
    const token = await this.getInstallationToken(installationId);
    return new Octokit({ auth: token });
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = this.configService.get<string>('GITHUB_WEBHOOK_SECRET');
    if (!secret) {
      throw new Error('GitHub webhook secret is not configured');
    }

    const { createHmac, timingSafeEqual } = require('node:crypto');
    const expectedSignature = 'sha256=' + createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Get app information
   */
  async getAppInfo() {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    
    // Return mock app info in development
    if (!this.app && nodeEnv === 'development') {
      return {
        id: 123456,
        name: 'CI-CD Agent (Development)',
        slug: 'ci-cd-agent-dev',
        owner: {
          login: 'development-user',
          id: 12345,
          type: 'User',
        },
      };
    }
    
    const octokit = new Octokit({ auth: this.generateJWT() });
    const { data } = await (octokit as any).rest.apps.getAuthenticated();
    return data;
  }
}
