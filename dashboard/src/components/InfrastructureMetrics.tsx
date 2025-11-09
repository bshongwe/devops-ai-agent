'use client'

export default function InfrastructureMetrics() {
  return (
    <div className="dashboard-card">
      <h3 className="text-lg font-semibold text-white mb-4">Infrastructure Status</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">PostgreSQL Connections</span>
          <span className="text-green-400 font-mono">8/100</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Redis Memory Usage</span>
          <span className="text-yellow-400 font-mono">245MB</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Docker Containers</span>
          <span className="text-green-400 font-mono">6 Running</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Kubernetes Pods</span>
          <span className="text-green-400 font-mono">4 Ready</span>
        </div>
      </div>
    </div>
  )
}
