'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { 
  Sparkles,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Lock,
  Unlock,
  TrendingUp,
  Heart,
  Shield,
  Users,
  Brain,
  Zap,
  Award,
  ArrowRight,
  PlayCircle,
  BookOpen,
  Activity,
  Compass,
  Mountain
} from 'lucide-react'
import { motion } from 'framer-motion'

interface Journey {
  id: string
  name: string
  description: string
  category: 'addiction' | 'relationships' | 'purpose' | 'trauma' | 'self-worth'
  duration: number // weeks
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  steps: JourneyStep[]
  recommendedFor: string[]
  outcomes: string[]
  icon: any
  color: string
}

interface JourneyStep {
  id: string
  title: string
  description: string
  type: 'exercise' | 'reflection' | 'meditation' | 'journaling' | 'action'
  duration: number // minutes
  completed: boolean
  insights?: string[]
}

interface UserJourney {
  journey: Journey
  progress: number
  currentStep: number
  startedAt: string
  completedSteps: string[]
  insights: { step: string; insight: string; date: string }[]
}

const PREDEFINED_JOURNEYS: Journey[] = [
  {
    id: 'breaking-addiction',
    name: 'Breaking Free from Addiction',
    description: 'Understand and heal the root causes driving your addictive patterns',
    category: 'addiction',
    duration: 8,
    difficulty: 'intermediate',
    icon: Shield,
    color: 'emerald',
    recommendedFor: ['addiction patterns', 'substance dependency', 'behavioral addictions'],
    outcomes: [
      'Identify underlying emotional needs',
      'Develop healthy coping mechanisms',
      'Build sustainable recovery practices',
      'Create accountability systems'
    ],
    steps: [
      {
        id: 'add-1',
        title: 'Mapping Your Triggers',
        description: 'Identify and understand what triggers your addictive behaviors',
        type: 'journaling',
        duration: 30,
        completed: false
      },
      {
        id: 'add-2',
        title: 'The Pain Beneath',
        description: 'Explore the emotional pain your addiction is trying to numb',
        type: 'reflection',
        duration: 45,
        completed: false
      },
      {
        id: 'add-3',
        title: 'Childhood Connections',
        description: 'Connect current patterns to early life experiences',
        type: 'exercise',
        duration: 60,
        completed: false
      },
      {
        id: 'add-4',
        title: 'Building New Pathways',
        description: 'Create alternative responses to triggers',
        type: 'action',
        duration: 30,
        completed: false
      },
      {
        id: 'add-5',
        title: 'Self-Compassion Practice',
        description: 'Develop kindness toward yourself in recovery',
        type: 'meditation',
        duration: 20,
        completed: false
      }
    ]
  },
  {
    id: 'authentic-friendships',
    name: 'Building Authentic Friendships',
    description: 'Move beyond surface connections to create meaningful relationships',
    category: 'relationships',
    duration: 6,
    difficulty: 'beginner',
    icon: Users,
    color: 'blue',
    recommendedFor: ['social anxiety', 'loneliness', 'people-pleasing', 'trust issues'],
    outcomes: [
      'Understand your relationship patterns',
      'Learn vulnerability and boundaries',
      'Develop authentic communication',
      'Build lasting connections'
    ],
    steps: [
      {
        id: 'friend-1',
        title: 'Your Friendship History',
        description: 'Explore past friendships and patterns',
        type: 'reflection',
        duration: 40,
        completed: false
      },
      {
        id: 'friend-2',
        title: 'The Masks You Wear',
        description: 'Identify how you hide your true self',
        type: 'journaling',
        duration: 30,
        completed: false
      },
      {
        id: 'friend-3',
        title: 'Vulnerability Practice',
        description: 'Small steps toward authentic sharing',
        type: 'exercise',
        duration: 25,
        completed: false
      },
      {
        id: 'friend-4',
        title: 'Setting Healthy Boundaries',
        description: 'Learn to say no and protect your energy',
        type: 'action',
        duration: 35,
        completed: false
      }
    ]
  },
  {
    id: 'finding-purpose',
    name: 'Finding Purpose Beyond Substances',
    description: 'Discover meaning and direction in your life without relying on external escapes',
    category: 'purpose',
    duration: 10,
    difficulty: 'advanced',
    icon: Compass,
    color: 'purple',
    recommendedFor: ['existential crisis', 'lack of direction', 'post-recovery', 'emptiness'],
    outcomes: [
      'Clarify your core values',
      'Discover authentic passions',
      'Create meaningful goals',
      'Build a purpose-driven life'
    ],
    steps: [
      {
        id: 'purpose-1',
        title: 'The Void Within',
        description: 'Acknowledge the emptiness you\'ve been filling',
        type: 'reflection',
        duration: 50,
        completed: false
      },
      {
        id: 'purpose-2',
        title: 'Your Core Values',
        description: 'Identify what truly matters to you',
        type: 'exercise',
        duration: 45,
        completed: false
      },
      {
        id: 'purpose-3',
        title: 'Childhood Dreams',
        description: 'Reconnect with early aspirations',
        type: 'journaling',
        duration: 40,
        completed: false
      },
      {
        id: 'purpose-4',
        title: 'Creating Your Mission',
        description: 'Define your life purpose statement',
        type: 'action',
        duration: 60,
        completed: false
      },
      {
        id: 'purpose-5',
        title: 'Daily Purpose Practice',
        description: 'Integrate meaning into everyday life',
        type: 'meditation',
        duration: 15,
        completed: false
      }
    ]
  },
  {
    id: 'healing-trauma',
    name: 'Healing Childhood Trauma',
    description: 'Gently process and integrate past experiences affecting your present',
    category: 'trauma',
    duration: 12,
    difficulty: 'advanced',
    icon: Heart,
    color: 'rose',
    recommendedFor: ['PTSD', 'childhood trauma', 'abandonment', 'abuse survivors'],
    outcomes: [
      'Process traumatic memories safely',
      'Develop self-regulation skills',
      'Build internal safety',
      'Reclaim your narrative'
    ],
    steps: [
      {
        id: 'trauma-1',
        title: 'Creating Safety',
        description: 'Establish internal and external safety',
        type: 'meditation',
        duration: 25,
        completed: false
      },
      {
        id: 'trauma-2',
        title: 'Window of Tolerance',
        description: 'Learn your emotional regulation zone',
        type: 'exercise',
        duration: 35,
        completed: false
      },
      {
        id: 'trauma-3',
        title: 'The Story You Tell',
        description: 'Examine your trauma narrative',
        type: 'journaling',
        duration: 45,
        completed: false
      },
      {
        id: 'trauma-4',
        title: 'Inner Child Work',
        description: 'Connect with and heal your younger self',
        type: 'reflection',
        duration: 60,
        completed: false
      }
    ]
  },
  {
    id: 'self-worth',
    name: 'Rebuilding Self-Worth',
    description: 'Develop unshakeable confidence and self-love from within',
    category: 'self-worth',
    duration: 6,
    difficulty: 'beginner',
    icon: Award,
    color: 'amber',
    recommendedFor: ['low self-esteem', 'self-criticism', 'shame', 'perfectionism'],
    outcomes: [
      'Challenge negative self-talk',
      'Build self-compassion',
      'Recognize your inherent worth',
      'Develop authentic confidence'
    ],
    steps: [
      {
        id: 'worth-1',
        title: 'The Inner Critic',
        description: 'Identify and understand your critical voice',
        type: 'reflection',
        duration: 30,
        completed: false
      },
      {
        id: 'worth-2',
        title: 'Origins of Shame',
        description: 'Trace self-worth issues to their roots',
        type: 'journaling',
        duration: 40,
        completed: false
      },
      {
        id: 'worth-3',
        title: 'Daily Affirmations',
        description: 'Build new neural pathways of self-love',
        type: 'action',
        duration: 10,
        completed: false
      },
      {
        id: 'worth-4',
        title: 'Celebrating Small Wins',
        description: 'Practice recognizing your achievements',
        type: 'exercise',
        duration: 20,
        completed: false
      }
    ]
  }
]

