'use client'

import { motion } from 'framer-motion'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { 
  Compass,
  Play,
  CheckCircle,
  Clock,
  ChevronRight,
  Target,
  Heart,
  Briefcase,
  Users,
  Brain,
  Star,
  Lock,
  TrendingUp,
  BookOpen,
  Award
} from 'lucide-react'
import { format } from 'date-fns'

interface Journey {
  id: string
  name: string
  description: string
  steps: any[]
  focus_areas: string[]
  estimated_duration_weeks: number
  is_active: boolean
}

interface UserJourneyProgress {
  id: string
  journey_id: string
  current_step: number
  started_at: string
  completed_at: string | null
  insights_gained: any[]
  progress_notes: string | null
}

const focusAreaIcons: Record<string, any> = {
  'relationships': Heart,
  'career': Briefcase,
  'family': Users,
  'personal-growth': TrendingUp,
  'self-compassion': Heart,
  'purpose': Target,
  'healing': Brain,
  'authenticity': Star,
  'emotional-wellness': Heart,
  'resilience': TrendingUp,
  'communication': Users
}

function JourneysContent() {
  const { user } = useAuth()
  const [availableJourneys, setAvailableJourneys] = useState<Journey[]>([])
  const [userProgress, setUserProgress] = useState<Record<string, UserJourneyProgress>>({})
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null)
  const [currentProgress, setCurrentProgress] = useState<UserJourneyProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchJourneys()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchJourneys = async () => {
    try {
      // Fetch all available journeys
      const { data: journeys } = await supabase
        .from('growth_journeys')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (journeys) setAvailableJourneys(journeys)

      // Fetch user's progress
      const { data: progress } = await supabase
        .from('user_journey_progress')
        .select('*')
        .eq('user_id', user?.id)

      if (progress) {
        const progressMap = progress.reduce((acc, p) => {
          acc[p.journey_id] = p
          return acc
        }, {} as Record<string, UserJourneyProgress>)
        setUserProgress(progressMap)
      }

    } catch (error) {
      console.error('Error fetching journeys:', error)
    } finally {
      setLoading(false)
    }
  }

  const startJourney = async (journey: Journey) => {
    try {
      const { data, error } = await supabase
        .from('user_journey_progress')
        .insert({
          user_id: user?.id,
          journey_id: journey.id,
          current_step: 0,
          insights_gained: []
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setUserProgress(prev => ({
          ...prev,
          [journey.id]: data
        }))
        setSelectedJourney(journey)
        setCurrentProgress(data)
      }

    } catch (error) {
      console.error('Error starting journey:', error)
      alert('Failed to start journey. Please try again.')
    }
  }

  const updateProgress = async (journeyId: string, newStep: number) => {
    try {
      const progress = userProgress[journeyId]
      const journey = availableJourneys.find(j => j.id === journeyId)
      
      if (!progress || !journey) return

      const isComplete = newStep >= journey.steps.length - 1
      
      const { error } = await supabase
        .from('user_journey_progress')
        .update({
          current_step: newStep,
          completed_at: isComplete ? new Date().toISOString() : null
        })
        .eq('id', progress.id)

      if (error) throw error

      await fetchJourneys()
      
      if (isComplete) {
        alert('Congratulations! You\'ve completed this journey!')
      }

    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const selectJourney = (journey: Journey) => {
    setSelectedJourney(journey)
    setCurrentProgress(userProgress[journey.id] || null)
  }

  const getJourneyStatus = (journey: Journey) => {
    const progress = userProgress[journey.id]
    
    if (!progress) return 'not_started'
    if (progress.completed_at) return 'completed'
    return 'in_progress'
  }

  const getProgressPercentage = (journey: Journey) => {
    const progress = userProgress[journey.id]
    if (!progress) return 0
    
    return Math.round(((progress.current_step + 1) / journey.steps.length) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading growth journeys...</div>
      </div>
    )
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
        {/* Header */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Growth <span className="gradient-text">Journeys</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Structured pathways designed to guide you through meaningful personal transformation
          </p>
          
          {/* Trust indicators */}
          <div className="flex justify-center items-center gap-6 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-teal-500" />
              <span>Evidence-based</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-teal-500" />
              <span>Self-paced</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4 text-teal-500" />
              <span>Professional guidance</span>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Journey List */}
          <div className="lg:col-span-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-teal-700">Available Journeys</CardTitle>
                  <CardDescription>Select a journey to explore</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                {availableJourneys.map((journey) => {
                  const status = getJourneyStatus(journey)
                  const progress = getProgressPercentage(journey)
                  
                  return (
                    <motion.button
                      key={journey.id}
                      onClick={() => selectJourney(journey)}
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 ${
                        selectedJourney?.id === journey.id
                          ? 'bg-teal-50 border-teal-300 border-2 shadow-lg'
                          : 'hover:bg-white/80 border border-gray-200 hover:border-teal-200 hover:shadow-md'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-1">{journey.name}</p>
                            <p className="text-xs text-gray-500">
                              {journey.estimated_duration_weeks} weeks • {journey.steps.length} steps
                            </p>
                          </div>
                          {status === 'completed' && (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                          {status === 'in_progress' && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span className="text-xs font-medium text-blue-500">{progress}%</span>
                            </div>
                          )}
                        </div>
                        
                        {status === 'in_progress' && (
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-blue-500 h-1 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {journey.focus_areas.slice(0, 3).map((area) => {
                            const Icon = focusAreaIcons[area] || Target
                            return (
                              <span key={area} className="inline-flex items-center">
                                <Icon className="h-3 w-3 text-gray-400" />
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </CardContent>
            </Card>
            </motion.div>

            {/* Journey Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
            <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Journeys</span>
                  <span className="font-bold">
                    {Object.values(userProgress).filter(p => !p.completed_at).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-bold">
                    {Object.values(userProgress).filter(p => p.completed_at).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Steps</span>
                  <span className="font-bold">
                    {Object.values(userProgress).reduce((acc, p) => acc + p.current_step + 1, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </div>

          {/* Journey Details */}
          <div className="lg:col-span-2">
            {selectedJourney ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
              <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedJourney.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {selectedJourney.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{selectedJourney.estimated_duration_weeks} weeks</span>
                    </div>
                  </div>

                  {/* Focus Areas */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedJourney.focus_areas.map((area) => {
                      const Icon = focusAreaIcons[area] || Target
                      return (
                        <span
                          key={area}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {area.replace('-', ' ')}
                        </span>
                      )
                    })}
                  </div>

                  {/* Action Button */}
                  <div className="mt-6">
                    {!currentProgress ? (
                      <Button onClick={() => startJourney(selectedJourney)} className="btn-primary w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Start This Journey
                      </Button>
                    ) : currentProgress.completed_at ? (
                      <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
                        <Award className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-600 font-medium">Journey Completed!</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Your Progress</span>
                          <span className="font-medium">
                            Step {currentProgress.current_step + 1} of {selectedJourney.steps.length}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-teal-600 h-2 rounded-full transition-all"
                            style={{ width: `${getProgressPercentage(selectedJourney)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Journey Steps */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Journey Steps</h3>
                    <div className="space-y-3">
                      {selectedJourney.steps.map((step: any, index: number) => {
                        const isCompleted = currentProgress && index < currentProgress.current_step
                        const isCurrent = currentProgress && index === currentProgress.current_step
                        const isLocked = !currentProgress || index > currentProgress.current_step
                        
                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border transition-all ${
                              isCurrent ? 'border-teal-600 bg-teal-600/5' :
                              isCompleted ? 'border-green-200 bg-green-50' :
                              isLocked ? 'border-gray-200 bg-white opacity-60' :
                              'border-gray-200'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                isCompleted ? 'bg-green-500 text-white' :
                                isCurrent ? 'bg-teal-600 text-white' :
                                'bg-gray-200 text-gray-500'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : isLocked ? (
                                  <Lock className="h-4 w-4" />
                                ) : (
                                  <span className="text-sm font-medium">{index + 1}</span>
                                )}
                              </div>

                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{step.title}</h4>
                                  {isCurrent && (
                                    <span className="text-xs bg-teal-600 text-white px-2 py-1 rounded-full">
                                      Current
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{step.description}</p>
                                
                                {step.activities && (
                                  <div className="mt-2 space-y-1">
                                    <p className="text-xs font-medium text-gray-500">Activities:</p>
                                    {step.activities.map((activity: string, idx: number) => (
                                      <div key={idx} className="flex items-start space-x-2">
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-600">{activity}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {isCurrent && currentProgress && (
                                  <div className="mt-3 flex space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={() => updateProgress(
                                        selectedJourney.id,
                                        currentProgress.current_step + 1
                                      )}
                                    >
                                      Mark Complete
                                      <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
              <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="text-center py-12">
                  <Compass className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a journey to view details</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Choose from the available journeys on the left to get started
                  </p>
                </CardContent>
              </Card>
              </motion.div>
            )}
          </div>
        </div>
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