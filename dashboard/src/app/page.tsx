'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import MetricsOverview from '../components/MetricsOverview'
import SystemHealth from '../components/SystemHealth'
import ApplicationMetrics from '../components/ApplicationMetrics'
import InfrastructureMetrics from '../components/InfrastructureMetrics'
import RealTimeChart from '../components/RealTimeChart'
import AlertsPanel from '../components/AlertsPanel'

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    // Set up periodic updates
    const updateInterval = setInterval(() => {
      setLastUpdate(new Date())
    }, 5000) // Update every 5 seconds

    return () => {
      clearTimeout(timer)
      clearInterval(updateInterval)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Loading Dashboard...</h2>
          <p className="text-gray-400">Connecting to monitoring services</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">CI-CD Agent Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-ci-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
              Refresh All
            </button>
            <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              Settings
            </button>
          </div>
        </div>

        {/* System Health Overview */}
        <SystemHealth />

        {/* Key Metrics Grid */}
        <MetricsOverview />

        {/* Real-time Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
        </div>

        {/* Application and Infrastructure Metrics */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ApplicationMetrics />
          <InfrastructureMetrics />
        </div>

        {/* Alerts and Notifications */}
        <AlertsPanel />
      </div>
    </DashboardLayout>
  )
}
