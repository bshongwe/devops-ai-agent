'use client'

export default function AlertsPanel() {
  const alerts = [
    {
      id: 1,
      level: 'info',
      title: 'Prometheus Scraping Active',
      message: 'All metrics targets are being scraped successfully',
      time: '2 minutes ago'
    },
    {
      id: 2,
      level: 'warning',
      title: 'High CPU Usage Detected',
      message: 'CPU usage exceeded 80% for 5 minutes',
      time: '15 minutes ago'
    },
    {
      id: 3,
      level: 'success',
      title: 'ArgoCD Sync Completed',
      message: 'Application deployed successfully to staging',
      time: '1 hour ago'
    }
  ]

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
        <button className="text-sm text-ci-primary hover:text-blue-300">View All</button>
      </div>
      
      <div className="space-y-3">
        {alerts.map(alert => (
          <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              alert.level === 'success' ? 'bg-green-400' :
              alert.level === 'warning' ? 'bg-yellow-400' :
              alert.level === 'error' ? 'bg-red-400' : 'bg-blue-400'
            }`}></div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-white">{alert.title}</h4>
              <p className="text-xs text-gray-400 mt-1">{alert.message}</p>
              <span className="text-xs text-gray-500">{alert.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
