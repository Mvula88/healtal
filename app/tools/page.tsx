'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { APP_CONFIG } from '@/lib/config'
import { Skeleton, CardSkeleton } from '@/components/ui/skeleton'
import { 
  Brain,
  Heart,
  Wind,
  Eye,
  FileText,
  Headphones,
  Activity,
  Target,
  Lightbulb,
  Shield,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle,
  Circle,
  ArrowRight,
  ArrowLeft,
  Zap
} from 'lucide-react'
import { format } from 'date-fns'

interface TherapeuticTool {
  id: string
  type: 'cbt' | 'emdr' | 'breathwork' | 'meditation' | 'journaling'
  name: string
  description: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface CBTWorksheet {
  id: string
  title: string
  type: 'thought-record' | 'behavioral-activation' | 'core-beliefs' | 'problem-solving'
  questions: {
    id: string
    question: string
    placeholder?: string
    type: 'text' | 'scale' | 'multiple-choice'
    options?: string[]
  }[]
}

interface BreathworkSession {
  id: string
  name: string
  pattern: string
  duration: number
  description: string
  instructions: string[]
}

function ToolsContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [activeWorksheet, setActiveWorksheet] = useState<CBTWorksheet | null>(null)
  const [worksheetAnswers, setWorksheetAnswers] = useState<Record<string, string>>({})
  
  // Breathwork state
  const [breathingActive, setBreathingActive] = useState(false)
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [breathCount, setBreathCount] = useState(0)
  const [sessionTime, setSessionTime] = useState(0)
  
  // EMDR state
  const [emdrActive, setEmdrActive] = useState(false)
  const [emdrSpeed, setEmdrSpeed] = useState(1)
  const [dotPosition, setDotPosition] = useState(50)
  const animationRef = useRef<number>()
  
  // Meditation state
  const [meditationActive, setMeditationActive] = useState(false)
  const [selectedMeditation, setSelectedMeditation] = useState<string | null>(null)
  
