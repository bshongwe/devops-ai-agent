import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Setup Swagger for E2E tests
    const config = new DocumentBuilder()
      .setTitle('CI-CD Agent API')
      .setDescription('CI-CD orchestration agent with GitHub App integration')
      .setVersion('1.0')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/webhooks/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/webhooks/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.timestamp).toBeDefined();
      });
  });

  it('/api (GET) - should serve Swagger documentation', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200);
  });
});
