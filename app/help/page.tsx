'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/navigation/footer'
import { Search, HelpCircle, MessageCircle, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react'
import { APP_CONFIG } from '@/lib/config'

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'What is Beneathy?',
        a: 'Beneathy is an AI-powered personal growth coach that helps you discover the root causes behind your patterns and behaviors. We use evidence-based techniques to help you understand yourself better and create lasting positive change.'
      },
      {
        q: 'How do I get started?',
        a: 'Simply sign up for a free account and complete our brief onboarding questionnaire. Our AI coach will then guide you through your first pattern discovery session.'
      },
      {
        q: 'Is Beneathy a replacement for therapy?',
        a: 'No, Beneathy is not a replacement for professional therapy. We are a personal growth tool that can complement therapy or help you prepare for it. If you\'re in crisis, please contact emergency services or call 988.'
      }
    ]
  },
  {
    category: 'Features & Usage',
    questions: [
      {
        q: 'What features are included in the free plan?',
        a: 'The free plan includes basic pattern discovery, 3 AI coaching sessions per month, daily wellness tracking, community access, and mobile app access.'
      },
      {
        q: 'How does voice mode work?',
        a: 'Voice mode allows you to speak naturally to our AI coach instead of typing. Available in paid plans, it creates a more conversational experience and includes voice responses.'
      },
      {
        q: 'Can I export my data?',
        a: 'Yes! Paid plan users can export all their data including conversation history, insights, and wellness tracking data in various formats.'
      }
    ]
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        q: 'Is my data secure?',
        a: 'Yes, we use end-to-end encryption and follow HIPAA compliance standards. Your data is never shared with third parties without your explicit consent.'
      },
      {
        q: 'Can I delete my account and data?',
        a: 'Yes, you can delete your account and all associated data at any time from your settings page. This action is permanent and cannot be undone.'
      },
      {
        q: 'Who can see my conversations?',
        a: 'Only you can see your conversations. Our AI processes them securely, but no human team members have access to your personal conversations.'
      }
    ]
  },
  {
    category: 'Billing & Subscriptions',
    questions: [
      {
        q: 'Can I cancel my subscription anytime?',
        a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your current billing period.'
      },
      {
        q: 'Do you offer refunds?',
        a: 'We offer a 7-day money-back guarantee for all paid plans. If you\'re not satisfied, contact support within 7 days of purchase for a full refund.'
      },
      {
        q: 'Can I change my plan?',
        a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.'
      }
    ]
  }
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Getting Started'])

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="orb orb-teal w-96 h-96 top-20 -right-20 opacity-30" />
        <div className="orb orb-cyan w-80 h-80 bottom-10 left-10 opacity-30" />
      </div>
      
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            How Can We Help?
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to common questions or get in touch with our support team.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div 
          className="grid md:grid-cols-3 gap-4 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="glass-card border-0 card-hover cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 text-teal-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Live Chat</h3>
              <p className="text-sm text-gray-600">Chat with our support team</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-0 card-hover cursor-pointer">
            <CardContent className="p-6 text-center">
              <Mail className="h-8 w-8 text-teal-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Email Support</h3>
              <p className="text-sm text-gray-600">support@beneathy.com</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-0 card-hover cursor-pointer">
            <CardContent className="p-6 text-center">
              <HelpCircle className="h-8 w-8 text-teal-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Knowledge Base</h3>
              <p className="text-sm text-gray-600">Browse help articles</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          {faqs.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="glass-card border-0 mb-4">
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleCategory(category.category)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                  {expandedCategories.includes(category.category) ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </CardHeader>
              
              {expandedCategories.includes(category.category) && (
                <CardContent className="space-y-4">
                  {category.questions.map((item, index) => (
                    <div key={index} className="border-l-2 border-teal-200 pl-4">
                      <h4 className="font-medium mb-2">{item.q}</h4>
                      <p className="text-sm text-gray-600">{item.a}</p>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </motion.div>

        {/* Contact Section */}
        <motion.div 
          className="mt-12 text-center py-12 px-8 glass-card border-0 rounded-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="gradient-wellness text-white">
                Contact Support
              </Button>
            </Link>
            <Button variant="outline" className="border-teal-200 text-teal-600 hover:bg-teal-50">
              Schedule a Call
            </Button>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  )
}