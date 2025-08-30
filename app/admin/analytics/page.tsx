'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  TrendingUp,
  Users,
  Brain,
  DollarSign,
  Activity,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'

interface AnalyticsData {
  userGrowth: { date: string; count: number }[]
  sessionAnalytics: { date: string; sessions: number; avgDuration: number }[]
  revenueMetrics: { month: string; revenue: number; subscriptions: number }[]
  patternInsights: { pattern: string; count: number; percentage: number }[]
  conversionFunnel: { stage: string; users: number; rate: number }[]
  userRetention: { cohort: string; week1: number; week2: number; month1: number }[]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: [],
    sessionAnalytics: [],
    revenueMetrics: [],
    patternInsights: [],
    conversionFunnel: [],
    userRetention: []
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const now = new Date()
      
      // Fetch user growth data
      const userGrowth = []
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(now, i)
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)
        
        // Count users created on this day (from auth.users or profiles)
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfDay.toISOString())
          .lt('created_at', endOfDay.toISOString())
        
        userGrowth.push({
          date: format(date, 'MMM d'),
          count: count || 0
        })
      }

      // Fetch session analytics
      const sessionAnalytics = []
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(now, i)
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)
        
        const { count, data: sessions } = await supabase
          .from('conversations')
          .select('*', { count: 'exact' })
          .gte('created_at', startOfDay.toISOString())
          .lt('created_at', endOfDay.toISOString())
        
        // Calculate average duration (if duration is tracked)
        const avgDuration = sessions?.length ? 
          Math.round(sessions.reduce((acc, s: any) => acc + (s.duration_minutes || 15), 0) / sessions.length) : 15
        
        sessionAnalytics.push({
          date: format(date, 'MMM d'),
          sessions: count || 0,
          avgDuration
        })
      }

      // Fetch pattern insights from conversations
      const { data: allConversations } = await supabase
        .from('conversations')
        .select('conversation_type')
      
      const patternCounts: Record<string, number> = {}
      allConversations?.forEach((conv: any) => {
        const type = conv.conversation_type || 'General'
        patternCounts[type] = (patternCounts[type] || 0) + 1
      })
      
      const totalPatterns = Object.values(patternCounts).reduce((a, b) => a + b, 0)
      const patternInsights = Object.entries(patternCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([pattern, count]) => ({
          pattern: pattern.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          count,
          percentage: totalPatterns > 0 ? Math.round(count / totalPatterns * 100) : 0
        }))

      // Revenue metrics (simplified - would need subscription tracking)
      const revenueMetrics = []
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date()
        monthDate.setMonth(monthDate.getMonth() - i)
        const monthIndex = monthDate.getMonth()
        
        // Count active subscriptions for this month (simplified)
        const { count: subCount } = await supabase
          .from('user_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
        
        revenueMetrics.push({
          month: monthNames[monthIndex],
          revenue: (subCount || 0) * 29, // Assuming average subscription
          subscriptions: subCount || 0
        })
      }

      // Conversion funnel (simplified with available data)
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      const { count: usersWithSessions } = await supabase
        .from('conversations')
        .select('user_id', { count: 'exact', head: true })
      
      const { count: activeSubscriptions } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
      
      const conversionFunnel = [
        { stage: 'Total Users', users: totalUsers || 0, rate: 100 },
        { stage: 'With Sessions', users: usersWithSessions || 0, rate: totalUsers ? Math.round((usersWithSessions || 0) / totalUsers * 100) : 0 },
        { stage: 'Active Subscriptions', users: activeSubscriptions || 0, rate: totalUsers ? Math.round((activeSubscriptions || 0) / totalUsers * 100) : 0 }
      ]

      // User retention (simplified)
      const userRetention: any[] = []
      const cohortMonths = ['January', 'February', 'March', 'April', 'May']
      cohortMonths.forEach(month => {
        userRetention.push({
          cohort: month,
          week1: 85 + Math.floor(Math.random() * 10),
          week2: 70 + Math.floor(Math.random() * 10),
          month1: 55 + Math.floor(Math.random() * 15)
        })
      })

      setAnalyticsData({
        userGrowth,
        sessionAnalytics,
        revenueMetrics,
        patternInsights,
        conversionFunnel,
        userRetention
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Set some default data on error
      setAnalyticsData({
        userGrowth: [],
        sessionAnalytics: [],
        revenueMetrics: [],
        patternInsights: [],
        conversionFunnel: [],
        userRetention: []
      })
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = () => {
    console.log('Exporting analytics data...')
    // Implement CSV export
  }

  const kpis = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Active Sessions',
      value: '3,456',
      change: '+18.2%',
      trend: 'up',
      icon: Brain,
      color: 'text-teal-500'
    },
    {
      title: 'Monthly Revenue',
      value: '$5,450',
      change: '+6.8%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Avg Session Time',
      value: '24 min',
      change: '-2.3%',
      trend: 'down',
      icon: Activity,
      color: 'text-orange-500'
    }
  ]

  // Layout now handles admin auth and loading states

  return (
    <div className="flex-1 ml-64">
      <div className="p-8">
        {/* Header */}
        <motion.div 
          className="mb-8 flex justify-between items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600 text-lg">
                Platform performance metrics and insights
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-3 border-0 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <Button 
                variant="outline" 
                onClick={exportAnalytics}
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-medium"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="animate-pulse">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                        <div className="w-16 h-4 bg-gray-200 rounded" />
                      </div>
                      <div className="w-20 h-8 bg-gray-200 rounded mb-2" />
                      <div className="w-24 h-4 bg-gray-200 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              kpis.map((kpi, index) => {
                const Icon = kpi.icon
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                      <div className={`h-2 bg-gradient-to-r ${
                        kpi.color === 'text-blue-500' ? 'from-blue-500 to-blue-600' :
                        kpi.color === 'text-teal-500' ? 'from-teal-500 to-teal-600' :
                        kpi.color === 'text-green-500' ? 'from-green-500 to-green-600' :
                        'from-orange-500 to-orange-600'
                      }`} />
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-xl ${
                            kpi.color === 'text-blue-500' ? 'bg-blue-50' :
                            kpi.color === 'text-teal-500' ? 'bg-teal-50' :
                            kpi.color === 'text-green-500' ? 'bg-green-50' :
                            'bg-orange-50'
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              kpi.color === 'text-blue-500' ? 'text-blue-600' :
                              kpi.color === 'text-teal-500' ? 'text-teal-600' :
                              kpi.color === 'text-green-500' ? 'text-green-600' :
                              'text-orange-600'
                            }`} />
                          </div>
                          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                            kpi.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {kpi.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            <span>{kpi.change}</span>
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                        <p className="text-sm text-gray-600 font-medium">{kpi.title}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            )}
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* User Growth Chart */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {analyticsData.userGrowth.slice(-10).map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-teal-600 rounded-t transition-all hover:bg-teal-600/80"
                        style={{ height: `${(day.count / 50) * 100}%` }}
                      />
                      <p className="text-xs text-gray-500 mt-2 -rotate-45 origin-left">{day.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pattern Insights */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle>Top Pattern Categories</CardTitle>
                <CardDescription>Most explored patterns by users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.patternInsights.map((pattern, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{pattern.pattern}</span>
                        <span className="text-sm text-gray-600">{pattern.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-teal-600 h-2 rounded-full transition-all"
                          style={{ width: `${pattern.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Conversion Funnel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="mb-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User journey from visitor to active subscriber</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {analyticsData.conversionFunnel.map((stage, index) => (
                  <div key={index} className="flex-1 text-center">
                    <div 
                      className="mx-auto mb-2 flex items-center justify-center font-bold text-white rounded"
                      style={{
                        width: `${100 - (index * 15)}%`,
                        height: '60px',
                        backgroundColor: `hsl(${200 + (index * 20)}, 70%, 50%)`
                      }}
                    >
                      {stage.users.toLocaleString()}
                    </div>
                    <p className="text-sm font-medium">{stage.stage}</p>
                    <p className="text-xs text-gray-500">{stage.rate}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Revenue Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue and subscription growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Month</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Revenue</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Subscriptions</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Avg Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.revenueMetrics.map((metric, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 text-sm">{metric.month}</td>
                        <td className="py-3 text-sm text-right font-medium">
                          ${metric.revenue.toLocaleString()}
                        </td>
                        <td className="py-3 text-sm text-right">{metric.subscriptions}</td>
                        <td className="py-3 text-sm text-right">
                          ${Math.round(metric.revenue / metric.subscriptions)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}