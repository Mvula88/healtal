'use client'

import Link from 'next/link'
import { Navbar } from '@/components/navigation/navbar'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

export default function DisclaimersPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-20">
        <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Disclaimers</h1>
        <p className="text-gray-600 mb-8">Last updated: January 1, 2025</p>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Important Notice</h3>
              <p className="text-amber-800">
                Beneathy is not a replacement for professional medical or mental health care. If you are experiencing a mental health emergency, please contact emergency services immediately.
              </p>
            </div>
          </div>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Medical Disclaimer</h2>
            <p className="text-gray-700 mb-4">
              The information provided by Beneathy's AI coaching service is for general informational and educational purposes only. It is not intended as, and should not be considered a substitute for, professional medical advice, diagnosis, or treatment.
            </p>
            <p className="text-gray-700 mb-4">
              Never disregard professional medical advice or delay in seeking it because of something you have read or received through our service. Always consult with a qualified healthcare provider before making any changes to your mental health treatment plan.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">AI Coaching Limitations</h2>
            <p className="text-gray-700 mb-4">
              Our AI coaching system uses advanced technology to provide support and insights, but it has limitations:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>It cannot diagnose mental health conditions</li>
              <li>It cannot prescribe medications</li>
              <li>It cannot provide emergency crisis intervention</li>
              <li>It may not fully understand complex or nuanced situations</li>
              <li>Its responses are based on patterns in data and may not be suitable for every individual</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Therapeutic Relationship</h2>
            <p className="text-gray-700 mb-4">
              Use of Beneathy's AI coaching service does not establish a therapist-patient or doctor-patient relationship. The AI coach is not a licensed mental health professional and cannot replace the care of a qualified therapist, counselor, or psychiatrist.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Emergency Situations</h2>
            <p className="text-gray-700 mb-4">
              If you are experiencing a mental health emergency, having thoughts of self-harm or suicide, or are in immediate danger, please:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Call 911 or your local emergency number</li>
              <li>Call the National Suicide Prevention Lifeline at 988</li>
              <li>Text "HELLO" to 741741 (Crisis Text Line)</li>
              <li>Go to your nearest emergency room</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accuracy of Information</h2>
            <p className="text-gray-700 mb-4">
              While we strive to provide accurate and helpful information, Beneathy makes no representations or warranties about the completeness, accuracy, reliability, suitability, or availability of the information provided by our AI coaching service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Individual Results</h2>
            <p className="text-gray-700 mb-4">
              Individual results from using our service may vary. We do not guarantee any specific outcomes or results from using Beneathy's AI coaching service. Success depends on many factors including your personal commitment and individual circumstances.
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