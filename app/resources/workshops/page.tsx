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
  Calendar,
  Clock,
  Users,
  MapPin,
  Video,
  User,
  Search,
  Filter,
  ChevronRight,
  UserPlus,
  Star,
  Globe,
  Wifi,
  DollarSign,
  Award,
  Heart,
  Brain,
  Target,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react'
import { format, parseISO, isAfter } from 'date-fns'

interface Workshop {
  id: string
  title: string
  description: string
  facilitator: string
  facilitator_bio: string
  co_facilitators?: string[]
  category: string
  type: 'online' | 'in-person' | 'hybrid'
  date: string
  time: string
  duration: string
  timezone: string
  location?: string
  max_participants: number
  current_participants: number
  price: number
  early_bird_price?: number
  early_bird_deadline?: string
  what_you_learn: string[]
  who_should_attend: string[]
  materials_included: string[]
  prerequisites?: string[]
  tags: string[]
  featured: boolean
  popular: boolean
  registration_deadline: string
  zoom_link?: string
  recording_available: boolean
  certificate: boolean
  created_at: string
  thumbnail: string
  registered?: boolean
}

function WorkshopsContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState('all')

  useEffect(() => {
    fetchWorkshops()
  }, [])

  const fetchWorkshops = async () => {
    try {
      // Simulate API call with sample data
      setTimeout(() => {
        setWorkshops([
          {
            id: '1',
            title: 'Understanding Your Triggers: Interactive Workshop',
            description: 'Join us for an intensive 3-hour workshop where you\'ll learn to identify, understand, and manage your personal triggers. Through guided exercises and group discussions, you\'ll develop practical strategies for trigger management.',
            facilitator: 'Dr. Sarah Mitchell',
            facilitator_bio: 'Licensed psychologist with 15+ years in addiction recovery',
            co_facilitators: ['Lisa Chen, LCSW'],
            category: 'trigger-management',
            type: 'online',
            date: '2024-09-15',
            time: '10:00 AM',
            duration: '3 hours',
            timezone: 'PST',
            max_participants: 25,
            current_participants: 18,
            price: 67,
            early_bird_price: 47,
            early_bird_deadline: '2024-09-08',
            what_you_learn: [
              'Identify your personal trigger patterns',
              'Understand the neuroscience of triggers',
              'Practice grounding techniques in real-time',
              'Create a personalized trigger management plan',
              'Learn from others\' experiences in group setting'
            ],
            who_should_attend: [
              'Anyone struggling with triggering situations',
              'People in early recovery (3+ months)',
              'Those wanting to understand their reactions better',
              'Support system members and family'
            ],
            materials_included: [
              'Trigger identification worksheet',
              'Grounding techniques reference card',
              'Personal action plan template',
              'Workshop recording access'
            ],
            prerequisites: ['Basic understanding of recovery concepts'],
            tags: ['triggers', 'coping-strategies', 'neuroscience', 'group-work'],
            featured: true,
            popular: true,
            registration_deadline: '2024-09-13',
            recording_available: true,
            certificate: true,
            created_at: '2024-08-15',
            thumbnail: '/workshop-thumbnails/triggers.jpg',
            registered: user ? Math.random() > 0.7 : false
          },
          {
            id: '2',
            title: 'Trauma-Informed Self-Care Intensive',
            description: 'A gentle, compassionate workshop focusing on trauma-informed approaches to self-care. Learn to care for yourself in ways that honor your healing journey and nervous system needs.',
            facilitator: 'Dr. Elena Rodriguez',
            facilitator_bio: 'Trauma specialist and EMDR certified therapist',
            category: 'trauma-healing',
            type: 'online',
            date: '2024-09-22',
            time: '2:00 PM',
            duration: '4 hours',
            timezone: 'EST',
            max_participants: 20,
            current_participants: 12,
            price: 89,
            early_bird_price: 69,
            early_bird_deadline: '2024-09-15',
            what_you_learn: [
              'Trauma-informed self-care principles',
              'Nervous system regulation techniques',
              'Creating safety in daily routines',
              'Somatic self-care practices',
              'Building a sustainable self-care plan'
            ],
            who_should_attend: [
              'Trauma survivors at any stage of healing',
              'People with PTSD or complex trauma',
              'Healthcare workers experiencing vicarious trauma',
              'Anyone interested in nervous system health'
            ],
            materials_included: [
              'Self-care assessment tool',
              'Somatic exercises guide',
              'Safety planning worksheet',
              'Resource list for trauma-informed care'
            ],
            tags: ['trauma', 'self-care', 'nervous-system', 'somatic'],
            featured: true,
            popular: false,
            registration_deadline: '2024-09-20',
            recording_available: true,
            certificate: false,
            created_at: '2024-08-20',
            thumbnail: '/workshop-thumbnails/trauma-care.jpg'
          },
          {
            id: '3',
            title: 'Building Healthy Boundaries Workshop',
            description: 'Learn to set, maintain, and communicate healthy boundaries in all areas of your life. Perfect for those recovering from codependency or people-pleasing patterns.',
            facilitator: 'Jennifer Walsh, LMFT',
            facilitator_bio: 'Relationship therapist specializing in codependency recovery',
            category: 'boundaries',
            type: 'hybrid',
            date: '2024-09-28',
            time: '11:00 AM',
            duration: '5 hours',
            timezone: 'CST',
            location: 'Austin Wellness Center, Austin, TX',
            max_participants: 30,
            current_participants: 22,
            price: 125,
            early_bird_price: 95,
            early_bird_deadline: '2024-09-21',
            what_you_learn: [
              'Types of boundaries and when to use them',
              'How to communicate boundaries effectively',
              'Dealing with boundary violations',
              'Overcoming guilt around boundary setting',
              'Practice boundary conversations'
            ],
            who_should_attend: [
              'People recovering from codependency',
              'Those struggling with people-pleasing',
              'Anyone in toxic relationships',
              'People wanting healthier relationships'
            ],
            materials_included: [
              'Boundary assessment questionnaire',
              'Communication scripts and templates',
              'Boundary violation response guide',
              'Workbook with exercises'
            ],
            tags: ['boundaries', 'codependency', 'communication', 'relationships'],
            featured: false,
            popular: true,
            registration_deadline: '2024-09-26',
            recording_available: false,
            certificate: true,
            created_at: '2024-08-22',
            thumbnail: '/workshop-thumbnails/boundaries.jpg'
          },
          {
            id: '4',
            title: 'Mindful Recovery: Daily Practices Workshop',
            description: 'Discover how to integrate mindfulness into every aspect of your recovery journey. Learn practical techniques that fit into busy schedules and challenging moments.',
            facilitator: 'Marcus Chen',
            facilitator_bio: 'Meditation teacher and recovery coach with 8 years sobriety',
            category: 'mindfulness',
            type: 'online',
            date: '2024-10-05',
            time: '7:00 PM',
            duration: '2 hours',
            timezone: 'PST',
            max_participants: 40,
            current_participants: 15,
            price: 35,
            what_you_learn: [
              'Micro-meditation techniques for busy schedules',
              'Mindful craving management',
              'Using mindfulness during difficult emotions',
              'Creating sustainable daily practices',
              'Mindful communication skills'
            ],
            who_should_attend: [
              'Anyone interested in mindfulness',
              'People in recovery looking for tools',
              'Those struggling with emotional regulation',
              'Beginners to mindfulness practice'
            ],
            materials_included: [
              'Guided meditation recordings',
              'Mindfulness practice tracker',
              'Quick reference technique cards',
              'Community practice group invitation'
            ],
            tags: ['mindfulness', 'meditation', 'daily-practice', 'emotional-regulation'],
            featured: false,
            popular: false,
            registration_deadline: '2024-10-03',
            recording_available: true,
            certificate: false,
            created_at: '2024-08-25',
            thumbnail: '/workshop-thumbnails/mindfulness.jpg'
          },
          {
            id: '5',
            title: 'Digital Detox & Healthy Tech Boundaries',
            description: 'Break free from digital addiction patterns and create a healthier relationship with technology. Learn practical strategies for digital wellness in our connected world.',
            facilitator: 'Alex Turner',
            facilitator_bio: 'Former tech executive, digital wellness advocate',
            category: 'digital-wellness',
            type: 'online',
            date: '2024-10-12',
            time: '6:00 PM',
            duration: '2.5 hours',
            timezone: 'EST',
            max_participants: 35,
            current_participants: 8,
            price: 45,
            early_bird_price: 35,
            early_bird_deadline: '2024-10-05',
            what_you_learn: [
              'Recognize digital addiction patterns',
              'Create healthy tech boundaries',
              'Design analog alternatives to digital habits',
              'Use technology intentionally',
              'Build supportive accountability systems'
            ],
            who_should_attend: [
              'Anyone feeling overwhelmed by technology',
              'People with social media addiction',
              'Those wanting better work-life balance',
              'Parents concerned about family tech use'
            ],
            materials_included: [
              'Digital wellness assessment',
              'Tech boundary planning template',
              'Analog activity idea list',
              'Family tech agreement template'
            ],
            tags: ['digital-detox', 'technology', 'boundaries', 'wellness'],
            featured: false,
            popular: false,
            registration_deadline: '2024-10-10',
            recording_available: true,
            certificate: false,
            created_at: '2024-08-28',
            thumbnail: '/workshop-thumbnails/digital-detox.jpg'
          },
          {
            id: '6',
            title: 'Anxiety to Empowerment: Practical Strategies',
            description: 'Transform your relationship with anxiety through evidence-based techniques. Learn to work with anxiety as information rather than fighting against it.',
            facilitator: 'Dr. Michael Stevens',
            facilitator_bio: 'Clinical psychologist specializing in anxiety disorders',
            category: 'anxiety',
            type: 'online',
            date: '2024-10-19',
            time: '1:00 PM',
            duration: '4 hours',
            timezone: 'PST',
            max_participants: 25,
            current_participants: 19,
            price: 89,
            early_bird_price: 69,
            early_bird_deadline: '2024-10-12',
            what_you_learn: [
              'Understand anxiety as your nervous system\'s response',
              'Practice breathing techniques that actually work',
              'Learn cognitive restructuring techniques',
              'Develop exposure exercises for your specific fears',
              'Create an anxiety action plan'
            ],
            who_should_attend: [
              'People struggling with anxiety disorders',
              'Those interested in CBT techniques',
              'People with panic attacks',
              'Anyone wanting to understand anxiety better'
            ],
            materials_included: [
              'Anxiety tracking worksheets',
              'Cognitive restructuring templates',
              'Breathing exercise audio guides',
              'Exposure exercise planning sheets'
            ],
            prerequisites: ['Willingness to practice techniques during workshop'],
            tags: ['anxiety', 'cbt', 'panic-attacks', 'coping-strategies'],
            featured: true,
            popular: true,
            registration_deadline: '2024-10-17',
            recording_available: true,
            certificate: true,
            created_at: '2024-09-01',
            thumbnail: '/workshop-thumbnails/anxiety.jpg'
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching workshops:', error)
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'All Categories', count: workshops.length },
    { id: 'trigger-management', name: 'Trigger Management', count: 3 },
    { id: 'trauma-healing', name: 'Trauma Healing', count: 4 },
    { id: 'boundaries', name: 'Boundaries', count: 2 },
    { id: 'mindfulness', name: 'Mindfulness', count: 5 },
    { id: 'digital-wellness', name: 'Digital Wellness', count: 2 },
    { id: 'anxiety', name: 'Anxiety', count: 6 }
  ]

  const types = [
    { id: 'all', name: 'All Types' },
    { id: 'online', name: 'Online' },
    { id: 'in-person', name: 'In-Person' },
    { id: 'hybrid', name: 'Hybrid' }
  ]

  const timeframes = [
    { id: 'all', name: 'All Dates' },
    { id: 'this-week', name: 'This Week' },
    { id: 'this-month', name: 'This Month' },
    { id: 'next-month', name: 'Next Month' }
  ]

  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch = workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          workshop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          workshop.facilitator.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || workshop.category === selectedCategory
    const matchesType = selectedType === 'all' || workshop.type === selectedType
    
    // Time filtering logic would go here
    const matchesTimeframe = selectedTimeframe === 'all' // Simplified for demo
    
    return matchesSearch && matchesCategory && matchesType && matchesTimeframe
  })

  // Sort workshops by date
  const sortedWorkshops = [...filteredWorkshops].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  const handleRegisterWorkshop = (workshop: Workshop) => {
    if (!user) {
      router.push('/login')
      return
    }
    // Handle workshop registration
    console.log('Registering for workshop:', workshop.title)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'online': return Video
      case 'in-person': return MapPin
      case 'hybrid': return Globe
      default: return Video
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'online': return 'bg-blue-100 text-blue-800'
      case 'in-person': return 'bg-green-100 text-green-800'
      case 'hybrid': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isEarlyBirdEligible = (workshop: Workshop) => {
    if (!workshop.early_bird_deadline) return false
    return isAfter(parseISO(workshop.early_bird_deadline), new Date())
  }

  const getAvailabilityStatus = (workshop: Workshop) => {
    const spotsLeft = workshop.max_participants - workshop.current_participants
    if (spotsLeft === 0) return { status: 'full', message: 'Fully Booked', color: 'text-red-600' }
    if (spotsLeft <= 3) return { status: 'limited', message: `${spotsLeft} spots left`, color: 'text-orange-600' }
    return { status: 'available', message: `${spotsLeft} spots available`, color: 'text-green-600' }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
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
          className="orb orb-amber w-[600px] h-[600px] -top-48 -right-48"
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
          className="orb orb-yellow w-[500px] h-[500px] -bottom-32 -left-32"
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
            Healing <span className="gradient-text">Workshops</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Interactive workshops led by experts to accelerate your healing journey through hands-on learning and community connection
          </p>
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
                    <p className="text-sm text-gray-600">Upcoming</p>
                    <p className="text-2xl font-bold text-amber-700">18</p>
                  </div>
                  <Calendar className="h-8 w-8 text-amber-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Participants</p>
                    <p className="text-2xl font-bold text-amber-700">2.4K</p>
                  </div>
                  <Users className="h-8 w-8 text-amber-600 opacity-20" />
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
                    <p className="text-2xl font-bold text-amber-700">4.9</p>
                  </div>
                  <Star className="h-8 w-8 text-amber-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Expert Facilitators</p>
                    <p className="text-2xl font-bold text-amber-700">12</p>
                  </div>
                  <Award className="h-8 w-8 text-amber-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search workshops, facilitators, or topics..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'bg-white/70 text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
              >
                {types.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>

              {/* Timeframe Filter */}
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
              >
                {timeframes.map(timeframe => (
                  <option key={timeframe.id} value={timeframe.id}>{timeframe.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Workshops List */}
        <div className="space-y-8">
          {sortedWorkshops.map((workshop, index) => {
            const TypeIcon = getTypeIcon(workshop.type)
            const availability = getAvailabilityStatus(workshop)
            const isEarlyBird = isEarlyBirdEligible(workshop)
            
            return (
              <motion.div
                key={workshop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`feature-card ${workshop.featured ? 'border-l-4 border-l-yellow-400' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {workshop.featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                          )}
                          {workshop.popular && (
                            <Badge className="bg-orange-100 text-orange-800">Popular</Badge>
                          )}
                          <Badge className={getTypeColor(workshop.type)}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {workshop.type}
                          </Badge>
                          {workshop.certificate && (
                            <Badge variant="outline" className="border-amber-300 text-amber-600">
                              <Award className="h-3 w-3 mr-1" />
                              Certificate
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-2xl hover:text-amber-600 cursor-pointer mb-2">
                          {workshop.title}
                        </CardTitle>
                        <p className="text-gray-600 mb-4">{workshop.description}</p>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-amber-100 text-amber-600">
                              {workshop.facilitator.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{workshop.facilitator}</p>
                            <p className="text-sm text-gray-500">{workshop.facilitator_bio}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-2">
                          <span className={`text-sm font-medium ${availability.color}`}>
                            {availability.message}
                          </span>
                          {availability.status === 'limited' && (
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                        {workshop.registered && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Registered
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Workshop Details */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-amber-600" />
                            <span>{format(parseISO(workshop.date), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <span>{workshop.time} {workshop.timezone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-600" />
                            <span>{workshop.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-amber-600" />
                            <span>{workshop.current_participants}/{workshop.max_participants}</span>
                          </div>
                        </div>

                        {workshop.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{workshop.location}</span>
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold text-sm mb-2">What You'll Learn:</h4>
                          <ul className="space-y-1">
                            {workshop.what_you_learn.slice(0, 4).map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                            {workshop.what_you_learn.length > 4 && (
                              <li className="text-xs text-gray-500">
                                +{workshop.what_you_learn.length - 4} more learning objectives
                              </li>
                            )}
                          </ul>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {workshop.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Registration */}
                      <div className="lg:col-span-1">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              {isEarlyBird && workshop.early_bird_price && (
                                <>
                                  <span className="text-2xl font-bold text-green-600">
                                    ${workshop.early_bird_price}
                                  </span>
                                  <span className="text-lg text-gray-500 line-through">
                                    ${workshop.price}
                                  </span>
                                </>
                              )}
                              {(!isEarlyBird || !workshop.early_bird_price) && (
                                <span className="text-2xl font-bold text-amber-600">
                                  ${workshop.price}
                                </span>
                              )}
                            </div>
                            {isEarlyBird && (
                              <div className="text-xs text-green-600 mb-2">
                                Early bird until {format(parseISO(workshop.early_bird_deadline!), 'MMM d')}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>All materials included</span>
                            </div>
                            {workshop.recording_available && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>Recording access included</span>
                              </div>
                            )}
                            {workshop.certificate && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>Certificate of completion</span>
                              </div>
                            )}
                          </div>

                          <Button 
                            className={`w-full ${availability.status === 'full' ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => handleRegisterWorkshop(workshop)}
                            disabled={availability.status === 'full'}
                          >
                            {workshop.registered ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Registered
                              </>
                            ) : availability.status === 'full' ? (
                              'Fully Booked'
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Register Now
                              </>
                            )}
                          </Button>

                          {availability.status === 'full' && (
                            <p className="text-xs text-center text-gray-500">
                              Join waitlist or check for recordings
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {sortedWorkshops.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No workshops found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Why Join Workshops */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="feature-card bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Why Join Our Workshops?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Interactive Learning</h3>
                  <p className="text-gray-600 text-sm">Engage with experts and peers in real-time discussions and exercises</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Target className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Practical Tools</h3>
                  <p className="text-gray-600 text-sm">Leave with actionable strategies you can implement immediately</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Supportive Community</h3>
                  <p className="text-gray-600 text-sm">Connect with others on similar journeys in a safe, understanding environment</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

export default function WorkshopsPage() {
  return (
    <AuthProvider>
      <WorkshopsContent />
    </AuthProvider>
  )
}