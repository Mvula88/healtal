'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { Navbar } from '@/components/navigation/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Compass,
  Target,
  Trophy,
  Clock,
  ChevronRight,
  Play,
  Pause,
  CheckCircle,
  Circle,
  Star,
  TrendingUp,
  Calendar,
  Award,
  Sparkles,
  Brain,
  Heart,
  Shield,
  Users,
  Zap,
  Lock
} from 'lucide-react'

interface Journey {
  id: string
  template_id: string
  title: string
  description: string
  category: string
  status: 'active' | 'paused' | 'completed' | 'abandoned'
  progress: number
  current_milestone: number
  completed_milestones: string[]
  started_at: string
  template?: JourneyTemplate
  nextMilestone?: Milestone
  completedSteps: number
  totalSteps: number
}

interface JourneyTemplate {
  id: string
  title: string
  description: string
  category: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  milestones: Milestone[]
}

interface Milestone {
  step: number
  title: string
  description: string
  duration: string
}

function JourneysContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('my-journeys')
  const [userJourneys, setUserJourneys] = useState<Journey[]>([])
  const [templates, setTemplates] = useState<JourneyTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null)

  useEffect(() => {
    if (user) {
      fetchUserJourneys()
      fetchTemplates()
    }
  }, [user])

  const fetchUserJourneys = async () => {
    try {
      const response = await fetch('/api/journeys')
      const data = await response.json()
      if (data.success) {
        setUserJourneys(data.journeys)
        if (data.journeys.length > 0 && data.journeys[0].status === 'active') {
          setSelectedJourney(data.journeys[0])
        }
      }
    } catch (error) {
      console.error('Error fetching journeys:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/journeys?type=templates')
      const data = await response.json()
      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const startJourney = async (templateId: string) => {
    try {
      const response = await fetch('/api/journeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      })
      const data = await response.json()
      if (data.success) {
        await fetchUserJourneys()
        setActiveTab('my-journeys')
      }
    } catch (error) {
      console.error('Error starting journey:', error)
    }
  }

  const updateJourneyStatus = async (journeyId: string, action: string, milestoneId?: string) => {
    try {
      const response = await fetch('/api/journeys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journeyId, action, milestoneId })
      })
      const data = await response.json()
      if (data.success) {
        await fetchUserJourneys()
      }
    } catch (error) {
      console.error('Error updating journey:', error)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Mental Health': return Brain
      case 'Relationships': return Heart
      case 'Personal Growth': return TrendingUp
      case 'Healing': return Shield
      case 'Recovery': return Zap
      default: return Compass
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700'
      case 'advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const activeJourneys = userJourneys.filter(j => j.status === 'active')
  const completedJourneys = userJourneys.filter(j => j.status === 'completed')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <Compass className="h-3 w-3 mr-1" />
            Growth Journeys
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Your Personal <span className="gradient-text">Growth Path</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Structured journeys designed to help you achieve lasting transformation. 
            Each path is guided by AI and supported by our community.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Journeys</p>
                  <p className="text-2xl font-bold">{activeJourneys.length}</p>
                </div>
                <Play className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{completedJourneys.length}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Milestones</p>
                  <p className="text-2xl font-bold">
                    {userJourneys.reduce((sum, j) => sum + (j.completedSteps || 0), 0)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold">
                    {activeJourneys.length > 0 
                      ? Math.round(activeJourneys.reduce((sum, j) => sum + j.progress, 0) / activeJourneys.length) 
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="my-journeys">My Journeys</TabsTrigger>
            <TabsTrigger value="explore">Explore Paths</TabsTrigger>
          </TabsList>

          <TabsContent value="my-journeys" className="space-y-6">
            {activeJourneys.length === 0 && completedJourneys.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Compass className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No journeys started yet</h3>
                  <p className="text-gray-600 mb-4">Begin your transformation with a structured growth path</p>
                  <Button onClick={() => setActiveTab('explore')}>
                    Explore Journeys
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Journey Details */}
                <div className="lg:col-span-2 space-y-6">
                  {selectedJourney && (
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-2xl">{selectedJourney.title}</CardTitle>
                            <CardDescription>{selectedJourney.description}</CardDescription>
                          </div>
                          <Badge className={getDifficultyColor(selectedJourney.template?.difficulty || 'beginner')}>
                            {selectedJourney.template?.difficulty}
                          </Badge>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Overall Progress</span>
                            <span>{selectedJourney.progress}%</span>
                          </div>
                          <Progress value={selectedJourney.progress} className="h-2" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-semibold mb-4">Journey Milestones</h4>
                        <div className="space-y-4">
                          {selectedJourney.template?.milestones.map((milestone, index) => {
                            const isCompleted = selectedJourney.completedMilestones?.includes(milestone.step.toString())
                            const isCurrent = index === selectedJourney.completedSteps
                            
                            return (
                              <div
                                key={milestone.step}
                                className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                                  isCompleted ? 'bg-green-50' : isCurrent ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                                }`}
                              >
                                <div className="flex-shrink-0">
                                  {isCompleted ? (
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                  ) : isCurrent ? (
                                    <Circle className="h-6 w-6 text-blue-600 animate-pulse" />
                                  ) : (
                                    <Circle className="h-6 w-6 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-1">
                                    <h5 className="font-medium">
                                      Step {milestone.step}: {milestone.title}
                                    </h5>
                                    <span className="text-sm text-gray-500">{milestone.duration}</span>
                                  </div>
                                  <p className="text-sm text-gray-600">{milestone.description}</p>
                                  {isCurrent && (
                                    <Button
                                      size="sm"
                                      className="mt-3"
                                      onClick={() => updateJourneyStatus(
                                        selectedJourney.id, 
                                        'complete_milestone', 
                                        milestone.step.toString()
                                      )}
                                    >
                                      Mark Complete
                                      <CheckCircle className="h-3 w-3 ml-2" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Journey List Sidebar */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Your Journeys</h3>
                  
                  {activeJourneys.map(journey => (
                    <Card
                      key={journey.id}
                      className={`cursor-pointer transition-all ${
                        selectedJourney?.id === journey.id ? 'ring-2 ring-purple-500' : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedJourney(journey)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="outline" className="text-xs">
                            {journey.category}
                          </Badge>
                          <Badge className="bg-green-100 text-green-700">
                            Active
                          </Badge>
                        </div>
                        <h4 className="font-semibold mb-2">{journey.title}</h4>
                        <Progress value={journey.progress} className="h-2 mb-2" />
                        <p className="text-sm text-gray-600">
                          {journey.completedSteps}/{journey.totalSteps} milestones
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateJourneyStatus(journey.id, 'pause')
                            }}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {completedJourneys.length > 0 && (
                    <>
                      <h3 className="font-semibold text-lg mt-6">Completed</h3>
                      {completedJourneys.map(journey => (
                        <Card key={journey.id} className="opacity-75">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{journey.title}</h4>
                              <Trophy className="h-5 w-5 text-yellow-500" />
                            </div>
                            <p className="text-sm text-gray-600">
                              Completed {new Date(journey.started_at).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="explore" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {templates.map((template, index) => {
                const Icon = getCategoryIcon(template.category)
                const isStarted = userJourneys.some(j => j.template_id === template.id && j.status === 'active')
                
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Icon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <CardTitle className="text-xl">{template.title}</CardTitle>
                              <Badge variant="outline" className="mt-1">
                                {template.category}
                              </Badge>
                            </div>
                          </div>
                          <Badge className={getDifficultyColor(template.difficulty)}>
                            {template.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{template.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{template.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span>{template.milestones.length} milestones</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <p className="text-sm font-medium">Key Milestones:</p>
                          {template.milestones.slice(0, 3).map((milestone, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                              <Circle className="h-3 w-3" />
                              <span>{milestone.title}</span>
                            </div>
                          ))}
                          {template.milestones.length > 3 && (
                            <p className="text-sm text-gray-500 ml-5">
                              +{template.milestones.length - 3} more milestones
                            </p>
                          )}
                        </div>
                        
                        <Button 
                          className="w-full"
                          disabled={isStarted}
                          onClick={() => startJourney(template.id)}
                        >
                          {isStarted ? (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              Already Started
                            </>
                          ) : (
                            <>
                              Start Journey
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Why Growth Journeys Work</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">AI-Guided Progress</h4>
                  <p className="text-sm text-gray-600">
                    Personalized guidance and insights at every step
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Community Support</h4>
                  <p className="text-sm text-gray-600">
                    Connect with others on similar journeys
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Milestone Rewards</h4>
                  <p className="text-sm text-gray-600">
                    Celebrate progress with achievements and badges
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

export default function JourneysPage() {
  return (
    <AuthProvider>
      <JourneysContent />
    </AuthProvider>
  )
}