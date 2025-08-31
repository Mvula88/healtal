'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { PatternAnalyticsDashboard } from '@/components/pattern-analytics-dashboard'
import { GrowthJourneyIntegration } from '@/components/growth-journey-integration'
import { PersonalizedPatternInsights } from '@/components/personalized-pattern-insights'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { 
  Brain, 
  BarChart3, 
  Compass, 
  Lightbulb,
  TrendingUp,
  Sparkles,
  Activity,
  ChevronRight,
  Lock,
  Crown
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

function InsightsContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [detectedPatterns, setDetectedPatterns] = useState<string[]>([])
  const [userTier, setUserTier] = useState<'free' | 'explore' | 'transform' | 'enterprise'>('free')
  const [activeTab, setActiveTab] = useState('analytics')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchUserData()
      analyzeUserPatterns()
    } else {
      router.push('/login')
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user?.id)
        .single()
      
      if (userData) {
        setUserTier(userData.subscription_tier || 'free')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const analyzeUserPatterns = async () => {
    try {
      setLoading(true)
      
      // Fetch user's conversations and messages to detect patterns
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*, messages(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (conversations) {
        // Extract patterns from conversation metadata
        const patterns = new Set<string>()
        
        conversations.forEach(conv => {
          // Check insights_generated for patterns
          if (conv.insights_generated?.patterns) {
            conv.insights_generated.patterns.forEach((p: string) => patterns.add(p))
          }
          
          // Check message metadata for patterns
          conv.messages?.forEach((msg: any) => {
            if (msg.metadata?.patterns_detected) {
              msg.metadata.patterns_detected.forEach((p: string) => patterns.add(p))
            }
          })
          
          // Check tags
          if (conv.tags) {
            conv.tags.forEach((tag: string) => patterns.add(tag))
          }
        })
        
        // Add some detected patterns based on conversation content
        // This is a simplified version - in production, you'd use NLP
        const allMessages = conversations.flatMap(c => c.messages || [])
        const messageContent = allMessages.map(m => m.content).join(' ').toLowerCase()
        
        if (messageContent.includes('addiction') || messageContent.includes('drinking')) {
          patterns.add('addiction patterns')
        }
        if (messageContent.includes('friend') || messageContent.includes('social')) {
          patterns.add('social dependency')
        }
        if (messageContent.includes('all or nothing') || messageContent.includes('extreme')) {
          patterns.add('all-or-nothing thinking')
        }
        if (messageContent.includes('anxious') || messageContent.includes('anxiety')) {
          patterns.add('anxiety patterns')
        }
        
        setDetectedPatterns(Array.from(patterns))
      }
    } catch (error) {
      console.error('Error analyzing patterns:', error)
    } finally {
      setLoading(false)
    }
  }

  const isPremiumFeature = (feature: string) => {
    const freeFeatures = ['analytics-basic']
    const exploreFeatures = ['analytics', 'insights-basic']
    const transformFeatures = ['analytics', 'journeys', 'insights']
    
    switch (userTier) {
      case 'free':
        return !freeFeatures.includes(feature)
      case 'explore':
        return !exploreFeatures.includes(feature)
      case 'transform':
      case 'enterprise':
        return false
      default:
        return true
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="orb orb-teal w-96 h-96 top-20 -right-20 opacity-20"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div 
          className="orb orb-purple w-80 h-80 bottom-10 left-10 opacity-20"
          animate={{ 
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />
      </div>

      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pattern Insights Hub</h1>
              <p className="text-gray-600">
                Deep analysis of your behavioral patterns and personalized growth recommendations
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {userTier !== 'free' && (
                <Badge variant="premium" className="px-3 py-1">
                  <Crown className="h-3 w-3 mr-1" />
                  {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Patterns Detected</p>
                    <p className="text-2xl font-bold text-teal-600">{detectedPatterns.length}</p>
                  </div>
                  <Brain className="h-8 w-8 text-teal-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Journeys</p>
                    <p className="text-2xl font-bold text-purple-600">2</p>
                  </div>
                  <Compass className="h-8 w-8 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Weekly Progress</p>
                    <p className="text-2xl font-bold text-green-600">+15%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Insights Generated</p>
                    <p className="text-2xl font-bold text-amber-600">12</p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-amber-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Pattern Analytics</span>
            </TabsTrigger>
            <TabsTrigger 
              value="journeys" 
              className="flex items-center space-x-2"
              disabled={isPremiumFeature('journeys')}
            >
              <Compass className="h-4 w-4" />
              <span>Growth Journeys</span>
              {isPremiumFeature('journeys') && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger 
              value="insights"
              className="flex items-center space-x-2"
              disabled={isPremiumFeature('insights')}
            >
              <Lightbulb className="h-4 w-4" />
              <span>Personal Insights</span>
              {isPremiumFeature('insights') && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {isPremiumFeature('analytics') && userTier === 'free' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Unlock Full Pattern Analytics</CardTitle>
                  <CardDescription>
                    Get detailed analytics about your behavioral patterns with a premium plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Lock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Pattern Analytics is available with Explore plan and above
                    </p>
                    <Button onClick={() => router.push('/pricing')}>
                      Upgrade Now
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <PatternAnalyticsDashboard userId={user.id} />
            )}
          </TabsContent>

          <TabsContent value="journeys" className="space-y-6">
            {isPremiumFeature('journeys') ? (
              <Card>
                <CardHeader>
                  <CardTitle>Unlock Growth Journeys</CardTitle>
                  <CardDescription>
                    Access personalized growth programs with Transform plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Lock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Growth Journeys are available with Transform plan and above
                    </p>
                    <Button onClick={() => router.push('/pricing')}>
                      Upgrade to Transform
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <GrowthJourneyIntegration 
                userId={user.id} 
                detectedPatterns={detectedPatterns}
              />
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {isPremiumFeature('insights') ? (
              <Card>
                <CardHeader>
                  <CardTitle>Unlock Personalized Insights</CardTitle>
                  <CardDescription>
                    Get AI-powered personal insights with Transform plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Lock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Personalized Insights are available with Transform plan and above
                    </p>
                    <Button onClick={() => router.push('/pricing')}>
                      Upgrade to Transform
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <PersonalizedPatternInsights userId={user.id} />
            )}
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        {loading === false && detectedPatterns.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready to explore your patterns deeper?
                  </h3>
                  <p className="text-gray-600">
                    Start a new coaching session to work on: {detectedPatterns.slice(0, 2).join(', ')}
                  </p>
                </div>
                <Button 
                  size="lg"
                  onClick={() => router.push('/coach')}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Start Coaching Session
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Helper Badge component for tier display
function Badge({ children, variant, className }: { 
  children: React.ReactNode, 
  variant: string,
  className?: string 
}) {
  const baseClasses = "inline-flex items-center rounded-full font-medium"
  const variantClasses = variant === 'premium' 
    ? "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800"
    : "bg-gray-100 text-gray-700"
  
  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  )
}

export default function InsightsPage() {
  return (
    <AuthProvider>
      <InsightsContent />
    </AuthProvider>
  )
}