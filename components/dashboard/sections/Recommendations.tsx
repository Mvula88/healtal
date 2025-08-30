import { motion } from 'framer-motion'
import { Sparkles, Brain, Users, BookOpen, Heart, Target, TrendingUp, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface RecommendationsProps {
  userProfile?: any
}

export function Recommendations({ userProfile }: RecommendationsProps) {
  const recommendations = [
    {
      id: '1',
      category: 'AI Insight',
      title: 'Pattern Analysis Ready',
      description: 'Based on your recent check-ins, we\'ve identified potential breakthrough areas',
      action: 'Start Analysis',
      href: '/coach',
      icon: Brain,
      color: 'from-purple-500 to-indigo-600',
      priority: 'high',
      reason: 'Multiple similar patterns detected'
    },
    {
      id: '2',
      category: 'Healing Circle',
      title: 'Perfect Match Found',
      description: 'Sarah\'s Anxiety Recovery group aligns with your healing goals',
      action: 'View Group',
      href: '/healing-circles/anxiety-recovery',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      priority: 'high',
      match: '94% compatibility'
    },
    {
      id: '3',
      category: 'Growth Path',
      title: 'Continue Your Journey',
      description: 'You\'re 67% through "Breaking Free from Patterns" - keep the momentum!',
      action: 'Resume Path',
      href: '/journeys/breaking-patterns',
      icon: Target,
      color: 'from-teal-500 to-cyan-600',
      priority: 'medium',
      progress: 67
    },
    {
      id: '4',
      category: 'Resource',
      title: 'New Tool Available',
      description: 'Mindfulness meditation guide for managing daily stress',
      action: 'Explore Tool',
      href: '/tools/mindfulness',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      priority: 'low',
      duration: '10 min'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Personalized for You</h2>
        </div>
        <Button variant="ghost" size="sm">
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all">
                <div className={`p-3 bg-gradient-to-r ${rec.color} rounded-lg shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getPriorityColor(rec.priority)}`}>
                          {rec.category}
                        </span>
                        {rec.match && (
                          <span className="text-xs text-green-600 font-medium">
                            {rec.match}
                          </span>
                        )}
                        {rec.duration && (
                          <span className="text-xs text-gray-500">
                            {rec.duration}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 group-hover:text-teal-600 transition-colors">
                        {rec.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {rec.description}
                  </p>

                  {rec.reason && (
                    <p className="text-xs text-gray-500 italic mb-2">
                      💡 {rec.reason}
                    </p>
                  )}

                  {rec.progress && (
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${rec.progress}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 h-1.5 rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  <Link href={rec.href}>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 -ml-2"
                    >
                      {rec.action}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            Recommendations update based on your activity
          </span>
          <button className="text-teal-600 hover:text-teal-700 font-medium">
            Customize →
          </button>
        </div>
      </div>
    </Card>
  )
}