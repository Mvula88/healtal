'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users,
  User,
  Heart,
  MessageCircle,
  Search,
  Filter,
  ChevronRight,
  MapPin,
  Clock,
  Shield,
  UserPlus,
  Star,
  HandHeart,
  Globe,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react'

interface Buddy {
  id: string
  name: string
  bio: string
  location: string
  timezone: string
  experience: string[]
  interests: string[]
  support_style: string
  availability: string
  rating: number
  total_matches: number
  languages: string[]
  verified: boolean
  online_status: 'online' | 'offline' | 'away'
  joined_date: string
  matching_score?: number
}

function BuddyContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [buddies, setBuddies] = useState<Buddy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExperience, setSelectedExperience] = useState('all')
  const [showMatching, setShowMatching] = useState(false)
  const [matchingPreferences, setMatchingPreferences] = useState({
    experience: [],
    location_preference: 'any',
    timezone_preference: 'flexible',
    support_style: 'any'
  })

  useEffect(() => {
    fetchBuddies()
  }, [])

  const fetchBuddies = async () => {
    try {
      // Simulate API call with sample data
      setTimeout(() => {
        setBuddies([
          {
            id: '1',
            name: 'Sarah C.',
            bio: 'Two years in recovery from alcohol addiction. I understand the struggle of social anxiety and finding healthy coping mechanisms.',
            location: 'Seattle, WA',
            timezone: 'PST',
            experience: ['addiction', 'anxiety', 'social-recovery'],
            interests: ['mindfulness', 'hiking', 'cooking', 'reading'],
            support_style: 'empathetic-listener',
            availability: 'evenings-weekends',
            rating: 4.9,
            total_matches: 23,
            languages: ['English', 'Spanish'],
            verified: true,
            online_status: 'online',
            joined_date: '2022-03-15',
            matching_score: 95
          },
          {
            id: '2',
            name: 'Marcus J.',
            bio: 'Gaming addiction survivor. Now helping others find balance with technology and discover real-world connections.',
            location: 'Austin, TX',
            timezone: 'CST',
            experience: ['gaming-addiction', 'digital-wellness', 'social-skills'],
            interests: ['board-games', 'music', 'coding', 'fitness'],
            support_style: 'practical-advisor',
            availability: 'flexible',
            rating: 4.7,
            total_matches: 18,
            languages: ['English'],
            verified: true,
            online_status: 'online',
            joined_date: '2021-11-08',
            matching_score: 88
          },
          {
            id: '3',
            name: 'Elena M.',
            bio: 'Overcame codependency and toxic relationships. Passionate about helping others build healthy boundaries and self-worth.',
            location: 'Miami, FL',
            timezone: 'EST',
            experience: ['codependency', 'relationships', 'boundaries', 'trauma'],
            interests: ['art-therapy', 'yoga', 'dancing', 'journaling'],
            support_style: 'boundary-coach',
            availability: 'mornings',
            rating: 4.8,
            total_matches: 31,
            languages: ['English', 'Spanish', 'Portuguese'],
            verified: true,
            online_status: 'away',
            joined_date: '2021-06-22',
            matching_score: 82
          },
          {
            id: '4',
            name: 'David K.',
            bio: 'Former workaholic who learned to manage anxiety without substances. Love helping others find work-life balance.',
            location: 'Remote',
            timezone: 'Flexible',
            experience: ['workaholism', 'anxiety', 'self-medication', 'balance'],
            interests: ['meditation', 'nature', 'podcasts', 'minimalism'],
            support_style: 'mindful-guide',
            availability: 'weekday-lunch',
            rating: 4.6,
            total_matches: 15,
            languages: ['English', 'German'],
            verified: true,
            online_status: 'offline',
            joined_date: '2022-01-10',
            matching_score: 79
          },
          {
            id: '5',
            name: 'Luna R.',
            bio: 'Eating disorder recovery advocate. Understanding the complex relationship with food, body image, and emotional eating.',
            location: 'Portland, OR',
            timezone: 'PST',
            experience: ['eating-disorders', 'body-image', 'emotional-eating', 'self-acceptance'],
            interests: ['cooking', 'photography', 'gardening', 'cats'],
            support_style: 'gentle-supporter',
            availability: 'weekends',
            rating: 4.9,
            total_matches: 27,
            languages: ['English', 'French'],
            verified: true,
            online_status: 'online',
            joined_date: '2021-09-03',
            matching_score: 91
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching buddies:', error)
      setLoading(false)
    }
  }

  const experiences = [
    { id: 'all', name: 'All Experiences', count: buddies.length },
    { id: 'addiction', name: 'Addiction Recovery', count: 15 },
    { id: 'anxiety', name: 'Anxiety & Depression', count: 22 },
    { id: 'relationships', name: 'Relationship Issues', count: 18 },
    { id: 'digital-wellness', name: 'Digital Wellness', count: 12 },
    { id: 'eating-disorders', name: 'Eating Disorders', count: 8 },
    { id: 'trauma', name: 'Trauma Healing', count: 14 }
  ]

  const filteredBuddies = buddies.filter(buddy => {
    const matchesSearch = buddy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          buddy.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          buddy.experience.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesExperience = selectedExperience === 'all' || 
                             buddy.experience.some(exp => exp.includes(selectedExperience))
    return matchesSearch && matchesExperience
  })

  // Sort by matching score if available
  const sortedBuddies = filteredBuddies.sort((a, b) => {
    if (a.matching_score && b.matching_score) {
      return b.matching_score - a.matching_score
    }
    return b.rating - a.rating
  })

  const handleRequestMatch = (buddy: Buddy) => {
    if (!user) {
      router.push('/login')
      return
    }
    // Handle match request
    console.log('Requesting match with:', buddy.name)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online'
      case 'away': return 'Away'
      case 'offline': return 'Offline'
      default: return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <motion.div className="absolute inset-0 -z-10">
        <motion.div 
          className="orb orb-blue w-[600px] h-[600px] -top-48 -right-48"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="orb orb-indigo w-[500px] h-[500px] -bottom-32 -left-32"
          animate={{ 
            y: [0, 20, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your <span className="gradient-text">Support Buddy</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Connect with peer supporters who understand your journey and can provide personalized guidance
          </p>
          
          {/* Trust indicators */}
          <div className="flex justify-center items-center gap-6 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Verified supporters</span>
            </div>
            <div className="flex items-center gap-1">
              <HandHeart className="h-4 w-4 text-blue-500" />
              <span>Peer-to-peer matching</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-blue-500" />
              <span>Safe & confidential</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="trust-badge">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Buddies</p>
                    <p className="text-2xl font-bold text-blue-700">89</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="trust-badge">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Successful Matches</p>
                    <p className="text-2xl font-bold text-blue-700">342</p>
                  </div>
                  <HandHeart className="h-8 w-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="trust-badge">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-blue-700">4.8</p>
                  </div>
                  <Star className="h-8 w-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="trust-badge">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Languages</p>
                    <p className="text-2xl font-bold text-blue-700">12</p>
                  </div>
                  <Globe className="h-8 w-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* How It Works */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="feature-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How Buddy Matching Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Find Compatible Buddies</h3>
                  <p className="text-gray-600 text-sm">Browse verified peer supporters based on shared experiences and support style</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Request a Match</h3>
                  <p className="text-gray-600 text-sm">Send a match request with a personal introduction message</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Start Supporting</h3>
                  <p className="text-gray-600 text-sm">Begin your peer support relationship through secure messaging</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, experience, or interests..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {experiences.map(experience => (
              <button
                key={experience.id}
                onClick={() => setSelectedExperience(experience.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedExperience === experience.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/70 text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {experience.name} ({experience.count})
              </button>
            ))}
          </div>
        </div>

        {/* Buddies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBuddies.map((buddy, index) => (
            <motion.div
              key={buddy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="feature-card relative">
                {buddy.matching_score && buddy.matching_score > 85 && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-green-500 text-white">
                      {buddy.matching_score}% Match
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                            {buddy.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(buddy.online_status)}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{buddy.name}</CardTitle>
                          {buddy.verified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{buddy.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{buddy.total_matches} matches</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-xs ${buddy.online_status === 'online' ? 'border-green-200 text-green-600' : ''}`}>
                      {getStatusText(buddy.online_status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{buddy.bio}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{buddy.location}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{buddy.timezone}</span>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-2">Experience Areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {buddy.experience.slice(0, 3).map((exp) => (
                          <Badge key={exp} variant="outline" className="text-xs">
                            {exp.replace('-', ' ')}
                          </Badge>
                        ))}
                        {buddy.experience.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{buddy.experience.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-2">Support Style:</p>
                      <Badge className="text-xs bg-blue-100 text-blue-700">
                        {buddy.support_style.replace('-', ' ')}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-2">Languages:</p>
                      <div className="flex flex-wrap gap-1">
                        {buddy.languages.map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="btn-primary w-full mt-6"
                    onClick={() => handleRequestMatch(buddy)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Request Match
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {sortedBuddies.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No buddies found</h3>
            <p className="text-gray-600">Try adjusting your search or experience filters</p>
          </div>
        )}

        {/* Become a Buddy CTA */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="feature-card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <HandHeart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Help Others?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                If you've made progress in your own journey, consider becoming a peer support buddy. 
                Help others while continuing your own growth and healing.
              </p>
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Become a Support Buddy
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

export default function BuddyPage() {
  return (
    <AuthProvider>
      <BuddyContent />
    </AuthProvider>
  )
}