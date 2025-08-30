'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navigation/navbar'
import { MiniReferralPrompt } from '@/components/professional-referral'
import { FeatureHub } from '@/components/dashboard/feature-hub'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { APP_CONFIG } from '@/lib/config'
import { 
  Brain, 
  Heart, 
  Compass, 
  BookOpen,
  TrendingUp,
  Calendar,
  ChevronRight,
  Sparkles,
  Activity,
  Target,
  Lightbulb,
  Search,
  Shield,
  TreePine,
  Users,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Clock,
  Award,
  Flame,
  Zap,
  XCircle,
  Plus
} from 'lucide-react'
import { format } from 'date-fns'

interface WellnessEntry {
  id: string
  mood_score: number
  energy_level: number
  created_at: string
}

interface Conversation {
  id: string
  title: string
  created_at: string
  conversation_type: string
}

interface Journey {
  id: string
  journey_id: string
  current_step: number
  started_at: string
  journey: {
    name: string
    steps: any[]
    estimated_duration_weeks: number
  }
}

interface RecoveryData {
  sobrietyDate: string | null
  currentStreak: number
  selectedAddiction: string | null
  haltStatus: {
    hungry: boolean | null
    angry: boolean | null
    lonely: boolean | null
    tired: boolean | null
  }
  cravingIntensity: number
  triggers: string[]
  nextMilestone: {
    days: number
    label: string
    badge: string
  } | null
}

interface PatternInsight {
  id: string
  pattern_name: string
  frequency: string | null
  triggers: any
  impacts: any
  created_at: string
}

function DashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [wellnessData, setWellnessData] = useState<WellnessEntry[]>([])
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([])
  const [activeJourneys, setActiveJourneys] = useState<Journey[]>([])
  const [affirmation, setAffirmation] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [recoveryData, setRecoveryData] = useState<RecoveryData>({
    sobrietyDate: null,
    currentStreak: 0,
    selectedAddiction: null,
    haltStatus: { hungry: null, angry: null, lonely: null, tired: null },
    cravingIntensity: 0,
    triggers: [],
    nextMilestone: null
  })
  const [patternInsights, setPatternInsights] = useState<PatternInsight[]>([])
  const [hasRecoveryData, setHasRecoveryData] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      checkAdminStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const checkAdminStatus = async () => {
    // Simply check if the user email matches admin email
    // Bypass database check to avoid infinite recursion error
    console.log('Admin check for user:', user?.email)
    const adminStatus = user?.email === 'ismaelmvula@gmail.com'
    console.log('Is admin?', adminStatus)
    setIsAdmin(adminStatus)
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch wellness entries
      const { data: wellness } = await supabase
        .from('wellness_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(7)

      if (wellness) setWellnessData(wellness)

      // Fetch recent conversations
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (conversations) setRecentConversations(conversations)

      // Fetch active journeys
      const { data: journeys } = await supabase
        .from('user_journey_progress')
        .select(`
          *,
          journey:growth_journeys(
            name,
            steps,
            estimated_duration_weeks
          )
        `)
        .eq('user_id', user?.id)
        .is('completed_at', null)

      if (journeys) setActiveJourneys(journeys as any)

      // Fetch daily affirmation
      const { data: affirmations } = await supabase
        .from('daily_affirmations')
        .select('affirmation')
      
      if (affirmations && affirmations.length > 0) {
        const randomIndex = Math.floor(Math.random() * affirmations.length)
        setAffirmation(affirmations[randomIndex].affirmation)
      }

      // Fetch pattern insights
      const { data: patterns } = await supabase
        .from('pattern_analysis')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (patterns) setPatternInsights(patterns)

      // Check for recovery data by looking at user preferences
      const { data: userData } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', user?.id)
        .single()

      if (userData?.preferences) {
        const prefs = userData.preferences as any
        if (prefs.recovery) {
          setHasRecoveryData(true)
          const sobrietyDate = prefs.recovery.sobrietyDate ? new Date(prefs.recovery.sobrietyDate) : null
          const currentStreak = sobrietyDate ? Math.floor((new Date().getTime() - sobrietyDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
          
          const milestones = [
            { days: 1, label: '24 Hours', badge: '🌱' },
            { days: 3, label: '3 Days', badge: '🌿' },
            { days: 7, label: '1 Week', badge: '🌳' },
            { days: 30, label: '1 Month', badge: '⭐' },
            { days: 90, label: '3 Months', badge: '✨' },
            { days: 365, label: '1 Year', badge: '🏆' }
          ]
          
          const nextMilestone = milestones.find(m => currentStreak < m.days)
          
          setRecoveryData({
            sobrietyDate: prefs.recovery.sobrietyDate || null,
            currentStreak,
            selectedAddiction: prefs.recovery.addictionType || null,
            haltStatus: prefs.recovery.lastHaltCheck || { hungry: null, angry: null, lonely: null, tired: null },
            cravingIntensity: prefs.recovery.lastCravingIntensity || 0,
            triggers: prefs.recovery.identifiedTriggers || [],
            nextMilestone: nextMilestone || null
          })
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAverageMood = () => {
    if (wellnessData.length === 0) return 0
    const sum = wellnessData.reduce((acc, entry) => acc + (entry.mood_score || 0), 0)
    return (sum / wellnessData.length).toFixed(1)
  }

  const quickActions = [
    { title: 'Explore Patterns', icon: Brain, href: '/coach', color: 'bg-teal-500' },
    { title: 'Track Progress', icon: Target, href: '/wellness', color: 'bg-cyan-500' },
    { title: 'Growth Paths', icon: Compass, href: '/journeys', color: 'bg-teal-600' },
    { title: 'Deep Insights', icon: Lightbulb, href: '/insights', color: 'bg-cyan-600' },
  ]

  const recoveryQuickActions = [
    { title: 'Recovery Center', icon: TreePine, href: '/recovery', color: 'bg-green-500', description: 'Track sobriety and milestones' },
    { title: 'AI Coach', icon: Brain, href: '/coach?mode=recovery', color: 'bg-purple-500', description: 'Recovery-focused guidance' },
    { title: 'Safety Plan', icon: Shield, href: '/safety', color: 'bg-red-500', description: 'Crisis support resources' },
    { title: 'Support Groups', icon: Users, href: '/community', color: 'bg-blue-500', description: 'Connect with others' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading your pattern discovery dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="orb orb-teal w-96 h-96 top-20 -right-20"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div 
          className="orb orb-cyan w-80 h-80 bottom-10 left-10"
          animate={{ 
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />
        <motion.div 
          className="orb orb-turquoise w-72 h-72 top-1/3 left-1/2"
          animate={{ 
            x: [0, 15, 0],
            y: [0, -25, 0],
          }}
          transition={{ duration: 22, repeat: Infinity }}
        />
      </div>
      
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                Welcome back to {APP_CONFIG.name}, {user?.user_metadata?.full_name || 'Friend'}
              </h1>
              <p className="text-gray-600 mt-2">
                Let's continue understanding your deeper patterns • {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            {(isAdmin || user?.email === 'ismaelmvula@gmail.com') && (
              <a href="/admin">
                <Button 
                  variant="outline" 
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </a>
            )}
          </div>
        </motion.div>

        {/* Daily Affirmation */}
        {affirmation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border border-teal-100 p-6 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="bg-teal-500 rounded-full p-3 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-900 italic leading-relaxed">"{affirmation}"</p>
                  <p className="text-sm text-teal-600 mt-2 font-medium">Today's insight for growth</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recovery Overview Card - Only show if user has recovery data */}
        {hasRecoveryData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-100 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <TreePine className="h-6 w-6 text-green-600" />
                  Recovery Progress
                </h3>
                <Link href="/recovery">
                  <Button variant="outline" size="sm" className="border-green-500 text-green-600 hover:bg-green-50">
                    View Details
                  </Button>
                </Link>
              </div>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">{recoveryData.currentStreak}</div>
                  <div className="text-sm text-gray-600">Days Strong</div>
                </div>
                
                {recoveryData.nextMilestone && (
                  <div className="text-center">
                    <div className="text-2xl mb-1">{recoveryData.nextMilestone.badge}</div>
                    <div className="text-sm text-gray-600">Next: {recoveryData.nextMilestone.label}</div>
                    <div className="text-xs text-gray-500">({recoveryData.nextMilestone.days - recoveryData.currentStreak} days)</div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="flex justify-center gap-1 mb-2">
                    {Object.entries(recoveryData.haltStatus).map(([key, value]) => (
                      <div key={key} className={`w-3 h-3 rounded-full ${
                        value === true ? 'bg-red-400' : 
                        value === false ? 'bg-green-400' : 'bg-gray-300'
                      }`} />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">HALT Status</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-700 mb-1">
                    {recoveryData.cravingIntensity}/10
                  </div>
                  <div className="text-sm text-gray-600">Craving Level</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: hasRecoveryData ? 0.4 : 0.3 }}
        >
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={action.href}>
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full border border-gray-100 hover:border-teal-200 group">
                    <div className="p-6 text-center">
                      <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <p className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">{action.title}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Recovery Quick Actions - Only show if user has recovery data */}
        {hasRecoveryData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Recovery Support
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recoveryQuickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Link href={action.href}>
                      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200 group">
                        <div className="p-4">
                          <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <p className="font-medium text-gray-900 text-sm mb-1">{action.title}</p>
                          <p className="text-xs text-gray-500">{action.description}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Root Cause Insights Widget - Only show if user has recovery data and pattern insights */}
        {hasRecoveryData && patternInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Root Cause Insights
                </h3>
                <Link href="/insights">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Common Triggers</h4>
                  <div className="space-y-1">
                    {recoveryData.triggers.slice(0, 3).map((trigger, index) => (
                      <div key={index} className="text-sm bg-red-50 text-red-700 px-2 py-1 rounded">
                        {trigger}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Recent Discoveries</h4>
                  <div className="space-y-1">
                    {patternInsights.slice(0, 2).map((insight) => (
                      <div key={insight.id} className="text-sm bg-blue-50 text-blue-700 p-2 rounded">
                        {insight.pattern_name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link href="/coach?focus=triggers">
                  <Button variant="outline" size="sm" className="w-full">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Explore Trigger Patterns
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Daily Check-in Widget - Only show if user has recovery data */}
        {hasRecoveryData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Daily Check-in
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">HALT Status</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'hungry', label: 'Hungry', icon: '🍽️' },
                      { key: 'angry', label: 'Angry', icon: '😤' },
                      { key: 'lonely', label: 'Lonely', icon: '💔' },
                      { key: 'tired', label: 'Tired', icon: '😴' }
                    ].map(({ key, label, icon }) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>{icon}</span>
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={async () => {
                              const newStatus = { ...recoveryData.haltStatus, [key]: false }
                              setRecoveryData(prev => ({ ...prev, haltStatus: newStatus }))
                              // Save to database
                              await supabase
                                .from('users')
                                .update({ 
                                  preferences: { 
                                    ...(await supabase.from('users').select('preferences').eq('id', user?.id).single()).data?.preferences,
                                    recovery: { 
                                      ...((await supabase.from('users').select('preferences').eq('id', user?.id).single()).data?.preferences as any)?.recovery,
                                      lastHaltCheck: newStatus 
                                    }
                                  }
                                })
                                .eq('id', user?.id)
                            }}
                            className={`p-1 rounded transition-colors ${
                              recoveryData.haltStatus[key as keyof typeof recoveryData.haltStatus] === false 
                                ? 'bg-green-100' : 'hover:bg-green-100'
                            }`}
                          >
                            <CheckCircle className={`h-4 w-4 ${
                              recoveryData.haltStatus[key as keyof typeof recoveryData.haltStatus] === false 
                                ? 'text-green-700' : 'text-green-600'
                            }`} />
                          </button>
                          <button 
                            onClick={async () => {
                              const newStatus = { ...recoveryData.haltStatus, [key]: true }
                              setRecoveryData(prev => ({ ...prev, haltStatus: newStatus }))
                              // Save to database
                              await supabase
                                .from('users')
                                .update({ 
                                  preferences: { 
                                    ...(await supabase.from('users').select('preferences').eq('id', user?.id).single()).data?.preferences,
                                    recovery: { 
                                      ...((await supabase.from('users').select('preferences').eq('id', user?.id).single()).data?.preferences as any)?.recovery,
                                      lastHaltCheck: newStatus 
                                    }
                                  }
                                })
                                .eq('id', user?.id)
                            }}
                            className={`p-1 rounded transition-colors ${
                              recoveryData.haltStatus[key as keyof typeof recoveryData.haltStatus] === true 
                                ? 'bg-red-100' : 'hover:bg-red-100'
                            }`}
                          >
                            <XCircle className={`h-4 w-4 ${
                              recoveryData.haltStatus[key as keyof typeof recoveryData.haltStatus] === true 
                                ? 'text-red-700' : 'text-red-600'
                            }`} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Mood Tracker</h4>
                    <div className="flex gap-1">
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <button 
                          key={num} 
                          onClick={async () => {
                            // Save mood to wellness entries
                            await supabase
                              .from('wellness_entries')
                              .insert({
                                user_id: user?.id,
                                mood_score: num,
                                energy_level: 5,
                                created_at: new Date().toISOString()
                              })
                            // Refresh data
                            fetchDashboardData()
                          }}
                          className={`w-6 h-6 rounded-full transition-colors text-xs font-medium ${
                            wellnessData[0] && format(new Date(wellnessData[0].created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') 
                              && wellnessData[0].mood_score === num
                              ? 'bg-teal-500 text-white' 
                              : 'bg-gray-200 hover:bg-teal-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Craving Intensity</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">0</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        value={recoveryData.cravingIntensity}
                        onChange={async (e) => {
                          const intensity = parseInt(e.target.value)
                          setRecoveryData(prev => ({ ...prev, cravingIntensity: intensity }))
                          // Save to database
                          await supabase
                            .from('users')
                            .update({ 
                              preferences: { 
                                ...(await supabase.from('users').select('preferences').eq('id', user?.id).single()).data?.preferences,
                                recovery: { 
                                  ...((await supabase.from('users').select('preferences').eq('id', user?.id).single()).data?.preferences as any)?.recovery,
                                  lastCravingIntensity: intensity 
                                }
                              }
                            })
                            .eq('id', user?.id)
                        }}
                        className="flex-1"
                      />
                      <span className="text-sm">10</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full transition-all duration-300" 
                        style={{ width: `${recoveryData.cravingIntensity * 10}%` }} 
                      />
                    </div>
                  </div>
                  
                  <Link href="/checkin">
                    <Button className="w-full btn-primary text-sm">
                      Complete Full Check-in
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Wellness Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <div className="bg-teal-100 rounded-lg p-2 mr-3">
                  <Activity className="h-5 w-5 text-teal-600" />
                </div>
                Progress Overview
              </h3>
              <p className="text-gray-600 mt-1">Your pattern discovery journey</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Average Mood</span>
                    <span className="text-2xl font-bold">{calculateAverageMood()}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Number(calculateAverageMood()) * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Recent Entries</p>
                  {wellnessData.length > 0 ? (
                    <div className="space-y-2">
                      {wellnessData.slice(0, 3).map((entry) => (
                        <div key={entry.id} className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            {format(new Date(entry.created_at), 'MMM d')}
                          </span>
                          <div className="flex space-x-3">
                            <span>Mood: {entry.mood_score}/10</span>
                            <span>Energy: {entry.energy_level}/10</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No wellness entries yet</p>
                  )}
                </div>

                <Link href="/wellness">
                  <button className="w-full btn-secondary text-sm py-2 px-4 group">
                    Track Today's Progress
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
            </div>
          </motion.div>

          {/* Recent Conversations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <div className="bg-blue-100 rounded-lg p-2 mr-3">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                Pattern Sessions
              </h3>
              <p className="text-gray-600 mt-1">Your root cause discovery conversations</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentConversations.length > 0 ? (
                  recentConversations.map((conversation) => (
                    <Link key={conversation.id} href={`/coach/${conversation.id}`}>
                      <div className="p-4 border border-gray-100 rounded-xl hover:bg-teal-50 hover:border-teal-200 cursor-pointer transition-all duration-200 group">
                        <p className="font-semibold text-gray-900 group-hover:text-teal-700 line-clamp-1">
                          {conversation.title || 'Untitled Conversation'}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {format(new Date(conversation.created_at), 'MMM d, h:mm a')}
                          </span>
                          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium">
                            {conversation.conversation_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">No conversations yet</p>
                    <Link href="/coach">
                      <button className="btn-primary text-sm py-2 px-4">Start Pattern Discovery</button>
                    </Link>
                  </div>
                )}

                {recentConversations.length > 0 && (
                  <Link href="/coach">
                    <button className="w-full btn-secondary text-sm py-2 px-4 group">
                      Explore New Pattern
                      <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                )}
              </div>
            </div>
            </div>
          </motion.div>

          {/* Active Journeys */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <div className="bg-purple-100 rounded-lg p-2 mr-3">
                  <Compass className="h-5 w-5 text-purple-600" />
                </div>
                Growth Paths
              </h3>
              <p className="text-gray-600 mt-1">Your deep transformation programs</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activeJourneys.length > 0 ? (
                  activeJourneys.map((journey) => (
                    <div key={journey.id} className="p-4 border border-gray-100 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all duration-200">
                      <p className="font-semibold text-gray-900 line-clamp-1">
                        {journey.journey.name}
                      </p>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-2 font-medium">
                          <span>Step {journey.current_step + 1} of {journey.journey.steps.length}</span>
                          <span>{Math.round(((journey.current_step + 1) / journey.journey.steps.length) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((journey.current_step + 1) / journey.journey.steps.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">No active growth paths</p>
                    <Link href="/journeys">
                      <button className="btn-primary text-sm py-2 px-4">Start Growth Path</button>
                    </Link>
                  </div>
                )}

                {activeJourneys.length > 0 && (
                  <Link href="/journeys">
                    <button className="w-full btn-secondary text-sm py-2 px-4 group">
                      View All Growth Paths
                      <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                )}
              </div>
            </div>
            </div>
          </motion.div>
        </div>

        {/* Recovery Journal Quick Entry - Only show if user has recovery data */}
        {hasRecoveryData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8"
          >
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Today's Recovery Reflection
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Morning Prompt</p>
                  <div className="bg-white rounded-lg p-3 border border-purple-100">
                    <p className="text-sm text-gray-600 italic mb-3">
                      "What am I feeling as I wake up today? Where do I feel it in my body?"
                    </p>
                    <textarea 
                      placeholder="Your reflection..."
                      className="w-full text-sm border border-gray-200 rounded-lg p-2 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Gratitude</p>
                  <div className="bg-white rounded-lg p-3 border border-purple-100">
                    <p className="text-sm text-gray-600 italic mb-3">
                      "What's one thing I'm grateful for in my recovery?"
                    </p>
                    <textarea 
                      placeholder="I'm grateful for..."
                      className="w-full text-sm border border-gray-200 rounded-lg p-2 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-purple-600">
                  <Sparkles className="h-4 w-4" />
                  <span>Daily journaling strengthens recovery</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                    Save Entry
                  </Button>
                  <Link href="/journeys?focus=recovery-journal">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Full Journal
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recovery Progress Chart - Only show if user has recovery data */}
        {hasRecoveryData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-8"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Recovery Timeline
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">{recoveryData.currentStreak}</div>
                  <div className="text-sm text-gray-600 mb-4">Current Streak</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="text-sm text-gray-600 mb-4">Milestones Reached</div>
                  <div className="text-lg font-semibold text-gray-700">
                    {[
                      { days: 1, badge: '🌱' },
                      { days: 3, badge: '🌿' },
                      { days: 7, badge: '🌳' },
                      { days: 30, badge: '⭐' },
                      { days: 90, badge: '✨' },
                      { days: 365, badge: '🏆' }
                    ].filter(m => recoveryData.currentStreak >= m.days).length}/6
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="text-sm text-gray-600 mb-4">Pattern Insights</div>
                  <div className="text-lg font-semibold text-gray-700">{patternInsights.length}</div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Link href="/recovery">
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Detailed Recovery Analytics
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Stats */}
        <motion.div 
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: hasRecoveryData ? 1.0 : 0.7 }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pattern Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{recentConversations.length}</p>
                </div>
                <div className="bg-teal-100 rounded-xl p-3">
                  <Brain className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Discovery Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{wellnessData.length} days</p>
                </div>
                <div className="bg-green-100 rounded-xl p-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Growth Paths</p>
                  <p className="text-2xl font-bold text-gray-900">{activeJourneys.length}</p>
                </div>
                <div className="bg-purple-100 rounded-xl p-3">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{wellnessData.filter(e => 
                    new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}</p>
                </div>
                <div className="bg-blue-100 rounded-xl p-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Professional Referral Prompt */}
        <div className="mt-8">
          <MiniReferralPrompt />
        </div>

        {/* Comprehensive Feature Hub */}
        <div className="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              All Platform Features
            </h2>
            <p className="text-gray-600 mb-8">
              Everything you need for your transformation journey in one place
            </p>
            <FeatureHub />
          </motion.div>
        </div>
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