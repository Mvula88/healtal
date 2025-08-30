import { motion } from 'framer-motion'
import { TrendingUp, Activity } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useState } from 'react'

interface ProgressChartProps {
  data: any
}

export function ProgressChart({ data }: ProgressChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  
  // Mock data for visualization
  const chartData = {
    '7d': [65, 70, 68, 72, 75, 73, 78],
    '30d': Array.from({ length: 30 }, (_, i) => 60 + Math.sin(i * 0.5) * 15 + i * 0.5),
    '90d': Array.from({ length: 90 }, (_, i) => 55 + Math.sin(i * 0.2) * 20 + i * 0.3)
  }

  const currentData = chartData[timeRange]
  const maxValue = Math.max(...currentData)
  const minValue = Math.min(...currentData)
  const range = maxValue - minValue

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Progress Overview</h2>
        </div>
        
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between space-x-1">
          {currentData.map((value, index) => {
            const height = ((value - minValue) / range) * 100
            return (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: index * 0.02 }}
                className="flex-1 bg-gradient-to-t from-teal-500 to-cyan-400 rounded-t-lg hover:from-teal-600 hover:to-cyan-500 transition-colors relative group"
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {value.toFixed(0)}%
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[100, 75, 50, 25, 0].map((percent) => (
            <div key={percent} className="flex items-center">
              <span className="text-xs text-gray-400 w-8">{percent}%</span>
              <div className="flex-1 border-t border-gray-100 ml-2" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-green-500 rounded-full" />
            <span className="text-sm text-gray-600">Growth Rate</span>
            <span className="text-sm font-semibold text-gray-900">+23%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-blue-500 rounded-full" />
            <span className="text-sm text-gray-600">Consistency</span>
            <span className="text-sm font-semibold text-gray-900">87%</span>
          </div>
        </div>
        
        <div className="flex items-center text-green-600 text-sm font-medium">
          <TrendingUp className="h-4 w-4 mr-1" />
          Trending up
        </div>
      </div>
    </Card>
  )
}