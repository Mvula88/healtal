'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { 
  Brain, 
  AlertCircle,
  ArrowRight,
  Shield,
  Heart,
  Sparkles,
  Check
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setError('')
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google sign in')
    }
  }

  const benefits = [
    'Access your personalized AI coach',
    'Track your emotional patterns',
    'Get insights into your behaviors',
    '100% private and secure'
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="orb orb-teal w-[500px] h-[500px] -top-32 -right-32"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div 
          className="orb orb-cyan w-[400px] h-[400px] -bottom-20 -left-20"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative" style={{
          backgroundImage: 'linear-gradient(rgba(20, 184, 166, 0.3), rgba(6, 182, 212, 0.3)), url(/login.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image 
                src="/images/beneathy-logo.png" 
                alt="Beneathy Logo" 
                width={150} 
                height={40} 
                className="h-10 w-auto"
              />
            </Link>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome back to your
                <span className="block gradient-text">journey of understanding</span>
              </h2>
              <p className="text-lg text-gray-600">
                Continue discovering the patterns that shape your life with AI-powered insights.
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center"
                >
                  <Check className="h-5 w-5 text-teal-500 mr-3" />
                  <span className="text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-teal-600" />
                <div className="ml-3">
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-600">Secure</div>
                </div>
              </div>
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-teal-600" />
                <div className="ml-3">
                  <div className="text-2xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
              <div className="flex items-center">
                <Sparkles className="h-8 w-8 text-teal-600" />
                <div className="ml-3">
                  <div className="text-2xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Users</div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="text-sm text-gray-600">
            © 2025 Beneathy. All rights reserved.
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-flex items-center justify-center">
                <Image 
                  src="/images/beneathy-logo.png" 
                  alt="Beneathy Logo" 
                  width={150} 
                  height={40} 
                  className="h-10 w-auto"
                />
              </Link>
              <h1 className="mt-4 text-3xl font-bold text-gray-900">Welcome back</h1>
              <p className="mt-2 text-gray-600">Sign in to continue your journey</p>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mb-8">
                <div className="flex justify-center mb-6 lg:hidden">
                  <Image 
                    src="/images/beneathy-logo.png" 
                    alt="Beneathy Logo" 
                    width={120} 
                    height={32} 
                    className="h-8 w-auto"
                  />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 text-center lg:text-left">Sign in</h1>
                <p className="mt-2 text-gray-600 text-center lg:text-left">Welcome back! Please enter your details.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start"
                  >
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>

                  <Link href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary group"
                >
                  {loading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="inline-block ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20">
                      <path
                        fill="#4285F4"
                        d="M19.8 10.2c0-.7-.1-1.4-.2-2H10v3.8h5.5c-.2 1.2-.9 2.3-1.9 3v2.5h3.1c1.8-1.7 2.9-4.1 2.9-7.3z"
                      />
                      <path
                        fill="#34A853"
                        d="M10 20c2.6 0 4.8-.9 6.4-2.3l-3.1-2.5c-.9.6-2 .9-3.3.9-2.5 0-4.7-1.7-5.4-4H1.3v2.6C2.9 17.8 6.2 20 10 20z"
                      />
                      <path
                        fill="#FBBC04"
                        d="M4.6 12.1c-.2-.6-.3-1.3-.3-2.1s.1-1.4.3-2.1V5.3H1.3C.5 6.9 0 8.4 0 10s.5 3.1 1.3 4.7l3.3-2.6z"
                      />
                      <path
                        fill="#EA4335"
                        d="M10 4c1.4 0 2.7.5 3.6 1.5L16.4 2.7C14.8 1.2 12.6 0 10 0 6.2 0 2.9 2.2 1.3 5.3l3.3 2.6C5.3 5.7 7.5 4 10 4z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <Link href="/signup" className="text-teal-600 hover:text-teal-700 font-semibold">
                  Start your journey
                </Link>
              </div>

              <p className="mt-6 text-center text-xs text-gray-500">
                By signing in, you agree to our{' '}
                <Link href="/terms" className="text-teal-600 hover:underline">Terms of Service</Link> and{' '}
                <Link href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link href="/contact" className="text-sm text-gray-500 hover:text-teal-600">
                Need help? Contact support
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}