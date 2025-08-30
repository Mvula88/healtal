'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/navigation/footer'
import { BookOpen, FileText, Video, Headphones, Download, ExternalLink } from 'lucide-react'
import { APP_CONFIG } from '@/lib/config'

const resources = [
  {
    category: 'Educational Guides',
    icon: BookOpen,
    items: [
      { title: 'Understanding Behavioral Patterns', type: 'PDF Guide', size: '2.3 MB' },
      { title: 'Root Cause Analysis Workbook', type: 'Interactive PDF', size: '3.1 MB' },
      { title: 'Breaking Negative Cycles', type: 'E-Book', size: '1.8 MB' },
      { title: 'Emotional Intelligence Handbook', type: 'PDF Guide', size: '2.5 MB' }
    ]
  },
  {
    category: 'Video Content',
    icon: Video,
    items: [
      { title: 'Introduction to Pattern Discovery', type: 'Video', duration: '15 min' },
      { title: 'Guided Self-Reflection Sessions', type: 'Video Series', duration: '8 episodes' },
      { title: 'Understanding Your Triggers', type: 'Workshop', duration: '45 min' },
      { title: 'Building Healthy Habits', type: 'Video Course', duration: '2 hours' }
    ]
  },
  {
    category: 'Audio Resources',
    icon: Headphones,
    items: [
      { title: 'Guided Meditations for Clarity', type: 'Audio', duration: '20 min' },
      { title: 'Sleep Stories for Healing', type: 'Audio Series', duration: '10 episodes' },
      { title: 'Daily Affirmations', type: 'Audio Collection', duration: '30 tracks' },
      { title: 'Breathing Exercises', type: 'Audio Guide', duration: '15 min' }
    ]
  },
  {
    category: 'Worksheets & Tools',
    icon: FileText,
    items: [
      { title: 'Pattern Tracking Template', type: 'Worksheet', format: 'PDF' },
      { title: 'Mood Journal Template', type: 'Printable', format: 'PDF' },
      { title: 'Goal Setting Planner', type: 'Template', format: 'Excel' },
      { title: 'Trigger Identification Chart', type: 'Worksheet', format: 'PDF' }
    ]
  }
]

export default function ResourcesPage() {
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
            Resources for Your Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Free tools, guides, and content to support your personal growth and mental wellness.
          </p>
        </motion.div>

        {/* Resource Categories */}
        {resources.map((category, categoryIndex) => {
          const Icon = category.icon
          return (
            <motion.div 
              key={categoryIndex}
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 gradient-wellness rounded-lg flex items-center justify-center mr-3">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold">{category.category}</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.items.map((item, index) => (
                  <Card key={index} className="glass-card border-0 card-hover cursor-pointer">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {item.type} {'size' in item && item.size && `• ${item.size}`} {'duration' in item && item.duration && `• ${item.duration}`} {'format' in item && item.format && `• ${item.format}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button size="sm" variant="outline" className="w-full border-teal-200 text-teal-600 hover:bg-teal-50">
                        <Download className="h-4 w-4 mr-2" />
                        Access
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )
        })}

        {/* External Resources */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Additional Support Resources</CardTitle>
              <CardDescription>Trusted external resources for mental health support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'National Suicide Prevention Lifeline', number: '988', url: 'https://988lifeline.org' },
                  { name: 'Crisis Text Line', number: 'Text HOME to 741741', url: 'https://www.crisistextline.org' },
                  { name: 'SAMHSA National Helpline', number: '1-800-662-4357', url: 'https://www.samhsa.gov' },
                  { name: 'NAMI HelpLine', number: '1-800-950-6264', url: 'https://www.nami.org' }
                ].map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/50">
                    <div>
                      <p className="font-medium text-sm">{resource.name}</p>
                      <p className="text-xs text-gray-600">{resource.number}</p>
                    </div>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="text-teal-600 hover:text-teal-700">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  )
}