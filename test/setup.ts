// Jest setup file
// This file is executed before all tests

// Global test configuration
jest.setTimeout(30000); // 30 seconds timeout for all tests

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.GITHUB_APP_ID = 'test_app_id';
process.env.GITHUB_PRIVATE_KEY = 'test_private_key';
process.env.GITHUB_WEBHOOK_SECRET = 'test_webhook_secret';
process.env.POSTGRES_PASSWORD = 'test_password';
process.env.GRAFANA_PASSWORD = 'test_grafana_password';

// Suppress console logs during testing (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
