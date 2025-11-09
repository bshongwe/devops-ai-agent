'use client'

import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-white">CI-CD Agent</h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Overview
                </a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Metrics
                </a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Logs
                </a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Alerts
                </a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-slow"></div>
                <span className="text-sm text-gray-300">All Systems Operational</span>
              </div>
              
              {/* Time display */}
              <div className="text-sm text-gray-400">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              CI-CD Agent Dashboard v1.0.0 | Data refreshes every 5 seconds
            </div>
            <div className="flex space-x-4 text-sm text-gray-400">
              <a href="/api/health" className="hover:text-white">Health Check</a>
              <a href="/grafana" className="hover:text-white">Grafana</a>
              <a href="/argocd" className="hover:text-white">ArgoCD</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
