'use client'

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
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Welcome, {user?.name || 'there'}!</h3>
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
                  className={`p-4 rounded-lg border-2 transition-all ${
                    responses.goals.includes(goal.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{goal.icon}</div>
                  <div className="text-sm font-medium">{goal.label}</div>
                </button>
              ))}
            </div>
            <div>
              <Label htmlFor="challenge">What's your biggest challenge right now? (Optional)</Label>
              <Textarea
                id="challenge"
                placeholder="Share what you're currently struggling with..."
                value={responses.currentChallenge}
                onChange={(e) => setResponses(prev => ({ ...prev, currentChallenge: e.target.value }))}
                className="mt-2"
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
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-4 rounded-lg">
              <p className="text-sm text-purple-700">
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {onboardingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`text-xs ${
                  index <= currentStep ? 'text-primary font-medium' : 'text-gray-400'
                }`}
              >
                {index < currentStep && '✓'}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <CurrentIcon className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>{onboardingSteps[currentStep].title}</CardTitle>
                <CardDescription>{onboardingSteps[currentStep].description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="min-h-[300px]">
              {renderStepContent()}
            </div>
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                className="flex items-center"
                disabled={currentStep === 1 && responses.goals.length === 0}
              >
                {currentStep === onboardingSteps.length - 1 ? 'Start Journey' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}