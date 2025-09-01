'use client'

import { useState, useEffect, Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navigation/navbar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LayoutDashboard, 
  Sparkles, 
  BarChart3,
  Settings,
  ChevronRight,
  Brain,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Lazy load components for better performance
const DashboardHeader = lazy(() => import('@/components/dashboard/sections/DashboardHeader').then(m => ({ default: m.DashboardHeader })))
const QuickStats = lazy(() => import('@/components/dashboard/sections/QuickStats').then(m => ({ default: m.QuickStats })))
const QuickActions = lazy(() => import('@/components/dashboard/sections/QuickActions').then(m => ({ default: m.QuickActions })))
const ActiveGoals = lazy(() => import('@/components/dashboard/sections/ActiveGoals').then(m => ({ default: m.ActiveGoals })))
const ProgressChart = lazy(() => import('@/components/dashboard/sections/ProgressChart').then(m => ({ default: m.ProgressChart })))
const RecentActivity = lazy(() => import('@/components/dashboard/sections/RecentActivity').then(m => ({ default: m.RecentActivity })))
const UpcomingEvents = lazy(() => import('@/components/dashboard/sections/UpcomingEvents').then(m => ({ default: m.UpcomingEvents })))
const Recommendations = lazy(() => import('@/components/dashboard/sections/Recommendations').then(m => ({ default: m.Recommendations })))
const LoadingState = lazy(() => import('@/components/dashboard/sections/LoadingState').then(m => ({ default: m.LoadingState })))

function DashboardContent() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      redirect('/login')
    }
  }, [user, authLoading])

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return
      
      setLoading(true)
      try {
        // Fetch real data from APIs
        const [statsRes, journeysRes, sessionsRes, checkinsRes] = await Promise.all([
          fetch('/api/user/stats'),
          fetch('/api/journeys'),
          fetch('/api/sessions'),
          fetch('/api/checkins')
        ])

        const [stats, journeys, sessions, checkins] = await Promise.all([
          statsRes.json(),
          journeysRes.json(),
          sessionsRes.json(),
          checkinsRes.json()
        ])

        // Calculate real stats from data
        const currentStreak = calculateStreak(checkins.checkins || [])
        const totalSessions = sessions.sessions?.length || 0
        const moodScores = (checkins.checkins || []).map((c: any) => c.mood_score).filter(Boolean)
        const moodAverage = moodScores.length > 0 
          ? (moodScores.reduce((a: number, b: number) => a + b, 0) / moodScores.length).toFixed(1)
          : 0

        // Convert journeys to goals format
        const goals = (journeys.journeys || []).filter((j: any) => j.status === 'active').map((journey: any) => ({
          id: journey.id,
          title: journey.title,
          deadline: journey.estimated_completion ? 
            formatDistanceToNow(new Date(journey.estimated_completion)) : 'No deadline',
          progress: journey.completedSteps || 0,
          target: journey.totalSteps || 1
        }))

        setDashboardData({
          stats: {
            currentStreak,
            totalSessions,
            breakthroughs: stats.breakthroughs || 0,
            moodAverage,
            weeklyProgress: stats.weeklyProgress || 0
          },
          goals,
          sessions: sessions.sessions || [],
          checkins: checkins.checkins || [],
          journeys: journeys.journeys || []
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Set empty data on error
        setDashboardData({
          stats: {
            currentStreak: 0,
            totalSessions: 0,
            breakthroughs: 0,
            moodAverage: 0,
            weeklyProgress: 0
          },
          goals: [],
          sessions: [],
          checkins: [],
          journeys: []
        })
      } finally {
        setLoading(false)
      }
    }

    const calculateStreak = (checkins: any[]) => {
      if (!checkins.length) return 0
      
      const sortedCheckins = [...checkins].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      
      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      for (let i = 0; i < sortedCheckins.length; i++) {
        const checkinDate = new Date(sortedCheckins[i].created_at)
        checkinDate.setHours(0, 0, 0, 0)
        
        const daysDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === streak) {
          streak++
        } else {
          break
        }
      }
      
      return streak
    }

    const formatDistanceToNow = (date: Date) => {
      const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (days <= 0) return 'Overdue'
      if (days === 1) return '1 day'
      if (days <= 7) return `${days} days`
      if (days <= 30) return `${Math.ceil(days / 7)} weeks`
      return `${Math.ceil(days / 30)} months`
    }

    if (user) {
      loadDashboardData()
    }
  }, [user])

  if (authLoading || loading) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <LoadingState />
      </Suspense>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Welcome Section with Featured Actions and Beneathy Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
        >
          {/* Beneathy Logo Watermark */}
          <div className="absolute top-4 right-4 opacity-20">
            <Image 
              src="/beneathy-logo.png" 
              alt="Beneathy" 
              width={120} 
              height={120}
              className="object-contain"
            />
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h1 className="text-4xl font-bold mb-3">
                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Friend'}! 
              </h1>
              <p className="text-teal-50 text-lg mb-4">
                Your journey to healing continues with Beneathy. Let's make today count.
              </p>
              <div className="flex gap-3">
                <Link href="/coach">
                  <button className="bg-white text-teal-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-teal-50 transition-colors shadow-lg flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Start AI Session
                  </button>
                </Link>
                <Link href="/checkin">
                  <button className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors border border-teal-400 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Daily Check-in
                  </button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                <div className="text-3xl font-bold mb-1">Day 7</div>
                <div className="text-teal-100 text-sm">Current Streak</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Features</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="space-y-6">
              {/* Quick Actions - MOVED TO TOP AND MADE PROMINENT */}
              <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
                <QuickActions />
              </Suspense>

              {/* Quick Stats */}
              <Suspense fallback={<div className="h-32 bg-gray-100 rounded-lg animate-pulse" />}>
                <QuickStats stats={dashboardData?.stats} />
              </Suspense>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
                    <ProgressChart data={dashboardData} />
                  </Suspense>
                  
                  <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
                    <RecentActivity />
                  </Suspense>

                  <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
                    <UpcomingEvents />
                  </Suspense>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                  <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
                    <ActiveGoals goals={dashboardData?.goals} />
                  </Suspense>

                  <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
                    <Recommendations userProfile={user?.user_metadata} />
                  </Suspense>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
                    <QuickActions />
                  </Suspense>
                  
                  <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
                    <Recommendations userProfile={user?.user_metadata} />
                  </Suspense>
                </div>

                <div className="mt-6">
                  <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
                    <UpcomingEvents />
                  </Suspense>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Suspense fallback={<div className="h-32 bg-gray-100 rounded-lg animate-pulse" />}>
                  <QuickStats stats={dashboardData?.stats} />
                </Suspense>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
                    <ProgressChart data={dashboardData} />
                  </Suspense>
                  
                  <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
                    <ActiveGoals goals={dashboardData?.goals} />
                  </Suspense>
                </div>

                <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
                  <RecentActivity />
                </Suspense>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        {/* Mobile Quick Access */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden"
        >
          <div className="flex justify-around">
            <button className="flex flex-col items-center space-y-1 text-gray-600 hover:text-teal-600">
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-gray-600 hover:text-teal-600">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs">Features</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-gray-600 hover:text-teal-600">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">Progress</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-gray-600 hover:text-teal-600">
              <Settings className="h-5 w-5" />
              <span className="text-xs">Settings</span>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  )
}