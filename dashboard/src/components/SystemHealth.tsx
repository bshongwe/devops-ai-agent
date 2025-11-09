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
  const [healthData, setHealthData] = useState<HealthStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('http://localhost:3000/dashboard/health')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        
        // Transform the API data to match our HealthStatus interface
        const transformedData: HealthStatus[] = data.map((service: any) => {
          let mappedStatus: 'healthy' | 'warning' | 'error' = 'error'
          if (service.status === 'healthy' || service.status === 'up') {
            mappedStatus = 'healthy'
          } else if (service.status === 'warning' || service.status === 'degraded') {
            mappedStatus = 'warning'
          }
          
          return {
            service: service.service,
            status: mappedStatus,
            uptime: service.uptime,
            lastCheck: service.lastCheck,
            message: service.message
          }
        })
        
        setHealthData(transformedData)
      } catch (error) {
        console.error('Failed to fetch health data:', error)
        // Set empty array on error
        setHealthData([])
      } finally {
        setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className="dashboard-card">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-white">Loading System Health...</h3>
          </div>
        </div>
      </div>
    )
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

      {healthData.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400">No health data available</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthData.map((item) => (
          <div 
            key={item.service}
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
      )}

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
