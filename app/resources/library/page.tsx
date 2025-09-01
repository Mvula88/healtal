'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider } from '@/contexts/auth-context'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  BookOpen,
  Search,
  Filter,
  Download,
  ExternalLink,
  FileText,
  Video,
  Headphones,
  Image,
  Link2,
  Star,
  Eye,
  Clock,
  ChevronRight,
  BookmarkPlus,
  Heart,
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react'

interface Resource {
  id: string
  title: string
  description: string
  type: 'ebook' | 'pdf' | 'video' | 'audio' | 'tool' | 'article' | 'guide'
  category: string
  tags: string[]
  author: string
  rating: number
  reviews: number
  downloads: number
  duration?: string
  size?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  premium: boolean
  featured: boolean
  created_at: string
  url: string
}

function LibraryContent() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('featured')

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      // Simulate API call with sample data
      setTimeout(() => {
        setResources([
          {
            id: '1',
            title: 'The Complete Guide to Understanding Behavioral Patterns',
            description: 'A comprehensive guide that helps you identify and understand the root causes behind your behavioral patterns. Includes exercises, worksheets, and real-life examples.',
            type: 'ebook',
            category: 'self-discovery',
            tags: ['patterns', 'behavior', 'self-awareness', 'psychology'],
            author: 'Dr. Sarah Mitchell',
            rating: 4.8,
            reviews: 342,
            downloads: 2547,
            size: '2.3 MB',
            difficulty: 'beginner',
            premium: false,
            featured: true,
            created_at: '2024-01-15',
            url: '/resources/behavioral-patterns-guide.pdf'
          },
          {
            id: '2',
            title: 'Mindfulness for Addiction Recovery',
            description: 'Learn evidence-based mindfulness techniques specifically designed for addiction recovery. Includes guided meditations and daily practices.',
            type: 'video',
            category: 'recovery',
            tags: ['mindfulness', 'addiction', 'meditation', 'recovery'],
            author: 'Mindful Recovery Institute',
            rating: 4.9,
            reviews: 189,
            downloads: 1876,
            duration: '2.5 hours',
            difficulty: 'intermediate',
            premium: true,
            featured: true,
            created_at: '2024-02-03',
            url: '/resources/mindfulness-recovery-course'
          },
          {
            id: '3',
            title: 'Anxiety Management Toolkit',
            description: 'A practical collection of tools, worksheets, and strategies for managing anxiety. Includes breathing exercises, thought tracking, and coping mechanisms.',
            type: 'pdf',
            category: 'mental-health',
            tags: ['anxiety', 'coping', 'tools', 'mental-health'],
            author: 'Anxiety Recovery Center',
            rating: 4.7,
            reviews: 456,
            downloads: 3421,
            size: '1.8 MB',
            difficulty: 'beginner',
            premium: false,
            featured: false,
            created_at: '2024-01-28',
            url: '/resources/anxiety-toolkit.pdf'
          },
          {
            id: '4',
            title: 'Trauma-Informed Healing Practices',
            description: 'Understanding trauma responses and gentle healing practices. Includes somatic exercises, grounding techniques, and self-compassion practices.',
            type: 'audio',
            category: 'trauma-healing',
            tags: ['trauma', 'healing', 'somatic', 'self-compassion'],
            author: 'Dr. Elena Rodriguez',
            rating: 4.9,
            reviews: 267,
            downloads: 1943,
            duration: '3.2 hours',
            difficulty: 'intermediate',
            premium: true,
            featured: false,
            created_at: '2024-02-10',
            url: '/resources/trauma-healing-audio'
          },
          {
            id: '5',
            title: 'Building Healthy Relationships Workbook',
            description: 'Learn to identify codependent patterns and build healthy, balanced relationships. Includes boundary-setting exercises and communication tools.',
            type: 'pdf',
            category: 'relationships',
            tags: ['relationships', 'boundaries', 'codependency', 'communication'],
            author: 'Relationship Wellness Group',
            rating: 4.6,
            reviews: 298,
            downloads: 2156,
            size: '3.4 MB',
            difficulty: 'intermediate',
            premium: false,
            featured: false,
            created_at: '2024-01-22',
            url: '/resources/relationships-workbook.pdf'
          },
          {
            id: '6',
            title: 'Digital Wellness Assessment Tool',
            description: 'Interactive tool to assess your relationship with technology and social media. Includes personalized recommendations and action plans.',
            type: 'tool',
            category: 'digital-wellness',
            tags: ['digital', 'technology', 'assessment', 'balance'],
            author: 'Digital Balance Institute',
            rating: 4.4,
            reviews: 134,
            downloads: 876,
            difficulty: 'beginner',
            premium: false,
            featured: false,
            created_at: '2024-02-15',
            url: '/tools/digital-wellness-assessment'
          },
          {
            id: '7',
            title: 'Understanding Eating Disorder Recovery',
            description: 'Compassionate guide to understanding eating disorders and the recovery process. Includes body image exercises and nutrition guidelines.',
            type: 'ebook',
            category: 'eating-disorders',
            tags: ['eating-disorders', 'recovery', 'body-image', 'nutrition'],
            author: 'Dr. Maria Santos',
            rating: 4.8,
            reviews: 187,
            downloads: 1432,
            size: '2.7 MB',
            difficulty: 'intermediate',
            premium: true,
            featured: true,
            created_at: '2024-01-30',
            url: '/resources/eating-disorder-recovery.pdf'
          },
          {
            id: '8',
            title: 'Sleep Hygiene for Mental Wellness',
            description: 'Evidence-based strategies for improving sleep quality to support mental health. Includes sleep tracking templates and bedtime routines.',
            type: 'guide',
            category: 'wellness',
            tags: ['sleep', 'mental-health', 'wellness', 'routines'],
            author: 'Sleep Wellness Center',
            rating: 4.5,
            reviews: 234,
            downloads: 1765,
            size: '1.6 MB',
            difficulty: 'beginner',
            premium: false,
            featured: false,
            created_at: '2024-02-05',
            url: '/resources/sleep-hygiene-guide.pdf'
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching resources:', error)
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'All Categories', count: resources.length },
    { id: 'self-discovery', name: 'Self Discovery', count: 15 },
    { id: 'recovery', name: 'Recovery', count: 23 },
    { id: 'mental-health', name: 'Mental Health', count: 34 },
    { id: 'relationships', name: 'Relationships', count: 18 },
    { id: 'trauma-healing', name: 'Trauma Healing', count: 12 },
    { id: 'digital-wellness', name: 'Digital Wellness', count: 8 },
    { id: 'eating-disorders', name: 'Eating Disorders', count: 9 },
    { id: 'wellness', name: 'Wellness', count: 21 }
  ]

  const types = [
    { id: 'all', name: 'All Types' },
    { id: 'ebook', name: 'E-Books' },
    { id: 'pdf', name: 'PDF Guides' },
    { id: 'video', name: 'Videos' },
    { id: 'audio', name: 'Audio' },
    { id: 'tool', name: 'Tools' },
    { id: 'guide', name: 'Guides' }
  ]

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    const matchesType = selectedType === 'all' || resource.type === selectedType
    return matchesSearch && matchesCategory && matchesType
  })

  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return b.rating - a.rating
      case 'popular':
        return b.downloads - a.downloads
      case 'rating':
        return b.rating - a.rating
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      default:
        return 0
    }
  })

  const featuredResources = sortedResources.filter(resource => resource.featured)
  const regularResources = sortedResources.filter(resource => !resource.featured)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ebook': return BookOpen
      case 'pdf': return FileText
      case 'video': return Video
      case 'audio': return Headphones
      case 'tool': return Link2
      case 'guide': return FileText
      default: return FileText
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
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
          className="orb orb-orange w-[600px] h-[600px] -top-48 -right-48"
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
          className="orb orb-red w-[500px] h-[500px] -bottom-32 -left-32"
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
            Resource <span className="gradient-text">Library</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Curated collection of books, guides, tools, and resources to support your healing journey
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
                    <p className="text-sm text-gray-600">Total Resources</p>
                    <p className="text-2xl font-bold text-orange-700">340</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-orange-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Downloads</p>
                    <p className="text-2xl font-bold text-orange-700">125K</p>
                  </div>
                  <Download className="h-8 w-8 text-orange-600 opacity-20" />
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
                    <p className="text-2xl font-bold text-orange-700">4.7</p>
                  </div>
                  <Star className="h-8 w-8 text-orange-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Free Resources</p>
                    <p className="text-2xl font-bold text-orange-700">68%</p>
                  </div>
                  <Heart className="h-8 w-8 text-orange-600 opacity-20" />
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
                placeholder="Search resources, topics, or authors..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="featured">Featured First</option>
              <option value="popular">Most Downloaded</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white/70 text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {types.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedType === type.id
                    ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="h-6 w-6 text-yellow-500 mr-2" />
              Featured Resources
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredResources.map((resource, index) => {
                const TypeIcon = getTypeIcon(resource.type)
                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="feature-card border-l-4 border-l-yellow-400">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                              {resource.premium && (
                                <Badge variant="outline" className="border-orange-300 text-orange-600">
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg hover:text-orange-600 cursor-pointer">
                              {resource.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <TypeIcon className="h-4 w-4" />
                              <span className="capitalize">{resource.type}</span>
                              <span>•</span>
                              <span>by {resource.author}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {resource.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span>{resource.rating}</span>
                              <span>({resource.reviews})</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              <span>{resource.downloads.toLocaleString()}</span>
                            </div>
                          </div>
                          <Badge className={getDifficultyColor(resource.difficulty)}>
                            {resource.difficulty}
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          <Button className="btn-primary flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            {resource.premium ? 'Get Premium' : 'Download Free'}
                          </Button>
                          <Button variant="outline" size="sm">
                            <BookmarkPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* All Resources */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularResources.map((resource, index) => {
              const TypeIcon = getTypeIcon(resource.type)
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="feature-card">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <TypeIcon className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base hover:text-orange-600 cursor-pointer">
                              {resource.title}
                            </CardTitle>
                            <p className="text-xs text-gray-500">by {resource.author}</p>
                          </div>
                        </div>
                        {resource.premium && (
                          <Badge variant="outline" className="border-orange-300 text-orange-600 text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{resource.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {resource.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>{resource.rating}</span>
                        </div>
                        <Badge className={`${getDifficultyColor(resource.difficulty)} text-xs`}>
                          {resource.difficulty}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="btn-secondary flex-1">
                          <Download className="h-3 w-3 mr-1" />
                          {resource.premium ? 'Premium' : 'Free'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <BookmarkPlus className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>

        {sortedResources.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function LibraryPage() {
  return (
    <AuthProvider>
      <LibraryContent />
    </AuthProvider>
  )
}