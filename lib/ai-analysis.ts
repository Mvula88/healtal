interface AnalysisInput {
  conversations: any[]
  checkins: any[]
  journeys: any[]
}

interface PatternAnalysis {
  patterns: Pattern[]
  recommendations: Recommendation[]
  breakthroughs: Breakthrough[]
  trends: Trend[]
  risks: RiskFactor[]
  strengths: Strength[]
  nextSteps: NextStep[]
}

interface Pattern {
  type: string
  description: string
  frequency: number
  impact: 'positive' | 'negative' | 'neutral'
  firstDetected: string
  lastOccurred: string
  relatedFactors: string[]
}

interface Recommendation {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: string
  expectedOutcome: string
  suggestedActions: string[]
}

interface Breakthrough {
  date: string
  type: string
  description: string
  triggerEvent?: string
  impactScore: number
}

interface Trend {
  metric: string
  direction: 'improving' | 'declining' | 'stable'
  changeRate: number
  prediction: string
  confidenceLevel: number
}

interface RiskFactor {
  type: string
  severity: 'high' | 'medium' | 'low'
  description: string
  mitigationStrategies: string[]
}

interface Strength {
  area: string
  description: string
  evidence: string[]
  suggestions: string[]
}

interface NextStep {
  action: string
  rationale: string
  expectedDuration: string
  resources: string[]
}

export async function analyzeUserPatterns(input: AnalysisInput): Promise<PatternAnalysis> {
  // Analyze conversation patterns
  const conversationPatterns = analyzeConversations(input.conversations)
  
  // Analyze mood and check-in patterns
  const checkinPatterns = analyzeCheckins(input.checkins)
  
  // Analyze journey progress
  const journeyInsights = analyzeJourneys(input.journeys)
  
  // Cross-reference all data for comprehensive insights
  const comprehensiveAnalysis = synthesizeInsights(
    conversationPatterns,
    checkinPatterns,
    journeyInsights
  )
  
  return comprehensiveAnalysis
}

function analyzeConversations(conversations: any[]): any {
  const patterns: Pattern[] = []
  const topics = new Map<string, number>()
  const emotions = new Map<string, number>()
  const timePatterns = new Map<string, number>()
  
  conversations.forEach(conv => {
    // Extract topics from conversation
    const convTopics = extractTopics(conv.title, conv.mode)
    convTopics.forEach(topic => {
      topics.set(topic, (topics.get(topic) || 0) + 1)
    })
    
    // Analyze time patterns
    const hour = new Date(conv.created_at).getHours()
    const timeSlot = getTimeSlot(hour)
    timePatterns.set(timeSlot, (timePatterns.get(timeSlot) || 0) + 1)
    
    // Track emotional states
    if (conv.mode) {
      emotions.set(conv.mode, (emotions.get(conv.mode) || 0) + 1)
    }
  })
  
  // Convert to patterns
  topics.forEach((count, topic) => {
    if (count >= 3) {
      patterns.push({
        type: 'recurring_topic',
        description: `Frequently discusses ${topic}`,
        frequency: count,
        impact: determineImpact(topic),
        firstDetected: conversations[conversations.length - 1]?.created_at || '',
        lastOccurred: conversations[0]?.created_at || '',
        relatedFactors: []
      })
    }
  })
  
  return { patterns, topics, emotions, timePatterns }
}

function analyzeCheckins(checkins: any[]): any {
  if (!checkins.length) return { trends: [], patterns: [] }
  
  const trends: Trend[] = []
  const patterns: Pattern[] = []
  
  // Calculate mood trends
  const moodScores = checkins.map(c => c.mood_score).filter(Boolean)
  const moodTrend = calculateTrend(moodScores)
  
  trends.push({
    metric: 'Mood',
    direction: moodTrend.direction,
    changeRate: moodTrend.rate,
    prediction: `Expected to ${moodTrend.direction} over next week`,
    confidenceLevel: moodTrend.confidence
  })
  
  // Analyze triggers
  const triggerMap = new Map<string, number>()
  checkins.forEach(checkin => {
    if (checkin.triggers_today) {
      checkin.triggers_today.forEach((trigger: string) => {
        triggerMap.set(trigger, (triggerMap.get(trigger) || 0) + 1)
      })
    }
  })
  
  // Identify recurring triggers
  triggerMap.forEach((count, trigger) => {
    if (count >= 3) {
      patterns.push({
        type: 'recurring_trigger',
        description: `${trigger} appears frequently`,
        frequency: count,
        impact: 'negative',
        firstDetected: checkins[checkins.length - 1]?.created_at || '',
        lastOccurred: checkins[0]?.created_at || '',
        relatedFactors: []
      })
    }
  })
  
  return { trends, patterns, triggers: triggerMap }
}

