'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navigation/navbar'
import { MiniReferralPrompt } from '@/components/professional-referral'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
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
  Shield
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

function DashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [wellnessData, setWellnessData] = useState<WellnessEntry[]>([])
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([])
  const [activeJourneys, setActiveJourneys] = useState<Journey[]>([])
  const [affirmation, setAffirmation] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      checkAdminStatus()
    }
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
    { title: 'Explore Patterns', icon: Brain, href: '/coach', color: 'bg-blue-500' },
    { title: 'Track Progress', icon: Target, href: '/wellness', color: 'bg-green-500' },
    { title: 'Growth Paths', icon: Compass, href: '/journeys', color: 'bg-purple-500' },
    { title: 'Deep Insights', icon: Lightbulb, href: '/insights', color: 'bg-amber-500' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading your pattern discovery dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
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
        </div>

        {/* Daily Affirmation */}
        {affirmation && (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg font-medium text-gray-900 italic">"{affirmation}"</p>
                  <p className="text-sm text-gray-600 mt-2">Today's insight for growth</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-medium text-sm">{action.title}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Wellness Overview */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Progress Overview
              </CardTitle>
              <CardDescription>Your pattern discovery journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Average Mood</span>
                    <span className="text-2xl font-bold">{calculateAverageMood()}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
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
                  <Button className="w-full" variant="outline" size="sm">
                    Track Today's Progress
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Conversations */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Pattern Sessions
              </CardTitle>
              <CardDescription>Your root cause discovery conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentConversations.length > 0 ? (
                  recentConversations.map((conversation) => (
                    <Link key={conversation.id} href={`/coach/${conversation.id}`}>
                      <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <p className="font-medium text-sm line-clamp-1">
                          {conversation.title || 'Untitled Conversation'}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">
                            {format(new Date(conversation.created_at), 'MMM d, h:mm a')}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
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
                      <Button size="sm">Start Pattern Discovery</Button>
                    </Link>
                  </div>
                )}

                {recentConversations.length > 0 && (
                  <Link href="/coach">
                    <Button className="w-full" variant="outline" size="sm">
                      Explore New Pattern
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Journeys */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Compass className="h-5 w-5 mr-2" />
                Growth Paths
              </CardTitle>
              <CardDescription>Your deep transformation programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeJourneys.length > 0 ? (
                  activeJourneys.map((journey) => (
                    <div key={journey.id} className="p-3 border rounded-lg">
                      <p className="font-medium text-sm line-clamp-1">
                        {journey.journey.name}
                      </p>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Step {journey.current_step + 1} of {journey.journey.steps.length}</span>
                          <span>{Math.round(((journey.current_step + 1) / journey.journey.steps.length) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full transition-all"
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
                      <Button size="sm">Start Growth Path</Button>
                    </Link>
                  </div>
                )}

                {activeJourneys.length > 0 && (
                  <Link href="/journeys">
                    <Button className="w-full" variant="outline" size="sm">
                      View All Growth Paths
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pattern Sessions</p>
                  <p className="text-2xl font-bold">{recentConversations.length}</p>
                </div>
                <Brain className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Discovery Streak</p>
                  <p className="text-2xl font-bold">{wellnessData.length} days</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Growth Paths</p>
                  <p className="text-2xl font-bold">{activeJourneys.length}</p>
                </div>
                <Target className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold">{wellnessData.filter(e => 
                    new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}</p>
                </div>
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Referral Prompt */}
        <div className="mt-8">
          <MiniReferralPrompt />
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