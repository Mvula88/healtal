'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/navigation/footer'
import { 
  Brain, 
  Heart, 
  Compass, 
  Shield,
  Sparkles,
  Target,
  Lightbulb,
  Users,
  LineChart,
  Lock,
  Zap,
  CheckCircle
} from 'lucide-react'
import { APP_CONFIG, FEATURES } from '@/lib/config'
import { LoadingWrapper, useLoadingState } from '@/components/ui/loading-wrapper'
import { CardSkeleton } from '@/components/ui/skeleton'

const detailedFeatures = [
  {
    category: 'Pattern Discovery',
    icon: Brain,
    color: 'bg-teal-500',
    description: 'Uncover the root causes behind your behaviors',
    features: [
      'AI-powered pattern analysis',
      'Root cause identification',
      'Behavioral mapping',
      'Trigger recognition',
      'Historical pattern tracking'
    ]
  },
  {
    category: 'Personal Growth',
    icon: Target,
    color: 'bg-cyan-500',
    description: 'Transform insights into lasting change',
    features: [
      'Personalized growth plans',
      'Goal setting and tracking',
      'Milestone celebrations',
      'Progress visualization',
      'Habit formation tools'
    ]
  },
  {
    category: 'AI Coaching',
    icon: Sparkles,
    color: 'bg-teal-600',
    description: 'Get 24/7 support from our specialized AI coach',
    features: [
      'Conversational guidance',
      'Voice mode sessions',
      'Personalized insights',
      'Crisis detection',
      'Continuous learning'
    ]
  },
  {
    category: 'Wellness Tracking',
    icon: Heart,
    color: 'bg-cyan-600',
    description: 'Monitor your emotional and mental wellbeing',
    features: [
      'Daily mood tracking',
      'Energy level monitoring',
      'Wellness trends',
      'Custom metrics',
      'Health insights'
    ]
  },
  {
    category: 'Growth Journeys',
    icon: Compass,
    color: 'bg-teal-500',
    description: 'Structured pathways for transformation',
    features: [
      '30+ guided programs',
      'Step-by-step guidance',
      'Interactive exercises',
      'Progress tracking',
      'Certificate completion'
    ]
  },
  {
    category: 'Privacy & Security',
    icon: Shield,
    color: 'bg-cyan-500',
    description: 'Your data is protected and confidential',
    features: [
      'End-to-end encryption',
      'HIPAA compliant',
      'Data ownership',
      'Export capabilities',
      'Anonymous options'
    ]
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="orb orb-teal w-96 h-96 top-20 -right-20 opacity-30" />
        <div className="orb orb-cyan w-80 h-80 bottom-10 left-10 opacity-30" />
      </div>
      
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Features That Transform Lives
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every feature in {APP_CONFIG.name} is designed to help you understand yourself better 
            and create lasting positive change in your life.
          </p>
        </motion.div>

        {/* Feature Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {detailedFeatures.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="glass-card border-0 h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4 glow`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{category.category}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* CTA Section */}
        <motion.div 
          className="text-center py-12 px-8 glass-card border-0 rounded-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Transform?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands who are discovering their patterns and creating meaningful change.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gradient-wellness text-white">
              Start Your Free Journey
              <Zap className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  )
}