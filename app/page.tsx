'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/navigation/footer'
import { LegalDisclaimer, MiniCrisisBar } from '@/components/crisis-resources'
import { APP_CONFIG, PRICING_TIERS, FEATURES, COMPETITIVE_MESSAGING } from '@/lib/config'
import { 
  Brain, 
  Heart, 
  Compass, 
  Users, 
  Shield, 
  Sparkles,
  ChevronRight,
  Check,
  Star,
  TrendingUp,
  Lightbulb,
  Target
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Root Cause Analysis',
    description: 'Go beyond surface symptoms to understand the deeper origins of your patterns and behaviors.'
  },
  {
    icon: Lightbulb,
    title: 'Pattern Discovery',
    description: 'Identify recurring themes and behaviors that shape your life experiences and relationships.'
  },
  {
    icon: Target,
    title: 'Focused Growth Plans',
    description: 'Personalized strategies that target the root of your challenges for lasting transformation.'
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Monitor your journey from understanding to transformation with clear metrics and milestones.'
  },
  {
    icon: Users,
    title: 'Professional Network',
    description: 'Access to vetted therapists and coaches when you need additional professional support.'
  },
  {
    icon: Shield,
    title: 'Safe & Confidential',
    description: 'Your personal growth journey is protected with enterprise-grade security and complete privacy.'
  }
]

const testimonials = [
  {
    content: "Healtal helped me understand why I kept repeating the same relationship patterns. Now I finally see the root causes and can make real changes.",
    author: "Sarah M.",
    role: "Understand Member",
    rating: 5
  },
  {
    content: "Before expensive therapy, I wanted to understand my patterns. Healtal gave me insights that years of surface-level self-help never could.",
    author: "Michael T.",
    role: "Transform Member",
    rating: 5
  },
  {
    content: "The AI coach asks questions that get to the heart of issues. I discovered connections I never saw before.",
    author: "Emily R.",
    role: "Understand Member",
    rating: 5
  }
]

const pricingPlans = PRICING_TIERS.map(tier => ({
  ...tier,
  period: tier.price > 0 ? '/month' : undefined,
  price: tier.price === 0 ? 'Free' : `$${tier.price}`,
  highlighted: tier.popular || false
}))

export default function HomePage() {
  return (
    <div className="min-h-screen hero-gradient">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-32 bg-gradient-to-br from-teal-50/30 via-cyan-50/20 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 float-animation">
                {APP_CONFIG.tagline}
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {COMPETITIVE_MESSAGING.betterHelp}. Specialized AI coaching that helps you discover 
                the root causes behind your patterns and behaviors for lasting personal transformation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="text-lg px-8 btn-glow bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 border-0 pulse-animation">
                    Start Your Journey
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="text-lg px-8 border-teal-500 text-teal-600 hover:bg-teal-50 hover:border-teal-600">
                    Learn More
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                No credit card required • Start free today
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-b from-white to-teal-50/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Beyond Surface-Level Solutions
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {COMPETITIVE_MESSAGING.headspace}. Our specialized approach helps you understand the why behind your patterns.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="card-hover border-teal-100 hover:border-teal-300">
                    <CardHeader>
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-teal-600" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gradient-to-b from-teal-50/20 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                From Surface to Source
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A proven approach to understanding the root causes of your patterns
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Share Your Story', desc: 'Tell our AI coach what you want to understand' },
                { step: '2', title: 'Explore Root Causes', desc: 'Discover the deeper origins of your patterns' },
                { step: '3', title: 'Connect the Dots', desc: 'See how past experiences shape current behaviors' },
                { step: '4', title: 'Transform with Insight', desc: 'Use deep understanding to create lasting change' }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gradient-to-br from-white via-teal-50/10 to-cyan-50/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Stories of Transformation
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real experiences from our community members
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="card-hover border-teal-100 hover:border-teal-300">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-teal-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                    <div className="border-t pt-4">
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-gradient-to-b from-cyan-50/20 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Growth Path
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Flexible plans to support your personal development journey
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={`card-hover ${plan.highlighted ? 'border-teal-500 shadow-xl bg-gradient-to-br from-white to-teal-50/30' : 'border-teal-100'}`}>
                  {plan.highlighted && (
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-center py-2 text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-gray-600">{plan.period}</span>}
                    </div>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/signup" className="block">
                      <Button 
                        className={`w-full ${plan.highlighted ? 'btn-glow bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 border-0' : 'border-teal-500 text-teal-600 hover:bg-teal-50'}`} 
                        variant={plan.highlighted ? 'default' : 'outline'}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer Section */}
        <section className="py-12 bg-gradient-to-b from-teal-50/30 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <LegalDisclaimer />
            <div className="mt-4 flex justify-center space-x-4">
              <Link href="/privacy" className="text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors">
                Privacy Policy
              </Link>
              <span className="text-teal-300">•</span>
              <Link href="/terms" className="text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors">
                Terms of Service
              </Link>
              <span className="text-teal-300">•</span>
              <Link href="/disclaimers" className="text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors">
                Full Disclaimers
              </Link>
            </div>
          </div>
        </section>

        {/* Crisis Resources Bar */}
        <MiniCrisisBar />

      <Footer />
    </div>
  )
}