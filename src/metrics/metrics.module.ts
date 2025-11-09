import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultLabels: {
        app: 'ci-cd-agent',
        version: '1.0.0',
      },
    }),
  ],
  exports: [PrometheusModule],
})
export class MetricsModule {}
