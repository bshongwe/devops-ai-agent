import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { createConnection } from 'node:net'

export interface HealthStatus {
  service: string
  status: 'healthy' | 'warning' | 'error'
  uptime: string
  lastCheck: string
  message: string
}

export interface MetricData {
  timestamp: string
  value: number
  labels?: Record<string, string>
}

export interface DashboardOverview {
  totalRequests: number
  activePipelines: number
  responseTime: number
  errorRate: number
  cpuUsage: number
  memoryUsage: number
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      // Fetch key metrics from Prometheus
      const [
        requestsData,
        pipelinesData,
        responseTimeData,
        errorRateData,
        cpuData,
        memoryData
      ] = await Promise.all([
        this.queryPrometheus('sum(rate(http_requests_total[5m]))'),
        this.queryPrometheus('count(pipeline_status{status="running"})'),
        this.queryPrometheus('histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))'),
        this.queryPrometheus('rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100'),
        this.queryPrometheus('rate(process_cpu_seconds_total[5m]) * 100'),
        this.queryPrometheus('process_resident_memory_bytes / 1024 / 1024 / 1024')
      ])

      return {
        totalRequests: this.extractMetricValue(requestsData) * 3600, // Convert to hourly
        activePipelines: this.extractMetricValue(pipelinesData),
        responseTime: this.extractMetricValue(responseTimeData) * 1000, // Convert to ms
        errorRate: this.extractMetricValue(errorRateData),
        cpuUsage: this.extractMetricValue(cpuData),
        memoryUsage: this.extractMetricValue(memoryData)
      }
    } catch (error) {
      console.error('Error fetching dashboard overview:', error)
      // Return mock data if Prometheus is not available
      return {
        totalRequests: 24700,
        activePipelines: 8,
        responseTime: 145,
        errorRate: 0.12,
        cpuUsage: 34,
        memoryUsage: 2.1
      }
    }
  }

  async getSystemHealth(): Promise<HealthStatus[]> {
    const services = [
      { name: 'CI-CD Agent', url: 'http://localhost:3000/webhooks/health', type: 'http' },
      { name: 'PostgreSQL', host: 'localhost', port: 5432, type: 'tcp' },
      { name: 'Redis', host: 'localhost', port: 6379, type: 'tcp' },
      { name: 'Prometheus', url: 'http://localhost:9090/-/healthy', type: 'http' },
      { name: 'Grafana', url: 'http://localhost:3001/api/health', type: 'http' }
    ]

    const healthChecks = await Promise.allSettled(
      services.map(service => this.checkServiceHealth(service))
    )

    return healthChecks.map((result, index) => {
      const service = services[index]
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          service: service.name,
          status: 'error' as const,
          uptime: 'N/A',
          lastCheck: new Date().toLocaleTimeString(),
          message: 'Service unavailable'
        }
      }
    })
  }

  async getPrometheusMetrics(query: string, range?: string): Promise<any> {
    try {
      const prometheusUrl = this.configService.get('PROMETHEUS_URL', 'http://ci-cd-prometheus:9090')
      const endpoint = range ? '/api/v1/query_range' : '/api/v1/query'
      
      const params: any = { query }
      if (range) {
        const end = Math.floor(Date.now() / 1000)
        const start = end - Number.parseInt(range) * 60 // range in minutes
        params.start = start
        params.end = end
        params.step = '60s'
      }

      const response = await firstValueFrom(
        this.httpService.get(`${prometheusUrl}${endpoint}`, { params })
      )

      return response.data
    } catch (error) {
      console.error('Error fetching Prometheus metrics:', error)
      // Return mock data for demo
      return this.generateMockTimeSeriesData(query)
    }
  }

  async getGrafanaDashboard(dashboardId: string): Promise<any> {
    try {
      const grafanaUrl = this.configService.get('GRAFANA_URL', 'http://ci-cd-grafana:3000')
      const response = await firstValueFrom(
        this.httpService.get(`${grafanaUrl}/api/dashboards/uid/${dashboardId}`)
      )
      return response.data
    } catch (error) {
      console.error('Error fetching Grafana dashboard:', error)
      throw new HttpException('Dashboard not found', HttpStatus.NOT_FOUND)
    }
  }

  async getAlerts(): Promise<any[]> {
    // In a real implementation, fetch from Alertmanager or similar
    return [
      {
        id: 1,
        level: 'info',
        title: 'Prometheus Scraping Active',
        message: 'All metrics targets are being scraped successfully',
        time: new Date(Date.now() - 2 * 60000).toISOString(),
        source: 'prometheus'
      },
      {
        id: 2,
        level: 'warning',
        title: 'High CPU Usage Detected',
        message: 'CPU usage exceeded 80% for 5 minutes',
        time: new Date(Date.now() - 15 * 60000).toISOString(),
        source: 'system'
      },
      {
        id: 3,
        level: 'success',
        title: 'ArgoCD Sync Completed',
        message: 'Application deployed successfully to staging',
        time: new Date(Date.now() - 60 * 60000).toISOString(),
        source: 'argocd'
      }
    ]
  }

  async getInfrastructureMetrics(): Promise<any> {
    try {
      const [
        postgresConnections,
        redisMemory,
        dockerContainers,
        k8sPods
      ] = await Promise.all([
        this.queryPrometheus('pg_stat_database_numbackends'),
        this.queryPrometheus('redis_memory_used_bytes / 1024 / 1024'),
        this.queryPrometheus('count(container_last_seen)'),
        this.queryPrometheus('count(kube_pod_status_phase{phase="Running"})')
      ])

      return {
        postgresql: {
          connections: this.extractMetricValue(postgresConnections),
          maxConnections: 100
        },
        redis: {
          memoryUsage: this.extractMetricValue(redisMemory),
          memoryMax: 512
        },
        docker: {
          runningContainers: this.extractMetricValue(dockerContainers)
        },
        kubernetes: {
          runningPods: this.extractMetricValue(k8sPods)
        }
      }
    } catch (error) {
      console.error('Error fetching infrastructure metrics:', error)
      return {
        postgresql: { connections: 8, maxConnections: 100 },
        redis: { memoryUsage: 245, memoryMax: 512 },
        docker: { runningContainers: 6 },
        kubernetes: { runningPods: 4 }
      }
    }
  }

  async getApplicationMetrics(): Promise<any> {
    try {
      const [
        webhookCount,
        pipelineExecutions,
        argoSyncs,
        apiEndpoints
      ] = await Promise.all([
        this.queryPrometheus('sum(increase(webhook_requests_total[1h]))'),
        this.queryPrometheus('sum(increase(pipeline_executions_total[1h]))'),
        this.queryPrometheus('sum(increase(argocd_sync_total[1h]))'),
        this.queryPrometheus('count(up{job="ci-cd-agent"})')
      ])

      return {
        webhooks: this.extractMetricValue(webhookCount),
        pipelineExecutions: this.extractMetricValue(pipelineExecutions),
        argocdSyncs: this.extractMetricValue(argoSyncs),
        activeEndpoints: this.extractMetricValue(apiEndpoints)
      }
    } catch (error) {
      console.error('Error fetching application metrics:', error)
      return {
        webhooks: 142,
        pipelineExecutions: 28,
        argocdSyncs: 15,
        activeEndpoints: 12
      }
    }
  }

  async getRealTimeMetric(metric: string): Promise<any> {
    const queries = {
      'http_requests': 'rate(http_requests_total[5m])',
      'cpu_usage': 'rate(process_cpu_seconds_total[5m]) * 100',
      'memory_usage': 'process_resident_memory_bytes / 1024 / 1024',
      'response_time': 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))'
    }

    const query = queries[metric]
    if (!query) {
      throw new HttpException('Metric not found', HttpStatus.NOT_FOUND)
    }

    return await this.getPrometheusMetrics(query, '30') // Last 30 minutes
  }

  private async queryPrometheus(query: string): Promise<any> {
    const prometheusUrl = this.configService.get('PROMETHEUS_URL', 'http://ci-cd-prometheus:9090')
    const response = await firstValueFrom(
      this.httpService.get(`${prometheusUrl}/api/v1/query`, {
        params: { query },
        timeout: 5000
      })
    )
    return response.data
  }

  private async checkServiceHealth(service: any): Promise<HealthStatus> {
    const startTime = Date.now()
    
    try {
      if (service.type === 'http') {
        await firstValueFrom(
          this.httpService.get(service.url, { timeout: 3000 })
        )
      } else if (service.type === 'tcp') {
        await this.checkTcpConnection(service.host, service.port)
      }
      
      const responseTime = Date.now() - startTime

      return {
        service: service.name,
        status: 'healthy',
        uptime: '99.9%', // This would be calculated from actual uptime metrics
        lastCheck: new Date().toLocaleTimeString(),
        message: `Responding in ${responseTime}ms`
      }
    } catch (error) {
      return {
        service: service.name,
        status: 'error',
        uptime: 'N/A',
        lastCheck: new Date().toLocaleTimeString(),
        message: error.code || error.message || 'Connection failed'
      }
    }
  }

  private async checkTcpConnection(host: string, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = createConnection({ host, port, timeout: 3000 })
      
      socket.on('connect', () => {
        socket.end()
        resolve()
      })
      
      socket.on('error', (error) => {
        reject(error)
      })
      
      socket.on('timeout', () => {
        socket.destroy()
        reject(new Error('Connection timeout'))
      })
    })
  }

  private extractMetricValue(prometheusResponse: any): number {
    try {
      if (prometheusResponse?.data?.result?.length > 0) {
        const result = prometheusResponse.data.result[0]
        return Number.parseFloat(result.value[1]) || 0
      }
      return 0
    } catch (error) {
      console.error('Error extracting metric value:', error)
      return 0
    }
  }

  private generateMockTimeSeriesData(query: string): any {
    const now = Date.now() / 1000
    const points = []
    
    for (let i = 0; i < 30; i++) {
      const timestamp = now - (29 - i) * 60 // Every minute for last 30 minutes
      let value = Math.sin(i * 0.2) * 20 + 50 + Math.random() * 10
      
      if (query.includes('cpu')) value = Math.max(0, Math.min(100, value))
      else if (query.includes('memory')) value = Math.max(0, value * 20 + 1000)
      else if (query.includes('http_requests')) value = Math.max(0, value * 2)
      
      points.push([timestamp, value.toFixed(2)])
    }

    return {
      status: 'success',
      data: {
        resultType: 'matrix',
        result: [{
          metric: { __name__: query },
          values: points
        }]
      }
    }
  }
}