function analyzeJourneys(journeys: any[]): any {
  const activeJourneys = journeys.filter(j => j.status === 'active')
  const completedJourneys = journeys.filter(j => j.status === 'completed')
  
  const insights = {
    completionRate: journeys.length > 0 ? completedJourneys.length / journeys.length : 0,
    averageProgress: activeJourneys.reduce((sum, j) => sum + (j.progress || 0), 0) / (activeJourneys.length || 1),
    focusAreas: activeJourneys.map(j => j.focus_area).filter(Boolean)
  }
  
  return insights
}

function synthesizeInsights(
  conversationData: any,
  checkinData: any,
  journeyData: any
): PatternAnalysis {
  const patterns: Pattern[] = [
    ...conversationData.patterns,
    ...checkinData.patterns
  ]
  
  const recommendations: Recommendation[] = generateRecommendations(
    patterns,
    checkinData.trends,
    journeyData
  )
  
  const breakthroughs: Breakthrough[] = identifyBreakthroughs(
    conversationData,
    checkinData
  )
  
  const risks: RiskFactor[] = identifyRisks(patterns, checkinData.triggers)
  
  const strengths: Strength[] = identifyStrengths(
    conversationData,
    checkinData,
    journeyData
  )
  
  const nextSteps: NextStep[] = generateNextSteps(
    patterns,
    recommendations,
    journeyData
  )
  
  return {
    patterns,
    recommendations,
    breakthroughs,
    trends: checkinData.trends || [],
    risks,
    strengths,
    nextSteps
  }
}

function generateRecommendations(
  patterns: Pattern[],
  trends: Trend[],
  journeyData: any
): Recommendation[] {
  const recommendations: Recommendation[] = []
  
  // Recommend based on recurring negative patterns
  const negativePatterns = patterns.filter(p => p.impact === 'negative')
  negativePatterns.forEach(pattern => {
    recommendations.push({
      title: `Address ${pattern.type.replace('_', ' ')}`,
      description: `We've noticed ${pattern.description.toLowerCase()}. This pattern has occurred ${pattern.frequency} times.`,
      priority: pattern.frequency > 5 ? 'high' : 'medium',
      category: 'Pattern Management',
      expectedOutcome: 'Reduced frequency and impact of this pattern',
      suggestedActions: [
        'Explore root causes in your next AI coaching session',
        'Track occurrences in daily check-ins',
        'Join a relevant healing circle for peer support'
      ]
    })
  })
  
  // Recommend based on trends
  trends.forEach(trend => {
    if (trend.direction === 'declining' && trend.metric === 'Mood') {
      recommendations.push({
        title: 'Mood Support Needed',
        description: 'Your mood has been trending downward. Let\'s address this proactively.',
        priority: 'high',
        category: 'Wellness',
        expectedOutcome: 'Stabilized and improved mood',
        suggestedActions: [
          'Schedule daily AI coaching check-ins',
          'Consider professional support',
          'Implement mood-boosting activities'
        ]
      })
    }
  })
  
  return recommendations
}

function identifyBreakthroughs(conversationData: any, checkinData: any): Breakthrough[] {
  const breakthroughs: Breakthrough[] = []
  
  // Look for significant positive changes in mood
  if (checkinData.trends?.length > 0) {
    const moodTrend = checkinData.trends.find((t: Trend) => t.metric === 'Mood')
    if (moodTrend && moodTrend.direction === 'improving' && moodTrend.changeRate > 20) {
      breakthroughs.push({
        date: new Date().toISOString(),
        type: 'mood_improvement',
        description: 'Significant mood improvement detected',
        impactScore: 8
      })
    }
  }
  
  return breakthroughs
}

function identifyRisks(patterns: Pattern[], triggers: Map<string, number>): RiskFactor[] {
  const risks: RiskFactor[] = []
  
  // Check for high-frequency negative patterns
  const highFreqNegative = patterns.filter(
    p => p.impact === 'negative' && p.frequency > 5
  )
  
  highFreqNegative.forEach(pattern => {
    risks.push({
      type: pattern.type,
      severity: pattern.frequency > 10 ? 'high' : 'medium',
      description: `Recurring pattern: ${pattern.description}`,
      mitigationStrategies: [
        'Identify and address root causes',
        'Develop coping strategies',
        'Seek professional support if needed'
      ]
    })
  })
  
  return risks
}

