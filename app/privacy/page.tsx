'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/navigation/footer'
import { Shield, Lock, Eye, UserCheck, Database, Globe } from 'lucide-react'
import { APP_CONFIG } from '@/lib/config'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="orb orb-teal w-96 h-96 top-20 -right-20 opacity-30" />
        <div className="orb orb-cyan w-80 h-80 bottom-10 left-10 opacity-30" />
      </div>
      
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold gradient-text mb-6">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: January 2025</p>
        </motion.div>

        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-teal-500 mr-2" />
                <CardTitle>Our Commitment to Privacy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p className="text-gray-600">
                At {APP_CONFIG.name}, we understand that your mental health journey is deeply personal. 
                We are committed to protecting your privacy and ensuring your data remains secure and confidential.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex items-center">
                <Database className="h-5 w-5 text-teal-500 mr-2" />
                <CardTitle>Information We Collect</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-600">
              <h3 className="font-semibold text-gray-900">Personal Information</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Name and email address when you create an account</li>
                <li>Payment information for paid subscriptions (processed securely via Stripe)</li>
                <li>Optional profile information you choose to provide</li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 mt-4">Usage Data</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Conversation history with our AI coach</li>
                <li>Wellness tracking entries</li>
                <li>Journey progress and completed exercises</li>
                <li>App usage patterns and preferences</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-teal-500 mr-2" />
                <CardTitle>How We Protect Your Data</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-600">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>End-to-end encryption for all sensitive data</li>
                <li>HIPAA-compliant infrastructure and practices</li>
                <li>Regular security audits and penetration testing</li>
                <li>Strict access controls for our team members</li>
                <li>Secure data centers with 24/7 monitoring</li>
                <li>Regular backups with encryption at rest</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex items-center">
                <Eye className="h-5 w-5 text-teal-500 mr-2" />
                <CardTitle>How We Use Your Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-600">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>To provide personalized AI coaching and insights</li>
                <li>To track your wellness journey and progress</li>
                <li>To improve our services and develop new features</li>
                <li>To send important account and service updates</li>
                <li>To provide customer support when requested</li>
              </ul>
              <p className="mt-4 font-semibold text-gray-900">We Never:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Sell your personal data to third parties</li>
                <li>Share your conversations without explicit consent</li>
                <li>Use your data for advertising purposes</li>
                <li>Allow unauthorized access to your information</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex items-center">
                <UserCheck className="h-5 w-5 text-teal-500 mr-2" />
                <CardTitle>Your Rights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-600">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Access all data we have about you</li>
                <li>Export your data in common formats</li>
                <li>Request correction of inaccurate information</li>
                <li>Delete your account and all associated data</li>
                <li>Opt-out of non-essential communications</li>
                <li>Restrict processing of your data</li>
                <li>Lodge a complaint with supervisory authorities</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-teal-500 mr-2" />
                <CardTitle>Contact Us</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-600">
              <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
              <ul className="mt-3 space-y-1">
                <li>Email: privacy@beneathy.com</li>
                <li>Phone: 1-800-BENEATHY</li>
                <li>Mail: Beneathy Privacy Team, 123 Wellness Street, San Francisco, CA 94105</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  )
}