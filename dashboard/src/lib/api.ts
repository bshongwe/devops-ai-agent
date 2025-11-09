import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const dashboardAPI = {
  getOverview: () => apiClient.get('/dashboard/overview'),
  getHealth: () => apiClient.get('/dashboard/health'),
  getPrometheusMetrics: (query: string, range?: string) => 
    apiClient.get('/dashboard/metrics/prometheus', { params: { query, range } }),
  getAlerts: () => apiClient.get('/dashboard/alerts'),
  getApplicationMetrics: () => apiClient.get('/dashboard/application'),
  getInfrastructureMetrics: () => apiClient.get('/dashboard/infrastructure'),
  getRealTimeMetric: (metric: string) => apiClient.get(`/dashboard/realtime/${metric}`),
}