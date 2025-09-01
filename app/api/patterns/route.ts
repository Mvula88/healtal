import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch comprehensive data for pattern analysis
    const [messages, checkins, conversations, journeys] = await Promise.all([
      // Get all messages for pattern detection
      supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100),
      
      // Get check-ins for mood patterns
      supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', getTimeRangeDate(timeRange))
        .order('created_at', { ascending: false }),
      
      // Get conversations for topic patterns
      supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', getTimeRangeDate(timeRange))
        .order('created_at', { ascending: false }),
      
      // Get journey progress
      supabase
        .from('user_journeys')
        .select('*')
        .eq('user_id', userId)
    ])

    // Analyze patterns
    const patterns = analyzePatterns({
      messages: messages.data || [],
      checkins: checkins.data || [],
      conversations: conversations.data || [],
      journeys: journeys.data || []
    })

    return NextResponse.json({
      success: true,
      patterns,
      timeRange,
      analyzedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching patterns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patterns' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pattern, action } = await request.json()
    const userId = session.user.id

    // Handle pattern actions (acknowledge, dismiss, explore)
    if (action === 'acknowledge') {
      await supabase
        .from('pattern_acknowledgments')
        .insert({
          user_id: userId,
          pattern_id: pattern.id,
          pattern_type: pattern.type,
          acknowledged_at: new Date().toISOString()
        })
    } else if (action === 'explore') {
      // Create a new conversation focused on this pattern
      const { data: conversation } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          title: `Exploring: ${pattern.description}`,
          mode: 'pattern_exploration',
          metadata: { pattern }
        })
        .select()
        .single()

      return NextResponse.json({
        success: true,
        action: 'explore',
        conversationId: conversation?.id
      })
    }

    return NextResponse.json({
      success: true,
      action,
      pattern
    })
  } catch (error) {
    console.error('Error handling pattern action:', error)
    return NextResponse.json(
      { error: 'Failed to process pattern action' },
      { status: 500 }
    )
  }
}

function getTimeRangeDate(range: string): string {
  const now = new Date()
  const days = parseInt(range.replace('d', ''))
  now.setDate(now.getDate() - days)
  return now.toISOString()
}

function analyzePatterns(data: {
  messages: any[]
  checkins: any[]
  conversations: any[]
  journeys: any[]
}) {
  const patterns = {
    behavioral: analyzeBehavioralPatterns(data.messages, data.conversations),
    emotional: analyzeEmotionalPatterns(data.checkins),
    temporal: analyzeTemporalPatterns(data.checkins, data.conversations),
    progress: analyzeProgressPatterns(data.journeys, data.checkins),
    relational: analyzeRelationalPatterns(data.messages),
    coping: analyzeCopingPatterns(data.checkins)
  }

  return {
    ...patterns,
    summary: generatePatternSummary(patterns),
    insights: generateInsights(patterns),
    visualizations: prepareVisualizationData(patterns)
  }
}

function analyzeBehavioralPatterns(messages: any[], conversations: any[]) {
  const topics = new Map<string, number>()
  const behaviors = new Map<string, number>()
  
  // Analyze conversation modes
  conversations.forEach(conv => {
    if (conv.mode) {
      behaviors.set(conv.mode, (behaviors.get(conv.mode) || 0) + 1)
    }
  })

  // Extract topics from messages
  messages.forEach(msg => {
    const keywords = extractKeywords(msg.content)
    keywords.forEach(keyword => {
      topics.set(keyword, (topics.get(keyword) || 0) + 1)
    })
  })

  return {
    recurringTopics: Array.from(topics.entries())
      .filter(([_, count]) => count >= 3)
      .map(([topic, count]) => ({
        topic,
        frequency: count,
        percentage: (count / messages.length) * 100
      }))
      .sort((a, b) => b.frequency - a.frequency),
    
    dominantBehaviors: Array.from(behaviors.entries())
      .map(([behavior, count]) => ({
        behavior,
        frequency: count,
        percentage: (count / conversations.length) * 100
      }))
      .sort((a, b) => b.frequency - a.frequency)
  }
}

function analyzeEmotionalPatterns(checkins: any[]) {
  if (!checkins.length) return { trends: [], patterns: [] }

  const moodScores = checkins.map(c => c.mood_score).filter(Boolean)
  const anxietyLevels = checkins.map(c => c.anxiety_level).filter(Boolean)
  const energyLevels = checkins.map(c => c.energy_level).filter(Boolean)

  return {
    moodTrend: calculateTrend(moodScores),
    anxietyTrend: calculateTrend(anxietyLevels),
    energyTrend: calculateTrend(energyLevels),
    averages: {
      mood: average(moodScores),
      anxiety: average(anxietyLevels),
      energy: average(energyLevels)
    },
    volatility: {
      mood: standardDeviation(moodScores),
      anxiety: standardDeviation(anxietyLevels),
      energy: standardDeviation(energyLevels)
    }
  }
}

