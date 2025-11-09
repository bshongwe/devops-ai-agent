'use client'

export default function ApplicationMetrics() {
  return (
    <div className="dashboard-card">
      <h3 className="text-lg font-semibold text-white mb-4">Application Metrics</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">GitHub Webhooks</span>
          <span className="text-white font-mono">142</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Pipeline Executions</span>
          <span className="text-white font-mono">28</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">ArgoCD Syncs</span>
          <span className="text-white font-mono">15</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">API Endpoints</span>
          <span className="text-green-400 font-mono">12 Active</span>
        </div>
      </div>
    </div>
  )
}
