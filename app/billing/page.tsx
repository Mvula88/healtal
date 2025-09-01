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
  tier: 'free' | 'explore' | 'transform' | 'enterprise'
  price: number
  period: string
  features: string[]
  limitations?: string[]
  recommended?: boolean
  icon: any
  color: string
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: 0,
    period: 'forever',
    icon: Zap,
    color: 'gray',
    features: [
      '5 AI coaching sessions per month',
      'Daily mood check-ins',
      'Basic community access',
      'Limited pattern insights'
    ],
    limitations: [
      'No growth journeys',
      'No advanced analytics',
      'Limited support'
    ]
  },
  {
    id: 'explore',
    name: 'Explore',
    tier: 'explore',
    price: 19,
    period: 'month',
    icon: Shield,
    color: 'blue',
    features: [
      'Unlimited AI coaching sessions',
      'Full pattern analytics dashboard',
      'All wellness tools',
      'Community full access',
      'Weekly insights reports',
      'Email support'
    ],
    limitations: [
      'No growth journeys',
      'No personalized insights'
    ]
  },
  {
    id: 'transform',
    name: 'Transform',
    tier: 'transform',
    price: 49,
    period: 'month',
    icon: Crown,
    color: 'purple',
    recommended: true,
    features: [
      'Everything in Explore',
      'Personalized growth journeys',
      'Advanced pattern insights',
      'Priority support',
      'Healing circles access',
      'Custom recovery programs',
      'Voice sessions',
      'Downloadable reports'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 'enterprise',
    price: 0,
    period: 'custom',
    icon: Users,
    color: 'amber',
    features: [
      'Everything in Transform',
      'Dedicated account manager',
      'Custom integrations',
      'Team analytics',
      'Bulk licenses',
      'Training & onboarding',
      'SLA guarantee',
      'Custom features'
    ]
  }
]

function BillingContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<'free' | 'explore' | 'transform' | 'enterprise'>('free')
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
    if (plan.tier === 'enterprise') {
      window.location.href = 'mailto:support@beneathy.com?subject=Enterprise Plan Inquiry'
      return
    }

    setLoading(true)
    // Here you would integrate with Stripe or your payment processor
    alert(`Upgrade to ${plan.name} plan - Payment integration coming soon!`)
    setLoading(false)
  }

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel your subscription?')) {
      setLoading(true)
      // Handle cancellation
      alert('Subscription cancellation - Coming soon')
      setLoading(false)
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
          {currentPlan !== 'free' && (
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
                      {plan.price === 0 && plan.period === 'forever' ? (
                        <div className="text-3xl font-bold">Free</div>
                      ) : plan.period === 'custom' ? (
                        <div className="text-2xl font-bold">Contact Us</div>
                      ) : (
                        <>
                          <div className="text-3xl font-bold">
                            ${billingPeriod === 'yearly' ? getYearlyPrice(plan.price) : plan.price}
                          </div>
                          <div className="text-sm text-gray-600">
                            per {billingPeriod === 'yearly' ? 'year' : 'month'}
                          </div>
                        </>
                      )}
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
                    ) : plan.tier === 'free' ? (
                      <Button className="w-full" variant="outline" disabled>
                        Downgrade
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
                <h4 className="font-semibold text-gray-900">Is there a free trial?</h4>
                <p className="text-gray-600">Yes! Start with our free plan and upgrade when you're ready for more features.</p>
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