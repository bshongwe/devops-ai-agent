import { Controller, Get, Query, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { DashboardService, DashboardOverview, HealthStatus } from '../services/dashboard.service'

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview with key metrics' })
  @ApiResponse({ status: 200, description: 'Dashboard overview data' })
  async getDashboardOverview(): Promise<DashboardOverview> {
    return await this.dashboardService.getDashboardOverview()
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health status for all services' })
  @ApiResponse({ status: 200, description: 'System health data' })
  async getSystemHealth(): Promise<HealthStatus[]> {
    return await this.dashboardService.getSystemHealth()
  }

  @Get('metrics/prometheus')
  @ApiOperation({ summary: 'Get Prometheus metrics data' })
  @ApiResponse({ status: 200, description: 'Prometheus metrics' })
  async getPrometheusMetrics(@Query('query') query: string, @Query('range') range?: string) {
    return await this.dashboardService.getPrometheusMetrics(query, range)
  }

  @Get('metrics/grafana/:dashboardId')
  @ApiOperation({ summary: 'Get Grafana dashboard data' })
  @ApiResponse({ status: 200, description: 'Grafana dashboard data' })
  async getGrafanaDashboard(@Param('dashboardId') dashboardId: string) {
    return await this.dashboardService.getGrafanaDashboard(dashboardId)
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get active alerts and notifications' })
  @ApiResponse({ status: 200, description: 'Active alerts' })
  async getAlerts() {
    return await this.dashboardService.getAlerts()
  }

  @Get('infrastructure')
  @ApiOperation({ summary: 'Get infrastructure metrics from all sources' })
  @ApiResponse({ status: 200, description: 'Infrastructure metrics' })
  async getInfrastructureMetrics() {
    return await this.dashboardService.getInfrastructureMetrics()
  }

  @Get('application')
  @ApiOperation({ summary: 'Get application-specific metrics' })
  @ApiResponse({ status: 200, description: 'Application metrics' })
  async getApplicationMetrics() {
    return await this.dashboardService.getApplicationMetrics()
  }

  @Get('realtime/:metric')
  @ApiOperation({ summary: 'Get real-time metric data' })
  @ApiResponse({ status: 200, description: 'Real-time metric data' })
  async getRealTimeMetric(@Param('metric') metric: string) {
    return await this.dashboardService.getRealTimeMetric(metric)
  }
}