function analyzeTemporalPatterns(checkins: any[], conversations: any[]) {
  const timeOfDay = new Map<string, number>()
  const dayOfWeek = new Map<string, number>()
  
  const allItems = [...checkins, ...conversations]
  allItems.forEach(item => {
    if (item.created_at) {
      const date = new Date(item.created_at)
      const hour = date.getHours()
      const day = date.toLocaleDateString('en-US', { weekday: 'long' })
      
      const timeSlot = getTimeSlot(hour)
      timeOfDay.set(timeSlot, (timeOfDay.get(timeSlot) || 0) + 1)
      dayOfWeek.set(day, (dayOfWeek.get(day) || 0) + 1)
    }
  })

  return {
    activeTimeSlots: Array.from(timeOfDay.entries())
      .sort((a, b) => b[1] - a[1]),
    activeDays: Array.from(dayOfWeek.entries())
      .sort((a, b) => b[1] - a[1]),
    consistency: calculateConsistency(checkins)
  }
}

function analyzeProgressPatterns(journeys: any[], checkins: any[]) {
  const activeJourneys = journeys.filter(j => j.status === 'active')
  const completedJourneys = journeys.filter(j => j.status === 'completed')
  
  return {
    journeyMetrics: {
      active: activeJourneys.length,
      completed: completedJourneys.length,
      completionRate: journeys.length > 0 
        ? (completedJourneys.length / journeys.length) * 100 
        : 0,
      averageProgress: activeJourneys.length > 0
        ? activeJourneys.reduce((sum, j) => sum + (j.progress || 0), 0) / activeJourneys.length
        : 0
    },
    momentum: calculateMomentum(checkins),
    milestones: identifyMilestones(journeys, checkins)
  }
}

function analyzeRelationalPatterns(messages: any[]) {
  const relationshipTopics = [
    'family', 'friend', 'partner', 'relationship', 
    'communication', 'boundaries', 'conflict'
  ]
  
  const relationalMessages = messages.filter(msg => 
    relationshipTopics.some(topic => 
      msg.content?.toLowerCase().includes(topic)
    )
  )

  return {
    focusOnRelationships: (relationalMessages.length / messages.length) * 100,
    relationshipThemes: extractThemes(relationalMessages),
    communicationPatterns: identifyCommunicationPatterns(relationalMessages)
  }
}

function analyzeCopingPatterns(checkins: any[]) {
  const strategies = new Map<string, number>()
  const triggers = new Map<string, number>()
  
  checkins.forEach(checkin => {
    if (checkin.coping_strategies_used) {
      checkin.coping_strategies_used.forEach((strategy: string) => {
        strategies.set(strategy, (strategies.get(strategy) || 0) + 1)
      })
    }
    
    if (checkin.triggers_today) {
      checkin.triggers_today.forEach((trigger: string) => {
        triggers.set(trigger, (triggers.get(trigger) || 0) + 1)
      })
    }
  })

  return {
    topStrategies: Array.from(strategies.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    topTriggers: Array.from(triggers.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    effectiveness: calculateCopingEffectiveness(checkins, strategies)
  }
}

// Helper functions
function extractKeywords(text: string): string[] {
  if (!text) return []
  const words = text.toLowerCase().split(/\s+/)
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']
  return words
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 10)
}

function calculateTrend(values: number[]): string {
  if (values.length < 2) return 'stable'
  const recent = average(values.slice(0, Math.ceil(values.length / 2)))
  const older = average(values.slice(Math.ceil(values.length / 2)))
  const change = ((recent - older) / older) * 100
  
  if (change > 10) return 'improving'
  if (change < -10) return 'declining'
  return 'stable'
}

function average(values: number[]): number {
  if (!values.length) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function standardDeviation(values: number[]): number {
  const avg = average(values)
  const squareDiffs = values.map(value => Math.pow(value - avg, 2))
  const avgSquareDiff = average(squareDiffs)
  return Math.sqrt(avgSquareDiff)
}

function getTimeSlot(hour: number): string {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

function calculateConsistency(checkins: any[]): number {
  if (checkins.length < 2) return 0
  
  const dates = checkins.map(c => new Date(c.created_at).toDateString())
  const uniqueDates = new Set(dates)
  const dayRange = Math.ceil(
    (new Date(checkins[0].created_at).getTime() - 
     new Date(checkins[checkins.length - 1].created_at).getTime()) / 
    (1000 * 60 * 60 * 24)
  )
  
  return dayRange > 0 ? (uniqueDates.size / dayRange) * 100 : 0
}

function calculateMomentum(checkins: any[]): string {
  if (checkins.length < 4) return 'building'
  
  const recentMood = average(checkins.slice(0, 3).map(c => c.mood_score || 0))
  const olderMood = average(checkins.slice(3, 6).map(c => c.mood_score || 0))
  
  if (recentMood > olderMood * 1.1) return 'accelerating'
  if (recentMood < olderMood * 0.9) return 'slowing'
  return 'steady'
}

function identifyMilestones(journeys: any[], checkins: any[]): any[] {
  const milestones = []
  
  // Journey completions
  journeys.filter(j => j.status === 'completed').forEach(journey => {
    milestones.push({
      type: 'journey_completed',
      date: journey.completed_at,
      description: `Completed ${journey.title}`
    })
  })
  
  // Mood improvements
  const moodScores = checkins.map(c => c.mood_score).filter(Boolean)
  if (moodScores.length >= 7) {
    const weeklyAvg = average(moodScores.slice(0, 7))
    if (weeklyAvg >= 4) {
      milestones.push({
        type: 'mood_milestone',
        date: new Date().toISOString(),
        description: 'Maintained positive mood for a week'
      })
    }
  }
  
  return milestones
}

function extractThemes(messages: any[]): string[] {
  const themes = new Map<string, number>()
  const themeKeywords = {
    'trust': ['trust', 'honest', 'truth', 'betrayal'],
    'boundaries': ['boundaries', 'limit', 'space', 'respect'],
    'communication': ['talk', 'listen', 'understand', 'express'],
    'conflict': ['fight', 'argue', 'disagree', 'tension']
  }
  
  messages.forEach(msg => {
    const content = msg.content?.toLowerCase() || ''
    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        themes.set(theme, (themes.get(theme) || 0) + 1)
      }
    })
  })
  
  return Array.from(themes.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([theme]) => theme)
}

