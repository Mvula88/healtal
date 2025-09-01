'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { Navbar } from '@/components/navigation/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageSquare,
  Users,
  Heart,
  Reply,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Pin,
  ChevronRight,
  Plus
} from 'lucide-react'

interface ForumPost {
  id: string
  title: string
  content: string
  author: string
  category: string
  replies: number
  likes: number
  views: number
  pinned: boolean
  created_at: string
  last_reply: string
}

function ForumsContent() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/community/forums')
      const data = await response.json()
      if (data.success) {
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      // Set some default posts for now
      setPosts([
        {
          id: '1',
          title: 'How I overcame my anxiety after 10 years',
          content: 'Sharing my journey...',
          author: 'Sarah M.',
          category: 'anxiety',
          replies: 23,
          likes: 45,
          views: 312,
          pinned: true,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          last_reply: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'Daily check-in thread - Share your wins!',
          content: 'Let\'s celebrate our progress together',
          author: 'Community',
          category: 'general',
          replies: 67,
          likes: 89,
          views: 523,
          pinned: true,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          last_reply: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: 'Meditation techniques that actually work',
          content: 'I\'ve tried many techniques...',
          author: 'Mike J.',
          category: 'wellness',
          replies: 15,
          likes: 32,
          views: 189,
          pinned: false,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          last_reply: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'All Topics', count: posts.length },
    { id: 'general', name: 'General', count: 12 },
    { id: 'anxiety', name: 'Anxiety', count: 8 },
    { id: 'depression', name: 'Depression', count: 6 },
    { id: 'relationships', name: 'Relationships', count: 9 },
    { id: 'wellness', name: 'Wellness', count: 11 }
  ]

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const pinnedPosts = filteredPosts.filter(p => p.pinned)
  const regularPosts = filteredPosts.filter(p => !p.pinned)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <MessageSquare className="h-3 w-3 mr-1" />
            Community Forums
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Connect & <span className="gradient-text">Share</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join discussions, share experiences, and support each other
          </p>
        </motion.div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search discussions..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Start Discussion
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-purple-100 text-purple-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{category.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {category.count}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Discussions</span>
                    <span className="font-semibold">{posts.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Members</span>
                    <span className="font-semibold">1,234</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Replies</span>
                    <span className="font-semibold">5,678</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Posts List */}
          <div className="lg:col-span-3 space-y-4">
            {/* Pinned Posts */}
            {pinnedPosts.length > 0 && (
              <>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Pin className="h-4 w-4" />
                  Pinned Discussions
                </h3>
                {pinnedPosts.map(post => (
                  <Card key={post.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg hover:text-purple-600 cursor-pointer">
                            {post.title}
                          </h4>
                          <p className="text-gray-600 mt-1">{post.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span>by {post.author}</span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post.replies} replies
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post.likes}
                            </span>
                            <span>{post.views} views</span>
                          </div>
                        </div>
                        <Badge>{post.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {/* Regular Posts */}
            {regularPosts.length > 0 && (
              <>
                <h3 className="font-semibold text-lg mt-6">Recent Discussions</h3>
                {regularPosts.map(post => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg hover:text-purple-600 cursor-pointer">
                            {post.title}
                          </h4>
                          <p className="text-gray-600 mt-1">{post.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span>by {post.author}</span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post.replies} replies
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post.likes}
                            </span>
                            <span>{post.views} views</span>
                          </div>
                        </div>
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {filteredPosts.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No discussions found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ForumsPage() {
  return (
    <AuthProvider>
      <ForumsContent />
    </AuthProvider>
  )
}