'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { 
  BookOpen,
  Lightbulb,
  TrendingUp,
  Link,
  Target,
  Sparkles,
  CheckCircle,
  Clock,
  ChevronRight,
  Brain,
  Heart,
  Compass,
  Filter,
  Download,
  Share2
} from 'lucide-react'
import { format } from 'date-fns'

interface PersonalInsight {
  id: string
  insight_type: 'pattern' | 'connection' | 'breakthrough' | 'opportunity'
  content: any
  confidence_score: number
  created_at: string
  user_validated: boolean
}

interface ConversationInsight {
  conversation_id: string
  title: string
  insights_generated: any
  created_at: string
}

const insightTypeConfig = {
  pattern: {
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Pattern',
    description: 'Recurring themes in your journey'
  },
  connection: {
    icon: Link,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Connection',
    description: 'Links between experiences'
  },
  breakthrough: {
    icon: Lightbulb,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Breakthrough',
    description: 'Moments of clarity'
  },
  opportunity: {
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Opportunity',
    description: 'Areas for growth'
  }
}

function InsightsContent() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<PersonalInsight[]>([])
  const [conversationInsights, setConversationInsights] = useState<ConversationInsight[]>([])
  const [filterType, setFilterType] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchInsights()
    }
  }, [user, filterType])

  const fetchInsights = async () => {
    try {
      // Fetch personal insights
      let insightsQuery = supabase
        .from('personal_insights')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (filterType !== 'all') {
        insightsQuery = insightsQuery.eq('insight_type', filterType)
      }

      const { data: insightsData } = await insightsQuery

      if (insightsData) setInsights(insightsData)

      // Fetch conversation insights
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('id, title, insights_generated, created_at')
        .eq('user_id', user?.id)
        .not('insights_generated', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10)

      if (conversationsData) {
        setConversationInsights(conversationsData.filter(c => 
          c.insights_generated && Object.keys(c.insights_generated).length > 0
        ))
      }

    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateInsight = async (insightId: string, validated: boolean) => {
    try {
      await supabase
        .from('personal_insights')
        .update({ user_validated: validated })
        .eq('id', insightId)

      await fetchInsights()
    } catch (error) {
      console.error('Error validating insight:', error)
    }
  }

  const exportInsights = () => {
    const dataStr = JSON.stringify(insights, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `insights-${format(new Date(), 'yyyy-MM-dd')}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const getInsightStats = () => {
    const total = insights.length
    const validated = insights.filter(i => i.user_validated).length
    const recent = insights.filter(i => 
      new Date(i.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length

    const typeBreakdown = insights.reduce((acc, insight) => {
      acc[insight.insight_type] = (acc[insight.insight_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total, validated, recent, typeBreakdown }
  }

  const stats = getInsightStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading your insights...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Personal Insights</h1>
          <p className="text-gray-600 mt-2">Discoveries and patterns from your growth journey</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Insights</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Validated</p>
                  <p className="text-2xl font-bold">{stats.validated}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold">{stats.recent}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className="text-2xl font-bold">
                    {insights.length > 0 
                      ? `${Math.round(insights.reduce((acc, i) => acc + i.confidence_score, 0) / insights.length * 100)}%`
                      : '0%'
                    }
                  </p>
                </div>
                <Sparkles className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Insights List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Filter by type:</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          filterType === 'all' 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        All
                      </button>
                      {Object.entries(insightTypeConfig).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => setFilterType(key)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            filterType === key 
                              ? 'bg-primary text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={exportInsights} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Insights Cards */}
            {insights.length > 0 ? (
              insights.map((insight) => {
                const config = insightTypeConfig[insight.insight_type]
                const Icon = config.icon
                
                return (
                  <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <Icon className={`h-5 w-5 ${config.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{config.label}</CardTitle>
                            <CardDescription>
                              {format(new Date(insight.created_at), 'MMM d, yyyy • h:mm a')}
                            </CardDescription>
                          </div>
                        </div>
                        {insight.user_validated && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-gray-700">
                          {typeof insight.content === 'string' 
                            ? insight.content 
                            : insight.content.text || insight.content.description || 'Personal insight discovered through your journey'}
                        </p>
                        
                        {insight.content.related_patterns && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Related patterns:</p>
                            <div className="flex flex-wrap gap-2">
                              {insight.content.related_patterns.map((pattern: string, idx: number) => (
                                <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {pattern}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Confidence:</span>
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${insight.confidence_score * 100}%` }}
                                />
                              </div>
                              <span className="ml-2 text-sm font-medium">
                                {Math.round(insight.confidence_score * 100)}%
                              </span>
                            </div>
                          </div>

                          {!insight.user_validated && (
                            <Button
                              onClick={() => validateInsight(insight.id, true)}
                              size="sm"
                              variant="outline"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Validate
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No insights discovered yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Keep exploring with your AI coach to uncover personal insights
                  </p>
                  <Button className="mt-4" onClick={() => window.location.href = '/coach'}>
                    Start a Conversation
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Insight Types Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Insight Types</CardTitle>
                <CardDescription>Distribution of your discoveries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(insightTypeConfig).map(([key, config]) => {
                    const Icon = config.icon
                    const count = stats.typeBreakdown[key] || 0
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
                    
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className={`h-4 w-4 ${config.color}`} />
                            <span className="text-sm font-medium">{config.label}</span>
                          </div>
                          <span className="text-sm text-gray-500">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${config.bgColor}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent From Conversations */}
            <Card>
              <CardHeader>
                <CardTitle>From Conversations</CardTitle>
                <CardDescription>Insights from AI coaching sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {conversationInsights.length > 0 ? (
                  <div className="space-y-3">
                    {conversationInsights.slice(0, 5).map((conv) => (
                      <div key={conv.conversation_id} className="text-sm">
                        <p className="font-medium line-clamp-1">{conv.title}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(conv.created_at), 'MMM d')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No conversation insights yet</p>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  Insight Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Validating insights helps your AI coach better understand what resonates with you, 
                  leading to more personalized and relevant discoveries in future conversations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function InsightsPage() {
  return (
    <AuthProvider>
      <InsightsContent />
    </AuthProvider>
  )
}