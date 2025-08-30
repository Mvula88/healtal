'use client'

import Link from 'next/link'
import { Navbar } from '@/components/navigation/navbar'
import { ArrowLeft, Cookie } from 'lucide-react'

export default function CookiesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-20">
        <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex items-center mb-4">
          <Cookie className="h-8 w-8 text-teal-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">Cookie Policy</h1>
        </div>
        <p className="text-gray-600 mb-8">Last updated: January 1, 2025</p>
        
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies</h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Cookies</h2>
            <p className="text-gray-700 mb-4">Beneathy uses cookies for the following purposes:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Authentication:</strong> To keep you signed in during your session</li>
              <li><strong>Preferences:</strong> To remember your settings and preferences</li>
              <li><strong>Analytics:</strong> To understand how you use our service and improve it</li>
              <li><strong>Security:</strong> To help protect your account and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of Cookies We Use</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">1. Strictly Necessary Cookies</h3>
              <p className="text-gray-700">
                These cookies are essential for the website to function. They enable basic functions like page navigation, secure areas access, and maintaining your session. The website cannot function properly without these cookies.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">2. Performance Cookies</h3>
              <p className="text-gray-700">
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve how our website works.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">3. Functionality Cookies</h3>
              <p className="text-gray-700">
                These cookies allow the website to remember choices you make (such as your username, language, or region) and provide enhanced, more personalized features.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-700 mb-4">
              We may use third-party services that set their own cookies, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Analytics providers (e.g., Google Analytics)</li>
              <li>Payment processors</li>
              <li>Customer support tools</li>
            </ul>
            <p className="text-gray-700">
              These third parties may use cookies to collect information about your online activities across websites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
            <p className="text-gray-700 mb-4">
              You can control and manage cookies in various ways:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies through their settings</li>
              <li><strong>Cookie Preferences:</strong> You can adjust your cookie preferences when you first visit our site</li>
              <li><strong>Opt-Out Links:</strong> Some third-party providers offer opt-out mechanisms</li>
            </ul>
            <p className="text-gray-700">
              Please note that disabling certain cookies may impact the functionality of our website and limit your ability to use some features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. We will notify you of any material changes by posting the new policy on this page with an updated revision date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about our use of cookies, please contact us at:
            </p>
            <p className="text-gray-700">
              Email: privacy@beneathy.com<br />
              Address: Beneathy, Privacy Department
            </p>
          </section>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          © 2025 Beneathy. All rights reserved.
        </div>
      </div>
    </div>
  )
}