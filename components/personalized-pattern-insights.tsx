'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { 
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Brain,
  Heart,
  Target,
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  Activity,
  Shield,
  Zap,
  Info,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, differenceInDays } from 'date-fns'

interface PatternInsight {
  id: string
  type: 'progress' | 'trigger' | 'correlation' | 'breakthrough' | 'warning'
  title: string
  description: string
  details: string
  pattern?: string
  severity: 'low' | 'medium' | 'high'
  actionable: boolean
  actions?: string[]
  relatedPatterns?: string[]
  confidence: number
  createdAt: string
}

interface WeeklyInsight {
  weekStarting: string
  keyInsights: PatternInsight[]
  progressSummary: {
    patternsImproved: string[]
    patternsWorsened: string[]
    newPatternsDetected: string[]
    breakthroughs: string[]
  }
  recommendations: string[]
  overallTrend: 'improving' | 'stable' | 'declining'
}

export function PersonalizedPatternInsights({ userId }: { userId: string }) {
  const [currentInsights, setCurrentInsights] = useState<PatternInsight[]>([])
  const [weeklyInsight, setWeeklyInsight] = useState<WeeklyInsight | null>(null)
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set())
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showAllInsights, setShowAllInsights] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchInsights()
    generateWeeklyInsight()
  }, [userId])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      
      // Fetch personal insights
      const { data: insights } = await supabase
        .from('personal_insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      // Fetch pattern analysis for context
      const { data: patterns } = await supabase
        .from('pattern_analysis')
        .select('*')
        .eq('user_id', userId)

      // Fetch recent conversations for context
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*, messages(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      // Generate insights based on data
      const generatedInsights = await generateInsights(insights || [], patterns || [], conversations || [])
      setCurrentInsights(generatedInsights)
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = async (
    insights: any[], 
    patterns: any[], 
    conversations: any[]
  ): Promise<PatternInsight[]> => {
    const generatedInsights: PatternInsight[] = []
    
    // Analyze patterns for insights
    patterns.forEach(pattern => {
      // Check for high-frequency patterns
      if (pattern.frequency === 'daily' || pattern.frequency === 'multiple_daily') {
        generatedInsights.push({
          id: `freq-${pattern.id}`,
          type: 'warning',
          title: `High Frequency Alert: ${pattern.pattern_name}`,
          description: `Your "${pattern.pattern_name}" pattern appears ${pattern.frequency.replace('_', ' ')}`,
          details: 'Frequent patterns often indicate unmet needs or unresolved emotional states. Consider exploring what this pattern is trying to fulfill.',
          pattern: pattern.pattern_name,
          severity: 'high',
          actionable: true,
          actions: [
            'Schedule a deep-dive session with your coach',
            'Journal about what happens before this pattern',
            'Try the "Pattern Interrupt" exercise'
          ],
          confidence: 0.85,
          createdAt: new Date().toISOString()
        })
      }

      // Check for patterns with strong triggers
      if (pattern.triggers?.triggers?.length > 3) {
        generatedInsights.push({
          id: `trigger-${pattern.id}`,
          type: 'trigger',
          title: `Multiple Triggers Identified`,
          description: `${pattern.triggers.triggers.length} triggers linked to "${pattern.pattern_name}"`,
          details: `Triggers: ${pattern.triggers.triggers.join(', ')}. Understanding these connections can help you prepare and respond differently.`,
          pattern: pattern.pattern_name,
          severity: 'medium',
          actionable: true,
          actions: [
            'Create a trigger response plan',
            'Practice mindfulness when triggers arise',
            'Use the HALT check (Hungry, Angry, Lonely, Tired)'
          ],
          confidence: 0.75,
          createdAt: new Date().toISOString()
        })
      }
    })

    // Analyze conversation patterns
    const recentMessages = conversations.flatMap(c => c.messages || [])
    const emotionalTones = recentMessages
      .filter(m => m.metadata?.emotional_tone)
      .map(m => m.metadata.emotional_tone)
    
    // Check for emotional patterns
    const toneFrequency: { [key: string]: number } = {}
    emotionalTones.forEach(tone => {
      toneFrequency[tone] = (toneFrequency[tone] || 0) + 1
    })
    
    const dominantTone = Object.entries(toneFrequency)
      .sort(([,a], [,b]) => b - a)[0]
    
    if (dominantTone && dominantTone[1] > 5) {
      generatedInsights.push({
        id: `emotion-${Date.now()}`,
        type: 'correlation',
        title: `Emotional Pattern Detected`,
        description: `You frequently express "${dominantTone[0]}" in your conversations`,
        details: 'This consistent emotional tone might indicate an underlying pattern worth exploring.',
        severity: 'medium',
        actionable: true,
        actions: [
          `Explore what "${dominantTone[0]}" means to you`,
          'Consider when this emotion first became prominent',
          'Practice emotional regulation techniques'
        ],
        confidence: 0.7,
        createdAt: new Date().toISOString()
      })
    }

    // Add progress insights
    const improvedPatterns = patterns.filter((p: any) => {
      // Logic to determine if pattern is improving
      return Math.random() > 0.5 // Placeholder - would use real data
    })
    
    if (improvedPatterns.length > 0) {
      generatedInsights.push({
        id: `progress-${Date.now()}`,
        type: 'progress',
        title: 'Positive Progress Detected!',
        description: `${improvedPatterns.length} patterns showing improvement`,
        details: `Your consistent work is paying off. Patterns improving: ${improvedPatterns.map((p: any) => p.pattern_name).join(', ')}`,
        severity: 'low',
        actionable: false,
        confidence: 0.8,
        createdAt: new Date().toISOString()
      })
    }

    // Add breakthrough insights
    if (insights.some(i => i.insight_type === 'breakthrough')) {
      const breakthrough = insights.find(i => i.insight_type === 'breakthrough')
      generatedInsights.push({
        id: breakthrough.id,
        type: 'breakthrough',
        title: 'Breakthrough Moment!',
        description: breakthrough.content.title || 'You\'ve made an important connection',
        details: breakthrough.content.description || 'This insight represents significant progress in understanding your patterns.',
        severity: 'low',
        actionable: true,
        actions: [
          'Celebrate this achievement',
          'Journal about this realization',
          'Share with your support network'
        ],
        confidence: breakthrough.confidence_score,
        createdAt: breakthrough.created_at
      })
    }

    // Sort by severity and recency
    return generatedInsights.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 }
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity]
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }

  const generateWeeklyInsight = async () => {
    // This would normally analyze a week's worth of data
    const weeklyData: WeeklyInsight = {
      weekStarting: format(new Date(), 'MMM d, yyyy'),
      keyInsights: currentInsights.slice(0, 3),
      progressSummary: {
        patternsImproved: ['All-or-nothing thinking', 'Social anxiety'],
        patternsWorsened: ['Avoidance behaviors'],
        newPatternsDetected: ['Perfectionism'],
        breakthroughs: ['Connected childhood experiences to current behaviors']
      },
      recommendations: [
        'Focus on gradual exposure to social situations',
        'Practice self-compassion when perfectionism arises',
        'Consider starting the "Building Authentic Friendships" journey',
        'Schedule regular check-ins with accountability partner'
      ],
      overallTrend: 'improving'
    }
    
    setWeeklyInsight(weeklyData)
  }

  const toggleInsightExpansion = (id: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const dismissInsight = (id: string) => {
    setDismissedInsights(prev => new Set(prev).add(id))
  }

  const getInsightIcon = (type: PatternInsight['type']) => {
    switch (type) {
      case 'progress': return CheckCircle
      case 'trigger': return Zap
      case 'correlation': return Activity
      case 'breakthrough': return Sparkles
      case 'warning': return AlertTriangle
      default: return Info
    }
  }

  const getInsightColor = (type: PatternInsight['type']) => {
    switch (type) {
      case 'progress': return 'text-green-600 bg-green-100'
      case 'trigger': return 'text-amber-600 bg-amber-100'
      case 'correlation': return 'text-blue-600 bg-blue-100'
      case 'breakthrough': return 'text-purple-600 bg-purple-100'
      case 'warning': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Lightbulb className="h-8 w-8 animate-pulse text-amber-600 mx-auto mb-2" />
          <p className="text-gray-600">Generating personalized insights...</p>
        </div>
      </div>
    )
  }

  const visibleInsights = currentInsights.filter(i => !dismissedInsights.has(i.id))
  const displayedInsights = showAllInsights ? visibleInsights : visibleInsights.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Weekly Summary Card */}
      {weeklyInsight && (
        <Card className="border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-teal-100">
                  <Calendar className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <CardTitle>Weekly Pattern Insights</CardTitle>
                  <CardDescription>Week of {weeklyInsight.weekStarting}</CardDescription>
                </div>
              </div>
              <Badge 
                variant={weeklyInsight.overallTrend === 'improving' ? 'default' : 'secondary'}
                className="text-sm"
              >
                {weeklyInsight.overallTrend === 'improving' ? (
                  <>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Improving
                  </>
                ) : (
                  'Stable'
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Progress Highlights</p>
                <div className="space-y-1">
                  {weeklyInsight.progressSummary.patternsImproved.map((pattern, i) => (
                    <div key={i} className="flex items-center text-sm text-green-700">
                      <CheckCircle className="h-3 w-3 mr-2" />
                      {pattern} improving
                    </div>
                  ))}
                  {weeklyInsight.progressSummary.breakthroughs.map((breakthrough, i) => (
                    <div key={i} className="flex items-center text-sm text-purple-700">
                      <Sparkles className="h-3 w-3 mr-2" />
                      {breakthrough}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Areas for Focus</p>
                <div className="space-y-1">
                  {weeklyInsight.progressSummary.patternsWorsened.map((pattern, i) => (
                    <div key={i} className="flex items-center text-sm text-amber-700">
                      <AlertTriangle className="h-3 w-3 mr-2" />
                      {pattern} needs attention
                    </div>
                  ))}
                  {weeklyInsight.progressSummary.newPatternsDetected.map((pattern, i) => (
                    <div key={i} className="flex items-center text-sm text-blue-700">
                      <Info className="h-3 w-3 mr-2" />
                      New: {pattern}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">This Week's Recommendations</p>
              <div className="grid gap-2">
                {weeklyInsight.recommendations.slice(0, 2).map((rec, i) => (
                  <div key={i} className="flex items-start">
                    <Target className="h-4 w-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Personalized Pattern Insights</CardTitle>
              <CardDescription>Real-time analysis of your patterns and progress</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllInsights(!showAllInsights)}
            >
              {showAllInsights ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show All ({visibleInsights.length})
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            <div className="space-y-4">
              {displayedInsights.length > 0 ? (
                displayedInsights.map((insight) => {
                  const Icon = getInsightIcon(insight.type)
                  const isExpanded = expandedInsights.has(insight.id)
                  
                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert className={`border-l-4 ${
                        insight.type === 'progress' ? 'border-l-green-500' :
                        insight.type === 'warning' ? 'border-l-red-500' :
                        insight.type === 'breakthrough' ? 'border-l-purple-500' :
                        insight.type === 'trigger' ? 'border-l-amber-500' :
                        'border-l-blue-500'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <AlertTitle className="text-base font-semibold mb-1">
                                {insight.title}
                              </AlertTitle>
                              <AlertDescription className="text-sm text-gray-600">
                                {insight.description}
                              </AlertDescription>
                              
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 space-y-3"
                                >
                                  <p className="text-sm text-gray-700">
                                    {insight.details}
                                  </p>
                                  
                                  {insight.actionable && insight.actions && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 mb-2">
                                        Recommended Actions:
                                      </p>
                                      <ul className="space-y-1">
                                        {insight.actions.map((action, i) => (
                                          <li key={i} className="flex items-start text-sm text-gray-600">
                                            <ArrowRight className="h-3 w-3 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                                            {action}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                      <span className="flex items-center">
                                        <Brain className="h-3 w-3 mr-1" />
                                        {Math.round(insight.confidence * 100)}% confidence
                                      </span>
                                      <span className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {format(new Date(insight.createdAt), 'MMM d')}
                                      </span>
                                    </div>
                                    {insight.pattern && (
                                      <Badge variant="outline" className="text-xs">
                                        {insight.pattern}
                                      </Badge>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleInsightExpansion(insight.id)}
                            >
                              <ChevronRight className={`h-4 w-4 transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dismissInsight(insight.id)}
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      </Alert>
                    </motion.div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No insights available yet.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Keep using the coach to generate personalized insights.
                  </p>
                </div>
              )}
            </div>
          </AnimatePresence>
          
          {!showAllInsights && visibleInsights.length > 5 && (
            <div className="mt-4 text-center">
              <Button 
                variant="outline"
                onClick={() => setShowAllInsights(true)}
              >
                View {visibleInsights.length - 5} More Insights
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Summary */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-amber-100">
              <Target className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <CardTitle>Your Action Plan</CardTitle>
              <CardDescription>Prioritized actions based on your insights</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-red-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Address High-Frequency Patterns</p>
                  <p className="text-sm text-gray-600">Focus on patterns appearing daily</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Start <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-amber-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Explore Trigger Connections</p>
                  <p className="text-sm text-gray-600">Understand what activates patterns</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Start <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Celebrate Progress</p>
                  <p className="text-sm text-gray-600">Acknowledge improvements made</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                View <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}