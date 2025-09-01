'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { APP_CONFIG } from '@/lib/config'
import { 
  Home,
  Compass,
  Brain,
  Heart,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Target,
  Shield
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Pattern Coach', href: '/coach', icon: Brain },
  { name: 'Growth Paths', href: '/journeys', icon: Compass },
  { name: 'Progress', href: '/wellness', icon: Target },
  { name: 'Insights', href: '/insights', icon: BookOpen },
  { name: 'Community', href: '/community', icon: Users },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { user, signOut } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    checkAdminStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false)
      return
    }

    // Simply check if the user email matches admin email
    // Bypass database check to avoid infinite recursion error
    setIsAdmin(user?.email === 'ismaelmvula@gmail.com')
  }

  return (
    <motion.nav 
      className="backdrop-blur-xl bg-white/30 border-b border-white/20 sticky top-0 z-50 shadow-lg"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href={user ? '/dashboard' : '/'} className="flex items-center group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <Image
                  src="/images/beneathy-logo.png"
                  alt="Beneathy Logo"
                  width={180}
                  height={60}
                  className="object-contain"
                />
              </motion.div>
            </Link>

            {user && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-2">
                {navigation.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all',
                          pathname === item.href
                            ? 'bg-teal-50 text-teal-700 shadow-sm'
                            : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50/50'
                        )}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                {isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="border border-orange-200 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      onClick={() => {
                        console.log('Admin nav clicked!')
                        window.location.href = '/admin'
                      }}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Button>
                  </motion.div>
                )}
                <Link href="/settings">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-teal-600 hover:bg-teal-50">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Button onClick={signOut} variant="outline" size="sm" className="border-teal-200 text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-teal-600 hover:bg-teal-50">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="gradient-wellness text-white border-0 hover:scale-105 transition-smooth shadow-lg">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div 
          className="sm:hidden backdrop-blur-xl bg-white/30 border-t border-white/20 shadow-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)'
          }}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="pt-2 pb-3 space-y-1">
            {user && navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-2 text-base font-medium transition-all',
                    pathname === item.href
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50/50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
            
            <div className="border-t pt-2">
              {user ? (
                <>
                  {isAdmin && (
                    <button
                      className="flex items-center px-4 py-2 text-base font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 w-full text-left transition-all"
                      onClick={() => {
                        router.push('/admin')
                        setMobileMenuOpen(false)
                      }}
                    >
                      <Shield className="h-5 w-5 mr-3" />
                      Admin Panel
                    </button>
                  )}
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-base font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="flex w-full items-center px-4 py-2 text-base font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-4 py-2 text-base font-medium text-teal-600 font-semibold hover:bg-teal-50 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}