'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Target,
  Brain,
  Calendar,
  Activity,
  BarChart3,
  Users,
  Zap,
  Shield,
  ArrowRight,
  ChevronRight
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format } from 'date-fns'

interface Pattern {
  id: string
  name: string
  frequency: number
  trend: 'increasing' | 'decreasing' | 'stable'
  lastOccurrence: string
  triggers: string[]
  correlations: { pattern: string; strength: number }[]
  severity: 'low' | 'medium' | 'high'
}

interface PatternAnalytics {
  topPatterns: Pattern[]
  patternHistory: { date: string; count: number }[]
  triggerCorrelations: { trigger: string; patterns: string[]; strength: number }[]
  progressMetrics: {
    patternsDecreasing: number
    patternsIncreasing: number
    overallImprovement: number
  }
}

export function PatternAnalyticsDashboard({ userId }: { userId: string }) {
  const [analytics, setAnalytics] = useState<PatternAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')
  const supabase = createClient()

  useEffect(() => {
    fetchPatternAnalytics()
  }, [userId, timeRange])

  const fetchPatternAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch pattern analysis data
      const { data: patterns } = await supabase
        .from('pattern_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Fetch pattern connections
      const { data: connections } = await supabase
        .from('pattern_connections')
        .select('*')
        .eq('user_id', userId)

      // Fetch pattern timeline
      const { data: timeline } = await supabase
        .from('pattern_timeline')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: false })

      // Process data into analytics format
      const processedAnalytics = processPatternData(patterns || [], connections || [], timeline || [])
      setAnalytics(processedAnalytics)
    } catch (error) {
      console.error('Error fetching pattern analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const processPatternData = (patterns: any[], connections: any[], timeline: any[]): PatternAnalytics => {
    // Process top patterns
    const topPatterns: Pattern[] = patterns.slice(0, 5).map(p => ({
      id: p.id,
      name: p.pattern_name,
      frequency: calculateFrequency(p.id, timeline),
      trend: calculateTrend(p.id, timeline),
      lastOccurrence: getLastOccurrence(p.id, timeline),
      triggers: p.triggers?.triggers || [],
      correlations: getCorrelations(p.id, connections),
      severity: determineSeverity(p.impacts)
    }))

    // Calculate pattern history
    const patternHistory = calculatePatternHistory(timeline)

    // Calculate trigger correlations
    const triggerCorrelations = calculateTriggerCorrelations(patterns)

    // Calculate progress metrics
    const progressMetrics = {
      patternsDecreasing: topPatterns.filter(p => p.trend === 'decreasing').length,
      patternsIncreasing: topPatterns.filter(p => p.trend === 'increasing').length,
      overallImprovement: calculateOverallImprovement(patternHistory)
    }

    return {
      topPatterns,
      patternHistory,
      triggerCorrelations,
      progressMetrics
    }
  }

  const calculateFrequency = (patternId: string, timeline: any[]) => {
    const occurrences = timeline.filter(t => t.pattern_id === patternId)
    return occurrences.length
  }

  const calculateTrend = (patternId: string, timeline: any[]): 'increasing' | 'decreasing' | 'stable' => {
    const occurrences = timeline.filter(t => t.pattern_id === patternId)
    if (occurrences.length < 2) return 'stable'
    
    const recent = occurrences.slice(0, Math.floor(occurrences.length / 2))
    const older = occurrences.slice(Math.floor(occurrences.length / 2))
    
    const recentFreq = recent.length
    const olderFreq = older.length
    
    if (recentFreq > olderFreq * 1.2) return 'increasing'
    if (recentFreq < olderFreq * 0.8) return 'decreasing'
    return 'stable'
  }

  const getLastOccurrence = (patternId: string, timeline: any[]) => {
    const occurrence = timeline.find(t => t.pattern_id === patternId)
    return occurrence?.event_date || new Date().toISOString()
  }

  const getCorrelations = (patternId: string, connections: any[]) => {
    return connections
      .filter(c => c.from_pattern_id === patternId || c.to_pattern_id === patternId)
      .map(c => ({
        pattern: c.from_pattern_id === patternId ? c.to_pattern_id : c.from_pattern_id,
        strength: c.strength
      }))
      .slice(0, 3)
  }

  const determineSeverity = (impacts: any): 'low' | 'medium' | 'high' => {
    if (!impacts) return 'low'
    const impactScore = impacts.emotional_impact || 0
    if (impactScore >= 7) return 'high'
    if (impactScore >= 4) return 'medium'
    return 'low'
  }

  const calculatePatternHistory = (timeline: any[]) => {
    const history: { [key: string]: number } = {}
    
    timeline.forEach(event => {
      const date = format(new Date(event.event_date), 'MMM d')
      history[date] = (history[date] || 0) + 1
    })

    return Object.entries(history)
      .map(([date, count]) => ({ date, count }))
      .slice(0, 30)
      .reverse()
  }

  const calculateTriggerCorrelations = (patterns: any[]) => {
    const triggerMap: { [key: string]: Set<string> } = {}
    
    patterns.forEach(p => {
      const triggers = p.triggers?.triggers || []
      triggers.forEach((trigger: string) => {
        if (!triggerMap[trigger]) triggerMap[trigger] = new Set()
        triggerMap[trigger].add(p.pattern_name)
      })
    })

    return Object.entries(triggerMap)
      .map(([trigger, patternSet]) => ({
        trigger,
        patterns: Array.from(patternSet),
        strength: patternSet.size
      }))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5)
  }

  const calculateOverallImprovement = (history: any[]) => {
    if (history.length < 2) return 0
    const recent = history.slice(0, 7).reduce((sum, h) => sum + h.count, 0) / 7
    const older = history.slice(-7).reduce((sum, h) => sum + h.count, 0) / 7
    return Math.round(((older - recent) / older) * 100)
  }

  const COLORS = ['#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-pulse text-teal-600 mx-auto mb-2" />
          <p className="text-gray-600">Analyzing your patterns...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-600">No pattern data available yet. Keep using the coach to build your pattern profile.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Progress Overview */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pattern Analytics Dashboard</h2>
            <p className="text-gray-600">Track and understand your behavioral patterns</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={timeRange === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              Month
            </Button>
            <Button
              variant={timeRange === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('all')}
            >
              All Time
            </Button>
          </div>
        </div>

        {/* Progress Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Patterns Improving</p>
                <p className="text-2xl font-bold text-teal-600">{analytics.progressMetrics.patternsDecreasing}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-teal-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Need Attention</p>
                <p className="text-2xl font-bold text-amber-600">{analytics.progressMetrics.patternsIncreasing}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {analytics.progressMetrics.overallImprovement > 0 ? '+' : ''}
                  {analytics.progressMetrics.overallImprovement}%
                </p>
              </div>
              <Target className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Your Top 5 Recurring Patterns</CardTitle>
          <CardDescription>Click on a pattern to see detailed analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topPatterns.map((pattern, index) => (
              <div
                key={pattern.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => setSelectedPattern(pattern)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                    style={{ backgroundColor: COLORS[index] + '20' }}>
                    <span className="text-lg font-bold" style={{ color: COLORS[index] }}>
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{pattern.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={
                        pattern.severity === 'high' ? 'destructive' : 
                        pattern.severity === 'medium' ? 'default' : 'secondary'
                      }>
                        {pattern.severity} impact
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {pattern.frequency} occurrences
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {pattern.trend === 'decreasing' ? (
                    <TrendingDown className="h-5 w-5 text-green-500" />
                  ) : pattern.trend === 'increasing' ? (
                    <TrendingUp className="h-5 w-5 text-red-500" />
                  ) : (
                    <Activity className="h-5 w-5 text-gray-400" />
                  )}
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pattern Frequency Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Pattern Frequency Over Time</CardTitle>
          <CardDescription>Track how your patterns change day by day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.patternHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#14b8a6" 
                strokeWidth={2}
                dot={{ fill: '#14b8a6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trigger Correlations */}
      <Card>
        <CardHeader>
          <CardTitle>Pattern Triggers & Correlations</CardTitle>
          <CardDescription>Understand what triggers your patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.triggerCorrelations.map((correlation, index) => (
              <div key={index} className="border-l-4 border-teal-500 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{correlation.trigger}</p>
                    <p className="text-sm text-gray-600">
                      Correlates with: {correlation.patterns.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-600">
                      {correlation.strength} patterns
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Pattern Detail Modal */}
      {selectedPattern && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">{selectedPattern.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPattern(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Frequency</p>
                  <p className="text-lg font-semibold">{selectedPattern.frequency} times</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Last Occurrence</p>
                  <p className="text-lg font-semibold">
                    {format(new Date(selectedPattern.lastOccurrence), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Common Triggers</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPattern.triggers.map((trigger, i) => (
                    <Badge key={i} variant="outline">{trigger}</Badge>
                  ))}
                </div>
              </div>

              {selectedPattern.correlations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Related Patterns</h4>
                  <div className="space-y-2">
                    {selectedPattern.correlations.map((corr, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <span className="text-sm">{corr.pattern}</span>
                        <Progress value={corr.strength * 10} className="w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={() => setSelectedPattern(null)}>
                <Brain className="h-4 w-4 mr-2" />
                Explore This Pattern in Coach
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}