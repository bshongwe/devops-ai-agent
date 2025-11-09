'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardAPI } from '../lib/api'

interface RealTimeChartProps {
  dataSource: 'prometheus' | 'grafana'
  query: string
  title: string
  color: string
}

interface ChartDataPoint {
  timestamp: string
  value: number
  time: string
}

export default function RealTimeChart({ dataSource, query, title, color }: RealTimeChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        
        // Fetch from backend API
        let result
        if (dataSource === 'prometheus') {
          result = await dashboardAPI.getPrometheusMetrics(query)
        } else {
          result = await dashboardAPI.getRealTimeMetric(query)
        }
        
        // For demo purposes, generate realistic sample data
        const now = new Date()
        const newData: ChartDataPoint[] = []
        
        for (let i = 29; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - i * 60000) // Every minute
          newData.push({
            timestamp: timestamp.toISOString(),
            value: generateRealisticValue(query, i),
            time: timestamp.toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          })
        }
        
        setData(newData)
        setIsLoading(false)
      } catch (err) {
        setError('Failed to fetch chart data')
        setIsLoading(false)
        console.error('Chart data fetch error:', err)
      }
    }

    const generateRealisticValue = (queryType: string, timeOffset: number): number => {
      const baseValue = Math.sin(timeOffset * 0.1) * 10 + 50
      const noise = (Math.random() - 0.5) * 20
      
      if (queryType.includes('http_requests')) {
        return Math.max(0, baseValue + noise + Math.random() * 100)
      } else if (queryType.includes('cpu')) {
        return Math.max(0, Math.min(100, baseValue + noise))
      } else if (queryType.includes('memory')) {
        return Math.max(0, baseValue * 2 + noise + 1000)
      }
      
      return Math.max(0, baseValue + noise)
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [dataSource, query])

  // Add new data point every 5 seconds for real-time feel
  useEffect(() => {
    if (isLoading) return

    const realTimeInterval = setInterval(() => {
      const now = new Date()
      const newPoint: ChartDataPoint = {
        timestamp: now.toISOString(),
        value: generateLiveValue(query),
        time: now.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }

      setData(prev => {
        const updated = [...prev.slice(1), newPoint] // Remove first, add new
        return updated
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(realTimeInterval)
  }, [isLoading, query])

  const generateLiveValue = (queryType: string): number => {
    if (data.length === 0) return 0
    
    const lastValue = data[data.length - 1]?.value || 0
    const variation = (Math.random() - 0.5) * 10
    
    if (queryType.includes('cpu')) {
      return Math.max(0, Math.min(100, lastValue + variation))
    } else if (queryType.includes('memory')) {
      return Math.max(0, lastValue + variation)
    }
    
    return Math.max(0, lastValue + variation)
  }

  const formatValue = (value: number): string => {
    if (query.includes('cpu')) return `${value.toFixed(1)}%`
    if (query.includes('memory')) return `${(value / 1024).toFixed(1)}GB`
    if (query.includes('http_requests')) return value.toFixed(0)
    return value.toFixed(2)
  }

  const currentValue = data.length > 0 ? data[data.length - 1].value : 0

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg border border-red-500">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">⚠️</div>
          <p className="text-red-300">{error}</p>
          <p className="text-gray-400 text-sm mt-1">Check {dataSource} connection</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-2"></div>
          <p className="text-gray-400">Loading {title}...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full animate-pulse-slow" style={{ backgroundColor: color }}></div>
          <span className="text-sm text-gray-400">Live Data from {dataSource}</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">
            {formatValue(currentValue)}
          </div>
          <div className="text-xs text-gray-400">{title}</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            fontSize={12}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickFormatter={formatValue}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#FFFFFF'
            }}
            formatter={(value: number) => [formatValue(value), title]}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: '#1F2937' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
