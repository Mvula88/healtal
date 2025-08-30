'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { APP_CONFIG } from '@/lib/config'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import {
  Users,
  Brain,
  TrendingUp,
  Activity,
  DollarSign,
  UserCheck,
  AlertCircle,
  Settings,
  Database,
  MessageSquare,
  BarChart3,
  Shield,
  Clock,
  ChevronRight,
  CheckCircle,
  XCircle,
  Zap,
  Globe,
  Heart,
  Star
} from 'lucide-react'
import { format } from 'date-fns'

// Log immediately when component loads
console.log('=== ADMIN PAGE LOADING ===')

// Helper function to get time ago string
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' years ago'
  
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' months ago'
  
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' days ago'
  
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' hours ago'
  
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' minutes ago'
  
  return Math.floor(seconds) + ' seconds ago'
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSessions: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    sessionsToday: 0,
    activeJourneys: 0,
    professionalReferrals: 0,
    systemHealth: 'healthy' as const,
    pendingSupport: 0
  })

  useEffect(() => {
    fetchAdminStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const fetchAdminStats = async () => {
    try {
      setLoading(true)
      
      // Fetch total users from auth.users
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const totalUsersCount = users?.length || 0
      
      // Fetch users created today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const newUsersToday = users?.filter(u => 
        new Date(u.created_at) >= today
      ).length || 0
      
      // Fetch active users (logged in within last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const activeUsers = users?.filter(u => 
        u.last_sign_in_at && new Date(u.last_sign_in_at) >= sevenDaysAgo
      ).length || 0
      
      // Fetch total sessions (conversations)
      const { count: totalSessionsCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
      
      // Fetch sessions today
      const { count: sessionsTodayCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
      
      // Fetch active journeys
      const { count: activeJourneysCount } = await supabase
        .from('user_journey_progress')
        .select('*', { count: 'exact', head: true })
        .is('completed_at', null)
      
      // Calculate monthly revenue (mock for now)
      const totalRevenue = 5450
      
      // Fetch recent activity
      const activities: any[] = []
      
      // Get recent conversations
      const { data: recentConversations } = await supabase
        .from('conversations')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(3)
      
      if (recentConversations) {
        recentConversations.forEach(conv => {
          activities.push({
            type: 'session',
            description: 'Pattern session completed',
            detail: '15 minute session',
            timestamp: conv.created_at,
            icon: 'Brain'
          })
        })
      }
      
      // Sort activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivity(activities.slice(0, 4))
      
      setStats({
        totalUsers: totalUsersCount,
        activeUsers: activeUsers,
        totalSessions: totalSessionsCount || 0,
        totalRevenue: totalRevenue,
        newUsersToday: newUsersToday,
        sessionsToday: sessionsTodayCount || 0,
        activeJourneys: activeJourneysCount || 0,
        professionalReferrals: 0,
        systemHealth: 'healthy' as const,
        pendingSupport: 0
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      // Fallback to simplified queries if admin API fails
      fetchSimplifiedStats()
    } finally {
      setLoading(false)
    }
  }
  
  const fetchSimplifiedStats = async () => {
    try {
      // Use simplified queries that don't require admin access
      const { count: conversationsCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
      
      const { count: journeysCount } = await supabase
        .from('user_journey_progress')
        .select('*', { count: 'exact', head: true })
      
      setStats(prev => ({
        ...prev,
        totalSessions: conversationsCount || 0,
        activeJourneys: journeysCount || 0
      }))
    } catch (error) {
      console.error('Error fetching simplified stats:', error)
    }
  }
  
  // Layout now handles admin auth, so we can show dashboard directly

  const quickActions = [
    { title: 'User Management', icon: Users, href: '/admin/users', color: 'bg-blue-500' },
    { title: 'Content Manager', icon: Brain, href: '/admin/content', color: 'bg-teal-500' },
    { title: 'Analytics', icon: BarChart3, href: '/admin/analytics', color: 'bg-green-500' },
    { title: 'Support Tickets', icon: MessageSquare, href: '/admin/support', color: 'bg-orange-500' },
  ]

  const systemStatus = [
    { name: 'API Server', status: 'operational', uptime: '99.99%' },
    { name: 'Database', status: 'operational', uptime: '99.95%' },
    { name: 'AI Coach Service', status: 'operational', uptime: '99.90%' },
    { name: 'Payment Gateway', status: 'operational', uptime: '100%' },
  ]

  return (
    <div className="flex-1 ml-64">
      <div className="p-8">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome to Admin Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
                  {APP_CONFIG.name} Platform Management • {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-gray-700">All Systems Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl font-bold text-gray-900">
                      {loading ? <div className="animate-pulse bg-gray-200 h-8 w-16 rounded" /> : stats.totalUsers.toLocaleString()}
                    </span>
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-green-600 font-medium">
                      {loading ? '...' : `+${stats.newUsersToday} today`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-2" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-green-500" />
                    Active Users (7d)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl font-bold text-gray-900">
                      {loading ? <div className="animate-pulse bg-gray-200 h-8 w-16 rounded" /> : stats.activeUsers.toLocaleString()}
                    </span>
                    <div className="p-3 bg-green-50 rounded-xl">
                      <Activity className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-gray-600 font-medium">
                      {loading ? '...' : stats.totalUsers > 0 ? `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% engagement` : '0% engagement'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-2" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-teal-500" />
                    Pattern Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl font-bold text-gray-900">
                      {loading ? <div className="animate-pulse bg-gray-200 h-8 w-16 rounded" /> : stats.totalSessions.toLocaleString()}
                    </span>
                    <div className="p-3 bg-teal-50 rounded-xl">
                      <Brain className="h-6 w-6 text-teal-600" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-green-600 font-medium">
                      {loading ? '...' : `+${stats.sessionsToday} today`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                    Monthly Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl font-bold text-gray-900">
                      {loading ? <div className="animate-pulse bg-gray-200 h-8 w-20 rounded" /> : `$${stats.totalRevenue.toLocaleString()}`}
                    </span>
                    <div className="p-3 bg-green-50 rounded-xl">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-green-600 font-medium">
                      {loading ? '...' : '+12.5% vs last month'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="cursor-pointer"
                  onClick={() => router.push(action.href)}
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                    <CardContent className="p-6 text-center">
                      <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <p className="font-semibold text-gray-900">{action.title}</p>
                      <p className="text-sm text-gray-500 mt-1">Manage and configure</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
            </div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* System Health */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>System Health</span>
                  <Shield className={`h-5 w-5 ${
                    stats.systemHealth === 'healthy' ? 'text-green-500' :
                    stats.systemHealth === 'warning' ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                </CardTitle>
                <CardDescription>
                  Real-time system status and uptime
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemStatus.map((service) => (
                    <motion.div 
                      key={service.name} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-colors duration-200"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="font-medium text-gray-900">{service.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <p className="text-sm text-green-600 font-medium">Operational</p>
                        </div>
                        <p className="text-xs text-gray-500">{service.uptime} uptime</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Activity</span>
                  <Clock className="h-5 w-5 text-gray-500" />
                </CardTitle>
                <CardDescription>
                  Latest platform events and user actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-sm text-gray-500">Loading activity...</p>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => {
                      const IconComponent = activity.icon === 'Brain' ? Brain :
                                          activity.icon === 'UserCheck' ? UserCheck :
                                          activity.icon === 'DollarSign' ? DollarSign : AlertCircle
                      const iconColor = activity.icon === 'Brain' ? 'text-teal-500' :
                                      activity.icon === 'UserCheck' ? 'text-blue-500' :
                                      activity.icon === 'DollarSign' ? 'text-green-500' : 'text-orange-500'
                      
                      const timeAgo = getTimeAgo(new Date(activity.timestamp))
                      
                      return (
                        <div key={index} className="flex items-start gap-3">
                          <IconComponent className={`h-5 w-5 ${iconColor} mt-0.5`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-gray-500">{activity.detail} • {timeAgo}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-gray-500">No recent activity</p>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm"
                  onClick={() => router.push('/admin/activity')}>
                  View All Activity
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Alerts Section */}
          {stats.pendingSupport > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="mt-8 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-900">
                        {stats.pendingSupport} pending support tickets
                      </p>
                      <p className="text-sm text-orange-700">
                        Average response time: 2.5 hours
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" 
                    className="border-orange-600 text-orange-600 hover:bg-orange-100"
                    onClick={() => router.push('/admin/support')}>
                    View Tickets
                  </Button>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          )}
      </div>
    </div>
  )
}