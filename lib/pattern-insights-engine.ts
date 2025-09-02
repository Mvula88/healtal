import { createUntypedServerClient } from '@/lib/supabase/server-untyped'

interface PatternInsight {
  patternId: string
  insight: string
  confidence: number
  category: 'trigger' | 'correlation' | 'prediction' | 'recommendation'
  relatedPatterns: string[]
  actionableSteps: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

interface CrossUserPattern {
  patternType: string
  prevalence: number // percentage of users with this pattern
  commonTriggers: string[]
  effectiveInterventions: string[]
  averageResolutionTime: number // days
  correlatedPatterns: Array<{
    pattern: string
    correlation: number
  }>
}

interface PredictiveInsight {
  userId: string
  predictedPattern: string
  probability: number
  timeframe: string // e.g., "next 7 days"
  preventionStrategies: string[]
  earlyWarningSignals: string[]
}

export class PatternInsightsEngine {
  private supabase: any
  private aiCache: Map<string, any> = new Map()
  private insightThresholds = {
    minDataPoints: 5,
    minConfidence: 0.7,
    correlationThreshold: 0.6
  }

  constructor() {
    this.initializeEngine()
  }

  private async initializeEngine() {
    this.supabase = await createUntypedServerClient()
    // Load pre-computed insights
    await this.loadCachedInsights()
  }

  private async loadCachedInsights() {
    const { data } = await this.supabase
      .from('pattern_insights_cache')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (data) {
      data.forEach((item: any) => {
        this.aiCache.set(item.cache_key, item.insights)
      })
    }
  }

  // Core Analysis Methods

  async analyzeUserPatterns(userId: string): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = []

    // Fetch user's pattern data
    const { data: patterns } = await this.supabase
      .from('pattern_analysis')
      .select(`
        *,
        pattern_triggers (*),
        pattern_timeline (*),
        pattern_connections (*)
      `)
      .eq('user_id', userId)

    if (!patterns || patterns.length === 0) {
      return insights
    }

    // Analyze each pattern
    for (const pattern of patterns) {
      const patternInsights = await this.generatePatternInsights(pattern, userId)
      insights.push(...patternInsights)
    }

    // Find cross-pattern correlations
    const correlations = await this.findPatternCorrelations(patterns)
    insights.push(...correlations)

    // Generate predictive insights
    const predictions = await this.generatePredictiveInsights(userId, patterns)
    insights.push(...predictions)

    // Cache insights for performance
    await this.cacheInsights(userId, insights)

    return insights
  }

  private async generatePatternInsights(
    pattern: any,
    userId: string
  ): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = []

    // Trigger Analysis
    if (pattern.pattern_triggers && pattern.pattern_triggers.length >= this.insightThresholds.minDataPoints) {
      const triggerInsight = this.analyzeTriggers(pattern.pattern_triggers)
      if (triggerInsight) {
        insights.push({
          patternId: pattern.id,
          insight: triggerInsight.message,
          confidence: triggerInsight.confidence,
          category: 'trigger',
          relatedPatterns: [],
          actionableSteps: triggerInsight.recommendations,
          riskLevel: this.calculateRiskLevel(pattern.severity, pattern.frequency)
        })
      }
    }

    // Timeline Analysis
    if (pattern.pattern_timeline && pattern.pattern_timeline.length > 0) {
      const timelineInsight = this.analyzeTimeline(pattern.pattern_timeline)
      if (timelineInsight) {
        insights.push({
          patternId: pattern.id,
          insight: timelineInsight.message,
          confidence: timelineInsight.confidence,
          category: 'correlation',
          relatedPatterns: timelineInsight.relatedPatterns || [],
          actionableSteps: timelineInsight.recommendations,
          riskLevel: 'medium'
        })
      }
    }

    // Compare with community patterns
    const communityInsight = await this.compareToCommunityPatterns(pattern)
    if (communityInsight) {
      insights.push(communityInsight)
    }

