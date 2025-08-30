'use client'

import { motion } from 'framer-motion'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { Heart, ChevronRight, ChevronLeft, CheckCircle, Target, Users, Brain, Sparkles } from 'lucide-react'

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to InnerRoot',
    icon: Heart,
    description: 'Let\'s get to know you better to personalize your journey'
  },
  {
    id: 'goals',
    title: 'What brings you here?',
    icon: Target,
    description: 'Select the areas you\'d like to focus on'
  },
  {
    id: 'preferences',
    title: 'Your preferences',
    icon: Brain,
    description: 'Help us tailor your experience'
  },
  {
    id: 'community',
    title: 'Community settings',
    icon: Users,
    description: 'Choose how you\'d like to engage with others'
  },
  {
    id: 'complete',
    title: 'You\'re all set!',
    icon: Sparkles,
    description: 'Your personalized journey awaits'
  }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState({
    goals: [] as string[],
    currentChallenge: '',
    preferredPace: 'moderate',
    communityPreference: 'open',
    journeyType: 'guided'
  })
  const { user } = useAuth()
  const router = useRouter()

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save preferences and redirect to dashboard
      router.push('/dashboard')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleGoal = (goal: string) => {
    setResponses(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }))
  }

  const renderStepContent = () => {
    const step = onboardingSteps[currentStep]
    
    switch (step.id) {
      case 'welcome':
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-teal-600/10 rounded-full flex items-center justify-center">
                <Heart className="w-10 h-10 text-teal-600" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Welcome, {(user as any)?.name || 'there'}!</h3>
              <p className="text-gray-600">
                We're excited to be part of your personal growth journey. 
                Let's take a few moments to personalize your experience.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-left">
              <p className="text-sm text-blue-700">
                <strong>Your privacy matters:</strong> All your responses are kept confidential 
                and are only used to enhance your InnerRoot experience.
              </p>
            </div>
          </div>
        )
      
      case 'goals':
        const goalOptions = [
          { id: 'relationships', label: 'Improve Relationships', icon: '❤️' },
          { id: 'career', label: 'Career Growth', icon: '💼' },
          { id: 'stress', label: 'Manage Stress', icon: '🧘' },
          { id: 'confidence', label: 'Build Confidence', icon: '💪' },
          { id: 'habits', label: 'Better Habits', icon: '📈' },
          { id: 'mindfulness', label: 'Mindfulness', icon: '🌿' },
          { id: 'creativity', label: 'Unlock Creativity', icon: '🎨' },
          { id: 'purpose', label: 'Find Purpose', icon: '✨' }
        ]
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {goalOptions.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    responses.goals.includes(goal.id)
                      ? 'border-teal-500 bg-teal-50 shadow-lg'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/30'
                  }`}
                >
                  <div className="text-2xl mb-2">{goal.icon}</div>
                  <div className="text-sm font-semibold text-gray-900">{goal.label}</div>
                </button>
              ))}
            </div>
            <div>
              <label htmlFor="challenge" className="block text-sm font-medium text-gray-700 mb-2">
                What's your biggest challenge right now? (Optional)
              </label>
              <textarea
                id="challenge"
                placeholder="Share what you're currently struggling with..."
                value={responses.currentChallenge}
                onChange={(e) => setResponses(prev => ({ ...prev, currentChallenge: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all resize-none"
                rows={3}
              />
            </div>
          </div>
        )
      
      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-3 block">How fast would you like to progress?</Label>
              <RadioGroup
                value={responses.preferredPace}
                onValueChange={(value) => setResponses(prev => ({ ...prev, preferredPace: value }))}
              >
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <RadioGroupItem value="gentle" id="gentle" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="gentle" className="cursor-pointer font-medium">Gentle</Label>
                      <p className="text-sm text-gray-600">5-10 minutes daily, slow and steady progress</p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <RadioGroupItem value="moderate" id="moderate" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="moderate" className="cursor-pointer font-medium">Moderate</Label>
                      <p className="text-sm text-gray-600">15-20 minutes daily, balanced approach</p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <RadioGroupItem value="intensive" id="intensive" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="intensive" className="cursor-pointer font-medium">Intensive</Label>
                      <p className="text-sm text-gray-600">30+ minutes daily, accelerated growth</p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label className="text-base font-semibold mb-3 block">Journey style preference</Label>
              <RadioGroup
                value={responses.journeyType}
                onValueChange={(value) => setResponses(prev => ({ ...prev, journeyType: value }))}
              >
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <RadioGroupItem value="guided" id="guided" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="guided" className="cursor-pointer font-medium">Guided</Label>
                      <p className="text-sm text-gray-600">Structured programs with clear steps</p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <RadioGroupItem value="flexible" id="flexible" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="flexible" className="cursor-pointer font-medium">Flexible</Label>
                      <p className="text-sm text-gray-600">Mix of structure and self-directed exploration</p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <RadioGroupItem value="exploratory" id="exploratory" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="exploratory" className="cursor-pointer font-medium">Exploratory</Label>
                      <p className="text-sm text-gray-600">Self-paced with various tools and resources</p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )
      
      case 'community':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-3 block">Community engagement preference</Label>
              <RadioGroup
                value={responses.communityPreference}
                onValueChange={(value) => setResponses(prev => ({ ...prev, communityPreference: value }))}
              >
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <RadioGroupItem value="open" id="open" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="open" className="cursor-pointer font-medium">Open to connect</Label>
                      <p className="text-sm text-gray-600">Share progress and engage with the community</p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <RadioGroupItem value="selective" id="selective" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="selective" className="cursor-pointer font-medium">Selective sharing</Label>
                      <p className="text-sm text-gray-600">Choose when and what to share</p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <RadioGroupItem value="private" id="private" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="private" className="cursor-pointer font-medium">Private journey</Label>
                      <p className="text-sm text-gray-600">Focus on personal growth without sharing</p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Safe space guarantee:</strong> Our community guidelines ensure 
                respectful, supportive interactions. You can change these settings anytime.
              </p>
            </div>
          </div>
        )
      
      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">You're all set!</h3>
              <p className="text-gray-600">
                Your personalized InnerRoot experience is ready. 
                Let's begin your journey to a better you.
              </p>
            </div>
            <div className="bg-gradient-to-r from-teal-50 to-pink-50 border border-teal-200 p-4 rounded-lg">
              <p className="text-sm text-teal-700">
                <strong>First step:</strong> We've selected a growth journey based on your goals. 
                You can explore more journeys anytime from your dashboard.
              </p>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  const CurrentIcon = onboardingSteps[currentStep].icon

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="orb orb-teal w-96 h-96 -top-32 -right-32"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div 
          className="orb orb-cyan w-80 h-80 -bottom-20 -left-20"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div 
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Progress Section */}
          <div className="mb-8">
            <div className="bg-white rounded-full p-2 shadow-lg border border-gray-100">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div 
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between mt-4 px-2">
              {onboardingSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center text-xs ${
                    index <= currentStep ? 'text-teal-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    index <= currentStep ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <span className="hidden sm:block">{step.title.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Card */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-8 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="bg-teal-500 rounded-2xl p-4 shadow-lg">
                  <CurrentIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{onboardingSteps[currentStep].title}</h1>
                  <p className="text-gray-600 mt-1">{onboardingSteps[currentStep].description}</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
              <div className="min-h-[300px]">
                {renderStepContent()}
              </div>
              
              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                    currentStep === 0 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={currentStep === 1 && responses.goals.length === 0}
                  className="btn-primary group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentStep === onboardingSteps.length - 1 ? 'Start Journey' : 'Next'}
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Skip Option */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-500 hover:text-teal-600 transition-colors font-medium"
            >
              Skip for now
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}