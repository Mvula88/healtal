'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider } from '@/contexts/auth-context'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Headphones,
  Play,
  Pause,
  Search,
  Filter,
  Clock,
  Calendar,
  Download,
  Share2,
  Heart,
  Bookmark,
  ChevronRight,
  Star,
  TrendingUp,
  Users,
  Volume2,
  SkipBack,
  SkipForward,
  Mic,
  Rss,
  ExternalLink
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface PodcastEpisode {
  id: string
  title: string
  description: string
  show_name: string
  host: string
  guest?: string
  episode_number?: number
  season_number?: number
  category: string
  tags: string[]
  duration: string
  publish_date: string
  audio_url: string
  transcript_available: boolean
  downloads: number
  likes: number
  rating: number
  featured: boolean
  new_episode: boolean
  thumbnail: string
  show_description: string
}

interface PodcastShow {
  id: string
  name: string
  description: string
  host: string
  category: string
  episode_count: number
  subscribers: number
  rating: number
  thumbnail: string
  latest_episode: string
  rss_feed: string
}

function PodcastsContent() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([])
  const [shows, setShows] = useState<PodcastShow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('episodes')
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    fetchPodcasts()
  }, [])

  const fetchPodcasts = async () => {
    try {
      // Simulate API call with sample data
      setTimeout(() => {
        setEpisodes([
          {
            id: '1',
            title: 'Understanding Your Addiction Patterns: A Deep Dive',
            description: 'Join Dr. Sarah Mitchell as she explores the psychological patterns behind addiction and how understanding these patterns can be the key to lasting recovery.',
            show_name: 'Recovery Insights',
            host: 'Dr. Sarah Mitchell',
            guest: 'Marcus Chen, Recovery Coach',
            episode_number: 42,
            season_number: 3,
            category: 'recovery',
            tags: ['addiction', 'patterns', 'psychology', 'recovery'],
            duration: '48:32',
            publish_date: '2024-08-28',
            audio_url: '/audio/recovery-insights-42.mp3',
            transcript_available: true,
            downloads: 15420,
            likes: 892,
            rating: 4.8,
            featured: true,
            new_episode: false,
            thumbnail: '/podcast-thumbnails/recovery-insights.jpg',
            show_description: 'Weekly conversations about addiction recovery, mental health, and finding your path to healing.'
          },
          {
            id: '2',
            title: 'Trauma-Informed Self-Care: Beyond the Buzzwords',
            description: 'Dr. Elena Rodriguez breaks down what trauma-informed self-care really means and shares practical techniques for nurturing yourself through the healing process.',
            show_name: 'Healing Conversations',
            host: 'Dr. Elena Rodriguez',
            episode_number: 18,
            category: 'trauma-healing',
            tags: ['trauma', 'self-care', 'healing', 'nervous-system'],
            duration: '35:47',
            publish_date: '2024-09-02',
            audio_url: '/audio/healing-conversations-18.mp3',
            transcript_available: true,
            downloads: 9876,
            likes: 543,
            rating: 4.9,
            featured: true,
            new_episode: true,
            thumbnail: '/podcast-thumbnails/healing-conversations.jpg',
            show_description: 'Exploring trauma, healing, and post-traumatic growth with leading experts in the field.'
          },
          {
            id: '3',
            title: 'From People-Pleasing to Healthy Boundaries',
            description: 'Jennifer Walsh, LMFT, shares her personal journey from codependency to healthy relationships and practical strategies for setting boundaries.',
            show_name: 'Relationship Reset',
            host: 'Jennifer Walsh',
            episode_number: 25,
            category: 'relationships',
            tags: ['codependency', 'boundaries', 'relationships', 'people-pleasing'],
            duration: '52:18',
            publish_date: '2024-08-25',
            audio_url: '/audio/relationship-reset-25.mp3',
            transcript_available: false,
            downloads: 12340,
            likes: 678,
            rating: 4.7,
            featured: false,
            new_episode: false,
            thumbnail: '/podcast-thumbnails/relationship-reset.jpg',
            show_description: 'Real talk about building healthy relationships after codependency and toxic patterns.'
          },
          {
            id: '4',
            title: 'Mindful Technology: Breaking Digital Addiction',
            description: 'Alex Turner, former tech executive turned digital wellness coach, shares insights on breaking free from digital addiction and creating intentional tech use.',
            show_name: 'Digital Mindfulness',
            host: 'Alex Turner',
            episode_number: 12,
            category: 'digital-wellness',
            tags: ['digital-detox', 'technology', 'mindfulness', 'addiction'],
            duration: '41:15',
            publish_date: '2024-08-30',
            audio_url: '/audio/digital-mindfulness-12.mp3',
            transcript_available: true,
            downloads: 7652,
            likes: 398,
            rating: 4.6,
            featured: false,
            new_episode: false,
            thumbnail: '/podcast-thumbnails/digital-mindfulness.jpg',
            show_description: 'Exploring the intersection of technology, mindfulness, and mental health in our digital age.'
          },
          {
            id: '5',
            title: 'Anxiety as Your Teacher: A New Perspective',
            description: 'Dr. Michael Stevens challenges common beliefs about anxiety and shows how it can become a powerful teacher and ally in your healing journey.',
            show_name: 'Anxiety Alchemy',
            host: 'Dr. Michael Stevens',
            guest: 'Sarah M., Recovery Story',
            episode_number: 33,
            category: 'mental-health',
            tags: ['anxiety', 'reframe', 'mental-health', 'empowerment'],
            duration: '44:28',
            publish_date: '2024-09-01',
            audio_url: '/audio/anxiety-alchemy-33.mp3',
            transcript_available: true,
            downloads: 11234,
            likes: 721,
            rating: 4.8,
            featured: false,
            new_episode: true,
            thumbnail: '/podcast-thumbnails/anxiety-alchemy.jpg',
            show_description: 'Transforming anxiety from your enemy into your greatest teacher and source of wisdom.'
          },
          {
            id: '6',
            title: 'The Science of Habit Change in Recovery',
            description: 'A deep dive into the neuroscience of habits with Dr. James Wilson, exploring how understanding your brain can accelerate recovery.',
            show_name: 'Neuroscience & Recovery',
            host: 'Dr. James Wilson',
            episode_number: 8,
            category: 'neuroscience',
            tags: ['neuroscience', 'habits', 'brain', 'recovery'],
            duration: '58:42',
            publish_date: '2024-08-22',
            audio_url: '/audio/neuroscience-recovery-8.mp3',
            transcript_available: true,
            downloads: 8745,
            likes: 456,
            rating: 4.9,
            featured: true,
            new_episode: false,
            thumbnail: '/podcast-thumbnails/neuroscience-recovery.jpg',
            show_description: 'Making neuroscience accessible for anyone interested in understanding their brain and behavior.'
          }
        ])

        setShows([
          {
            id: '1',
            name: 'Recovery Insights',
            description: 'Weekly conversations about addiction recovery, mental health, and finding your path to healing with Dr. Sarah Mitchell.',
            host: 'Dr. Sarah Mitchell',
            category: 'recovery',
            episode_count: 42,
            subscribers: 28500,
            rating: 4.8,
            thumbnail: '/podcast-thumbnails/recovery-insights.jpg',
            latest_episode: '2024-08-28',
            rss_feed: 'https://feeds.example.com/recovery-insights'
          },
          {
            id: '2',
            name: 'Healing Conversations',
            description: 'Exploring trauma, healing, and post-traumatic growth with leading experts in trauma-informed care.',
            host: 'Dr. Elena Rodriguez',
            category: 'trauma-healing',
            episode_count: 18,
            subscribers: 15600,
            rating: 4.9,
            thumbnail: '/podcast-thumbnails/healing-conversations.jpg',
            latest_episode: '2024-09-02',
            rss_feed: 'https://feeds.example.com/healing-conversations'
          },
          {
            id: '3',
            name: 'Relationship Reset',
            description: 'Real talk about building healthy relationships after codependency and toxic patterns.',
            host: 'Jennifer Walsh, LMFT',
            category: 'relationships',
            episode_count: 25,
            subscribers: 19200,
            rating: 4.7,
            thumbnail: '/podcast-thumbnails/relationship-reset.jpg',
            latest_episode: '2024-08-25',
            rss_feed: 'https://feeds.example.com/relationship-reset'
          },
          {
            id: '4',
            name: 'Digital Mindfulness',
            description: 'Exploring the intersection of technology, mindfulness, and mental health in our digital age.',
            host: 'Alex Turner',
            category: 'digital-wellness',
            episode_count: 12,
            subscribers: 8900,
            rating: 4.6,
            thumbnail: '/podcast-thumbnails/digital-mindfulness.jpg',
            latest_episode: '2024-08-30',
            rss_feed: 'https://feeds.example.com/digital-mindfulness'
          }
        ])
        
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching podcasts:', error)
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'All Categories', count: episodes.length },
    { id: 'recovery', name: 'Recovery', count: 12 },
    { id: 'trauma-healing', name: 'Trauma Healing', count: 8 },
    { id: 'mental-health', name: 'Mental Health', count: 15 },
    { id: 'relationships', name: 'Relationships', count: 9 },
    { id: 'digital-wellness', name: 'Digital Wellness', count: 4 },
    { id: 'neuroscience', name: 'Neuroscience', count: 6 }
  ]

  const filteredEpisodes = episodes.filter(episode => {
    const matchesSearch = episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          episode.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          episode.show_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          episode.host.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || episode.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredShows = shows.filter(show => {
    const matchesSearch = show.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          show.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          show.host.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || show.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedEpisodes = [...filteredEpisodes].sort((a, b) => {
    // Sort by featured first, then by date
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
  })

  const handlePlayPause = (episodeId: string) => {
    if (currentlyPlaying === episodeId) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentlyPlaying(episodeId)
      setIsPlaying(true)
    }
  }

  const formatDuration = (duration: string) => {
    // Convert duration like "48:32" to a more readable format if needed
    return duration
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
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
          className="orb orb-rose w-[600px] h-[600px] -top-48 -right-48"
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
          className="orb orb-pink w-[500px] h-[500px] -bottom-32 -left-32"
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
            Recovery <span className="gradient-text">Podcasts</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Listen to expert insights, inspiring stories, and practical wisdom from leading voices in recovery and mental health
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
                    <p className="text-sm text-gray-600">Episodes</p>
                    <p className="text-2xl font-bold text-rose-700">240+</p>
                  </div>
                  <Headphones className="h-8 w-8 text-rose-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Total Listens</p>
                    <p className="text-2xl font-bold text-rose-700">1.2M</p>
                  </div>
                  <Volume2 className="h-8 w-8 text-rose-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Shows</p>
                    <p className="text-2xl font-bold text-rose-700">12</p>
                  </div>
                  <Mic className="h-8 w-8 text-rose-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Subscribers</p>
                    <p className="text-2xl font-bold text-rose-700">85K</p>
                  </div>
                  <Users className="h-8 w-8 text-rose-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white/70 backdrop-blur-sm rounded-2xl p-1 shadow-lg">
            {[
              { id: 'episodes', label: 'Latest Episodes' },
              { id: 'shows', label: 'All Shows' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search episodes, shows, or hosts..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'bg-white/70 text-gray-600 hover:text-rose-600 hover:bg-rose-50'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'episodes' && (
          <div className="space-y-6">
            {sortedEpisodes.map((episode, index) => (
              <motion.div
                key={episode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`feature-card ${episode.featured ? 'border-l-4 border-l-yellow-400' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Episode Thumbnail */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-rose-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                          <Headphones className="h-8 w-8 text-rose-600" />
                          {currentlyPlaying === episode.id && (
                            <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                              <Volume2 className="h-6 w-6 text-rose-600" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Episode Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {episode.featured && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">Featured</Badge>
                              )}
                              {episode.new_episode && (
                                <Badge className="bg-green-100 text-green-800 text-xs">New</Badge>
                              )}
                              <Badge variant="outline" className="text-xs capitalize">
                                {episode.category.replace('-', ' ')}
                              </Badge>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 hover:text-rose-600 cursor-pointer mb-1">
                              {episode.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                              <span className="font-medium">{episode.show_name}</span>
                              <span>•</span>
                              <span>{episode.host}</span>
                              {episode.guest && (
                                <>
                                  <span>with</span>
                                  <span className="font-medium">{episode.guest}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => handlePlayPause(episode.id)}
                              className={`${
                                currentlyPlaying === episode.id && isPlaying
                                  ? 'bg-rose-600 text-white'
                                  : 'btn-primary'
                              }`}
                            >
                              {currentlyPlaying === episode.id && isPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{episode.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDuration(episode.duration)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(parseISO(episode.publish_date), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              <span>{episode.downloads.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3 text-red-500" />
                              <span>{episode.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span>{episode.rating}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {episode.transcript_available && (
                              <Badge variant="outline" className="text-xs border-rose-300 text-rose-600">
                                Transcript
                              </Badge>
                            )}
                            <Button size="sm" variant="outline">
                              <Bookmark className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline">
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-3">
                          {episode.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'shows' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShows.map((show, index) => (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="feature-card">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mic className="h-8 w-8 text-rose-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg hover:text-rose-600 cursor-pointer mb-1">
                          {show.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mb-2">{show.host}</p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {show.category.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{show.description}</p>
                    
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Headphones className="h-3 w-3" />
                          <span>{show.episode_count} episodes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{show.subscribers.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{show.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-4">
                      Latest: {format(parseISO(show.latest_episode), 'MMM d, yyyy')}
                    </p>

                    <div className="flex gap-2">
                      <Button className="btn-primary flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Listen
                      </Button>
                      <Button variant="outline" size="sm">
                        <Rss className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {(activeTab === 'episodes' ? sortedEpisodes : filteredShows).length === 0 && (
          <div className="text-center py-12">
            <Headphones className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-600">Try adjusting your search or category filter</p>
          </div>
        )}

        {/* How to Listen */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="feature-card bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Listen Everywhere
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Headphones className="h-6 w-6 text-rose-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Stream Online</h3>
                  <p className="text-gray-600 text-sm">Listen directly on our platform with high-quality audio streaming</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Download className="h-6 w-6 text-rose-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Download Episodes</h3>
                  <p className="text-gray-600 text-sm">Download for offline listening during commutes or travel</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Rss className="h-6 w-6 text-rose-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Subscribe via RSS</h3>
                  <p className="text-gray-600 text-sm">Add our feeds to your favorite podcast app to never miss an episode</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

export default function PodcastsPage() {
  return (
    <AuthProvider>
      <PodcastsContent />
    </AuthProvider>
  )
}