import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GitHubAuthService } from './github-auth.service';

describe('GitHubAuthService', () => {
  let service: GitHubAuthService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'NODE_ENV':
          return 'development'; // Use development to trigger mock mode
        case 'GITHUB_APP_ID':
          return null; // Trigger mock mode
        case 'GITHUB_PRIVATE_KEY':
          return null; // Trigger mock mode
        case 'GITHUB_WEBHOOK_SECRET':
          return 'test_webhook_secret';
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitHubAuthService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<GitHubAuthService>(GitHubAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate JWT token in test environment', () => {
    const jwt = service.generateJWT();
    expect(jwt).toBeDefined();
    expect(typeof jwt).toBe('string');
    expect(jwt.length).toBeGreaterThan(0);
  });

  it('should get installation token in test environment', async () => {
    const token = await service.getInstallationToken(12345);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token).toContain('dev_mock_installation_token');
  });

  it('should get installation octokit in test environment', async () => {
    const octokit = await service.getInstallationOctokit(12345);
    expect(octokit).toBeDefined();
    expect(octokit.rest).toBeDefined();
    expect(octokit.rest.repos.createDispatchEvent).toBeDefined();
  });

  it('should get app info in test environment', async () => {
    const appInfo = await service.getAppInfo();
    expect(appInfo).toBeDefined();
    expect(appInfo.id).toBeDefined();
    expect(appInfo.name).toContain('Development');
  });

  it('should verify webhook signature when secret is available', async () => {
    // Create a service with mocked ConfigService that returns a webhook secret
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'GITHUB_WEBHOOK_SECRET') return 'test-secret';
        if (key === 'NODE_ENV') return 'development';
        if (key === 'GITHUB_APP_ID') return undefined; // Simulate missing credentials
        if (key === 'GITHUB_PRIVATE_KEY') return undefined;
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitHubAuthService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    const serviceWithSecret = module.get<GitHubAuthService>(GitHubAuthService);
    
    const payload = JSON.stringify({ test: 'data' });
    
    // Generate the correct signature for this payload and secret
    const crypto = require('node:crypto');
    const expectedSignature = crypto
      .createHmac('sha256', 'test-secret')
      .update(payload, 'utf8')
      .digest('hex');
    const signature = `sha256=${expectedSignature}`;
    
    const isValid = serviceWithSecret.verifyWebhookSignature(payload, signature);
    expect(isValid).toBe(true);
    
    // Test with wrong signature should fail
    const wrongSignature = 'sha256=' + crypto
      .createHmac('sha256', 'wrong-secret')
      .update(payload, 'utf8')
      .digest('hex');
    const isInvalid = serviceWithSecret.verifyWebhookSignature(payload, wrongSignature);
    expect(isInvalid).toBe(false);
  });
});
