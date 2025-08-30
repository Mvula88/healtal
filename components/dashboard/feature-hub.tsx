'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Brain, 
  Heart, 
  Compass, 
  Users,
  TrendingUp,
  Calendar,
  ChevronRight,
  Sparkles,
  Activity,
  Target,
  Lightbulb,
  Shield,
  TreePine,
  BarChart3,
  CheckCircle,
  Award,
  Flame,
  Zap,
  BookOpen,
  MessageCircle,
  DollarSign,
  UserCheck,
  Layers,
  Star,
  CircleDollarSign,
  GraduationCap,
  HandHeart,
  Megaphone,
  Crown
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface FeatureCardProps {
  title: string
  description: string
  icon: any
  href: string
  color: string
  badge?: string
  badgeColor?: string
  comingSoon?: boolean
  premium?: boolean
}

function FeatureCard({ title, description, icon: Icon, href, color, badge, badgeColor, comingSoon, premium }: FeatureCardProps) {
  const content = (
    <motion.div
      whileHover={{ scale: comingSoon ? 1 : 1.02 }}
      whileTap={{ scale: comingSoon ? 1 : 0.98 }}
      className={`relative h-full ${comingSoon ? 'opacity-60' : ''}`}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-gray-100 hover:border-teal-200 group cursor-pointer">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex gap-2">
              {badge && (
                <Badge className={badgeColor || 'bg-teal-500'}>{badge}</Badge>
              )}
              {premium && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
              {comingSoon && (
                <Badge variant="outline">Coming Soon</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
          {!comingSoon && (
            <div className="mt-4 flex items-center text-teal-600 text-sm font-medium group-hover:gap-2 transition-all">
              Access Feature
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  if (comingSoon) {
    return content
  }

  return <Link href={href}>{content}</Link>
}

export function FeatureHub() {
  const coreFeatures = [
    {
      title: 'AI Coach',
      description: 'Deep psychological analysis with Claude AI to understand root causes of your patterns and behaviors.',
      icon: Brain,
      href: '/coach',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      badge: 'Enhanced',
      badgeColor: 'bg-purple-500'
    },
    {
      title: 'Growth Paths',
      description: 'Structured 4-12 week transformation journeys with AI-guided exercises and milestone tracking.',
      icon: Compass,
      href: '/journeys',
      color: 'bg-gradient-to-br from-teal-500 to-teal-600',
      badge: 'AI-Powered',
      badgeColor: 'bg-teal-500'
    },
    {
      title: 'Healing Circles',
      description: 'Join or lead peer support groups. Connect with others who\'ve walked similar paths.',
      icon: Users,
      href: '/healing-circles',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      badge: 'NEW',
      badgeColor: 'bg-red-500',
      premium: true
    },
    {
      title: 'Daily Check-ins',
      description: 'Track your emotional state, energy, and patterns with AI analysis of your progress.',
      icon: CheckCircle,
      href: '/checkin',
      color: 'bg-gradient-to-br from-green-500 to-green-600'
    }
  ]

  const insightFeatures = [
    {
      title: 'Pattern Analysis',
      description: 'Discover hidden patterns in your thoughts, emotions, and behaviors with AI insights.',
      icon: BarChart3,
      href: '/patterns',
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
    },
    {
      title: 'Deep Insights',
      description: 'Comprehensive analysis of your journey with breakthrough detection and progress tracking.',
      icon: Lightbulb,
      href: '/insights',
      color: 'bg-gradient-to-br from-amber-500 to-amber-600'
    },
    {
      title: 'Wellness Tracker',
      description: 'Monitor mood, energy, sleep, and wellness metrics with predictive insights.',
      icon: Activity,
      href: '/wellness',
      color: 'bg-gradient-to-br from-cyan-500 to-cyan-600'
    },
    {
      title: 'Progress Dashboard',
      description: 'Visualize your transformation journey with charts, milestones, and achievements.',
      icon: TrendingUp,
      href: '/dashboard/progress',
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
    }
  ]

  const supportFeatures = [
    {
      title: 'Crisis Support',
      description: '24/7 crisis resources, safety planning, and immediate support when you need it most.',
      icon: Shield,
      href: '/safety',
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      badge: '24/7',
      badgeColor: 'bg-red-500'
    },
    {
      title: 'Community Forum',
      description: 'Connect with others on similar journeys. Share experiences and support each other.',
      icon: MessageCircle,
      href: '/community',
      color: 'bg-gradient-to-br from-violet-500 to-violet-600'
    },
    {
      title: 'Resource Library',
      description: 'Curated articles, videos, books, and exercises for your healing journey.',
      icon: BookOpen,
      href: '/resources',
      color: 'bg-gradient-to-br from-pink-500 to-pink-600'
    },
    {
      title: 'Professional Directory',
      description: 'Find therapists, counselors, and specialists when you need professional help.',
      icon: UserCheck,
      href: '/professionals',
      color: 'bg-gradient-to-br from-slate-500 to-slate-600',
      comingSoon: true
    }
  ]

  const monetizationFeatures = [
    {
      title: 'Become a Guide',
      description: 'Turn your healing journey into income by guiding others through similar challenges.',
      icon: GraduationCap,
      href: '/become-guide',
      color: 'bg-gradient-to-br from-gold-500 to-gold-600',
      badge: 'Earn 80%',
      badgeColor: 'bg-green-500',
      premium: true
    },
    {
      title: 'Create Content',
      description: 'Share your story, insights, and resources. Monetize your transformation experience.',
      icon: Megaphone,
      href: '/creator-hub',
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      comingSoon: true
    },
    {
      title: 'Affiliate Program',
      description: 'Earn commissions by referring others to their healing journey.',
      icon: CircleDollarSign,
      href: '/affiliate',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      comingSoon: true
    },
    {
      title: 'Workshops',
      description: 'Host paid workshops and intensive healing sessions for groups.',
      icon: HandHeart,
      href: '/workshops',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      comingSoon: true
    }
  ]

  const specializedPaths = [
    {
      title: 'Addiction Recovery',
      description: 'Specialized support for addiction recovery with sobriety tracking and milestone celebrations.',
      icon: TreePine,
      href: '/recovery',
      color: 'bg-gradient-to-br from-green-600 to-green-700'
    },
    {
      title: 'Trauma Healing',
      description: 'Trauma-informed approaches with somatic exercises and nervous system regulation.',
      icon: Heart,
      href: '/journeys?filter=trauma',
      color: 'bg-gradient-to-br from-rose-500 to-rose-600'
    },
    {
      title: 'Relationship Patterns',
      description: 'Understand attachment styles and transform relationship dynamics.',
      icon: Layers,
      href: '/journeys?filter=relationships',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      title: 'Inner Child Work',
      description: 'Reconnect with and heal your inner child through guided exercises.',
      icon: Star,
      href: '/journeys?filter=inner-child',
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600'
    }
  ]

  return (
    <div className="space-y-12">
      {/* Core Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-teal-500" />
            Core Features
          </h2>
          <p className="text-gray-600 mt-2">Essential tools for your transformation journey</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Insights & Tracking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-500" />
            Insights & Tracking
          </h2>
          <p className="text-gray-600 mt-2">Understand your patterns and track progress</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insightFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Support & Community */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-500" />
            Support & Community
          </h2>
          <p className="text-gray-600 mt-2">You're not alone on this journey</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {supportFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Earn & Share */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-500" />
            Earn & Share
          </h2>
          <p className="text-gray-600 mt-2">Transform your healing into helping others</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {monetizationFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Specialized Paths */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-500" />
            Specialized Paths
          </h2>
          <p className="text-gray-600 mt-2">Targeted support for specific challenges</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {specializedPaths.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Premium CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-12"
      >
        <Card className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-0">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Unlock Your Full Potential</h3>
                <p className="text-teal-50">
                  Upgrade to Transform tier for unlimited AI coaching, all Growth Paths, and the ability to lead Healing Circles.
                </p>
              </div>
              <Link href="/pricing">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50">
                  <Crown className="h-5 w-5 mr-2" />
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}