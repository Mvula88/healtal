import { motion } from 'framer-motion'
import { Clock, Brain, Users, Heart, Trophy, MessageCircle, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'

interface RecentActivityProps {
  activities?: any[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  // Mock activities if none provided
  const defaultActivities = [
    {
      id: '1',
      type: 'session',
      title: 'Completed AI Coaching Session',
      description: 'Deep dive into relationship patterns',
      icon: Brain,
      color: 'from-purple-500 to-indigo-600',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      impact: 'breakthrough'
    },
    {
      id: '2',
      type: 'circle',
      title: 'Joined Healing Circle',
      description: 'Anxiety Recovery Group with Sarah M.',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'milestone',
      title: 'Achieved 7-Day Streak',
      description: 'Consistent daily check-ins',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      celebration: true
    },
    {
      id: '4',
      type: 'insight',
      title: 'New Pattern Discovered',
      description: 'Identified stress trigger pattern',
      icon: Zap,
      color: 'from-teal-500 to-cyan-600',
      timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000)
    },
    {
      id: '5',
      type: 'checkin',
      title: 'Morning Check-in',
      description: 'Mood: 8/10, Energy: High',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000)
    }
  ]

  const activityList = activities || defaultActivities

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
          View all →
        </button>
      </div>

      <div className="space-y-4">
        {activityList.map((activity, index) => {
          const Icon = activity.icon
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-start space-x-4 group"
            >
              <div className="relative">
                <div className={`p-2 bg-gradient-to-r ${activity.color} rounded-lg shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                {activity.celebration && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full animate-pulse"
                  />
                )}
                {index < activityList.length - 1 && (
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-gray-200" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-teal-600 transition-colors">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                    {activity.impact && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                        {activity.impact}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Showing 5 most recent activities</span>
          <span className="text-teal-600 font-medium">23 total this week</span>
        </div>
      </div>
    </Card>
  )
}