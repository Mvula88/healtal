'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navigation/navbar'
import { PageSkeleton } from '@/components/ui/skeleton'
import { LoadingWrapper } from '@/components/ui/loading-wrapper'
import { 
  Brain, 
  Heart, 
  Shield, 
  ChevronRight,
  Check,
  Star,
  MessageCircle,
  Calendar,
  Clock,
  Award,
  Users,
  Sparkles,
  ArrowRight,
  Phone,
  Video,
  FileText
} from 'lucide-react'

export default function HomePage() {
  const [activeService, setActiveService] = useState('individual')
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [animatedUserCount, setAnimatedUserCount] = useState(0)
  const [animatedSatisfaction, setAnimatedSatisfaction] = useState(0)
  const [animatedConfidential, setAnimatedConfidential] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 50])
  const y2 = useTransform(scrollY, [0, 300], [0, -50])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8])

  useEffect(() => {
    setMounted(true)
    
    const fetchUserCount = async () => {
      try {
        const response = await fetch('/api/stats/users')
        if (response.ok) {
          const data = await response.json()
          setUserCount(data.count || 0)
        }
      } catch (error) {
        console.error('Failed to fetch user count:', error)
        setUserCount(0)
      }
    }
    
    // Initial load
    fetchUserCount()
    
    // Refresh stats periodically
    const interval = setInterval(() => {
      fetchUserCount()
    }, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [])

  // Counting animation effect
  useEffect(() => {
    if (!hasAnimated) return
    
    // Animate user count
    const userTarget = userCount
    const userDuration = 2000
    const userSteps = 60
    const userIncrement = userTarget / userSteps
    let userCurrent = 0
    
    const userTimer = setInterval(() => {
      userCurrent += userIncrement
      if (userCurrent >= userTarget) {
        setAnimatedUserCount(userTarget)
        clearInterval(userTimer)
      } else {
        setAnimatedUserCount(Math.floor(userCurrent))
      }
    }, userDuration / userSteps)
    
    // Animate satisfaction percentage
    const satisfactionTarget = 98
    const satisfactionDuration = 2000
    const satisfactionSteps = 50
    const satisfactionIncrement = satisfactionTarget / satisfactionSteps
    let satisfactionCurrent = 0
    
    const satisfactionTimer = setInterval(() => {
      satisfactionCurrent += satisfactionIncrement
      if (satisfactionCurrent >= satisfactionTarget) {
        setAnimatedSatisfaction(satisfactionTarget)
        clearInterval(satisfactionTimer)
      } else {
        setAnimatedSatisfaction(Math.floor(satisfactionCurrent))
      }
    }, satisfactionDuration / satisfactionSteps)
    
    // Animate confidential percentage
    const confidentialTarget = 100
    const confidentialDuration = 2000
    const confidentialSteps = 50
    const confidentialIncrement = confidentialTarget / confidentialSteps
    let confidentialCurrent = 0
    
    const confidentialTimer = setInterval(() => {
      confidentialCurrent += confidentialIncrement
      if (confidentialCurrent >= confidentialTarget) {
        setAnimatedConfidential(confidentialTarget)
        clearInterval(confidentialTimer)
      } else {
        setAnimatedConfidential(Math.floor(confidentialCurrent))
      }
    }, confidentialDuration / confidentialSteps)
    
    return () => {
      clearInterval(userTimer)
      clearInterval(satisfactionTimer)
      clearInterval(confidentialTimer)
    }
  }, [hasAnimated, userCount])

  // Update animated user count when real count changes
  useEffect(() => {
    if (hasAnimated && userCount > animatedUserCount) {
      const difference = userCount - animatedUserCount
      const duration = 1000
      const steps = 30
      const increment = difference / steps
      let current = animatedUserCount
      
      const timer = setInterval(() => {
        current += increment
        if (current >= userCount) {
          setAnimatedUserCount(userCount)
          clearInterval(timer)
        } else {
          setAnimatedUserCount(Math.floor(current))
        }
      }, duration / steps)
      
      return () => clearInterval(timer)
    }
  }, [userCount, animatedUserCount, hasAnimated])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            // Trigger counting animation when stats section is visible
            if (entry.target.classList.contains('stats-section') && !hasAnimated) {
              setHasAnimated(true)
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('.scroll-fade-in, .stats-section')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [hasAnimated])

  const stats = [
    { number: hasAnimated && userCount > 0 ? `${animatedUserCount.toLocaleString()}+` : '-', label: 'Active Users', icon: Users, isAnimated: true },
    { number: hasAnimated ? `${animatedSatisfaction}%` : '-', label: 'Satisfaction Rate', icon: Star, isAnimated: true },
    { number: '24/7', label: 'AI Support', icon: Clock, isAnimated: false },
    { number: hasAnimated ? `${animatedConfidential}%` : '-', label: 'Confidential', icon: Shield, isAnimated: true }
  ]

  const services = [
    { id: 'individual', label: 'For myself', description: 'Personal growth and self-discovery' },
    { id: 'couples', label: 'For couples', description: 'Strengthen your relationship' },
    { id: 'teen', label: 'For my teen', description: 'Support for young adults' }
  ]

  const features = [
    {
      icon: MessageCircle,
      title: 'Chat with AI Coach',
      description: 'Get instant support through secure messaging with our advanced AI coaching system',
      color: 'text-teal-600 bg-teal-50'
    },
    {
      icon: Brain,
      title: 'Root Cause Analysis',
      description: 'Discover the deeper patterns and origins behind your thoughts and behaviors',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Calendar,
      title: 'Track Your Progress',
      description: 'Monitor your journey with insights, milestones, and personalized metrics',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: Video,
      title: 'Professional Referrals',
      description: 'Connect with licensed therapists when you need additional support',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: FileText,
      title: 'Personalized Plans',
      description: 'Receive tailored strategies based on your unique situation and goals',
      color: 'text-orange-600 bg-orange-50'
    },
    {
      icon: Award,
      title: 'Evidence-Based',
      description: 'Built on proven psychological principles and therapeutic techniques',
      color: 'text-indigo-600 bg-indigo-50'
    }
  ]

  const testimonials = [
    {
      content: "I was skeptical about AI coaching, but Beneathy helped me understand patterns I'd been repeating for years. It's like having a therapist available 24/7.",
      author: "Marcus Thompson",
      role: "Small Business Owner",
      rating: 5,
      image: '/testimonial-1.jpg'
    },
    {
      content: "The root cause analysis was eye-opening. I finally understood why I kept sabotaging my relationships. Now I'm making real progress.",
      author: "Priya Natarajan",
      role: "Financial Analyst",
      rating: 5,
      image: '/testimonial-2.jpg'
    },
    {
      content: "As someone with social anxiety, starting with an AI coach was less intimidating than traditional therapy. It prepared me to eventually see a human therapist.",
      author: "Jordan Okafor",
      role: "Graphic Designer",
      rating: 5,
      image: '/testimonial-3.jpg'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Sign up in seconds',
      description: 'Create your account with just an email. No lengthy forms or commitments.',
      icon: Sparkles
    },
    {
      number: '02',
      title: 'Share your story',
      description: 'Tell our AI coach what brings you here in a safe, judgment-free space.',
      icon: MessageCircle
    },
    {
      number: '03',
      title: 'Get personalized insights',
      description: 'Receive deep insights about your patterns and actionable strategies.',
      icon: Brain
    },
    {
      number: '04',
      title: 'Transform your life',
      description: 'Apply your insights with ongoing support to create lasting change.',
      icon: Heart
    }
  ]

  return (
    <div className="relative">
      {/* Subtle animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="orb orb-teal w-[600px] h-[600px] absolute -top-48 -right-48"
        />
        <div 
          className="orb orb-cyan w-[500px] h-[500px] absolute -bottom-32 -left-32"
        />
      </div>
      
      <Navbar />
      
      {/* Hero Section - BetterHelp style */}
      <section 
          className="relative pt-24 pb-20 px-4 overflow-hidden"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(20, 184, 166, 0.5) 0%, rgba(6, 182, 212, 0.5) 100%), url(/hero-nature.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
        
          <div className="max-w-6xl mx-auto relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-balance drop-shadow-lg">
              You deserve to be
              <span className="block text-yellow-300">understood</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow">
              Professional AI coaching that helps you discover the root causes of your patterns—available 24/7
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <button className="bg-white text-teal-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-teal-50 transition-all shadow-xl hover:shadow-2xl group">
                  Start Today
                  <ArrowRight className="inline-block ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <Link href="/about">
                <button className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-all">
                  How it works
                </button>
              </Link>
            </div>
          </div>
          </div>
        </section>

      {/* Trust Indicators / Stats */}
        <section className="py-16 px-4 relative stats-section" style={{
          background: 'rgba(243, 244, 246, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(229, 231, 235, 0.5)'
        }}>
          <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="trust-badge group"
                >
                  <Icon className="h-8 w-8 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
                  <div className={`text-3xl font-bold text-gray-900 ${stat.isAnimated ? 'transition-all duration-100' : ''}`}>
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 bg-white/50 backdrop-blur-sm scroll-fade-in">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your journey to understanding starts here
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four simple steps to deeper self-awareness and lasting change
            </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={index}
                  className="relative"
                >
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-[2px] bg-gradient-to-r from-teal-200 to-transparent" />
                  )}
                  
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white mb-4 shadow-lg">
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="text-sm text-teal-600 font-semibold mb-2">{step.number}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>
              )
            })}
            </div>
          </div>
        </section>

          {/* Features Grid */}
        <section className="py-20 px-4 scroll-fade-in">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to heal and grow
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive support designed for your unique journey
            </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="feature-card group"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
            </div>
          </div>
        </section>

          {/* Testimonials */}
        <section className="py-20 px-4 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 scroll-fade-in">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Join thousands finding clarity
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from people who discovered their patterns
            </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="testimonial-card"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {testimonial.author[0]}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </section>

          {/* Pricing */}
        <section className="py-20 px-4 scroll-fade-in">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Invest in your mental wellness
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Affordable plans that fit your journey
            </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="pricing-card">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <div className="text-5xl font-bold text-gray-900 mb-1">$19</div>
                <p className="text-gray-600">Begin your healing journey</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  '10 AI coaching sessions/month',
                  'Mood tracking & journaling',
                  'Basic insights & patterns',
                  'Guided meditations',
                  'Community forum access'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <button className="w-full py-3 px-6 rounded-full border-2 border-gray-300 text-gray-700 font-semibold hover:border-teal-500 hover:bg-teal-50 transition-all">
                  Start now
                </button>
              </Link>
            </div>

            {/* Growth Plan */}
            <div className="pricing-card popular relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Growth</h3>
                <div className="text-5xl font-bold gradient-text mb-1">$39</div>
                <p className="text-gray-600">per month</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Unlimited AI coaching 24/7',
                  'Deep pattern & trigger analysis',
                  'Personalized action plans',
                  'Crisis support protocols',
                  'Weekly progress reports',
                  'Voice message support'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <button className="w-full btn-primary">
                  Get started
                </button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="pricing-card">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="text-5xl font-bold text-gray-900 mb-1">$79</div>
                <p className="text-gray-600">per month</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Everything in Growth',
                  'Licensed therapist matching',
                  '2 video therapy sessions/month',
                  'Couples & family tools',
                  'Advanced trauma support',
                  'Custom wellness programs',
                  'Priority 1-on-1 support'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <button className="w-full py-3 px-6 rounded-full border-2 border-gray-300 text-gray-700 font-semibold hover:border-teal-500 hover:bg-teal-50 transition-all">
                  Get started
                </button>
              </Link>
            </div>
            </div>

            <p className="text-center text-gray-600 mt-8">
            All plans include a 7-day free trial. Cancel anytime.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 text-white scroll-fade-in relative" style={{
          backgroundImage: 'linear-gradient(to bottom right, rgba(20, 184, 166, 0.65), rgba(6, 182, 212, 0.65)), url(/healing-hands.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="max-w-4xl mx-auto text-center">
            <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Take the first step toward understanding yourself
            </h2>
            <p className="text-xl mb-8 text-teal-100">
              Join thousands who are discovering their patterns and transforming their lives
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="bg-white text-teal-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-teal-50 transition-all shadow-xl hover:shadow-2xl">
                  Start your free trial
                  <ArrowRight className="inline-block ml-2 h-5 w-5" />
                </button>
              </Link>
              <Link href="/get-help">
                <button className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all">
                  Crisis support
                </button>
              </Link>
            </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Brand Column */}
              <div>
              <div className="mb-4">
                <Image 
                  src="/images/beneathy-logo.png" 
                  alt="Beneathy Logo" 
                  width={120} 
                  height={32} 
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-sm text-gray-600">
                AI-powered mental wellness platform helping you understand your patterns and heal from within.
              </p>
              </div>

              {/* Product Column */}
              <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                    Resources
                  </Link>
                </li>
              </ul>
              </div>

              {/* Support Column */}
              <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/get-help" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                    Crisis Resources
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                    Community
                  </Link>
                </li>
              </ul>
              </div>

              {/* Legal Column */}
              <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/disclaimers" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                    Disclaimers
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-600">
                © 2025 Beneathy. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-4 md:mt-0 max-w-2xl text-center md:text-right">
                Beneathy is an AI coach for educational purposes only. Not a substitute for professional therapy.
              </p>
              </div>
            </div>
          </div>
        </footer>
    </div>
  )
}