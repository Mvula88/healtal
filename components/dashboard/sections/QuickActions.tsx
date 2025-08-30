import { motion } from 'framer-motion'
import Link from 'next/link'
import { Brain, CheckCircle, Compass, Users, Heart, Shield, TrendingUp, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function QuickActions() {
  const actions = [
    {
      title: 'AI Coach',
      description: 'Start a deep analysis session',
      icon: Brain,
      href: '/coach',
      color: 'from-purple-500 to-indigo-600',
      popular: true
    },
    {
      title: 'Daily Check-in',
      description: 'Track your mood & energy',
      icon: CheckCircle,
      href: '/checkin',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Growth Paths',
      description: 'Continue your journey',
      icon: Compass,
      href: '/journeys',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      title: 'Healing Circles',
      description: 'Join peer support groups',
      icon: Users,
      href: '/healing-circles',
      color: 'from-blue-500 to-indigo-600',
      new: true
    }
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <Link href="/features">
          <span className="text-sm text-teal-600 hover:text-teal-700 font-medium cursor-pointer">
            View all →
          </span>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href={action.href}>
                <div className="relative group cursor-pointer">
                  {action.popular && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full z-10">
                      Popular
                    </span>
                  )}
                  {action.new && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full z-10">
                      NEW
                    </span>
                  )}
                  <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all duration-300">
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1">{action.title}</h3>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}