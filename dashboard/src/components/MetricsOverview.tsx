'use client'

import { useState, useEffect } from 'react'

interface MetricCard {
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: string
  color: string
}

export default function MetricsOverview() {
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: 'Total Requests',
      value: '24.7K',
      change: '+12.5%',
      trend: 'up',
      icon: '📊',
      color: 'text-blue-400'
    },
    {
      title: 'Active Pipelines',
      value: 8,
      change: '+2',
      trend: 'up',
      icon: '🔄',
      color: 'text-green-400'
    },
    {
      title: 'Response Time',
      value: '145ms',
      change: '-23ms',
      trend: 'down',
      icon: '⚡',
      color: 'text-yellow-400'
    },
    {
      title: 'Error Rate',
      value: '0.12%',
      change: '-0.08%',
      trend: 'down',
      icon: '🚨',
      color: 'text-red-400'
    },
    {
      title: 'CPU Usage',
      value: '34%',
      change: '+5%',
      trend: 'up',
      icon: '💻',
      color: 'text-purple-400'
    },
    {
      title: 'Memory Usage',
      value: '2.1GB',
      change: '+0.3GB',
      trend: 'up',
      icon: '🧠',
      color: 'text-indigo-400'
    }
  ])

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // In a real implementation, fetch from Prometheus/Grafana APIs
        // const response = await fetch('/api/metrics/overview')
        // const data = await response.json()
        // setMetrics(data)
        
        // Simulate real-time updates for demo
        setMetrics(prev => prev.map(metric => ({
          ...metric,
          value: generateRandomValue(metric.title),
          change: generateRandomChange()
        })))
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      }
    }

    const interval = setInterval(fetchMetrics, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const generateRandomValue = (title: string): string => {
    switch (title) {
      case 'Total Requests':
        return `${(Math.random() * 30 + 20).toFixed(1)}K`
      case 'Active Pipelines':
        return Math.floor(Math.random() * 15 + 5).toString()
      case 'Response Time':
        return `${Math.floor(Math.random() * 100 + 100)}ms`
      case 'Error Rate':
        return `${(Math.random() * 0.3).toFixed(2)}%`
      case 'CPU Usage':
        return `${Math.floor(Math.random() * 40 + 20)}%`
      case 'Memory Usage':
        return `${(Math.random() * 2 + 1.5).toFixed(1)}GB`
      default:
        return '0'
    }
  }

  const generateRandomChange = (): string => {
    const isPositive = Math.random() > 0.5
    const value = (Math.random() * 20).toFixed(1)
    return isPositive ? `+${value}%` : `-${value}%`
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️'
      case 'down': return '↘️'
      case 'stable': return '➡️'
      default: return '➡️'
    }
  }

  const getTrendColor = (trend: string, isErrorMetric: boolean = false) => {
    if (isErrorMetric) {
      // For error metrics, down is good (green), up is bad (red)
      switch (trend) {
        case 'up': return 'text-red-400'
        case 'down': return 'text-green-400'
        case 'stable': return 'text-gray-400'
        default: return 'text-gray-400'
      }
    } else {
      // For normal metrics, up is good (green), down is bad (red)
      switch (trend) {
        case 'up': return 'text-green-400'
        case 'down': return 'text-red-400'
        case 'stable': return 'text-gray-400'
        default: return 'text-gray-400'
      }
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {metrics.map((metric, index) => {
        const isErrorMetric = metric.title.toLowerCase().includes('error')
        
        return (
          <div 
            key={index}
            className="dashboard-card bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">{metric.icon}</div>
              <div className={`text-xl ${getTrendColor(metric.trend, isErrorMetric)}`}>
                {getTrendIcon(metric.trend)}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">{metric.title}</h3>
              <div className="flex items-end justify-between">
                <span className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </span>
                <span className={`text-sm font-medium ${getTrendColor(metric.trend, isErrorMetric)}`}>
                  {metric.change}
                </span>
              </div>
            </div>
            
            {/* Mini progress bar for visual appeal */}
            <div className="mt-3 w-full bg-gray-700 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-500 ${
                  metric.color.replace('text-', 'bg-')
                }`}
                style={{ 
                  width: `${Math.random() * 70 + 30}%` 
                }}
              ></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
