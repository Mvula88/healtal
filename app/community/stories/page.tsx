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
  Heart,
  Star,
  Quote,
  Search,
  Filter,
  ChevronRight,
  Clock,
  Share2,
  BookOpen,
  TrendingUp,
  Calendar,
  Eye,
  MessageCircle,
  Plus
} from 'lucide-react'

interface Story {
  id: string
  title: string
  content: string
  author: string
  category: string
  tags: string[]
  likes: number
  views: number
  comments: number
  featured: boolean
  created_at: string
  reading_time: string
}

function StoriesContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      // Simulate API call with sample data
      setTimeout(() => {
        setStories([
          {
            id: '1',
            title: 'From Rock Bottom to Recovery: My 2-Year Journey',
            content: 'Two years ago, I thought my life was over. Addiction had taken everything - my job, my relationships, my self-worth. But through pattern recognition and understanding my root causes, I found a way back...',
            author: 'Sarah M.',
            category: 'recovery',
            tags: ['addiction', 'trauma-healing', 'recovery', '2-years-sober'],
            likes: 234,
            views: 1876,
            comments: 45,
            featured: true,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            reading_time: '8 min read'
          },
          {
            id: '2',
            title: 'Breaking Free from Gaming Addiction',
            content: 'For years, I used gaming to escape reality. 12+ hours a day, neglecting everything else. Here\'s how I discovered what I was really seeking and found healthier ways to meet those needs...',
            author: 'Mike J.',
            category: 'digital-wellness',
            tags: ['gaming', 'digital-balance', 'self-discovery'],
            likes: 187,
            views: 1243,
            comments: 32,
            featured: true,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            reading_time: '6 min read'
          },
          {
            id: '3',
            title: 'Healing from Codependency: Learning to Love Myself First',
            content: 'My entire identity was wrapped up in fixing others. I attracted toxic relationships and lost myself completely. This is how I learned to set boundaries and find my own worth...',
            author: 'Elena R.',
            category: 'relationships',
            tags: ['codependency', 'boundaries', 'self-love', 'relationships'],
            likes: 298,
            views: 2156,
            comments: 67,
            featured: false,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            reading_time: '10 min read'
          },
          {
            id: '4',
            title: 'Understanding My Anxiety: From Panic to Peace',
            content: 'Panic attacks ruled my life for years. I self-medicated with alcohol and avoided everything. Through root cause analysis, I discovered my anxiety stemmed from childhood trauma...',
            author: 'David K.',
            category: 'mental-health',
            tags: ['anxiety', 'trauma', 'self-medication', 'healing'],
            likes: 156,
            views: 987,
            comments: 28,
            featured: false,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            reading_time: '7 min read'
          },
          {
            id: '5',
            title: 'Food and Control: My Journey with Eating Disorders',
            content: 'Food was my way of controlling emotions I couldn\'t handle. Binge eating, restricting, the endless cycle of shame. Here\'s how I learned to nourish my body and soul...',
            author: 'Maria L.',
            category: 'eating-disorders',
            tags: ['eating-disorders', 'body-image', 'control', 'self-acceptance'],
            likes: 203,
            views: 1432,
            comments: 41,
            featured: false,
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            reading_time: '9 min read'
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching stories:', error)
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'All Stories', count: stories.length },
    { id: 'recovery', name: 'Recovery', count: 12 },
    { id: 'mental-health', name: 'Mental Health', count: 15 },
    { id: 'relationships', name: 'Relationships', count: 8 },
    { id: 'digital-wellness', name: 'Digital Wellness', count: 6 },
    { id: 'eating-disorders', name: 'Eating Disorders', count: 7 },
    { id: 'trauma-healing', name: 'Trauma Healing', count: 9 }
  ]

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          story.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredStories = filteredStories.filter(story => story.featured)
  const regularStories = filteredStories.filter(story => !story.featured)

  const handleShareStory = () => {
    if (!user) {
      router.push('/login')
      return
    }
    // Navigate to share story form
    router.push('/community/share')
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
          className="orb orb-purple w-[600px] h-[600px] -top-48 -right-48"
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
            Success <span className="gradient-text">Stories</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Real stories from real people who've transformed their lives by understanding their patterns
          </p>
          
          <Button onClick={handleShareStory} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Share Your Story
          </Button>
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
                    <p className="text-sm text-gray-600">Total Stories</p>
                    <p className="text-2xl font-bold text-purple-700">156</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Total Reads</p>
                    <p className="text-2xl font-bold text-purple-700">45.2K</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Inspiring Hearts</p>
                    <p className="text-2xl font-bold text-purple-700">12.8K</p>
                  </div>
                  <Heart className="h-8 w-8 text-purple-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Communities</p>
                    <p className="text-2xl font-bold text-purple-700">24</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search stories..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white/70 text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Featured Stories */}
        {featuredStories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              Featured Stories
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="feature-card border-l-4 border-l-yellow-400">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge className="bg-yellow-100 text-yellow-800 mb-2">Featured</Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {story.reading_time}
                        </div>
                      </div>
                      <CardTitle className="text-xl hover:text-purple-600 cursor-pointer">
                        {story.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {story.author.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{story.author}</span>
                        <span>•</span>
                        <span>{new Date(story.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-3">{story.content}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {story.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span>{story.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{story.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{story.comments}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="btn-secondary">
                          Read Story
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Stories */}
        {regularStories.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="feature-card">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge variant="outline">{story.category}</Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {story.reading_time}
                        </div>
                      </div>
                      <CardTitle className="text-lg hover:text-purple-600 cursor-pointer">
                        {story.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">
                            {story.author.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{story.author}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{story.content}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {story.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-red-500" />
                            <span>{story.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{story.views}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-purple-600">
                          Read
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {filteredStories.length === 0 && (
          <div className="text-center py-12">
            <Quote className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No stories found</h3>
            <p className="text-gray-600">Try adjusting your search or category filter</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function StoriesPage() {
  return (
    <AuthProvider>
      <StoriesContent />
    </AuthProvider>
  )
}