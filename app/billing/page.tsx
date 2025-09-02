'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { Navbar } from '@/components/navigation/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { 
  CreditCard, 
  Check, 
  X, 
  Loader2,
  Crown,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Calendar
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  tier: 'lite' | 'starter' | 'growth' | 'premium'
  price: number
  priceId?: string
  period: string
  features: string[]
  limitations?: string[]
  recommended?: boolean
  icon: any
  color: string
  limits?: {
    ai_messages: number
    voice_minutes: number
    buddy_matching: number
    group_sessions: number
  }
}

const PLANS: Plan[] = [
  {
    id: 'lite',
    name: 'Lite',
    tier: 'lite',
    price: 9,
    priceId: process.env.NEXT_PUBLIC_STRIPE_LITE_PRICE_ID,
    period: 'month',
    icon: Shield,
    color: 'green',
    features: [
      '30 AI coach messages/month',
      'Unlimited mood tracking',
      'Unlimited journal entries',
      'Weekly pattern insights',
      'Community access (read & post)',
      'Crisis resources',
      'Mobile app access',
      'Email support'
    ],
    limitations: [
      'No voice features',
      'No peer messaging',
      'No buddy matching',
      'Limited AI messages'
    ],
    limits: {
      ai_messages: 30,
      voice_minutes: 0,
      buddy_matching: 0,
      group_sessions: 0
    }
  },
  {
    id: 'starter',
    name: 'Starter',
    tier: 'starter',
    price: 19,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    period: 'month',
    icon: Zap,
    color: 'blue',
    recommended: true,
    features: [
      '200 AI coach messages/month',
      '60 voice minutes/month',
      'Daily pattern insights',
      'Peer messaging',
      '1 buddy match',
      'Progress analytics',
      'Custom exercises',
      'Priority email support'
    ],
    limitations: [
      'No group sessions',
      'No therapist matching',
      'Limited voice minutes'
    ],
    limits: {
      ai_messages: 200,
      voice_minutes: 60,
      buddy_matching: 1,
      group_sessions: 0
    }
  },
  {
    id: 'growth',
    name: 'Growth',
    tier: 'growth',
    price: 39,
    priceId: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID,
    period: 'month',
    icon: Crown,
    color: 'purple',
    features: [
      'Unlimited AI coach messages',
      '300 voice minutes/month',
      '3 buddy matches',
      '4 group sessions/month',
      'Therapist matching',
      'Custom AI personality',
      'Export health records',
      'Priority support'
    ],
    limitations: [
      'Voice minutes capped at 300',
      'Limited buddy matches'
    ],
    limits: {
      ai_messages: -1,
      voice_minutes: 300,
      buddy_matching: 3,
      group_sessions: 4
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    tier: 'premium',
    price: 79,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    period: 'month',
    icon: Users,
    color: 'amber',
    features: [
      'Everything unlimited',
      'Unlimited voice minutes',
      'Unlimited buddy matches',
      'Unlimited group sessions',
      'Monthly therapist consultation',
      '2 family accounts',
      'White-label option',
      'API access',
      'Dedicated success manager'
    ],
    limits: {
      ai_messages: -1,
      voice_minutes: -1,
      buddy_matching: -1,
      group_sessions: -1
    }
  }
]

function BillingContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<'lite' | 'starter' | 'growth' | 'premium' | null>(null)
  const [loading, setLoading] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      return // Don't redirect immediately, let AuthProvider handle it
    }
    fetchUserSubscription()
  }, [user])

  const fetchUserSubscription = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user?.id)
        .single()
      
      if (data?.subscription_tier) {
        setCurrentPlan(data.subscription_tier)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  const handleUpgrade = async (plan: Plan) => {
    if (plan.tier === 'premium' && !plan.priceId) {
      window.location.href = 'mailto:support@beneathy.com?subject=Enterprise Plan Inquiry'
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planName: plan.name
        }),
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned')
        alert('Unable to process payment. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment processing error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.')) {
      setLoading(true)
      try {
        const response = await fetch('/api/stripe/checkout', {
          method: 'DELETE',
        })

        const data = await response.json()
        
        if (data.success) {
          alert('Your subscription has been cancelled. You will continue to have access until the end of your billing period.')
          await fetchUserSubscription()
        } else {
          alert('Unable to cancel subscription. Please try again or contact support.')
        }
      } catch (error) {
        console.error('Cancellation error:', error)
        alert('Unable to cancel subscription. Please contact support.')
      } finally {
        setLoading(false)
      }
    }
  }

  const getYearlyPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 10) // 2 months free on yearly
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Growth Plan</h1>
            <p className="text-xl text-gray-600 mb-6">
              Invest in your mental wellness journey with Beneathy
            </p>
            
            {/* Billing Period Toggle */}
            <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <Badge className="ml-2 bg-green-100 text-green-700">Save 17%</Badge>
              </button>
            </div>
          </div>

          {/* Current Plan */}
          {currentPlan && (
            <Card className="mb-6 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Your Current Plan</p>
                    <h3 className="text-2xl font-bold text-gray-900 capitalize">{currentPlan}</h3>
                  </div>
                  <Button variant="outline" onClick={handleCancel}>
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => {
              const Icon = plan.icon
              const isCurrentPlan = plan.tier === currentPlan
              const canUpgrade = PLANS.findIndex(p => p.tier === currentPlan) < PLANS.findIndex(p => p.tier === plan.tier)
              
              return (
                <Card 
                  key={plan.id}
                  className={`relative ${
                    plan.recommended ? 'border-2 border-purple-500 shadow-xl' : ''
                  } ${isCurrentPlan ? 'bg-gray-50' : ''}`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-500 text-white">Most Popular</Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-${plan.color}-100 flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 text-${plan.color}-600`} />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <div className="text-3xl font-bold">
                        ${billingPeriod === 'yearly' ? getYearlyPrice(plan.price) : plan.price}
                      </div>
                      <div className="text-sm text-gray-600">
                        per {billingPeriod === 'yearly' ? 'year' : 'month'}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {plan.limitations?.map((limitation, i) => (
                        <div key={i} className="flex items-start">
                          <X className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-500">{limitation}</span>
                        </div>
                      ))}
                    </div>
                    
                    {isCurrentPlan ? (
                      <Button className="w-full" disabled variant="outline">
                        Current Plan
                      </Button>
                    ) : canUpgrade ? (
                      <Button 
                        className="w-full"
                        onClick={() => handleUpgrade(plan)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Upgrade
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button className="w-full" variant="outline">
                        Contact Sales
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* FAQs */}
          <Card className="mt-10">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">Can I change plans anytime?</h4>
                <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">What payment methods do you accept?</h4>
                <p className="text-gray-600">We accept all major credit cards, debit cards, and PayPal.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Do you offer a trial period?</h4>
                <p className="text-gray-600">We offer a 7-day money-back guarantee on all plans. If you're not satisfied, we'll refund your payment.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Can I cancel my subscription?</h4>
                <p className="text-gray-600">Yes, you can cancel anytime. You'll continue to have access until the end of your billing period.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <AuthProvider>
      <BillingContent />
    </AuthProvider>
  )
}