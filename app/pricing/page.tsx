'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/navigation/footer'
import { PageSkeleton } from '@/components/ui/skeleton'
import { LoadingWrapper } from '@/components/ui/loading-wrapper'
import { 
  Check, 
  X, 
  Star, 
  Sparkles, 
  Shield, 
  Zap, 
  Award, 
  Brain,
  Heart,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  Gift
} from 'lucide-react'
import { APP_CONFIG } from '@/lib/config'
import Image from 'next/image'

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState(true)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 50])
  const y2 = useTransform(scrollY, [0, 300], [0, -50])
  const opacity = useTransform(scrollY, [0, 200], [0.3, 0.1])
  
  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 600)
  }, [])
  
  const plans = [
    {
      name: 'Starter',
      price: billingPeriod === 'monthly' ? '$19' : '$16',
      period: '/month',
      description: 'Begin your journey of self-discovery',
      features: [
        { text: 'AI Coaching Sessions', included: true },
        { text: 'Pattern Analysis', included: true },
        { text: 'Daily Check-ins', included: true },
        { text: 'Mood Tracking', included: true },
        { text: 'Basic Insights', included: true },
        { text: 'Community Access', included: true },
        { text: 'Priority Support', included: false },
        { text: 'Advanced Analytics', included: false }
      ],
      cta: 'Start Your Journey',
      ctaLink: '/signup?plan=starter',
      popular: false,
      color: 'from-cyan-500 to-teal-600'
    },
    {
      name: 'Growth',
      price: billingPeriod === 'monthly' ? '$39' : '$33',
      period: '/month',
      description: 'Accelerate your transformation',
      features: [
        { text: 'Everything in Starter', included: true },
        { text: 'Unlimited Sessions', included: true },
        { text: 'Root Cause Analysis', included: true },
        { text: 'Advanced Patterns', included: true },
        { text: 'Priority Support', included: true },
        { text: 'Progress Reports', included: true },
        { text: 'Crisis Tools', included: true },
        { text: 'Family Account', included: false }
      ],
      cta: 'Transform Now',
      ctaLink: '/signup?plan=growth',
      popular: true,
      badge: 'MOST POPULAR',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      name: 'Premium',
      price: billingPeriod === 'monthly' ? '$79' : '$67',
      period: '/month',
      description: 'Complete wellness ecosystem',
      features: [
        { text: 'Everything in Growth', included: true },
        { text: 'Human Coach Sessions', included: true },
        { text: 'Family Account (5 users)', included: true },
        { text: 'Personalized Plans', included: true },
        { text: 'Weekly Reviews', included: true },
        { text: 'VIP Support', included: true },
        { text: 'Custom Integrations', included: true },
        { text: 'Lifetime Access', included: true }
      ],
      cta: 'Get Premium',
      ctaLink: '/signup?plan=premium',
      popular: false,
      badge: 'BEST VALUE',
      color: 'from-purple-500 to-pink-600'
    }
  ]

  const faqs = [
    {
      q: 'Is there a free trial?',
      a: 'We offer a 7-day money-back guarantee instead of a free trial. This ensures you\'re committed to your transformation while still having a safety net.'
    },
    {
      q: 'Can I change plans anytime?',
      a: 'Yes! You can upgrade, downgrade, or cancel your plan anytime from your account settings. No contracts or hidden fees.'
    },
    {
      q: 'Is my data private?',
      a: 'Absolutely. We use bank-level encryption, are HIPAA compliant, and never sell your data. Your journey is completely confidential.'
    },
    {
      q: 'How is this different from therapy?',
      a: 'We complement but don\'t replace therapy. Our AI provides 24/7 availability, evidence-based techniques, and consistent support between therapy sessions.'
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
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-teal-50/80 backdrop-blur-sm border border-teal-200 rounded-full px-6 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-semibold text-teal-700">TRANSFORM YOUR LIFE TODAY</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Choose Your Path</span>
              <br />
              <span className="text-gray-900">To Healing</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Join thousands discovering their patterns and healing from within.
              <br />
              <span className="font-semibold text-gray-900">Start today. Cancel anytime.</span>
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`font-medium ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-14 h-7 bg-gray-200 rounded-full transition-colors duration-300"
              >
                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  billingPeriod === 'annual' ? 'translate-x-7 bg-teal-500' : ''
                }`} />
              </button>
              <span className={`font-medium ${billingPeriod === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
                Annual
                <span className="ml-2 inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  SAVE 15%
                </span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 relative" style={{
        background: 'rgba(243, 244, 246, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(229, 231, 235, 0.5)'
      }}>
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">50K+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">98%</div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600">Confidential</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={plan.popular ? 'md:scale-105 md:-mt-4' : ''}
              >
                <div className={`relative rounded-2xl overflow-hidden ${
                  plan.popular 
                    ? 'bg-white/90 backdrop-blur-sm border-2 border-teal-500 shadow-2xl' 
                    : 'bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl'
                } hover:shadow-2xl transition-all duration-300`}>
                  
                  {plan.badge && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-xs font-bold px-4 py-2 rounded-bl-xl">
                      {plan.badge}
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                      {index === 0 && <Brain className="h-6 w-6 text-white" />}
                      {index === 1 && <Zap className="h-6 w-6 text-white" />}
                      {index === 2 && <Award className="h-6 w-6 text-white" />}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600">{plan.period}</span>
                      </div>
                      {billingPeriod === 'annual' && (
                        <p className="text-green-600 text-sm mt-2">
                          Save {billingPeriod === 'annual' ? '15%' : '0%'} annually
                        </p>
                      )}
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          {feature.included ? (
                            <>
                              <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0" />
                              <span className="text-gray-700">{feature.text}</span>
                            </>
                          ) : (
                            <>
                              <X className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0" />
                              <span className="text-gray-400">{feature.text}</span>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                    
                    <Link href={plan.ctaLink}>
                      <button className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:shadow-lg transform hover:scale-105' 
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}>
                        {plan.cta}
                        <ArrowRight className="inline-block ml-2 h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-teal-50/50 to-cyan-50/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Beneathy?
            </h2>
            <p className="text-xl text-gray-600">
              More affordable, more accessible, always available
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Clock className="h-10 w-10 text-teal-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Access</h3>
              <p className="text-gray-600">No waiting lists. Start your journey immediately, 24/7 availability whenever you need support.</p>
            </motion.div>

            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Shield className="h-10 w-10 text-teal-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">100% Private</h3>
              <p className="text-gray-600">Your journey is completely confidential. Bank-level encryption and HIPAA compliant.</p>
            </motion.div>

            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Heart className="h-10 w-10 text-teal-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Proven Results</h3>
              <p className="text-gray-600">73% of users discover their root patterns within the first week of using Beneathy.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-start gap-3">
                  <ChevronDown className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-gray-600 ml-8">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 px-4 relative"
        style={{
          backgroundImage: 'linear-gradient(to bottom right, rgba(20, 184, 166, 0.85), rgba(6, 182, 212, 0.85)), url(/pricing-cta-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Life?
            </h2>
            <p className="text-xl text-teal-50 mb-8">
              Join thousands who are healing and growing with Beneathy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="bg-white text-teal-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-teal-50 transition-all shadow-xl hover:shadow-2xl">
                  Start Your Journey
                  <ArrowRight className="inline-block ml-2 h-5 w-5" />
                </button>
              </Link>
              <Link href="/coach">
                <button className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-all">
                  Try AI Coach First
                </button>
              </Link>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-teal-100">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">7-day money back</span>
              </div>
              <div className="flex items-center gap-2 text-teal-100">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2 text-teal-100">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">No hidden fees</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      </div>
    </LoadingWrapper>
  )
}