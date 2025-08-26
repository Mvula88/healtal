'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/navigation/footer'
import { AuthProvider } from '@/contexts/auth-context'
import { 
  Brain, 
  Heart, 
  Compass, 
  Users, 
  Shield, 
  Sparkles,
  ChevronRight,
  Check,
  Star
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI Growth Coach',
    description: 'Engage in meaningful conversations that help you explore patterns, understand your story, and foster personal growth.'
  },
  {
    icon: Compass,
    title: 'Personal Growth Journeys',
    description: 'Follow structured pathways designed for specific areas of self-discovery, from relationships to career fulfillment.'
  },
  {
    icon: Heart,
    title: 'Wellness Tracking',
    description: 'Monitor your emotional wellness, track patterns, and celebrate progress on your personal growth journey.'
  },
  {
    icon: Sparkles,
    title: 'Pattern Recognition',
    description: 'Discover connections between past experiences and current behaviors to unlock deeper self-understanding.'
  },
  {
    icon: Users,
    title: 'Supportive Community',
    description: 'Connect with others on similar journeys, share insights, and find encouragement in a safe space.'
  },
  {
    icon: Shield,
    title: 'Safe & Private',
    description: 'Your personal growth journey is protected with enterprise-grade security and complete privacy controls.'
  }
]

const testimonials = [
  {
    content: "InnerRoot helped me understand patterns I've been repeating for years. The AI coach asks the right questions that led to real breakthroughs.",
    author: "Sarah M.",
    role: "Explore Member",
    rating: 5
  },
  {
    content: "The growth journeys are incredibly well-designed. I finally understand my relationship patterns and am building healthier connections.",
    author: "Michael T.",
    role: "Transform Member",
    rating: 5
  },
  {
    content: "This platform gave me the tools to explore my story safely. The insights I've gained have been truly transformative.",
    author: "Emily R.",
    role: "Explore Member",
    rating: 5
  }
]

const pricingPlans = [
  {
    name: 'Discover',
    price: 'Free',
    description: 'Start your personal growth journey',
    features: [
      'Basic mood tracking',
      '3 AI coaching conversations/month',
      'Access to community',
      'Basic wellness insights'
    ],
    cta: 'Start Free',
    highlighted: false
  },
  {
    name: 'Explore',
    price: '$19.99',
    period: '/month',
    description: 'Unlock deeper self-discovery',
    features: [
      'Unlimited AI coaching',
      'All growth journey programs',
      'Advanced pattern insights',
      'Priority support',
      'Export your insights'
    ],
    cta: 'Start Exploring',
    highlighted: true
  },
  {
    name: 'Transform',
    price: '$39.99',
    period: '/month',
    description: 'Complete transformation support',
    features: [
      'Everything in Explore',
      'Human coaching sessions',
      'Advanced analytics',
      'Custom growth journeys',
      'API access',
      'Priority human support'
    ],
    cta: 'Transform Today',
    highlighted: false
  }
]

export default function HomePage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Discover the <span className="text-primary">Deeper You</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Where your story becomes your strength. Explore patterns, understand your journey, 
                and unlock personal growth through AI-powered conversations and self-discovery tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="text-lg px-8">
                    Start Your Journey
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="text-lg px-8">
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
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tools for Your Personal Growth Journey
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Comprehensive features designed to support your self-discovery and emotional wellness
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-primary" />
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
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Path to Self-Discovery
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A simple, supportive process designed for meaningful personal growth
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Create Your Profile', desc: 'Set your growth intentions and areas of focus' },
                { step: '2', title: 'Explore with AI Coach', desc: 'Have meaningful conversations about your experiences' },
                { step: '3', title: 'Discover Patterns', desc: 'Identify connections and insights in your story' },
                { step: '4', title: 'Apply & Grow', desc: 'Use insights to create positive change in your life' }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
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
        <section className="py-20 bg-white">
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
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
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
        <section className="py-20">
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
                <Card key={index} className={plan.highlighted ? 'border-primary shadow-lg' : ''}>
                  {plan.highlighted && (
                    <div className="bg-primary text-white text-center py-2 text-sm font-semibold">
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
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/signup" className="block">
                      <Button 
                        className="w-full" 
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
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Shield className="h-8 w-8 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Information</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              InnerRoot is a personal growth and wellness platform designed for self-discovery and emotional wellness. 
              This app is for educational purposes only and is not intended to diagnose, treat, cure, or prevent any 
              medical or mental health condition. The AI coach provides personal growth support, not therapy or medical advice. 
              If you're experiencing a mental health crisis, please contact your local emergency services or call 988.
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <Link href="/privacy" className="text-sm text-primary hover:underline">
                Privacy Policy
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/terms" className="text-sm text-primary hover:underline">
                Terms of Service
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/disclaimers" className="text-sm text-primary hover:underline">
                Full Disclaimers
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </AuthProvider>
  )
}