  // Journaling state
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null)
  const [journalEntry, setJournalEntry] = useState('')
  
  const supabase = createClient()

  const tools: TherapeuticTool[] = [
    {
      id: 'cbt',
      type: 'cbt',
      name: 'CBT Worksheets',
      description: 'Cognitive Behavioral Therapy exercises to challenge negative thoughts',
      duration: '10-20 min',
      difficulty: 'beginner',
      icon: Brain,
      color: 'text-teal-500'
    },
    {
      id: 'emdr',
      type: 'emdr',
      name: 'EMDR Exercises',
      description: 'Eye Movement Desensitization for processing difficult memories',
      duration: '15-30 min',
      difficulty: 'intermediate',
      icon: Eye,
      color: 'text-blue-500'
    },
    {
      id: 'breathwork',
      type: 'breathwork',
      name: 'Breathwork',
      description: 'Guided breathing exercises for anxiety and stress relief',
      duration: '5-15 min',
      difficulty: 'beginner',
      icon: Wind,
      color: 'text-green-500'
    },
    {
      id: 'meditation',
      type: 'meditation',
      name: 'Meditation',
      description: 'Pattern-specific guided meditations for mental clarity',
      duration: '10-30 min',
      difficulty: 'beginner',
      icon: Heart,
      color: 'text-red-500'
    },
    {
      id: 'journaling',
      type: 'journaling',
      name: 'Journaling Prompts',
      description: 'Structured prompts to explore your patterns and emotions',
      duration: '15-20 min',
      difficulty: 'beginner',
      icon: FileText,
      color: 'text-orange-500'
    }
  ]

  const cbtWorksheets: CBTWorksheet[] = [
    {
      id: 'thought-record',
      title: 'Thought Record',
      type: 'thought-record',
      questions: [
        {
          id: 'situation',
          question: 'What situation triggered these thoughts?',
          placeholder: 'Describe what happened...',
          type: 'text'
        },
        {
          id: 'automatic-thought',
          question: 'What automatic thoughts came to mind?',
          placeholder: 'List your immediate thoughts...',
          type: 'text'
        },
        {
          id: 'emotion',
          question: 'What emotions did you feel?',
          placeholder: 'Name the emotions and rate their intensity (0-10)',
          type: 'text'
        },
        {
          id: 'evidence-for',
          question: 'Evidence supporting this thought:',
          placeholder: 'What facts support this thought?',
          type: 'text'
        },
        {
          id: 'evidence-against',
          question: 'Evidence against this thought:',
          placeholder: 'What facts contradict this thought?',
          type: 'text'
        },
        {
          id: 'balanced-thought',
          question: 'More balanced/realistic thought:',
          placeholder: 'What would be a more balanced perspective?',
          type: 'text'
        },
        {
          id: 'outcome',
          question: 'How do you feel now?',
          placeholder: 'Rate your emotions again (0-10)',
          type: 'text'
        }
      ]
    },
    {
      id: 'behavioral-activation',
      title: 'Behavioral Activation',
      type: 'behavioral-activation',
      questions: [
        {
          id: 'activities',
          question: 'List activities that bring you joy or satisfaction:',
          placeholder: 'Activities you enjoy or used to enjoy...',
          type: 'text'
        },
        {
          id: 'barriers',
          question: 'What prevents you from doing these activities?',
          placeholder: 'Identify barriers...',
          type: 'text'
        },
        {
          id: 'small-steps',
          question: 'Break down one activity into small, manageable steps:',
          placeholder: 'Step 1:\nStep 2:\nStep 3:',
          type: 'text'
        },
        {
          id: 'schedule',
          question: 'When will you do this activity?',
          placeholder: 'Schedule specific times...',
          type: 'text'
        }
      ]
    }
  ]

  const breathworkSessions: BreathworkSession[] = [
    {
      id: 'box-breathing',
      name: 'Box Breathing',
      pattern: '4-4-4-4',
      duration: 240,
      description: 'Equal counts for inhale, hold, exhale, hold. Great for anxiety.',
      instructions: [
        'Inhale for 4 counts',
        'Hold for 4 counts',
        'Exhale for 4 counts',
        'Hold for 4 counts'
      ]
    },
    {
      id: '478-breathing',
      name: '4-7-8 Breathing',
      pattern: '4-7-8',
      duration: 300,
      description: 'Calming breath pattern for sleep and relaxation.',
      instructions: [
        'Inhale for 4 counts',
        'Hold for 7 counts',
        'Exhale for 8 counts'
      ]
    },
    {
      id: 'coherent-breathing',
      name: 'Coherent Breathing',
      pattern: '5-5',
      duration: 600,
      description: 'Balanced breathing for heart rate variability.',
      instructions: [
        'Inhale for 5 counts',
        'Exhale for 5 counts'
      ]
    }
  ]

  const meditations = [
    {
      id: 'anxiety-relief',
      name: 'Anxiety Relief',
      duration: '10 min',
      description: 'Calm your anxious thoughts and find peace'
    },
    {
      id: 'self-compassion',
      name: 'Self-Compassion',
      duration: '15 min',
      description: 'Develop kindness towards yourself'
    },
    {
      id: 'pattern-awareness',
      name: 'Pattern Awareness',
      duration: '20 min',
      description: 'Observe your patterns without judgment'
    },
    {
      id: 'body-scan',
      name: 'Body Scan',
      duration: '15 min',
      description: 'Release tension and connect with your body'
    }
  ]

  const journalPrompts = [
    'What pattern did I notice today, and what triggered it?',
    'How did my body feel when this pattern emerged?',
    'What would I tell my younger self about this pattern?',
    'What small step can I take tomorrow to break this pattern?',
    'What am I avoiding by maintaining this pattern?',
    'How has this pattern served me in the past?',
    'What would my life look like without this pattern?',
    'Who in my life reinforces this pattern?',
    'What emotion am I trying to protect myself from?',
    'What would self-compassion look like in this situation?'
  ]

  // Breathwork functions
  const startBreathwork = (session: BreathworkSession) => {
    setBreathingActive(true)
    setBreathPhase('inhale')
    setBreathCount(0)
    setSessionTime(0)
    
    // Start breathing cycle based on pattern
    const pattern = session.pattern.split('-').map(Number)
    let currentPhase = 0
    
    const breathInterval = setInterval(() => {
      const phases = ['inhale', 'hold', 'exhale', 'hold'].slice(0, pattern.length)
      currentPhase = (currentPhase + 1) % phases.length
      setBreathPhase(phases[currentPhase] as 'inhale' | 'hold' | 'exhale')
      
      if (currentPhase === 0) {
        setBreathCount(prev => prev + 1)
      }
    }, pattern[currentPhase] * 1000)
    
    // Session timer
    const sessionInterval = setInterval(() => {
      setSessionTime(prev => {
        if (prev >= session.duration) {
          stopBreathwork()
          return 0
        }
        return prev + 1
      })
    }, 1000)
    
    return () => {
      clearInterval(breathInterval)
      clearInterval(sessionInterval)
    }
  }

  const stopBreathwork = () => {
    setBreathingActive(false)
    setBreathPhase('inhale')
    setBreathCount(0)
    setSessionTime(0)
  }

  // EMDR functions
  const startEMDR = () => {
    setEmdrActive(true)
    let position = 50
    let direction = 1
    
    const animate = () => {
      position += direction * emdrSpeed * 2
      
      if (position >= 95 || position <= 5) {
        direction *= -1
      }
      
      setDotPosition(position)
      
      if (emdrActive) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }

  const stopEMDR = () => {
    setEmdrActive(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setDotPosition(50)
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const saveToolUsage = async (toolType: string, toolName: string, duration: number) => {
    if (!user) return
    
    try {
      await supabase
        .from('therapeutic_tools')
        .insert({
          user_id: user.id,
          tool_type: toolType,
          tool_name: toolName,
          duration_minutes: duration,
          completion_percentage: 100,
          effectiveness_rating: 0, // User can rate later
          insights_gained: []
        } as any)
    } catch (error) {
      console.error('Error saving tool usage:', error)
    }
  }

  const renderCBTWorksheet = () => {
    if (!activeWorksheet) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cbtWorksheets.map(worksheet => (
            <Card 
              key={worksheet.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveWorksheet(worksheet)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{worksheet.title}</CardTitle>
                <CardDescription>
                  {worksheet.questions.length} questions to guide your reflection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Start Worksheet
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    return (
      <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{activeWorksheet.title}</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setActiveWorksheet(null)
                setWorksheetAnswers({})
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeWorksheet.questions.map((question, index) => (
            <div key={question.id}>
              <Label htmlFor={question.id} className="text-base mb-2 block">
                {index + 1}. {question.question}
              </Label>
              <Textarea
                id={question.id}
                placeholder={question.placeholder}
                value={worksheetAnswers[question.id] || ''}
                onChange={(e) => setWorksheetAnswers({
                  ...worksheetAnswers,
                  [question.id]: e.target.value
                })}
                rows={3}
              />
            </div>
          ))}
          
          <div className="flex gap-4">
            <Button 
              className="btn-primary flex-1"
              onClick={() => {
                console.log('Saving worksheet:', worksheetAnswers)
                saveToolUsage('cbt_worksheet', activeWorksheet.title, 15)
                alert('Worksheet saved successfully!')
                setActiveWorksheet(null)
                setWorksheetAnswers({})
              }}
            >
              Save Worksheet
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setActiveWorksheet(null)
                setWorksheetAnswers({})
              }}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderBreathwork = () => {
    return (
      <div className="space-y-6">
        {!breathingActive ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {breathworkSessions.map(session => (
              <Card key={session.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{session.name}</CardTitle>
                  <CardDescription>{session.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Pattern:</span>
                      <Badge variant="outline">{session.pattern}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span>{session.duration / 60} min</span>
                    </div>
                    <Button 
                      className="btn-primary w-full"
                      onClick={() => startBreathwork(session)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card border-0">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="relative w-48 h-48 mx-auto">
                  <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                    breathPhase === 'inhale' ? 'bg-blue-200 scale-125' :
                    breathPhase === 'hold' ? 'bg-yellow-200 scale-110' :
                    'bg-green-200 scale-90'
                  }`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold capitalize">{breathPhase}</p>
                      <p className="text-sm text-gray-600 mt-1">Cycle {breathCount}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Progress value={(sessionTime / 240) * 100} />
                  <p className="text-sm text-gray-600">
                    {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')} elapsed
                  </p>
                </div>
                
                <Button 
                  variant="destructive"
                  onClick={stopBreathwork}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Session
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderEMDR = () => {
    return (
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle>EMDR Eye Movement Exercise</CardTitle>
          <CardDescription>
            Follow the dot with your eyes while recalling the memory you want to process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!emdrActive ? (
            <>
              <div className="p-6 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Important:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• EMDR should ideally be done with a trained therapist</li>
                  <li>• Start with less distressing memories</li>
                  <li>• Stop if you feel overwhelmed</li>
                  <li>• Have grounding techniques ready</li>
                </ul>
              </div>
              
              <div>
                <Label>Speed</Label>
                <RadioGroup value={emdrSpeed.toString()} onValueChange={(v) => setEmdrSpeed(Number(v))}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0.5" id="slow" />
                    <Label htmlFor="slow">Slow</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="medium" />
                    <Label htmlFor="medium">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1.5" id="fast" />
                    <Label htmlFor="fast">Fast</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button className="w-full" onClick={startEMDR}>
                <Eye className="h-4 w-4 mr-2" />
                Start EMDR Session
              </Button>
            </>
          ) : (
            <>
              <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-8 h-8 bg-teal-600 rounded-full transition-none"
                  style={{ left: `${dotPosition}%`, transform: `translate(-50%, -50%)` }}
                />
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Keep your head still and follow the dot with your eyes
                </p>
                <Button 
                  variant="destructive"
                  onClick={stopEMDR}
                >
                  Stop Session
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderMeditation = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meditations.map(meditation => (
          <Card key={meditation.id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                {meditation.name}
              </CardTitle>
              <CardDescription>{meditation.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <Badge variant="outline">{meditation.duration}</Badge>
                </div>
                <Button 
                  className="btn-primary w-full"
                  onClick={() => {
                    setSelectedMeditation(meditation.id)
                    setMeditationActive(true)
                    alert('Starting meditation audio... (Audio playback would be implemented here)')
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Meditation
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderJournaling = () => {
    return (
      <div className="space-y-6">
        {!selectedPrompt ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {journalPrompts.map((prompt, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedPrompt(prompt)}
              >
                <CardContent className="pt-6">
                  <p className="text-gray-700">{prompt}</p>
                  <Button className="w-full mt-4" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Use This Prompt
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Journal Entry</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedPrompt(null)
                    setJournalEntry('')
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-lg">
                <p className="text-gray-700 italic">{selectedPrompt}</p>
              </div>
              
              <Textarea
                placeholder="Start writing your thoughts..."
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                rows={10}
                className="min-h-[300px]"
              />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {journalEntry.split(' ').filter(w => w).length} words
                </span>
                <Button 
                  onClick={() => {
                    console.log('Saving journal entry:', journalEntry)
                    saveToolUsage('journaling', 'Journal Entry', 15)
                    alert('Journal entry saved!')
                    setSelectedPrompt(null)
                    setJournalEntry('')
                  }}
                  disabled={!journalEntry.trim()}
                >
                  Save Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
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
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Therapeutic <span className="gradient-text">Tools</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Evidence-based exercises and techniques to support your healing and growth journey
          </p>
          
          {/* Trust indicators */}
          <div className="flex justify-center items-center gap-6 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4 text-teal-500" />
              <span>Clinically proven</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-teal-500" />
              <span>Safe & secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-teal-500" />
              <span>Personalized</span>
            </div>
          </div>
        </motion.div>

        {!selectedTool ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
              <Card className="trust-badge">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Sessions This Week</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <Activity className="h-8 w-8 text-teal-600 opacity-20" />
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
                      <p className="text-sm text-gray-600">Total Minutes</p>
                      <p className="text-2xl font-bold text-teal-700">245</p>
                    </div>
                    <Target className="h-8 w-8 text-teal-600 opacity-20" />
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
                      <p className="text-sm text-gray-600">Favorite Tool</p>
                      <p className="text-lg font-bold text-teal-700">Breathwork</p>
                    </div>
                    <Wind className="h-8 w-8 text-teal-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
              <Card className="trust-badge">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Streak</p>
                      <p className="text-2xl font-bold text-teal-700">7 days</p>
                    </div>
                    <Zap className="h-8 w-8 text-teal-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                <Card 
                  className="feature-card cursor-pointer"
                  onClick={() => setSelectedTool(tool.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <tool.icon className={`h-8 w-8 ${tool.color}`} />
                      <Badge variant="outline">{tool.difficulty}</Badge>
                    </div>
                    <CardTitle>{tool.name}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Duration: {tool.duration}</span>
                      <Button variant="ghost" size="sm" className="btn-secondary">
                        Try Now
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back Button */}
            <Button 
              className="btn-secondary"
              onClick={() => {
                setSelectedTool(null)
                setActiveWorksheet(null)
                setWorksheetAnswers({})
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>

            {/* Render selected tool */}
            {selectedTool === 'cbt' && renderCBTWorksheet()}
            {selectedTool === 'breathwork' && renderBreathwork()}
            {selectedTool === 'emdr' && renderEMDR()}
            {selectedTool === 'meditation' && renderMeditation()}
            {selectedTool === 'journaling' && renderJournaling()}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function ToolsPage() {
  return (
    <AuthProvider>
      <ToolsContent />
    </AuthProvider>
  )
}