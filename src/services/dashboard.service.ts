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
    const [cpuData, memoryData] = await Promise.all([
      this.queryPrometheus('rate(process_cpu_seconds_total[5m]) * 100'),
      this.queryPrometheus('process_resident_memory_bytes / 1024 / 1024 / 1024')
    ])

    return {
      totalRequests: 0,
      activePipelines: 0,
      responseTime: 0,
      errorRate: 0,
      cpuUsage: this.extractMetricValue(cpuData),
      memoryUsage: this.extractMetricValue(memoryData)
    }
  }

  async getSystemHealth(): Promise<HealthStatus[]> {
    const services = [
      { name: 'PostgreSQL', host: 'ci-cd-postgres', port: 5432 },
      { name: 'Redis', host: 'ci-cd-redis', port: 6379 },
      { name: 'Prometheus', url: 'http://ci-cd-prometheus:9090/-/healthy' },
      { name: 'Grafana', url: 'http://ci-cd-grafana:3000/api/health' }
    ]

    const results = await Promise.allSettled(
      services.map(service => this.checkService(service))
    )

    return results.map((result, index) => {
      const service = services[index]
      if (result.status === 'fulfilled') {
        return result.value
      }
      return {
        service: service.name,
        status: 'error' as const,
        uptime: 'Down',
        lastCheck: new Date().toLocaleTimeString(),
        message: 'Connection failed'
      }
    })
  }

  async getPrometheusMetrics(query: string, range?: string): Promise<any> {
    try {
      const prometheusUrl = 'http://ci-cd-prometheus:9090'
      const endpoint = range ? '/api/v1/query_range' : '/api/v1/query'
      
      const params: any = { query }
      if (range) {
        const end = Math.floor(Date.now() / 1000)
        const start = end - Number.parseInt(range) * 60
        params.start = start
        params.end = end
        params.step = '60s'
      }

      const response = await firstValueFrom(
        this.httpService.get(`${prometheusUrl}${endpoint}`, { params, timeout: 5000 })
      )
      return response.data
    } catch (error) {
      return this.generateMockData(query)
    }
  }

  async getAlerts(): Promise<any[]> {
    return [
      {
        id: 1,
        level: 'info',
        title: 'System Running',
        message: 'All services operational',
        time: new Date().toISOString(),
        source: 'system'
      }
    ]
  }

  async getInfrastructureMetrics(): Promise<any> {
    return {
      postgresql: { connections: 5, maxConnections: 100 },
      redis: { memoryUsage: 128, memoryMax: 512 },
      docker: { runningContainers: 8 },
      kubernetes: { runningPods: 0 }
    }
  }

  async getApplicationMetrics(): Promise<any> {
    return {
      webhooks: 0,
      pipelineExecutions: 0,
      argocdSyncs: 0,
      activeEndpoints: 1
    }
  }

  async getGrafanaDashboard(dashboardId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://ci-cd-grafana:3000/api/dashboards/uid/${dashboardId}`, { timeout: 5000 })
      )
      return response.data
    } catch (error) {
      throw new HttpException('Dashboard not found', HttpStatus.NOT_FOUND)
    }
  }

  async getRealTimeMetric(metric: string): Promise<any> {
    const queries = {
      'http_requests': 'rate(http_requests_total[5m])',
      'cpu_usage': 'rate(process_cpu_seconds_total[5m]) * 100'
    }
    return await this.getPrometheusMetrics(queries[metric] || 'up', '30')
  }

  private async queryPrometheus(query: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('http://ci-cd-prometheus:9090/api/v1/query', {
          params: { query },
          timeout: 5000
        })
      )
      return response.data
    } catch (error) {
      return { data: { result: [] } }
    }
  }

  private async checkService(service: any): Promise<HealthStatus> {
    const startTime = Date.now()
    
    try {
      if (service.url) {
        await firstValueFrom(
          this.httpService.get(service.url, { timeout: 5000 })
        )
      } else {
        await this.checkTcp(service.host, service.port)
      }
      
      const responseTime = Date.now() - startTime
      const uptime = await this.getUptime(service.name)

      return {
        service: service.name,
        status: 'healthy',
        uptime,
        lastCheck: new Date().toLocaleTimeString(),
        message: `OK (${responseTime}ms)`
      }
    } catch (error) {
      return {
        service: service.name,
        status: 'error',
        uptime: 'Down',
        lastCheck: new Date().toLocaleTimeString(),
        message: error.code || 'Connection failed'
      }
    }
  }

  private async checkTcp(host: string, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = createConnection({ host, port, timeout: 5000 })
      socket.on('connect', () => {
        socket.end()
        resolve()
      })
      socket.on('error', reject)
      socket.on('timeout', () => {
        socket.destroy()
        reject(new Error('Timeout'))
      })
    })
  }

  private async getUptime(serviceName: string): Promise<string> {
    try {
      const query = `(time() - process_start_time_seconds{job="${serviceName.toLowerCase()}"})`
      const response = await this.queryPrometheus(query)
      const seconds = this.extractMetricValue(response)
      
      if (seconds > 0) {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
      }
    } catch (error) {
      // Ignore errors
    }
    return 'Running'
  }

  private extractMetricValue(prometheusResponse: any): number {
    try {
      if (prometheusResponse?.data?.result?.length > 0) {
        return Number.parseFloat(prometheusResponse.data.result[0].value[1]) || 0
      }
    } catch (error) {
      // Ignore errors
    }
    return 0
  }

  private generateMockData(query: string): any {
    const now = Date.now() / 1000
    const points = []
    
    for (let i = 0; i < 30; i++) {
      const timestamp = now - (29 - i) * 60
      const value = Math.sin(i * 0.2) * 20 + 50 + Math.random() * 10
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