'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { useAuth } from '@/contexts/auth-context'
import { APP_CONFIG } from '@/lib/config'
import { createClient } from '@/lib/supabase/client'
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
  XCircle
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
  console.log('AdminPage component rendering...')
  
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  
  // Log user info
  console.log('Current user:', user)
  console.log('User email:', user?.email)
  console.log('Is admin email?', user?.email === 'ismaelmvula@gmail.com')
  
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

  // Don't redirect, just show appropriate content
  const isAdmin = user?.email === 'ismaelmvula@gmail.com'
  
  console.log('Rendering admin page, isAdmin:', isAdmin)
  
  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats()
    }
  }, [isAdmin])
  
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
  
  if (!isAdmin) {
    console.log('NOT ADMIN - Showing access denied')
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Admin Access Required</CardTitle>
            <CardDescription>
              This page is restricted to administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Current user:</strong> {user?.email || 'Not logged in'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Required email:</strong> ismaelmvula@gmail.com
                </p>
              </div>
              <Button 
                onClick={() => {
                  console.log('Back to dashboard clicked')
                  router.push('/dashboard')
                }}
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  console.log('ADMIN ACCESS GRANTED - Showing dashboard')

  const quickActions = [
    { title: 'User Management', icon: Users, href: '/admin/users', color: 'bg-blue-500' },
    { title: 'Content Manager', icon: Brain, href: '/admin/content', color: 'bg-purple-500' },
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
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {APP_CONFIG.name} Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Platform management and analytics • {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">
                    {loading ? '...' : stats.totalUsers.toLocaleString()}
                  </span>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-sm text-green-600 mt-2">
                  {loading ? '...' : `+${stats.newUsersToday} today`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Active Users (7d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">
                    {loading ? '...' : stats.activeUsers.toLocaleString()}
                  </span>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {loading ? '...' : stats.totalUsers > 0 ? `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% engagement` : '0% engagement'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pattern Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">
                    {loading ? '...' : stats.totalSessions.toLocaleString()}
                  </span>
                  <Brain className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-sm text-green-600 mt-2">
                  {loading ? '...' : `+${stats.sessionsToday} today`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">
                    {loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`}
                  </span>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-green-600 mt-2">
                  {loading ? '...' : '+12.5% vs last month'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(action.href)}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-medium text-sm">{action.title}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System Health */}
            <Card>
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
                    <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600 font-medium">Operational</p>
                        <p className="text-xs text-gray-500">{service.uptime} uptime</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
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
                      const iconColor = activity.icon === 'Brain' ? 'text-purple-500' :
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
          </div>

          {/* Alerts Section */}
          {stats.pendingSupport > 0 && (
            <Card className="mt-8 border-orange-200 bg-orange-50">
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
          )}
        </div>
      </div>
    </div>
  )
}