    return insights
  }

  private analyzeTriggers(triggers: any[]): any {
    if (triggers.length < this.insightThresholds.minDataPoints) {
      return null
    }

    // Group triggers by type
    const triggerGroups = triggers.reduce((acc, trigger) => {
      acc[trigger.trigger_type] = (acc[trigger.trigger_type] || 0) + trigger.occurrence_count
      return acc
    }, {} as Record<string, number>)

    // Find most common trigger
    const mostCommon = Object.entries(triggerGroups).sort((a, b) => (b[1] as number) - (a[1] as number))[0]
    
    // Calculate average intensity
    const avgIntensity = triggers.reduce((sum, t) => sum + t.intensity, 0) / triggers.length

    const confidence = Math.min(triggers.length / 10, 1) // More data = higher confidence

    return {
      message: `Your ${mostCommon[0]} triggers occur ${mostCommon[1]} times more frequently than others. Average intensity is ${avgIntensity.toFixed(1)}/10.`,
      confidence,
      recommendations: [
        `Focus on managing ${mostCommon[0]} triggers first`,
        avgIntensity > 7 ? 'Consider crisis prevention strategies' : 'Practice regular coping techniques',
        'Track trigger patterns for the next week to identify timing'
      ]
    }
  }

  private analyzeTimeline(timeline: any[]): any {
    if (timeline.length < 3) {
      return null
    }

    // Sort by date
    const sorted = timeline.sort((a, b) => 
      new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime()
    )

    // Calculate pattern frequency
    const intervals: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      const diff = new Date(sorted[i].occurred_at).getTime() - 
                   new Date(sorted[i-1].occurred_at).getTime()
      intervals.push(diff / (1000 * 60 * 60 * 24)) // Convert to days
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const isAccelerating = intervals[intervals.length - 1] < avgInterval

    // Analyze emotional states
    const emotionalStates = timeline.map(t => t.emotional_state).filter(Boolean)
    const dominantEmotion = this.findMostCommon(emotionalStates)

    // Analyze coping strategies effectiveness
    const successfulCoping = timeline
      .filter(t => t.outcome === 'positive' && t.coping_used?.length > 0)
      .flatMap(t => t.coping_used)
    
    const mostEffectiveCoping = this.findMostCommon(successfulCoping)

    return {
      message: isAccelerating 
        ? `This pattern is occurring more frequently (every ${intervals[intervals.length - 1].toFixed(0)} days vs average of ${avgInterval.toFixed(0)} days).`
        : `This pattern occurs approximately every ${avgInterval.toFixed(0)} days.`,
      confidence: Math.min(timeline.length / 10, 1),
      recommendations: [
        isAccelerating ? 'Increase support and coping strategies' : 'Maintain current interventions',
        mostEffectiveCoping ? `'${mostEffectiveCoping}' has been your most effective coping strategy` : 'Try different coping strategies',
        dominantEmotion ? `Address underlying ${dominantEmotion} emotions` : 'Track emotional patterns'
      ],
      relatedPatterns: []
    }
  }

  private async compareToCommunityPatterns(pattern: any): Promise<PatternInsight | null> {
    // Get aggregated community data for this pattern type
    const { data: communityData } = await this.supabase
      .rpc('get_community_pattern_stats', {
        pattern_type: pattern.pattern_type
      })

    if (!communityData || communityData.length === 0) {
      return null
    }

    const stats = communityData[0]
    const userSeverity = pattern.severity
    const avgSeverity = stats.avg_severity
    const successRate = stats.resolution_rate

    let insight = ''
    let recommendations: string[] = []

    if (userSeverity > avgSeverity * 1.2) {
      insight = `Your ${pattern.pattern_type} pattern is more severe than 80% of the community.`
      recommendations = [
        'Consider professional support',
        'Join a focused support group',
        'Implement intensive interventions'
      ]
    } else if (userSeverity < avgSeverity * 0.8) {
      insight = `You're managing this pattern better than 70% of the community!`
      recommendations = [
        'Share your strategies with the community',
        'Help others with similar patterns',
        'Maintain your current approach'
      ]
    } else {
      insight = `Your pattern aligns with community averages. ${successRate}% successfully manage this.`
      recommendations = stats.effective_strategies || [
        'Connect with others facing similar challenges',
        'Try community-validated strategies',
        'Track your progress against community benchmarks'
      ]
    }

    return {
      patternId: pattern.id,
      insight,
      confidence: 0.85,
      category: 'correlation',
      relatedPatterns: stats.correlated_patterns || [],
      actionableSteps: recommendations,
      riskLevel: userSeverity > avgSeverity ? 'high' : 'medium'
    }
  }

  private async findPatternCorrelations(patterns: any[]): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = []
    
    if (patterns.length < 2) {
      return insights
    }

    // Analyze connections between patterns
    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const correlation = await this.calculatePatternCorrelation(patterns[i], patterns[j])
        
        if (correlation > this.insightThresholds.correlationThreshold) {
          insights.push({
            patternId: patterns[i].id,
            insight: `Strong correlation (${(correlation * 100).toFixed(0)}%) found between your ${patterns[i].pattern_name} and ${patterns[j].pattern_name} patterns.`,
            confidence: correlation,
            category: 'correlation',
            relatedPatterns: [patterns[j].id],
            actionableSteps: [
              `Address both patterns together for better results`,
              `When ${patterns[i].pattern_name} improves, expect ${patterns[j].pattern_name} to follow`,
              'Consider if one pattern triggers the other'
            ],
            riskLevel: 'medium'
          })
        }
      }
    }

    return insights
  }

  private async calculatePatternCorrelation(pattern1: any, pattern2: any): Promise<number> {
    // Simple correlation based on timing and triggers
    const sharedTriggers = pattern1.pattern_triggers?.filter((t1: any) =>
      pattern2.pattern_triggers?.some((t2: any) => t2.trigger_type === t1.trigger_type)
    ).length || 0

    const totalTriggers = (pattern1.pattern_triggers?.length || 0) + (pattern2.pattern_triggers?.length || 0)
    
    if (totalTriggers === 0) return 0

    const triggerCorrelation = (sharedTriggers * 2) / totalTriggers

    // Check temporal correlation
    const timeline1 = pattern1.pattern_timeline || []
    const timeline2 = pattern2.pattern_timeline || []
    
    let temporalCorrelation = 0
    const timeWindow = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds

    for (const event1 of timeline1) {
      const closeEvents = timeline2.filter((event2: any) => {
        const diff = Math.abs(
          new Date(event1.occurred_at).getTime() - new Date(event2.occurred_at).getTime()
        )
        return diff <= timeWindow
      })
      if (closeEvents.length > 0) {
        temporalCorrelation += 1
      }
    }

    if (timeline1.length > 0) {
      temporalCorrelation = temporalCorrelation / timeline1.length
    }

    // Weighted average
    return (triggerCorrelation * 0.4 + temporalCorrelation * 0.6)
  }

  private async generatePredictiveInsights(
    userId: string,
    patterns: any[]
  ): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = []

    for (const pattern of patterns) {
      const prediction = await this.predictPatternOccurrence(pattern)
      
      if (prediction && prediction.probability > this.insightThresholds.minConfidence) {
        insights.push({
          patternId: pattern.id,
          insight: `${prediction.probability > 0.8 ? 'High' : 'Moderate'} likelihood of ${pattern.pattern_name} pattern in the next ${prediction.timeframe}.`,
          confidence: prediction.probability,
          category: 'prediction',
          relatedPatterns: [],
          actionableSteps: prediction.preventionStrategies,
          riskLevel: prediction.probability > 0.8 ? 'high' : 'medium'
        })
      }
    }

    return insights
  }

  private async predictPatternOccurrence(pattern: any): Promise<any> {
    const timeline = pattern.pattern_timeline || []
    
    if (timeline.length < 3) {
      return null
    }

    // Calculate average interval
    const sorted = timeline.sort((a: any, b: any) => 
      new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    )
    
    const lastOccurrence = new Date(sorted[0].occurred_at)
    const now = new Date()
    const daysSinceLastOccurrence = (now.getTime() - lastOccurrence.getTime()) / (1000 * 60 * 60 * 24)

    // Calculate pattern intervals
    const intervals: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      const diff = new Date(sorted[i-1].occurred_at).getTime() - 
                   new Date(sorted[i].occurred_at).getTime()
      intervals.push(diff / (1000 * 60 * 60 * 24))
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const stdDev = Math.sqrt(intervals.reduce((sum, interval) => 
      sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length)

    // Calculate probability based on time since last occurrence
    let probability = 0
    if (daysSinceLastOccurrence >= avgInterval - stdDev) {
      probability = Math.min((daysSinceLastOccurrence - avgInterval + stdDev) / (2 * stdDev), 1)
    }

    // Identify early warning signals
    const triggers = pattern.pattern_triggers || []
    const commonTriggers = triggers
      .sort((a: any, b: any) => b.occurrence_count - a.occurrence_count)
      .slice(0, 3)
      .map((t: any) => t.trigger_description || t.trigger_type)

    return {
      probability,
      timeframe: probability > 0.8 ? '3-5 days' : '7-10 days',
      preventionStrategies: [
        'Increase use of coping strategies',
        'Schedule extra support or therapy sessions',
        'Avoid known triggers: ' + commonTriggers.join(', '),
        'Practice stress reduction techniques daily',
        'Reach out to your support network proactively'
      ],
      earlyWarningSignals: commonTriggers
    }
  }

  // Cross-User Analysis for Community Insights

  async analyzeCommunityPatterns(): Promise<CrossUserPattern[]> {
    const insights: CrossUserPattern[] = []

    // Get aggregated pattern data across all users
    const { data: aggregatedData } = await this.supabase
      .rpc('get_aggregated_pattern_insights')

    if (!aggregatedData) {
      return insights
    }

    for (const patternType of aggregatedData) {
      const communityPattern = await this.processCommunityPattern(patternType)
      if (communityPattern) {
        insights.push(communityPattern)
      }
    }

    // Store in pattern knowledge base
    await this.updatePatternKnowledgeBase(insights)

    return insights
  }

  private async processCommunityPattern(data: any): Promise<CrossUserPattern | null> {
    if (data.user_count < 10) {
      return null // Need minimum users for valid insights
    }

    // Get successful interventions
    const { data: interventions } = await this.supabase
      .from('pattern_analysis')
      .select('pattern_timeline')
      .eq('pattern_type', data.pattern_type)
      .eq('status', 'resolved')
      .limit(50)

    const effectiveInterventions = this.extractEffectiveInterventions(interventions)

    // Find correlated patterns
    const { data: correlations } = await this.supabase
      .rpc('get_pattern_correlations', {
        pattern_type: data.pattern_type
      })

    return {
      patternType: data.pattern_type,
      prevalence: (data.user_count / data.total_users) * 100,
      commonTriggers: data.common_triggers || [],
      effectiveInterventions,
      averageResolutionTime: data.avg_resolution_days || 0,
      correlatedPatterns: correlations?.map((c: any) => ({
        pattern: c.correlated_pattern,
        correlation: c.correlation_strength
      })) || []
    }
  }

  private extractEffectiveInterventions(interventions: any[]): string[] {
    if (!interventions || interventions.length === 0) {
      return []
    }

    const copingStrategies: Record<string, number> = {}

    interventions.forEach(item => {
      if (item.pattern_timeline) {
        item.pattern_timeline.forEach((event: any) => {
          if (event.outcome === 'positive' && event.coping_used) {
            event.coping_used.forEach((strategy: string) => {
              copingStrategies[strategy] = (copingStrategies[strategy] || 0) + 1
            })
          }
        })
      }
    })

    // Return top 5 most effective strategies
    return Object.entries(copingStrategies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([strategy]) => strategy)
  }

  private async updatePatternKnowledgeBase(insights: CrossUserPattern[]) {
    for (const insight of insights) {
      await this.supabase
        .from('pattern_knowledge_base')
        .upsert({
          pattern_type: insight.patternType,
          prevalence: insight.prevalence,
          common_triggers: insight.commonTriggers,
          effective_interventions: insight.effectiveInterventions,
          average_resolution_time: insight.averageResolutionTime,
          correlated_patterns: insight.correlatedPatterns,
          updated_at: new Date().toISOString()
        })
    }
  }

  // Helper Methods

  private calculateRiskLevel(severity: number, frequency: number): 'low' | 'medium' | 'high' {
    const riskScore = (severity * 0.6) + (frequency * 0.4)
    if (riskScore >= 7) return 'high'
    if (riskScore >= 4) return 'medium'
    return 'low'
  }

  private findMostCommon(items: string[]): string | null {
    if (items.length === 0) return null

    const counts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null
  }

  private async cacheInsights(userId: string, insights: PatternInsight[]) {
    const cacheKey = `user_insights_${userId}`
    
    await this.supabase
      .from('pattern_insights_cache')
      .upsert({
        cache_key: cacheKey,
        user_id: userId,
        insights: insights,
        created_at: new Date().toISOString()
      })

    this.aiCache.set(cacheKey, insights)
  }

  // Public API Methods

  async getUserInsights(userId: string): Promise<PatternInsight[]> {
    const cacheKey = `user_insights_${userId}`
    
    // Check cache first
    if (this.aiCache.has(cacheKey)) {
      const cached = this.aiCache.get(cacheKey)
      const cacheAge = Date.now() - new Date(cached.created_at).getTime()
      
      // Use cache if less than 1 hour old
      if (cacheAge < 60 * 60 * 1000) {
        return cached.insights
      }
    }

    // Generate fresh insights
    return await this.analyzeUserPatterns(userId)
  }

  async getRecommendations(userId: string, patternId: string): Promise<string[]> {
    const insights = await this.getUserInsights(userId)
    const patternInsights = insights.filter(i => i.patternId === patternId)
    
    const recommendations = new Set<string>()
    patternInsights.forEach(insight => {
      insight.actionableSteps.forEach(step => recommendations.add(step))
    })

    return Array.from(recommendations)
  }

  async getCommunityInsights(patternType: string): Promise<CrossUserPattern | null> {
    const { data } = await this.supabase
      .from('pattern_knowledge_base')
      .select('*')
      .eq('pattern_type', patternType)
      .single()

    return data
  }
}

// Export singleton instance
export const patternInsightsEngine = new PatternInsightsEngine()