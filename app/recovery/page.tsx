'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { 
  Brain,
  Heart,
  Shield,
  Calendar,
  TrendingUp,
  AlertCircle,
  Target,
  Lightbulb,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  TreePine,
  Flame
} from 'lucide-react'

function RecoveryContent() {
  const { user } = useAuth()
  const [sobrietyDate, setSobrietyDate] = useState<Date | null>(null)
  const [selectedAddiction, setSelectedAddiction] = useState('')
  const [triggerAnalysis, setTriggerAnalysis] = useState({
    emotional: [],
    situational: [],
    social: [],
    physical: []
  })
  const [activeTab, setActiveTab] = useState('tracker')

  // Calculate days sober
  const daysSober = sobrietyDate 
    ? Math.floor((new Date().getTime() - sobrietyDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const addictionTypes = [
    { id: 'alcohol', label: 'Alcohol', icon: '🍷' },
    { id: 'substances', label: 'Substances', icon: '💊' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'pornography', label: 'Pornography', icon: '🔞' },
    { id: 'social-media', label: 'Social Media', icon: '📱' },
    { id: 'food', label: 'Food/Eating', icon: '🍔' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'gambling', label: 'Gambling', icon: '🎰' },
    { id: 'relationships', label: 'Relationships', icon: '💔' },
    { id: 'work', label: 'Work', icon: '💼' }
  ]

  const rootCauseQuestions = [
    {
      category: 'Emotional Roots',
      icon: Heart,
      questions: [
        'What emotion am I trying to escape or numb?',
        'What feeling am I seeking through this behavior?',
        'When did I first feel this emptiness?',
        'What emotional wound am I avoiding?'
      ]
    },
    {
      category: 'Trauma Connection',
      icon: Brain,
      questions: [
        'What past experience does this remind me of?',
        'When did I first learn this coping mechanism?',
        'Who taught me (directly or indirectly) this pattern?',
        'What trauma am I trying to survive?'
      ]
    },
    {
      category: 'Unmet Needs',
      icon: Target,
      questions: [
        'What basic need is not being met?',
        'What am I really hungry for?',
        'What connection am I missing?',
        'What would truly satisfy this craving?'
      ]
    },
    {
      category: 'Identity & Shame',
      icon: Shield,
      questions: [
        'What story do I tell myself about who I am?',
        'What shame am I carrying?',
        'What part of myself am I rejecting?',
        'What would self-acceptance look like?'
      ]
    }
  ]

  const milestones = [
    { days: 1, label: '24 Hours', badge: '🌱', message: 'The hardest step - you did it!' },
    { days: 3, label: '3 Days', badge: '🌿', message: 'Your brain is starting to reset' },
    { days: 7, label: '1 Week', badge: '🌳', message: 'New neural pathways forming' },
    { days: 14, label: '2 Weeks', badge: '🏔️', message: 'Breaking the habit loop' },
    { days: 30, label: '1 Month', badge: '⭐', message: 'Significant brain healing' },
    { days: 60, label: '2 Months', badge: '🌟', message: 'New patterns established' },
    { days: 90, label: '3 Months', badge: '✨', message: 'Major neural rewiring' },
    { days: 180, label: '6 Months', badge: '🎯', message: 'Deep transformation' },
    { days: 365, label: '1 Year', badge: '🏆', message: 'Incredible achievement!' }
  ]

  const currentMilestone = milestones.filter(m => daysSober >= m.days).pop()
  const nextMilestone = milestones.find(m => daysSober < m.days)

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
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div 
          className="orb orb-cyan w-[500px] h-[500px] -bottom-32 -left-32"
          animate={{ 
            y: [0, 20, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 25, repeat: Infinity }}
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
            Recovery & <span className="gradient-text">Root Causes</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Understanding the "why" behind your patterns to create lasting change
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl bg-white/50 backdrop-blur-sm p-1">
            {['tracker', 'root-causes', 'triggers', 'milestones'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-teal-600 text-white' 
                    : 'text-gray-600 hover:text-teal-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Sobriety Tracker Tab */}
        {activeTab === 'tracker' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Counter */}
              <Card className="lg:col-span-2 feature-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Your Journey</CardTitle>
                  <CardDescription>
                    Track your progress and celebrate each day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedAddiction ? (
                    <div>
                      <p className="text-gray-600 mb-6">What pattern are you working to understand?</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {addictionTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setSelectedAddiction(type.id)}
                            className="p-4 rounded-xl border-2 border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition-all"
                          >
                            <div className="text-3xl mb-2">{type.icon}</div>
                            <div className="text-sm font-medium">{type.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="inline-block"
                      >
                        <div className="text-7xl font-bold gradient-text mb-2">
                          {daysSober}
                        </div>
                        <div className="text-xl text-gray-600">Days of Growth</div>
                      </motion.div>
                      
                      {currentMilestone && (
                        <div className="mt-8 p-4 bg-teal-50 rounded-xl">
                          <div className="text-4xl mb-2">{currentMilestone.badge}</div>
                          <div className="font-semibold text-teal-700">
                            {currentMilestone.label} Milestone!
                          </div>
                          <p className="text-sm text-teal-600 mt-1">
                            {currentMilestone.message}
                          </p>
                        </div>
                      )}

                      {nextMilestone && (
                        <div className="mt-6">
                          <p className="text-sm text-gray-500">Next milestone</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-2xl">{nextMilestone.badge}</span>
                            <span className="font-medium">{nextMilestone.label}</span>
                            <span className="text-gray-500">
                              ({nextMilestone.days - daysSober} days)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Daily Check-in */}
              <Card className="feature-card">
                <CardHeader>
                  <CardTitle>Daily Check-In</CardTitle>
                  <CardDescription>HALT Assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { label: 'Hungry', icon: '🍽️' },
                      { label: 'Angry', icon: '😤' },
                      { label: 'Lonely', icon: '💔' },
                      { label: 'Tired', icon: '😴' }
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 rounded-lg hover:bg-green-100 transition-colors">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-red-100 transition-colors">
                            <XCircle className="h-5 w-5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full btn-primary">
                    Complete Check-In
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Root Causes Tab */}
        {activeTab === 'root-causes' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {rootCauseQuestions.map((category, index) => {
                const Icon = category.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="feature-card h-full">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-teal-600" />
                          </div>
                          <CardTitle>{category.category}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {category.questions.map((question, qIndex) => (
                            <div 
                              key={qIndex}
                              className="p-3 rounded-lg bg-gray-50 hover:bg-teal-50 transition-colors cursor-pointer"
                            >
                              <p className="text-gray-700">{question}</p>
                            </div>
                          ))}
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          Explore with AI Coach
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Triggers Tab */}
        {activeTab === 'triggers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="feature-card">
              <CardHeader>
                <CardTitle>Identify Your Triggers</CardTitle>
                <CardDescription>
                  Understanding what activates cravings helps you prepare and respond differently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      type: 'Emotional',
                      icon: '😔',
                      triggers: ['Stress', 'Loneliness', 'Boredom', 'Anxiety', 'Shame', 'Anger'],
                      color: 'bg-blue-50 text-blue-700'
                    },
                    {
                      type: 'Situational',
                      icon: '📍',
                      triggers: ['Certain places', 'Time of day', 'After work', 'Weekends', 'Holidays'],
                      color: 'bg-purple-50 text-purple-700'
                    },
                    {
                      type: 'Social',
                      icon: '👥',
                      triggers: ['Certain people', 'Social events', 'Peer pressure', 'Isolation', 'Conflict'],
                      color: 'bg-green-50 text-green-700'
                    },
                    {
                      type: 'Physical',
                      icon: '🏃',
                      triggers: ['Fatigue', 'Hunger', 'Pain', 'Insomnia', 'Illness', 'Withdrawal'],
                      color: 'bg-orange-50 text-orange-700'
                    }
                  ].map((category) => (
                    <div key={category.type} className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{category.icon}</span>
                        <h3 className="font-semibold">{category.type}</h3>
                      </div>
                      <div className="space-y-2">
                        {category.triggers.map((trigger) => (
                          <div
                            key={trigger}
                            className={`p-2 rounded-lg text-sm cursor-pointer transition-all hover:scale-105 ${category.color}`}
                          >
                            {trigger}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid md:grid-cols-3 gap-4">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`feature-card ${daysSober >= milestone.days ? 'border-teal-500 bg-teal-50/50' : ''}`}>
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-3">{milestone.badge}</div>
                      <h3 className="font-bold text-lg mb-1">{milestone.label}</h3>
                      <p className="text-sm text-gray-600 mb-3">{milestone.days} days</p>
                      <p className="text-sm italic">{milestone.message}</p>
                      {daysSober >= milestone.days && (
                        <Badge className="mt-3 bg-teal-600">Achieved!</Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default function RecoveryPage() {
  return (
    <AuthProvider>
      <RecoveryContent />
    </AuthProvider>
  )
}