'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider } from '@/contexts/auth-context'
import { 
  Users,
  Star,
  DollarSign,
  Calendar,
  ChevronRight,
  Heart,
  Shield,
  Award,
  Clock,
  Globe,
  Filter,
  Search,
  GraduationCap,
  Sparkles,
  TrendingUp
} from 'lucide-react'

function HealingCirclesContent() {
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Sample circles data (would come from database)
  const circles = [
    {
      id: '1',
      title: 'From Survivor to Thriver',
      guide: 'Sarah M.',
      guideStory: 'Overcame 10 years of narcissistic abuse',
      category: 'Narcissistic Abuse Recovery',
      description: 'Transform from surviving narcissistic abuse to thriving in healthy relationships.',
      members: 12,
      capacity: 15,
      price: 49,
      frequency: 'Weekly',
      duration: '8 weeks',
      rating: 4.9,
      testimonials: 28,
      nextSession: 'Tuesday 7pm EST',
      verified: true
    },
    {
      id: '2',
      title: 'Sober & Strong',
      guide: 'Michael R.',
      guideStory: '5 years sober from alcohol addiction',
      category: 'Addiction Recovery',
      description: 'Build unshakeable sobriety through peer support and proven strategies.',
      members: 8,
      capacity: 10,
      price: 39,
      frequency: 'Twice weekly',
      duration: '12 weeks',
      rating: 4.8,
      testimonials: 45,
      nextSession: 'Monday 6pm PST',
      verified: true
    },
    {
      id: '3',
      title: 'Healing the Mother Wound',
      guide: 'Dr. Lisa K.',
      guideStory: 'Healed complex maternal trauma',
      category: 'Childhood Trauma',
      description: 'Process and heal from complicated mother-child dynamics.',
      members: 10,
      capacity: 12,
      price: 59,
      frequency: 'Weekly',
      duration: '10 weeks',
      rating: 5.0,
      testimonials: 62,
      nextSession: 'Thursday 8pm CST',
      verified: true
    },
    {
      id: '4',
      title: 'Anxiety Warriors',
      guide: 'James T.',
      guideStory: 'Overcame severe panic disorder',
      category: 'Anxiety Management',
      description: 'Master your anxiety with someone who truly understands the struggle.',
      members: 14,
      capacity: 20,
      price: 35,
      frequency: 'Weekly',
      duration: '6 weeks',
      rating: 4.7,
      testimonials: 89,
      nextSession: 'Wednesday 7pm EST',
      verified: true
    }
  ]

  const categories = [
    'All',
    'Addiction Recovery',
    'Trauma Healing',
    'Anxiety Management',
    'Depression Recovery',
    'Narcissistic Abuse Recovery',
    'Childhood Trauma',
    'Relationship Healing'
  ]

  const filteredCircles = circles.filter(circle => {
    const matchesCategory = filterCategory === 'all' || circle.category === filterCategory
    const matchesSearch = circle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          circle.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          circle.guide.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-teal-500">
            <Sparkles className="h-3 w-3 mr-1" />
            Peer-Led Support Groups
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Healing Circles
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join intimate support groups led by people who've walked your path. 
            Real transformation happens when survivors become guides.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-teal-600">147</div>
              <div className="text-sm text-gray-600">Active Circles</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-blue-600">2,384</div>
              <div className="text-sm text-gray-600">Members Healing</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-purple-600">89%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-green-600">4.8★</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-12">
            <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
              <Search className="h-5 w-5 mr-2" />
              Find Your Circle
            </Button>
            <Button size="lg" variant="outline">
              <GraduationCap className="h-5 w-5 mr-2" />
              Become a Guide
            </Button>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search circles, guides, or topics..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={filterCategory === category.toLowerCase().replace(' ', '_') || 
                            (category === 'All' && filterCategory === 'all') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterCategory(category === 'All' ? 'all' : category)}
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Circles Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {filteredCircles.map((circle, index) => (
            <motion.div
              key={circle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-gray-100">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <CardTitle className="text-xl mb-1">{circle.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">{circle.guide}</span>
                        {circle.verified && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-600">${circle.price}</div>
                      <div className="text-xs text-gray-500">per month</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mb-2">{circle.category}</Badge>
                  <p className="text-sm text-gray-500 italic">"{circle.guideStory}"</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{circle.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{circle.members}/{circle.capacity} members</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{circle.frequency}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{circle.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{circle.rating} ({circle.testimonials} reviews)</span>
                    </div>
                  </div>

                  <div className="bg-teal-50 rounded-lg p-3 mb-4">
                    <div className="text-sm font-medium text-teal-700">Next Session</div>
                    <div className="text-sm text-teal-600">{circle.nextSession}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-teal-600 hover:bg-teal-700">
                      Join Circle
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                    <Button variant="outline">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Become a Guide CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">
                    Turn Your Healing Into Helping
                  </h3>
                  <p className="text-purple-100 mb-4">
                    Have you overcome significant challenges? Share your journey and earn income 
                    by guiding others through similar struggles.
                  </p>
                  <div className="flex items-center gap-6 text-purple-100">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Earn 80% revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      <span>Impact lives</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Grow your practice</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                    <Award className="h-5 w-5 mr-2" />
                    Apply to Guide
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500 mb-4">Trusted by thousands on their healing journey</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="h-5 w-5" />
              <span>Verified Guides</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Globe className="h-5 w-5" />
              <span>Global Community</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Heart className="h-5 w-5" />
              <span>Safe & Supportive</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function HealingCirclesPage() {
  return (
    <AuthProvider>
      <HealingCirclesContent />
    </AuthProvider>
  )
}