function identifyStrengths(
  conversationData: any,
  checkinData: any,
  journeyData: any
): Strength[] {
  const strengths: Strength[] = []
  
  // Check for consistent engagement
  if (conversationData.patterns.length > 0) {
    strengths.push({
      area: 'Engagement',
      description: 'Consistently engaging with self-improvement tools',
      evidence: ['Regular AI coaching sessions', 'Active pattern tracking'],
      suggestions: ['Maintain this consistency', 'Share your experience with others']
    })
  }
  
  // Check for journey progress
  if (journeyData.averageProgress > 50) {
    strengths.push({
      area: 'Goal Achievement',
      description: 'Making steady progress on growth journeys',
      evidence: [`${journeyData.averageProgress}% average progress`],
      suggestions: ['Set more ambitious goals', 'Mentor others on similar journeys']
    })
  }
  
  return strengths
}

function generateNextSteps(
  patterns: Pattern[],
  recommendations: Recommendation[],
  journeyData: any
): NextStep[] {
  const nextSteps: NextStep[] = []
  
  // Prioritize high-priority recommendations
  const highPriority = recommendations.filter(r => r.priority === 'high')
  highPriority.forEach(rec => {
    nextSteps.push({
      action: rec.suggestedActions[0],
      rationale: rec.description,
      expectedDuration: '1 week',
      resources: ['AI Coach', 'Daily Check-ins', 'Community Support']
    })
  })
  
  // Add journey-based next steps
  if (journeyData.averageProgress < 30) {
    nextSteps.push({
      action: 'Focus on current growth journey',
      rationale: 'Your journey progress could benefit from more attention',
      expectedDuration: '2 weeks',
      resources: ['Journey Milestones', 'AI Guidance', 'Progress Tracking']
    })
  }
  
  return nextSteps.slice(0, 5) // Return top 5 next steps
}

// Helper functions
function extractTopics(title: string, mode: string): string[] {
  const topics: string[] = []
  
  // Map modes to topics
  const modeTopics: Record<string, string[]> = {
    'anxiety': ['anxiety', 'worry', 'stress'],
    'depression': ['depression', 'sadness', 'mood'],
    'relationship': ['relationships', 'communication', 'boundaries'],
    'trauma': ['trauma', 'healing', 'recovery'],
    'addiction': ['addiction', 'recovery', 'sobriety']
  }
  
  if (mode && modeTopics[mode]) {
    topics.push(...modeTopics[mode])
  }
  
  // Extract from title
  if (title) {
    const keywords = title.toLowerCase().split(' ')
    keywords.forEach(word => {
      if (word.length > 4) {
        topics.push(word)
      }
    })
  }
  
  return [...new Set(topics)]
}

function getTimeSlot(hour: number): string {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'late_night'
}

function determineImpact(topic: string): 'positive' | 'negative' | 'neutral' {
  const negativeTopics = ['anxiety', 'stress', 'trauma', 'depression', 'addiction']
  const positiveTopics = ['growth', 'healing', 'recovery', 'progress', 'achievement']
  
  if (negativeTopics.includes(topic)) return 'negative'
  if (positiveTopics.includes(topic)) return 'positive'
  return 'neutral'
}

function calculateTrend(values: number[]): {
  direction: 'improving' | 'declining' | 'stable'
  rate: number
  confidence: number
} {
  if (values.length < 2) {
    return { direction: 'stable', rate: 0, confidence: 0 }
  }
  
  const recent = values.slice(0, Math.min(5, values.length))
  const older = values.slice(Math.min(5, values.length))
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg = older.length > 0 
    ? older.reduce((a, b) => a + b, 0) / older.length 
    : recentAvg
  
  const change = ((recentAvg - olderAvg) / olderAvg) * 100
  
  let direction: 'improving' | 'declining' | 'stable'
  if (change > 5) direction = 'improving'
  else if (change < -5) direction = 'declining'
  else direction = 'stable'
  
  const confidence = Math.min(values.length * 10, 90)
  
  return {
    direction,
    rate: Math.abs(change),
    confidence
  }
}