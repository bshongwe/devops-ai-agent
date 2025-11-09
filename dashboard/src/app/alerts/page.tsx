'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'

interface Alert {
  id: number
  level: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  time: string
  source: string
}

export default function AlertsPage() {
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    // Simulate loading and set mock data
    const mockAlerts: Alert[] = [
      {
        id: 1,
        level: 'error',
        title: 'High Memory Usage Detected',
        message: 'Memory usage has exceeded 85% threshold on production server',
        time: new Date().toISOString(),
        source: 'Prometheus'
      },
      {
        id: 2,
        level: 'warning',
        title: 'Slow Response Time',
        message: 'API response time is averaging 2.5 seconds over the last 5 minutes',
        time: new Date(Date.now() - 300000).toISOString(),
        source: 'Grafana'
      },
      {
        id: 3,
        level: 'info',
        title: 'Deployment Successful',
        message: 'Application version 1.2.3 has been successfully deployed to staging',
        time: new Date(Date.now() - 600000).toISOString(),
        source: 'ArgoCD'
      },
      {
        id: 4,
        level: 'success',
        title: 'System Health Check Passed',
        message: 'All critical services are running normally',
        time: new Date(Date.now() - 900000).toISOString(),
        source: 'Health Monitor'
      }
    ]
    
    setAlerts(mockAlerts)
    setIsLoading(false)
  }, [])

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'error': return '🚨'
      case 'warning': return '⚠️'
      case 'success': return '✅'
      default: return 'ℹ️'
    }
  }

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'error': return 'border-red-500 bg-red-900/20'
      case 'warning': return 'border-yellow-500 bg-yellow-900/20'
      case 'success': return 'border-green-500 bg-green-900/20'
      default: return 'border-blue-500 bg-blue-900/20'
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white">Loading Alerts...</h2>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">System Alerts</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              {alerts.length} total alerts
            </div>
            <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              Mark All Read
            </button>
          </div>
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['error', 'warning', 'info', 'success'].map(level => {
            const count = alerts.filter(a => a.level === level).length
            return (
              <div key={level} className="dashboard-card text-center">
                <div className="text-2xl mb-2">{getAlertIcon(level)}</div>
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-sm text-gray-400 capitalize">{level}</div>
              </div>
            )
          })}
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="dashboard-card text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Active Alerts</h3>
              <p className="text-gray-400">All systems are running smoothly</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div 
                key={alert.id}
                className={`border-l-4 rounded-lg p-6 transition-all hover:shadow-lg ${getAlertColor(alert.level)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{getAlertIcon(alert.level)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                      <p className="text-gray-300 mt-1">{alert.message}</p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-400">
                        <span>Source: {alert.source}</span>
                        <span>•</span>
                        <span>{new Date(alert.time).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600">
                      Dismiss
                    </button>
                    <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