function identifyCommunicationPatterns(messages: any[]): any {
  return {
    assertiveness: messages.filter(m => 
      m.content?.includes('I feel') || m.content?.includes('I need')
    ).length,
    avoidance: messages.filter(m => 
      m.content?.includes('avoid') || m.content?.includes('ignore')
    ).length,
    directness: messages.filter(m => 
      m.content?.includes('directly') || m.content?.includes('confront')
    ).length
  }
}

function calculateCopingEffectiveness(checkins: any[], strategies: Map<string, number>): number {
  // Calculate correlation between strategy use and mood improvement
  let effectiveness = 0
  let count = 0
  
  for (let i = 1; i < checkins.length; i++) {
    if (checkins[i].coping_strategies_used?.length > 0 && 
        checkins[i].mood_score && checkins[i-1].mood_score) {
      const moodChange = checkins[i].mood_score - checkins[i-1].mood_score
      if (moodChange > 0) {
        effectiveness += moodChange
        count++
      }
    }
  }
  
  return count > 0 ? (effectiveness / count) * 20 : 50 // Scale to 0-100
}

function generatePatternSummary(patterns: any): any {
  return {
    strengths: identifyStrengths(patterns),
    challenges: identifyChallenges(patterns),
    opportunities: identifyOpportunities(patterns)
  }
}

function identifyStrengths(patterns: any): string[] {
  const strengths = []
  
  if (patterns.emotional?.moodTrend === 'improving') {
    strengths.push('Mood is trending upward')
  }
  if (patterns.temporal?.consistency > 70) {
    strengths.push('Consistent engagement with wellness tools')
  }
  if (patterns.progress?.journeyMetrics?.completionRate > 50) {
    strengths.push('Strong journey completion rate')
  }
  
  return strengths
}

function identifyChallenges(patterns: any): string[] {
  const challenges = []
  
  if (patterns.emotional?.anxietyTrend === 'declining') {
    challenges.push('Anxiety levels need attention')
  }
  if (patterns.coping?.topTriggers?.length > 3) {
    challenges.push('Multiple recurring triggers identified')
  }
  
  return challenges
}

function identifyOpportunities(patterns: any): string[] {
  const opportunities = []
  
  if (patterns.progress?.journeyMetrics?.active < 2) {
    opportunities.push('Explore new growth journeys')
  }
  if (patterns.coping?.effectiveness < 50) {
    opportunities.push('Discover more effective coping strategies')
  }
  
  return opportunities
}

function generateInsights(patterns: any): any[] {
  const insights = []
  
  // Behavioral insights
  if (patterns.behavioral?.recurringTopics?.length > 0) {
    insights.push({
      type: 'behavioral',
      title: 'Recurring Themes',
      description: `You frequently discuss ${patterns.behavioral.recurringTopics[0]?.topic}`,
      action: 'Explore root causes in your next session'
    })
  }
  
  // Emotional insights
  if (patterns.emotional?.volatility?.mood > 1.5) {
    insights.push({
      type: 'emotional',
      title: 'Mood Variability',
      description: 'Your mood shows significant fluctuations',
      action: 'Consider mood stabilization techniques'
    })
  }
  
  // Progress insights
  if (patterns.progress?.momentum === 'accelerating') {
    insights.push({
      type: 'progress',
      title: 'Great Momentum!',
      description: 'Your progress is accelerating',
      action: 'Maintain current practices'
    })
  }
  
  return insights
}

function prepareVisualizationData(patterns: any): any {
  return {
    moodChart: {
      type: 'line',
      data: patterns.emotional?.moodTrend || []
    },
    topicsCloud: {
      type: 'wordcloud',
      data: patterns.behavioral?.recurringTopics || []
    },
    progressGauge: {
      type: 'gauge',
      data: patterns.progress?.journeyMetrics?.averageProgress || 0
    },
    timeHeatmap: {
      type: 'heatmap',
      data: patterns.temporal?.activeTimeSlots || []
    }
  }
}