export function GrowthJourneyIntegration({ userId, detectedPatterns }: { 
  userId: string, 
  detectedPatterns?: string[] 
}) {
  const [recommendedJourneys, setRecommendedJourneys] = useState<Journey[]>([])
  const [activeJourneys, setActiveJourneys] = useState<UserJourney[]>([])
  const [availableJourneys, setAvailableJourneys] = useState<Journey[]>(PREDEFINED_JOURNEYS)
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null)
  const [currentTab, setCurrentTab] = useState<'recommended' | 'active' | 'all'>('recommended')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUserJourneys()
    generateRecommendations()
  }, [userId, detectedPatterns])

  const fetchUserJourneys = async () => {
    try {
      setLoading(true)
      
      const { data: userProgress } = await supabase
        .from('user_journey_progress')
        .select(`
          *,
          journey:growth_journeys(*)
        `)
        .eq('user_id', userId)
        .is('completed_at', null)

      if (userProgress) {
        const activeUserJourneys = userProgress.map(progress => {
          const journey = PREDEFINED_JOURNEYS.find(j => j.id === progress.journey_id)
          if (!journey) return null
          
          return {
            journey,
            progress: (progress.current_step / journey.steps.length) * 100,
            currentStep: progress.current_step,
            startedAt: progress.started_at,
            completedSteps: progress.insights_gained?.completedSteps || [],
            insights: progress.insights_gained?.insights || []
          }
        }).filter(Boolean) as UserJourney[]
        
        setActiveJourneys(activeUserJourneys)
      }
    } catch (error) {
      console.error('Error fetching user journeys:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRecommendations = () => {
    if (!detectedPatterns || detectedPatterns.length === 0) {
      setRecommendedJourneys(PREDEFINED_JOURNEYS.slice(0, 3))
      return
    }

    const recommendations: Journey[] = []
    
    // Match patterns to journeys
    if (detectedPatterns.some(p => p.toLowerCase().includes('addiction') || 
                              p.toLowerCase().includes('substance') ||
                              p.toLowerCase().includes('drinking'))) {
      recommendations.push(
        PREDEFINED_JOURNEYS.find(j => j.id === 'breaking-addiction')!,
        PREDEFINED_JOURNEYS.find(j => j.id === 'finding-purpose')!
      )
    }
    
    if (detectedPatterns.some(p => p.toLowerCase().includes('social') || 
                              p.toLowerCase().includes('friend') ||
                              p.toLowerCase().includes('lonely'))) {
      recommendations.push(PREDEFINED_JOURNEYS.find(j => j.id === 'authentic-friendships')!)
    }
    
    if (detectedPatterns.some(p => p.toLowerCase().includes('trauma') || 
                              p.toLowerCase().includes('childhood') ||
                              p.toLowerCase().includes('past'))) {
      recommendations.push(PREDEFINED_JOURNEYS.find(j => j.id === 'healing-trauma')!)
    }
    
    if (detectedPatterns.some(p => p.toLowerCase().includes('worth') || 
                              p.toLowerCase().includes('confidence') ||
                              p.toLowerCase().includes('self'))) {
      recommendations.push(PREDEFINED_JOURNEYS.find(j => j.id === 'self-worth')!)
    }

    // Remove duplicates and limit to 3
    const unique = Array.from(new Set(recommendations.filter(Boolean))).slice(0, 3)
    setRecommendedJourneys(unique.length > 0 ? unique : PREDEFINED_JOURNEYS.slice(0, 3))
  }

  const startJourney = async (journey: Journey) => {
    try {
      // Check if journey already exists
      const existing = activeJourneys.find(aj => aj.journey.id === journey.id)
      if (existing) {
        alert('You\'ve already started this journey!')
        return
      }

      // Create journey in database
      const { data: journeyData } = await supabase
        .from('growth_journeys')
        .upsert({
          id: journey.id,
          name: journey.name,
          description: journey.description,
          steps: journey.steps,
          focus_areas: journey.recommendedFor,
          estimated_duration_weeks: journey.duration,
          is_active: true
        })
        .select()
        .single()

      // Create user progress
      const { data: progressData } = await supabase
        .from('user_journey_progress')
        .insert({
          user_id: userId,
          journey_id: journey.id,
          current_step: 0,
          insights_gained: {
            completedSteps: [],
            insights: []
          }
        })
        .select()
        .single()

      if (progressData) {
        await fetchUserJourneys()
        setCurrentTab('active')
      }
    } catch (error) {
      console.error('Error starting journey:', error)
    }
  }

  const completeStep = async (journeyId: string, stepId: string, insight?: string) => {
    try {
      const userJourney = activeJourneys.find(aj => aj.journey.id === journeyId)
      if (!userJourney) return

      const updatedCompletedSteps = [...userJourney.completedSteps, stepId]
      const updatedInsights = insight 
        ? [...userJourney.insights, { step: stepId, insight, date: new Date().toISOString() }]
        : userJourney.insights

      const { error } = await supabase
        .from('user_journey_progress')
        .update({
          current_step: updatedCompletedSteps.length,
          insights_gained: {
            completedSteps: updatedCompletedSteps,
            insights: updatedInsights
          }
        })
        .eq('user_id', userId)
        .eq('journey_id', journeyId)

      if (!error) {
        await fetchUserJourneys()
      }
    } catch (error) {
      console.error('Error completing step:', error)
    }
  }

  const JourneyCard = ({ journey, type }: { journey: Journey, type: 'recommended' | 'active' | 'available' }) => {
    const userJourney = activeJourneys.find(aj => aj.journey.id === journey.id)
    const Icon = journey.icon
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl bg-${journey.color}-100`}>
                <Icon className={`h-6 w-6 text-${journey.color}-600`} />
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{journey.difficulty}</Badge>
                <Badge variant="secondary">{journey.duration} weeks</Badge>
              </div>
            </div>
            <CardTitle className="mt-4">{journey.name}</CardTitle>
            <CardDescription>{journey.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {type === 'recommended' && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Recommended because you show:</p>
                <div className="flex flex-wrap gap-2">
                  {journey.recommendedFor.slice(0, 3).map((pattern, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {pattern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {userJourney && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">
                    {userJourney.completedSteps.length}/{journey.steps.length} steps
                  </span>
                </div>
                <Progress value={userJourney.progress} className="h-2" />
              </div>
            )}

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">What you\'ll achieve:</p>
                <ul className="space-y-1">
                  {journey.outcomes.slice(0, 2).map((outcome, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {userJourney ? (
              <Button 
                className="w-full"
                onClick={() => setSelectedJourney(journey)}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Continue Journey
              </Button>
            ) : (
              <Button 
                className="w-full"
                variant={type === 'recommended' ? 'default' : 'outline'}
                onClick={() => startJourney(journey)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Start This Journey
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Compass className="h-8 w-8 animate-pulse text-purple-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading your growth journeys...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Growth Journey Integration</h2>
            <p className="text-gray-600">Personalized programs based on your patterns</p>
          </div>
          <Mountain className="h-10 w-10 text-purple-500" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-gray-600">Active Journeys</p>
            <p className="text-2xl font-bold text-purple-600">{activeJourneys.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-gray-600">Steps Completed</p>
            <p className="text-2xl font-bold text-pink-600">
              {activeJourneys.reduce((sum, aj) => sum + aj.completedSteps.length, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-gray-600">Insights Gained</p>
            <p className="text-2xl font-bold text-amber-600">
              {activeJourneys.reduce((sum, aj) => sum + aj.insights.length, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Journey Tabs */}
      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommended">
            <Sparkles className="h-4 w-4 mr-2" />
            Recommended
          </TabsTrigger>
          <TabsTrigger value="active">
            <Activity className="h-4 w-4 mr-2" />
            Active ({activeJourneys.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            <BookOpen className="h-4 w-4 mr-2" />
            All Journeys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="mt-6">
          {recommendedJourneys.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedJourneys.map(journey => (
                <JourneyCard key={journey.id} journey={journey} type="recommended" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">Complete more conversations to get personalized recommendations</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          {activeJourneys.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeJourneys.map(({ journey }) => (
                <JourneyCard key={journey.id} journey={journey} type="active" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Compass className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No active journeys yet</p>
                <Button onClick={() => setCurrentTab('recommended')}>
                  Explore Recommended Journeys
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableJourneys.map(journey => (
              <JourneyCard key={journey.id} journey={journey} type="available" />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Journey Detail Modal */}
      {selectedJourney && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl bg-${selectedJourney.color}-100`}>
                    <selectedJourney.icon className={`h-6 w-6 text-${selectedJourney.color}-600`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedJourney.name}</h3>
                    <p className="text-sm text-gray-600">{selectedJourney.duration} week journey</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedJourney(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Journey Steps</h4>
                  <div className="space-y-3">
                    {selectedJourney.steps.map((step, index) => {
                      const userJourney = activeJourneys.find(aj => aj.journey.id === selectedJourney.id)
                      const isCompleted = userJourney?.completedSteps.includes(step.id)
                      const isLocked = userJourney && index > userJourney.completedSteps.length
                      
                      return (
                        <div
                          key={step.id}
                          className={`border rounded-lg p-4 ${
                            isCompleted ? 'bg-green-50 border-green-200' :
                            isLocked ? 'bg-gray-50 border-gray-200 opacity-60' :
                            'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="mt-1">
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : isLocked ? (
                                  <Lock className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">
                                  Step {index + 1}: {step.title}
                                </h5>
                                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {step.type}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    {step.duration} min
                                  </span>
                                </div>
                              </div>
                            </div>
                            {!isCompleted && !isLocked && userJourney && (
                              <Button
                                size="sm"
                                onClick={() => completeStep(selectedJourney.id, step.id)}
                              >
                                Start
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Expected Outcomes</h4>
                  <ul className="space-y-2">
                    {selectedJourney.outcomes.map((outcome, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {!activeJourneys.find(aj => aj.journey.id === selectedJourney.id) && (
                  <Button 
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      startJourney(selectedJourney)
                      setSelectedJourney(null)
                    }}
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Begin This Journey
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}