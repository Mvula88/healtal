'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
  Shield,
  ChevronDown,
  MessageCircle,
  Coffee,
  Moon,
  Lightbulb,
  HeartHandshake,
  TrendingUp,
  BarChart3,
  Activity,
  Award,
  Calendar,
  FileText,
  HelpCircle,
  Library,
  Zap,
  Sparkles,
  Bell,
  User,
  CreditCard,
  Lock,
  Palette,
  Globe,
  Headphones,
  BookMarked,
  Video,
  GraduationCap,
  Podcast,
  UserPlus,
  MessageSquare,
  Share2,
  Star
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'

// Professional menu structure with dropdowns
const navigationItems = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home,
    description: 'Your personal overview'
  },
  { 
    name: 'Coaching',
    icon: Brain,
    dropdown: true,
    items: [
      { 
        name: 'Root Cause Analysis', 
        href: '/coach?mode=analysis', 
        icon: Brain,
        description: 'Discover deeper patterns',
        badge: 'Popular'
      },
      { 
        name: 'Just Talk', 
        href: '/coach?mode=talk', 
        icon: Coffee,
        description: 'Safe space to share',
        badge: 'New'
      },
      { 
        name: 'Quick Advice', 
        href: '/coach?mode=advice', 
        icon: Lightbulb,
        description: 'Get perspective'
      },
      { 
        name: 'Vent & Release', 
        href: '/coach?mode=vent', 
        icon: MessageCircle,
        description: 'Let it all out'
      },
      { 
        name: 'Late Night Support', 
        href: '/coach?mode=night', 
        icon: Moon,
        description: '24/7 companion'
      },
      { 
        name: 'Relationship Help', 
        href: '/coach?mode=relationship', 
        icon: HeartHandshake,
        description: 'Navigate dynamics'
      },
      { 
        name: 'Recovery Support', 
        href: '/coach?mode=recovery', 
        icon: Shield,
        description: 'Addiction & healing'
      }
    ]
  },
  { 
    name: 'Growth',
    icon: Compass,
    dropdown: true,
    items: [
      { 
        name: 'Growth Journeys', 
        href: '/journeys', 
        icon: Compass,
        description: 'Structured pathways'
      },
      { 
        name: 'Daily Check-ins', 
        href: '/checkin', 
        icon: Calendar,
        description: 'Track your mood'
      },
      { 
        name: 'Wellness Tracking', 
        href: '/wellness', 
        icon: Activity,
        description: 'Monitor progress'
      },
      { 
        name: 'Goals & Milestones', 
        href: '/goals', 
        icon: Target,
        description: 'Set achievements'
      },
      { 
        name: 'Habit Builder', 
        href: '/habits', 
        icon: Zap,
        description: 'Form new patterns'
      }
    ]
  },
  { 
    name: 'Insights',
    icon: TrendingUp,
    dropdown: true,
    items: [
      { 
        name: 'Pattern Analytics', 
        href: '/insights', 
        icon: BarChart3,
        description: 'Your behavior patterns'
      },
      { 
        name: 'Progress Reports', 
        href: '/reports', 
        icon: FileText,
        description: 'Weekly summaries'
      },
      { 
        name: 'Breakthrough Moments', 
        href: '/breakthroughs', 
        icon: Sparkles,
        description: 'Key discoveries'
      },
      { 
        name: 'Achievements', 
        href: '/achievements', 
        icon: Award,
        description: 'Celebrate wins'
      }
    ]
  },
  { 
    name: 'Community',
    icon: Users,
    dropdown: true,
    items: [
      { 
        name: 'Healing Circles', 
        href: '/healing-circles', 
        icon: Heart,
        description: 'Support groups',
        badge: 'Live'
      },
      { 
        name: 'Discussion Forums', 
        href: '/community/forums', 
        icon: MessageSquare,
        description: 'Topic discussions'
      },
      { 
        name: 'Success Stories', 
        href: '/community/stories', 
        icon: Star,
        description: 'Inspiring journeys'
      },
      { 
        name: 'Find Support Buddy', 
        href: '/community/buddy', 
        icon: UserPlus,
        description: 'Connect 1-on-1'
      },
      { 
        name: 'Share Progress', 
        href: '/community/share', 
        icon: Share2,
        description: 'Celebrate together'
      }
    ]
  },
  { 
    name: 'Resources',
    icon: Library,
    dropdown: true,
    items: [
      { 
        name: 'Learning Library', 
        href: '/resources/library', 
        icon: BookMarked,
        description: 'Articles & guides'
      },
      { 
        name: 'Video Courses', 
        href: '/resources/courses', 
        icon: Video,
        description: 'Self-paced learning'
      },
      { 
        name: 'Workshops', 
        href: '/resources/workshops', 
        icon: GraduationCap,
        description: 'Live sessions'
      },
      { 
        name: 'Podcasts', 
        href: '/resources/podcasts', 
        icon: Podcast,
        description: 'Audio content'
      },
      { 
        name: 'Help Center', 
        href: '/help', 
        icon: HelpCircle,
        description: 'FAQs & support'
      }
    ]
  }
]

