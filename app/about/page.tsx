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
  Users, 
  Target, 
  Award,
  ArrowRight,
  Star,
  Sparkles,
  CheckCircle
} from 'lucide-react'

export default function AboutPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 50])
  const y2 = useTransform(scrollY, [0, 300], [0, -50])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8])

  useEffect(() => {
    setMounted(true)
    // Simulate loading
    setTimeout(() => setLoading(false), 600)
  }, [])

  const values = [
    {
      icon: Heart,
      title: 'Empathy First',
      description: 'We understand that healing is a journey, not a destination. Our approach is rooted in compassion.',
      color: 'text-red-600 bg-red-50'
    },
    {
      icon: Shield,
      title: 'Privacy & Trust',
      description: 'Your story is safe with us. We maintain the highest standards of privacy and confidentiality.',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Brain,
      title: 'Evidence-Based',
      description: 'Our methods are grounded in psychological research and proven therapeutic techniques.',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: Users,
      title: 'Inclusive Support',
      description: 'Mental wellness is for everyone. We create an inclusive space for all backgrounds.',
      color: 'text-green-600 bg-green-50'
    }
  ]

  const milestones = [
    { number: '2025', label: 'Founded', description: 'Started with a mission to democratize mental wellness' },
    { number: '50K+', label: 'Users Helped', description: 'Lives transformed through AI coaching' },
    { number: '4.9/5', label: 'User Rating', description: 'Based on thousands of reviews' },
    { number: '24/7', label: 'Available', description: 'Support whenever you need it' }
  ]

  const team = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Chief Psychology Officer',
      bio: 'Clinical psychologist with 15+ years helping people understand behavioral patterns.',
      image: '/team-1.jpg'
    },
    {
      name: 'Marcus Thompson',
      role: 'Head of AI Development',
      bio: 'Former Google AI researcher specializing in empathetic AI systems.',
      image: '/team-2.jpg'
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Clinical Advisor',
      bio: 'Trauma specialist focused on root cause therapy and healing.',
      image: '/team-3.jpg'
    },
    {
      name: 'Alex Kim',
      role: 'Community Lead',
      bio: 'Mental health advocate building supportive communities for growth.',
      image: '/team-4.jpg'
    }
  ]

  return (
    <LoadingWrapper loading={loading} skeleton="page">
      <div className="relative">
      {/* Animated Background */}
      <motion.div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ opacity }}>
        <motion.div 
          className="orb orb-teal w-[600px] h-[600px] absolute -top-48 -right-48"
          style={{ y: y1 }}
        />
        <motion.div 
          className="orb orb-cyan w-[500px] h-[500px] absolute -bottom-32 -left-32"
          style={{ y: y2 }}
        />
      </motion.div>
      
      <Navbar />
      
      {/* Hero Section with Image */}
      <section 
        className="relative pt-24 pb-20 px-4 overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(20, 184, 166, 0.7), rgba(6, 182, 212, 0.7)), url(/about-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-6xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-balance drop-shadow-lg">
              Our Story of
              <span className="block text-yellow-300">Transformation</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow">
              We believe everyone deserves to understand themselves deeply and live authentically
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <button className="bg-white text-teal-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-teal-50 transition-all shadow-xl hover:shadow-2xl group">
                  Join Our Mission
                  <ArrowRight className="inline-block ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-all">
                  Get in Touch
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Milestones Section with Glassmorphic Effect */}
      <section className="py-16 px-4 relative" style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-4xl font-bold gradient-text mb-2">{milestone.number}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{milestone.label}</div>
                <div className="text-sm text-gray-600">{milestone.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent rounded-full"></div>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Born from Personal Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our founders understood firsthand the struggle of not understanding your own patterns
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">The Problem We Saw</h3>
                <p className="text-gray-700 leading-relaxed">
                  Millions of people struggle with patterns they don't understand. Whether it's relationship cycles, 
                  anxiety triggers, or self-sabotaging behaviors, we all have patterns that hold us back. Traditional 
                  therapy is invaluable but not always accessible or affordable.
                </p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Solution</h3>
                <p className="text-gray-700 leading-relaxed">
                  We created Beneathy to bridge this gap - offering 24/7 AI-powered coaching that helps you understand 
                  the 'why' behind your patterns, not just cope with symptoms. Our AI doesn't replace therapists; it 
                  empowers you with insights for self-discovery.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-w-4 aspect-h-5 bg-gradient-to-br from-teal-400 to-cyan-600">
                  <div className="flex items-center justify-center h-[500px]">
                    <Image 
                      src="/images/beneathy-logo.png" 
                      alt="Beneathy Logo" 
                      width={250} 
                      height={75} 
                      className="brightness-0 invert"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-gradient-to-br from-teal-200 to-cyan-200 rounded-full blur-3xl opacity-30 -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-teal-50/50 to-cyan-50/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${value.color} mb-4`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section 
        className="py-20 px-4 text-white relative"
        style={{
          backgroundImage: 'linear-gradient(to bottom right, rgba(20, 184, 166, 0.9), rgba(6, 182, 212, 0.9)), url(/healing-hands.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Life?
            </h2>
            <p className="text-xl mb-8 text-teal-100">
              Join thousands who are discovering their patterns and healing from within
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="bg-white text-teal-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-teal-50 transition-all shadow-xl hover:shadow-2xl">
                  Start Your Journey
                  <ArrowRight className="inline-block ml-2 h-5 w-5" />
                </button>
              </Link>
              <Link href="/features">
                <button className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all">
                  Explore Features
                </button>
              </Link>
            </div>
          </motion.div>
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
    </LoadingWrapper>
  )
}