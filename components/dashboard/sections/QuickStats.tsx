import { motion } from 'framer-motion'
import { TrendingUp, Brain, Zap, Target, Calendar, Heart } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface QuickStatsProps {
  stats: any
}

export function QuickStats({ stats }: QuickStatsProps) {
  const statCards = [
    {
      title: 'Current Streak',
      value: stats?.currentStreak || 0,
      unit: 'days',
      change: '+2',
      trend: 'up',
      icon: Calendar,
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Total Sessions',
      value: stats?.totalSessions || 0,
      unit: 'completed',
      change: '+12%',
      trend: 'up',
      icon: Brain,
      color: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Breakthroughs',
      value: stats?.breakthroughs || 0,
      unit: 'this month',
      change: '+3',
      trend: 'up',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Mood Average',
      value: stats?.moodAverage?.toFixed(1) || '0',
      unit: '/10',
      change: '+0.5',
      trend: 'up',
      icon: Heart,
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Weekly Progress',
      value: stats?.weeklyProgress || 0,
      unit: '%',
      change: '+8%',
      trend: 'up',
      icon: Target,
      color: 'from-teal-500 to-cyan-500'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="p-4 hover:shadow-lg transition-all duration-300 border-gray-100 hover:border-teal-200 group">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                  {stat.change}
                  <TrendingUp className={`h-3 w-3 ml-1 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  <span className="ml-1 text-sm text-gray-500">{stat.unit}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{stat.title}</p>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}