export function NavbarEnhanced() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const { user, signOut } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAdminStatus()
  }, [user])

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false)
      return
    }
    setIsAdmin(user?.email === 'ismaelmvula@gmail.com')
  }

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') return pathname === href
    return pathname.startsWith(href.split('?')[0])
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
          <div className="flex items-center">
            {/* Logo */}
            <Link href={user ? '/dashboard' : '/'} className="flex items-center group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <Image
                  src="/images/beneathy-logo.png"
                  alt="Beneathy"
                  width={160}
                  height={50}
                  className="object-contain"
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden md:ml-8 md:flex md:items-center md:space-x-1" ref={dropdownRef}>
                {navigationItems.map((item, index) => {
                  const Icon = item.icon
                  
                  if (item.dropdown) {
                    return (
                      <div key={item.name} className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                          className={cn(
                            'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all group',
                            activeDropdown === item.name
                              ? 'bg-teal-50 text-teal-700'
                              : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50/50'
                          )}
                        >
                          <Icon className="h-4 w-4 mr-1.5" />
                          {item.name}
                          <ChevronDown className={cn(
                            "h-3 w-3 ml-1 transition-transform",
                            activeDropdown === item.name && "rotate-180"
                          )} />
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {activeDropdown === item.name && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute left-0 mt-2 w-64 rounded-xl shadow-lg bg-white/95 backdrop-blur-xl border border-gray-100 overflow-hidden"
                              style={{
                                backdropFilter: 'blur(20px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                              }}
                            >
                              <div className="py-2">
                                {item.items?.map((subItem) => {
                                  const SubIcon = subItem.icon
                                  return (
                                    <Link
                                      key={subItem.name}
                                      href={subItem.href}
                                      onClick={() => setActiveDropdown(null)}
                                      className={cn(
                                        "flex items-start px-4 py-3 hover:bg-teal-50 transition-colors group",
                                        isActiveRoute(subItem.href) && "bg-teal-50/50"
                                      )}
                                    >
                                      <SubIcon className="h-5 w-5 text-gray-400 group-hover:text-teal-600 mt-0.5 mr-3 flex-shrink-0" />
                                      <div className="flex-1">
                                        <div className="flex items-center">
                                          <span className="text-sm font-medium text-gray-900 group-hover:text-teal-700">
                                            {subItem.name}
                                          </span>
                                          {subItem.badge && (
                                            <span className={cn(
                                              "ml-2 px-2 py-0.5 text-xs font-semibold rounded-full",
                                              subItem.badge === 'New' && "bg-green-100 text-green-700",
                                              subItem.badge === 'Popular' && "bg-purple-100 text-purple-700",
                                              subItem.badge === 'Live' && "bg-red-100 text-red-700"
                                            )}>
                                              {subItem.badge}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                          {subItem.description}
                                        </p>
                                      </div>
                                    </Link>
                                  )
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  }

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href!}
                        className={cn(
                          'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all',
                          isActiveRoute(item.href!)
                            ? 'bg-teal-50 text-teal-700 shadow-sm'
                            : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50/50'
                        )}
                      >
                        <Icon className="h-4 w-4 mr-1.5" />
                        {item.name}
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right side menu */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {user ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-teal-600">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>

                {/* User Menu */}
                <div className="relative group">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 hover:text-teal-600 hover:bg-teal-50"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden lg:inline">Account</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                  
                  <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white/95 backdrop-blur-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="py-2">
                      <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-teal-50">
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Link>
                      <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-teal-50">
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                      <Link href="/billing" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-teal-50">
                        <CreditCard className="h-4 w-4 mr-3" />
                        Billing
                      </Link>
                      {isAdmin && (
                        <>
                          <div className="border-t my-2"></div>
                          <Link href="/admin" className="flex items-center px-4 py-2 text-sm text-orange-600 hover:bg-orange-50">
                            <Shield className="h-4 w-4 mr-3" />
                            Admin Panel
                          </Link>
                        </>
                      )}
                      <div className="border-t my-2"></div>
                      <button 
                        onClick={signOut} 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 w-full text-left"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-teal-600">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="gradient-wellness text-white border-0 hover:scale-105 transition-smooth shadow-lg">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
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
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden backdrop-blur-xl bg-white/95 border-t border-gray-100"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user && navigationItems.map((item) => {
                const Icon = item.icon
                
                if (item.dropdown) {
                  return (
                    <div key={item.name}>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {item.name}
                      </div>
                      {item.items?.map((subItem) => {
                        const SubIcon = subItem.icon
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-md"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <SubIcon className="h-5 w-5 mr-3" />
                            {subItem.name}
                            {subItem.badge && (
                              <span className={cn(
                                "ml-auto px-2 py-0.5 text-xs font-semibold rounded-full",
                                subItem.badge === 'New' && "bg-green-100 text-green-700",
                                subItem.badge === 'Popular' && "bg-purple-100 text-purple-700",
                                subItem.badge === 'Live' && "bg-red-100 text-red-700"
                              )}>
                                {subItem.badge}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )
                }
                
                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    className={cn(
                      'flex items-center px-3 py-2 text-base font-medium rounded-md',
                      isActiveRoute(item.href!)
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
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
                    <Link
                      href="/profile"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-3" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      Settings
                    </Link>
                    <Link
                      href="/billing"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <CreditCard className="h-5 w-5 mr-3" />
                      Billing
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center px-3 py-2 text-base font-medium text-orange-600 hover:bg-orange-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="h-5 w-5 mr-3" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut()
                        setMobileMenuOpen(false)
                      }}
                      className="flex w-full items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="block px-3 py-2 text-base font-medium text-teal-600 font-semibold hover:bg-teal-50"
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
      </AnimatePresence>
    </motion.nav>
  )
}