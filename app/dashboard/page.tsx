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
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      setLoading(true)
      // In production, fetch from API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setDashboardData({
        stats: {
          currentStreak: 7,
          totalSessions: 42,
          breakthroughs: 3,
          moodAverage: 7.2,
          weeklyProgress: 85
        },
        goals: [
          {
            id: '1',
            title: 'Complete anxiety management program',
            deadline: '2 weeks',
            progress: 14,
            target: 21
          },
          {
            id: '2',
            title: 'Daily mindfulness practice',
            deadline: '30 days',
            progress: 7,
            target: 30
          },
          {
            id: '3',
            title: 'Join 3 healing circles',
            deadline: '1 month',
            progress: 1,
            target: 3
          }
        ]
      })
      setLoading(false)
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