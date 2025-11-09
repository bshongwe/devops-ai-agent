'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import RealTimeChart from '../../components/RealTimeChart'

export default function MetricsPage() {
  const [metricsData, setMetricsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // In a real implementation, fetch from the dashboard API
        const [overview, infrastructure, application] = await Promise.all([
          fetch('/api/agent/dashboard/overview').then(r => r.json()).catch(() => ({})),
          fetch('/api/agent/dashboard/infrastructure').then(r => r.json()).catch(() => ({})),
          fetch('/api/agent/dashboard/application').then(r => r.json()).catch(() => ({}))
        ])
        
        setMetricsData({ overview, infrastructure, application })
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
        setIsLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white">Loading Metrics...</h2>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Detailed Metrics</h1>
          <div className="text-sm text-gray-400">
            Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Real-time Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-white mb-4">HTTP Request Rate</h3>
            <RealTimeChart 
              dataSource="prometheus"
              query="rate(http_requests_total[5m])"
              title="Requests/sec"
              color="#22c55e"
            />
          </div>
          
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-white mb-4">CPU Usage</h3>
            <RealTimeChart 
              dataSource="prometheus"
              query="rate(process_cpu_seconds_total[5m]) * 100"
              title="CPU %"
              color="#f59e0b"
            />
          </div>

          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-white mb-4">Memory Usage</h3>
            <RealTimeChart 
              dataSource="prometheus"
              query="process_resident_memory_bytes / 1024 / 1024"
              title="Memory MB"
              color="#8b5cf6"
            />
          </div>

          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-white mb-4">Response Time</h3>
            <RealTimeChart 
              dataSource="prometheus"
              query="histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
              title="Response Time (95th)"
              color="#ef4444"
            />
          </div>
        </div>

        {/* Raw Metrics Data */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-white mb-4">Raw Metrics Data</h3>
          <div className="bg-gray-900 p-4 rounded-lg">
            <pre className="text-sm text-gray-300 overflow-auto">
              {JSON.stringify(metricsData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
