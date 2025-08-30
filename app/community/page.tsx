'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { APP_CONFIG } from '@/lib/config'
import { Skeleton, ListSkeleton, CardSkeleton } from '@/components/ui/skeleton'
import { 
  Users,
  User,
  MessageCircle,
  Heart,
  Shield,
  Award,
  Search,
  Filter,
  ChevronRight,
  Lock,
  Unlock,
  Calendar,
  UserPlus,
  Star,
  TrendingUp,
  HandHeart,
  Circle,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'

function CommunityContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('support-groups')
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [joinSuccess, setJoinSuccess] = useState(false)

  const handleJoinGroup = (group: any) => {
    if (!user) {
      router.push('/login')
      return
    }
    setSelectedItem(group)
    setShowJoinModal(true)
  }

  const handleJoinEvent = (event: any) => {
    if (!user) {
      router.push('/login')
      return
    }
    setSelectedItem(event)
    setShowJoinModal(true)
  }

  const confirmJoin = () => {
    // Simulate joining
    setJoinSuccess(true)
    setTimeout(() => {
      setShowJoinModal(false)
      setJoinSuccess(false)
      setSelectedItem(null)
    }, 2000)
  }
  
  const supportGroups = [
    {
      id: 1,
      name: 'Understanding Alcohol Patterns',
      description: 'Exploring root causes behind drinking - stress, trauma, social anxiety, or emotional pain',
      members: 287,
      activity: 'Active today',
      tags: ['alcohol', 'root-causes', 'recovery'],
      privacy: 'Private'
    },
    {
      id: 2,
      name: 'Beyond Addiction: Trauma Healing',
      description: 'Discovering how unresolved trauma drives addictive behaviors and finding paths to healing',
      members: 198,
      activity: 'Active today',
      tags: ['trauma', 'addiction', 'healing'],
      privacy: 'Private'
    },
    {
      id: 3,
      name: 'Digital Balance & Gaming',
      description: 'Understanding excessive gaming, social media, and screen time as escape mechanisms',
      members: 156,
      activity: '2 hours ago',
      tags: ['gaming', 'digital-wellness', 'balance'],
      privacy: 'Open'
    },
    {
      id: 4,
      name: 'Sexual Health & Shame Recovery',
      description: 'Safe space to understand pornography use, sexual behaviors, and healing deep shame',
      members: 234,
      activity: 'Active today',
      tags: ['sexuality', 'shame', 'recovery'],
      privacy: 'Private'
    },
    {
      id: 5,
      name: 'Substance Use Root Causes',
      description: 'Moving beyond substances to discover what you\'re really seeking - connection, peace, or escape',
      members: 312,
      activity: 'Active today',
      tags: ['substances', 'self-discovery', 'recovery'],
      privacy: 'Private'
    },
    {
      id: 6,
      name: 'Food, Body & Control Patterns',
      description: 'Understanding eating behaviors, body image, and the deeper need for control',
      members: 267,
      activity: '3 hours ago',
      tags: ['eating', 'body-image', 'control'],
      privacy: 'Private'
    },
    {
      id: 7,
      name: 'Codependency & Love Addiction',
      description: 'Exploring relationship patterns, attachment wounds, and healthy boundaries',
      members: 189,
      activity: 'Active today',
      tags: ['relationships', 'codependency', 'boundaries'],
      privacy: 'Private'
    },
    {
      id: 8,
      name: 'Anxiety & Self-Medication',
      description: 'Understanding how we use substances or behaviors to manage anxiety',
      members: 342,
      activity: 'Active today',
      tags: ['anxiety', 'self-medication', 'coping'],
      privacy: 'Private'
    }
  ]

  const events = [
    {
      id: 1,
      title: 'Understanding Your Triggers',
      type: 'Root Cause Workshop',
      date: 'Today, 7:00 PM',
      facilitator: 'Dr. Sarah Chen',
      attendees: 45,
      description: 'Identify what really triggers cravings - emotions, situations, or memories'
    },
    {
      id: 2,
      title: 'HALT Daily Check-In',
      type: 'Daily Support',
      date: 'Daily, 12:00 PM', 
      facilitator: 'Peer Facilitator',
      attendees: 23,
      description: 'Hungry, Angry, Lonely, Tired - essential recovery check-in'
    },
    {
      id: 3,
      title: 'Trauma & Addiction Connection',
      type: 'Educational',
      date: 'Tomorrow, 6:00 PM',
      facilitator: 'Dr. James Wilson',
      attendees: 67,
      description: 'How unresolved trauma fuels addictive patterns'
    },
    {
      id: 4,
      title: 'Shame to Self-Compassion',
      type: 'Healing Circle',
      date: 'Wednesday, 7:00 PM',
      facilitator: 'Licensed Therapist',
      attendees: 34,
      description: 'Transform shame into self-understanding and compassion'
    },
    {
      id: 5,
      title: 'Family Patterns Workshop',
      type: 'Support Group',
      date: 'Thursday, 6:30 PM',
      facilitator: 'Community Leader',
      attendees: 28,
      description: 'Exploring generational patterns in addiction'
    }
  ]

  const resources = [
    {
      title: 'Community Guidelines',
      description: 'Learn about our standards for respectful interaction',
      icon: Shield,
      type: 'Guide'
    },
    {
      title: 'Crisis Resources',
      description: 'Immediate support options available 24/7',
      icon: Heart,
      type: 'Emergency'
    },
    {
      title: 'Peer Support Training',
      description: 'Become a certified peer supporter in our community',
      icon: Award,
      type: 'Training'
    },
    {
      title: 'Wellness Challenges',
      description: 'Join monthly challenges to build healthy habits',
      icon: TrendingUp,
      type: 'Activity'
    }
  ]

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <motion.div className="absolute inset-0 -z-10">
        <motion.div 
          className="orb orb-teal w-[600px] h-[600px] -top-48 -right-48"
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
          className="orb orb-cyan w-[500px] h-[500px] -bottom-32 -left-32"
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
            Community & <span className="gradient-text">Support</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with others on similar journeys, find your support network, and grow together
          </p>
          
          {/* Trust indicators */}
          <div className="flex justify-center items-center gap-6 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-teal-500" />
              <span>Safe & moderated</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-teal-500" />
              <span>Peer support</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-teal-500" />
              <span>Compassionate community</span>
            </div>
          </div>
        </motion.div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="trust-badge">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Members</p>
                    <p className="text-2xl font-bold text-teal-700">2,847</p>
                  </div>
                  <Users className="h-8 w-8 text-teal-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Support Groups</p>
                    <p className="text-2xl font-bold text-teal-700">24</p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-teal-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Weekly Events</p>
                    <p className="text-2xl font-bold text-teal-700">12</p>
                  </div>
                  <Calendar className="h-8 w-8 text-teal-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="trust-badge">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Success Stories</p>
                    <p className="text-2xl font-bold text-teal-700">156</p>
                  </div>
                  <Star className="h-8 w-8 text-teal-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white/70 backdrop-blur-sm rounded-2xl p-1 shadow-lg">
            {[
              { id: 'support-groups', label: 'Support Groups' },
              { id: 'events', label: 'Events & Workshops' },
              { id: 'resources', label: 'Community Resources' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'support-groups' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {supportGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="feature-card">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-500">{group.members} members</span>
                            <span className="text-sm text-teal-600">{group.activity}</span>
                            <Badge variant={group.privacy === 'Private' ? 'secondary' : 'outline'}>
                              {group.privacy}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{group.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {group.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        className="btn-primary w-full"
                        onClick={() => handleJoinGroup(group)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Join Group
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'events' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="feature-card">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                            <Badge variant="outline">{event.type}</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{event.description}</p>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{event.facilitator}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{event.attendees} attending</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button 
                            className="btn-secondary"
                            onClick={() => handleJoinEvent(event)}
                          >
                            Join Event
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'resources' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((resource, index) => {
                const Icon = resource.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="feature-card">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-teal-50 rounded-2xl">
                            <Icon className="h-6 w-6 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{resource.title}</h3>
                              <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                            </div>
                            <p className="text-gray-600 mb-4">{resource.description}</p>
                            <Button className="btn-secondary">
                              <ChevronRight className="h-4 w-4 mr-2" />
                              Learn More
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </main>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            {!joinSuccess ? (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Join {selectedItem?.name || selectedItem?.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'support-groups' 
                    ? "You're about to join this support group. You'll be able to participate in discussions and connect with other members."
                    : "You're about to register for this event. We'll send you a reminder before it starts."}
                </p>
                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => {
                      setShowJoinModal(false)
                      setSelectedItem(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 btn-primary"
                    onClick={confirmJoin}
                  >
                    Confirm
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Successfully Joined!</h3>
                <p className="text-gray-600">
                  You've been added to {selectedItem?.name || selectedItem?.title}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default function CommunityPage() {
  return (
    <AuthProvider>
      <CommunityContent />
    </AuthProvider>
  )
}