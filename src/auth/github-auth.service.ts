import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import * as jwt from 'jsonwebtoken';
import { createHmac, timingSafeEqual } from 'node:crypto';

@Injectable()
export class GitHubAuthService {
  private readonly app: App;

  constructor(private readonly configService: ConfigService) {
    const appId = this.configService.get<string>('GITHUB_APP_ID');
    const privateKey = this.configService.get<string>('GITHUB_PRIVATE_KEY');
    
    if (!appId || !privateKey) {
      throw new Error('GitHub App ID and Private Key are required');
    }

    this.app = new App({
      appId: Number.parseInt(appId),
      privateKey: privateKey.replace(/\\n/g, '\n'),
    });
  }

  /**
   * Generate JWT token for GitHub App authentication
   */
  generateJWT(): string {
    const appId = this.configService.get<string>('GITHUB_APP_ID');
    const privateKey = this.configService.get<string>('GITHUB_PRIVATE_KEY');
    
    const now = Math.floor(Date.now() / 1000);
    
    const payload = {
      iat: now - 60, // Issued 60 seconds in the past
      exp: now + (10 * 60), // Expires in 10 minutes
      iss: parseInt(appId),
    };

    return jwt.sign(payload, privateKey.replace(/\\n/g, '\n'), {
      algorithm: 'RS256',
    });
  }

  /**
   * Get installation access token
   */
  async getInstallationToken(installationId: number): Promise<string> {
    try {
      // Use manual token generation for now
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
    const octokit = new Octokit({ auth: this.generateJWT() });
    const { data } = await (octokit as any).rest.apps.getAuthenticated();
    return data;
  }
}
