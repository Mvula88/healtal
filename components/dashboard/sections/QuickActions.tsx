import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Brain, 
  CheckCircle, 
  Compass, 
  Users, 
  Heart, 
  Shield, 
  TrendingUp, 
  BookOpen,
  MessageCircle,
  Target,
  Sparkles,
  Activity,
  Coffee,
  Moon,
  Lightbulb,
  HeartHandshake
} from 'lucide-react'
import { Card } from '@/components/ui/card'

export function QuickActions() {
  const mainActions = [
    {
      title: 'Root Cause Analysis',
      description: 'Discover the deeper origins of your patterns',
      icon: Brain,
      href: '/coach?mode=analysis',
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
      borderColor: 'border-purple-200 hover:border-purple-400',
      popular: true,
      stats: '42 breakthroughs'
    },
    {
      title: 'Just Need to Talk',
      description: 'Safe space to share anything on your mind',
      icon: Coffee,
      href: '/coach?mode=talk',
      color: 'from-rose-500 to-pink-600',
      bgColor: 'bg-gradient-to-br from-rose-50 to-pink-50',
      borderColor: 'border-rose-200 hover:border-rose-400',
      new: true,
      stats: 'Always available'
    },
    {
      title: 'Quick Advice',
      description: 'Get perspective on a specific situation',
      icon: Lightbulb,
      href: '/coach?mode=advice',
      color: 'from-amber-500 to-yellow-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      borderColor: 'border-amber-200 hover:border-amber-400',
      stats: '5 min sessions'
    },
    {
      title: 'Vent & Release',
      description: 'Let it all out without judgment',
      icon: MessageCircle,
      href: '/coach?mode=vent',
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-gradient-to-br from-teal-50 to-cyan-50',
      borderColor: 'border-teal-200 hover:border-teal-400',
      stats: 'No advice, just listening'
    },
    {
      title: 'Daily Check-in',
      description: 'Track your mood, energy, and daily progress',
      icon: CheckCircle,
      href: '/checkin',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      borderColor: 'border-green-200 hover:border-green-400',
      stats: '7 day streak'
    },
    {
      title: 'Late Night Talk',
      description: 'For those 3 AM thoughts you can\'t share',
      icon: Moon,
      href: '/coach?mode=night',
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
      borderColor: 'border-indigo-200 hover:border-indigo-400',
      stats: '24/7 companion'
    },
    {
      title: 'Relationship Help',
      description: 'Navigate complex relationship dynamics',
      icon: HeartHandshake,
      href: '/coach?mode=relationship',
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50',
      borderColor: 'border-pink-200 hover:border-pink-400',
      stats: 'Confidential advice'
    },
    {
      title: 'Pattern Insights',
      description: 'View your behavioral patterns & analytics',
      icon: TrendingUp,
      href: '/insights',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      stats: '12 patterns detected'
    }
  ]

  const secondaryActions = [
    {
      title: 'Community',
      icon: Heart,
      href: '/community',
      color: 'text-pink-600'
    },
    {
      title: 'Growth Journeys',
      icon: Compass,
      href: '/journeys',
      color: 'text-teal-600'
    },
    {
      title: 'Resources',
      icon: BookOpen,
      href: '/resources',
      color: 'text-indigo-600'
    },
    {
      title: 'Wellness Tools',
      icon: Activity,
      href: '/wellness',
      color: 'text-green-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Features Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Quick Actions
          </h2>
          <p className="text-gray-600 mt-1">Your most used features for daily wellness</p>
        </div>
        <Link href="/features">
          <span className="text-sm text-teal-600 hover:text-teal-700 font-medium cursor-pointer bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors">
            View all features →
          </span>
        </Link>
      </div>
      
      {/* Main Action Cards - Large and Prominent */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainActions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={action.href}>
                <Card className={`relative group cursor-pointer h-full ${action.bgColor} ${action.borderColor} border-2 transition-all duration-300 hover:shadow-xl overflow-hidden`}>
                  {/* Badge */}
                  {action.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-bl-lg font-semibold">
                      POPULAR
                    </div>
                  )}
                  {action.new && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1 rounded-bl-lg font-semibold animate-pulse">
                      NEW
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Icon */}
                    <div className={`w-14 h-14 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-teal-700 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {action.description}
                    </p>
                    
                    {/* Stats */}
                    {action.stats && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Activity className="h-3 w-3 mr-1" />
                        {action.stats}
                      </div>
                    )}
                    
                    {/* Hover Arrow */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white rounded-full p-2 shadow-md">
                        <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Background decoration */}
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-white/20 to-white/5 rounded-full blur-2xl" />
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Secondary Actions - Smaller Quick Links */}
      <Card className="p-4 bg-gradient-to-r from-gray-50 to-white border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">More Actions</h3>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-4 gap-3">
          {secondaryActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={action.href}>
                  <div className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group">
                    <Icon className={`h-6 w-6 ${action.color} mb-1 group-hover:scale-110 transition-transform`} />
                    <span className="text-xs text-gray-600 text-center">{action.title}</span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}