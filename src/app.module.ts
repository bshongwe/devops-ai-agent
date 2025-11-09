import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { MetricsModule } from './metrics/metrics.module';
import { AppController } from './controllers/app.controller';
import { PipelineController } from './controllers/pipeline.controller';
import { GitHubController } from './controllers/github.controller';
import { WebhookController } from './controllers/webhook.controller';
import { OrchestratorService } from './services/orchestrator.service';
import { PipelineService } from './services/pipeline.service';
import { GitHubAppService } from './services/github-app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
    MetricsModule,
  ],
  controllers: [
    AppController,
    PipelineController,
    GitHubController,
    WebhookController,
  ],
  providers: [
    OrchestratorService,
    PipelineService,
    GitHubAppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
