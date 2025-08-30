'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { Skeleton, CardSkeleton, ListSkeleton } from '@/components/ui/skeleton'
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Activity,
  Calendar,
  Target,
  Zap,
  Link2,
  ChevronRight,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Network,
  Lightbulb
} from 'lucide-react'
import { format, subDays, startOfWeek } from 'date-fns'

// Types for pattern analysis
interface Pattern {
  id: string
  pattern_name: string
  pattern_type: string
  severity: number
  frequency: number
  first_identified: string
  last_occurred: string
  status: 'active' | 'improving' | 'resolved'
  triggers: Trigger[]
  connections: PatternConnection[]
}

interface Trigger {
  id: string
  trigger_type: string
  trigger_description: string
  intensity: number
  occurrence_count: number
  last_triggered: string
}

interface PatternConnection {
  connected_pattern: string
  connection_type: string
  strength: number
}

interface TimelineEvent {
  id: string
  event_type: string
  event_description: string
  emotional_state: string
  intensity: number
  occurred_at: string
  triggers: string[]
  coping_used: string[]
  outcome: string
}

function PatternsContent() {
  const { user } = useAuth()
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null)
  const [activeTab, setActiveTab] = useState('timeline')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchPatternData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchPatternData = async () => {
    try {
      // Fetch user's patterns
      const { data: patternsData } = await supabase
        .from('pattern_analysis')
        .select(`
          *,
          pattern_triggers (*)
        `)
        .eq('user_id', user?.id)
        .order('severity', { ascending: false })

      if (patternsData) {
        // Fetch pattern connections
        const patternIds = patternsData.map(p => p.id)
        const { data: connections } = await supabase
          .from('pattern_connections')
          .select('*')
          .or(`pattern_from.in.(${patternIds.join(',')}),pattern_to.in.(${patternIds.join(',')})`)

        // Map connections to patterns
        const patternsWithConnections = patternsData.map(pattern => ({
          ...pattern,
          triggers: pattern.pattern_triggers || [],
          connections: connections?.filter(c => 
            c.pattern_from === pattern.id || c.pattern_to === pattern.id
          ).map(c => ({
            connected_pattern: c.pattern_from === pattern.id ? c.pattern_to : c.pattern_from,
            connection_type: c.connection_type,
            strength: c.strength
          })) || []
        }))

        setPatterns(patternsWithConnections)
        if (patternsWithConnections.length > 0) {
          setSelectedPattern(patternsWithConnections[0])
        }
      }

      // Fetch timeline events
      const { data: timeline } = await supabase
        .from('pattern_timeline')
        .select('*')
        .eq('user_id', user?.id)
        .order('occurred_at', { ascending: false })
        .limit(50)

      if (timeline) {
        setTimelineEvents(timeline)
      }
    } catch (error) {
      console.error('Error fetching pattern data:', error)
      // Create mock data for demonstration
      createMockPatternData()
    } finally {
      setLoading(false)
    }
  }

  const createMockPatternData = () => {
    const mockPatterns: Pattern[] = [
      {
        id: '1',
        pattern_name: 'Avoidance of Conflict',
        pattern_type: 'Behavioral',
        severity: 8,
        frequency: 5,
        first_identified: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        last_occurred: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        triggers: [
          {
            id: 't1',
            trigger_type: 'Social',
            trigger_description: 'Disagreement with partner',
            intensity: 8,
            occurrence_count: 12,
            last_triggered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 't2',
            trigger_type: 'Work',
            trigger_description: 'Team meetings with confrontation',
            intensity: 6,
            occurrence_count: 8,
            last_triggered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        connections: [
          {
            connected_pattern: 'People Pleasing',
            connection_type: 'reinforces',
            strength: 8
          },
          {
            connected_pattern: 'Anxiety',
            connection_type: 'triggers',
            strength: 7
          }
        ]
      },
      {
        id: '2',
        pattern_name: 'People Pleasing',
        pattern_type: 'Behavioral',
        severity: 7,
        frequency: 8,
        first_identified: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        last_occurred: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'improving',
        triggers: [
          {
            id: 't3',
            trigger_type: 'Emotional',
            trigger_description: 'Fear of rejection',
            intensity: 9,
            occurrence_count: 20,
            last_triggered: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        connections: []
      },
      {
        id: '3',
        pattern_name: 'Anxiety Spirals',
        pattern_type: 'Emotional',
        severity: 6,
        frequency: 4,
        first_identified: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        last_occurred: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'improving',
        triggers: [
          {
            id: 't4',
            trigger_type: 'Cognitive',
            trigger_description: 'Catastrophizing thoughts',
            intensity: 7,
            occurrence_count: 15,
            last_triggered: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        connections: []
      }
    ]

    const mockTimeline: TimelineEvent[] = [
      {
        id: 'e1',
        event_type: 'Pattern Triggered',
        event_description: 'Avoided confrontation with colleague about project deadline',
        emotional_state: 'Anxious',
        intensity: 7,
        occurred_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        triggers: ['Work pressure', 'Fear of conflict'],
        coping_used: ['Deep breathing', 'Journaling'],
        outcome: 'Partial success - communicated via email instead'
      },
      {
        id: 'e2',
        event_type: 'Breakthrough',
        event_description: 'Successfully expressed disagreement in team meeting',
        emotional_state: 'Empowered',
        intensity: 4,
        occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        triggers: [],
        coping_used: ['Preparation', 'Self-compassion'],
        outcome: 'Positive - felt heard and respected'
      }
    ]

    setPatterns(mockPatterns)
    setSelectedPattern(mockPatterns[0])
    setTimelineEvents(mockTimeline)
  }

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'text-red-600 bg-red-100'
    if (severity >= 5) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-700'
      case 'improving': return 'bg-yellow-100 text-yellow-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <motion.div className="absolute inset-0 -z-10">
        <motion.div 
          className="orb orb-teal w-[600px] h-[600px] -top-48 -right-48"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="orb orb-cyan w-[500px] h-[500px] -bottom-32 -left-32"
          animate={{ 
            y: [0, 20, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Pattern <span className="gradient-text">Analysis</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the deeper patterns shaping your thoughts, emotions, and behaviors
          </p>
          
          {/* Trust indicators */}
          <div className="flex justify-center items-center gap-6 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4 text-teal-500" />
              <span>AI-powered insights</span>
            </div>
            <div className="flex items-center gap-1">
              <Network className="h-4 w-4 text-teal-500" />
              <span>Pattern connections</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4 text-teal-500" />
              <span>Progress tracking</span>
            </div>
          </div>
        </motion.div>

        {/* Pattern Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
          <Card className="trust-badge">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Patterns</p>
                  <p className="text-2xl font-bold text-teal-700">{patterns.filter(p => p.status === 'active').length}</p>
                </div>
                <Brain className="h-8 w-8 text-teal-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
          <Card className="trust-badge">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Improving</p>
                  <p className="text-2xl font-bold text-teal-700">{patterns.filter(p => p.status === 'improving').length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-teal-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
          <Card className="trust-badge">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Triggers</p>
                  <p className="text-2xl font-bold text-teal-700">
                    {patterns.reduce((sum, p) => sum + p.triggers.length, 0)}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-teal-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pattern List */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
            <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle>Your Patterns</CardTitle>
                <CardDescription>Click to explore each pattern</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {patterns.map((pattern) => (
                    <motion.button
                      key={pattern.id}
                      onClick={() => setSelectedPattern(pattern)}
                      className={`w-full text-left p-4 rounded-lg hover:bg-teal-50 transition-all duration-200 ${
                        selectedPattern?.id === pattern.id ? 'bg-teal-50 border-l-4 border-teal-500' : 'hover:shadow-sm'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{pattern.pattern_name}</h4>
                        <Badge className={getStatusColor(pattern.status)}>
                          {pattern.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Severity: {pattern.severity}/10
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {pattern.frequency}x/week
                        </span>
                      </div>
                      <div className="mt-2">
                        <Progress value={100 - (pattern.severity * 10)} className="h-2" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </div>

          {/* Pattern Details */}
          <div className="lg:col-span-2">
            {selectedPattern && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
              <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedPattern.pattern_name}</CardTitle>
                      <CardDescription>
                        First identified: {format(new Date(selectedPattern.first_identified), 'MMM d, yyyy')}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{selectedPattern.pattern_type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                      <TabsTrigger value="triggers">Triggers</TabsTrigger>
                      <TabsTrigger value="connections">Connections</TabsTrigger>
                      <TabsTrigger value="toolkit">Toolkit</TabsTrigger>
                    </TabsList>

                    {/* Timeline Tab */}
                    <TabsContent value="timeline" className="space-y-4">
                      <h3 className="font-medium mb-3">Pattern Timeline</h3>
                      <div className="space-y-3">
                        {timelineEvents.slice(0, 5).map((event) => (
                          <div key={event.id} className="relative pl-6 pb-4 border-l-2 border-gray-200 last:border-0">
                            <div className="absolute -left-2 top-0 w-4 h-4 bg-white border-2 border-primary rounded-full" />
                            <div className="bg-white p-4 rounded-lg border">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium">{event.event_type}</span>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(event.occurred_at), 'MMM d, h:mm a')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{event.event_description}</p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {event.emotional_state}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Intensity: {event.intensity}/10
                                </Badge>
                              </div>
                              {event.outcome && (
                                <p className="text-sm mt-2 p-2 bg-gray-50 rounded">
                                  <strong>Outcome:</strong> {event.outcome}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Triggers Tab */}
                    <TabsContent value="triggers" className="space-y-4">
                      <h3 className="font-medium mb-3">Pattern Triggers</h3>
                      <div className="space-y-3">
                        {selectedPattern.triggers.map((trigger) => (
                          <div key={trigger.id} className="p-4 bg-white rounded-lg border">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{trigger.trigger_description}</h4>
                                <span className="text-sm text-gray-500">{trigger.trigger_type}</span>
                              </div>
                              <Badge className={getSeverityColor(trigger.intensity)}>
                                Intensity: {trigger.intensity}/10
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                              <span>Occurred {trigger.occurrence_count} times</span>
                              <span>Last: {format(new Date(trigger.last_triggered), 'MMM d')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Connections Tab */}
                    <TabsContent value="connections" className="space-y-4">
                      <h3 className="font-medium mb-3">Pattern Connections</h3>
                      {selectedPattern.connections.length > 0 ? (
                        <div className="space-y-3">
                          {selectedPattern.connections.map((connection, idx) => (
                            <div key={idx} className="p-4 bg-white rounded-lg border">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Link2 className="h-5 w-5 text-gray-400" />
                                  <div>
                                    <p className="font-medium">{connection.connected_pattern}</p>
                                    <p className="text-sm text-gray-500">
                                      This pattern {connection.connection_type} the connected pattern
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="outline">
                                  Strength: {connection.strength}/10
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          No pattern connections identified yet
                        </p>
                      )}
                    </TabsContent>

                    {/* Toolkit Tab */}
                    <TabsContent value="toolkit" className="space-y-4">
                      <h3 className="font-medium mb-3">Pattern Breaking Toolkit</h3>
                      <div className="space-y-3">
                        <Card>
                          <CardContent className="pt-4">
                            <h4 className="font-medium mb-2">Recommended Interventions</h4>
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                <span className="text-sm">Practice assertive communication daily</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                <span className="text-sm">Use the STOP technique when triggered</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                <span className="text-sm">Complete CBT worksheet for thought challenging</span>
                              </li>
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-4">
                            <h4 className="font-medium mb-2">Coping Strategies</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <Badge variant="secondary">Deep Breathing</Badge>
                              <Badge variant="secondary">Grounding (5-4-3-2-1)</Badge>
                              <Badge variant="secondary">Journaling</Badge>
                              <Badge variant="secondary">Progressive Relaxation</Badge>
                            </div>
                          </CardContent>
                        </Card>

                        <Button className="btn-primary w-full">
                          Start Pattern-Breaking Exercise
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Pattern Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
        <Card className="mt-8 rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Pattern Correlation Detected</h4>
                <p className="text-sm text-blue-700">
                  Your "Avoidance of Conflict" pattern appears to be strongly linked to "People Pleasing". 
                  When you avoid conflict, it reinforces the people-pleasing behavior in 78% of cases.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Progress Noted</h4>
                <p className="text-sm text-green-700">
                  You've shown a 35% reduction in anxiety spiral intensity over the past 2 weeks. 
                  The breathing exercises appear to be particularly effective.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">Recommendation</h4>
                <p className="text-sm text-purple-700">
                  Consider focusing on assertiveness training this week. Your patterns suggest this could 
                  help break the conflict avoidance cycle.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </main>
    </div>
  )
}

export default function PatternsPage() {
  return (
    <AuthProvider>
      <PatternsContent />
    </AuthProvider>
  )
}