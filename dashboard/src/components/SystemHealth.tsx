'use client'

import { useState, useEffect } from 'react'

interface SystemHealthProps {}

interface HealthStatus {
  service: string
  status: 'healthy' | 'warning' | 'error'
  uptime: string
  lastCheck: string
  message: string
}

export default function SystemHealth({}: SystemHealthProps) {
  const [healthData, setHealthData] = useState<HealthStatus[]>([
    {
      service: 'CI-CD Agent',
      status: 'healthy',
      uptime: '99.9%',
      lastCheck: new Date().toLocaleTimeString(),
      message: 'All endpoints responding'
    },
    {
      service: 'PostgreSQL',
      status: 'healthy',
      uptime: '100%',
      lastCheck: new Date().toLocaleTimeString(),
      message: 'Database operational'
    },
    {
      service: 'Redis',
      status: 'healthy',
      uptime: '99.8%',
      lastCheck: new Date().toLocaleTimeString(),
      message: 'Cache layer active'
    },
    {
      service: 'Prometheus',
      status: 'healthy',
      uptime: '99.7%',
      lastCheck: new Date().toLocaleTimeString(),
      message: 'Metrics collection running'
    },
    {
      service: 'Grafana',
      status: 'healthy',
      uptime: '99.9%',
      lastCheck: new Date().toLocaleTimeString(),
      message: 'Dashboards accessible'
    },
    {
      service: 'ArgoCD',
      status: 'warning',
      uptime: '98.5%',
      lastCheck: new Date().toLocaleTimeString(),
      message: 'Sync in progress'
    }
  ])

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        // In a real implementation, this would fetch from your health check API
        // const response = await fetch('/api/health/all')
        // const data = await response.json()
        // setHealthData(data)
        
        // For now, simulate data updates
        setHealthData(prev => prev.map(item => ({
          ...item,
          lastCheck: new Date().toLocaleTimeString()
        })))
      } catch (error) {
        console.error('Failed to fetch health data:', error)
      }
    }

    fetchHealthData()
    const interval = setInterval(fetchHealthData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-900'
      case 'warning': return 'bg-yellow-900'
      case 'error': return 'bg-red-900'
      default: return 'bg-gray-900'
    }
  }

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">System Health</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Live Status</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthData.map((item, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${getStatusBg(item.status)} border-gray-700 transition-all hover:border-gray-600`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white">{item.service}</h3>
              <span className={`text-sm font-semibold ${getStatusColor(item.status)}`}>
                {item.status.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime:</span>
                <span className="text-white">{item.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Check:</span>
                <span className="text-white">{item.lastCheck}</span>
              </div>
              <div className="mt-2">
                <p className="text-gray-300 text-xs">{item.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall System Status */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-white">Overall System Status</h3>
            <p className="text-sm text-gray-400">
              {healthData.filter(item => item.status === 'healthy').length} of {healthData.length} services healthy
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">
              {Math.round((healthData.filter(item => item.status === 'healthy').length / healthData.length) * 100)}%
            </div>
            <div className="text-sm text-gray-400">System Health</div>
          </div>
        </div>
      </div>
    </div>
  )
}
