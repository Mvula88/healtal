'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Share2,
  Plus,
  Heart,
  MessageCircle,
  BookOpen,
  FileText,
  Image,
  Link2,
  Send,
  ChevronRight,
  Clock,
  Eye,
  Star,
  TrendingUp,
  Users,
  Upload,
  X,
  Check
} from 'lucide-react'

interface SharedItem {
  id: string
  type: 'story' | 'resource' | 'tip' | 'question'
  title: string
  content: string
  author: string
  tags: string[]
  likes: number
  views: number
  comments: number
  created_at: string
  featured: boolean
  attachments?: {
    type: 'image' | 'link' | 'file'
    url: string
    title: string
  }[]
}

function ShareContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showShareForm, setShowShareForm] = useState(false)
  const [shareForm, setShareForm] = useState({
    type: 'story',
    title: '',
    content: '',
    tags: '',
    category: 'general'
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchSharedItems()
  }, [])

  const fetchSharedItems = async () => {
    try {
      // Simulate API call with sample data
      setTimeout(() => {
        setSharedItems([
          {
            id: '1',
            type: 'story',
            title: 'The morning routine that changed my life',
            content: 'After struggling with depression for years, I discovered that a simple 10-minute morning routine completely transformed my mental state. Here\'s what I do every single day...',
            author: 'Sarah M.',
            tags: ['morning-routine', 'depression', 'self-care', 'habits'],
            likes: 89,
            views: 543,
            comments: 23,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            featured: true
          },
          {
            id: '2',
            type: 'resource',
            title: 'Free meditation app that actually works',
            content: 'I\'ve tried dozens of meditation apps, and this one finally made it click for me. It\'s completely free and has guided sessions specifically for anxiety and trauma recovery.',
            author: 'Mike J.',
            tags: ['meditation', 'anxiety', 'apps', 'free-resources'],
            likes: 67,
            views: 234,
            comments: 15,
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            featured: false,
            attachments: [{
              type: 'link',
              url: 'https://example.com',
              title: 'Insight Timer - Free Meditation App'
            }]
          },
          {
            id: '3',
            type: 'tip',
            title: 'The 5-minute rule for overwhelming tasks',
            content: 'When I feel overwhelmed by something I need to do, I commit to just 5 minutes. Most of the time, I end up continuing, but even if I don\'t, I\'ve made progress.',
            author: 'Elena R.',
            tags: ['productivity', 'overwhelm', 'procrastination', 'tips'],
            likes: 134,
            views: 789,
            comments: 31,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            featured: true
          },
          {
            id: '4',
            type: 'question',
            title: 'How do you handle setbacks in recovery?',
            content: 'I\'ve been doing well for months, but had a difficult day yesterday and almost relapsed. I didn\'t, but I\'m feeling shaken. How do others handle these moments?',
            author: 'David K.',
            tags: ['recovery', 'setbacks', 'support', 'advice-needed'],
            likes: 45,
            views: 156,
            comments: 18,
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            featured: false
          },
          {
            id: '5',
            type: 'resource',
            title: 'Boundary setting worksheet I created',
            content: 'I made this worksheet to help me practice setting boundaries in different situations. It\'s been incredibly helpful for my codependency recovery. Feel free to use it!',
            author: 'Luna R.',
            tags: ['boundaries', 'codependency', 'worksheets', 'tools'],
            likes: 78,
            views: 267,
            comments: 12,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            featured: false,
            attachments: [{
              type: 'file',
              url: '/downloads/boundary-worksheet.pdf',
              title: 'Boundary Setting Worksheet.pdf'
            }]
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching shared items:', error)
      setLoading(false)
    }
  }

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }

    setSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSubmitted(true)
      setTimeout(() => {
        setShowShareForm(false)
        setSubmitted(false)
        setShareForm({
          type: 'story',
          title: '',
          content: '',
          tags: '',
          category: 'general'
        })
        // Refresh shared items
        fetchSharedItems()
      }, 2000)
    } catch (error) {
      console.error('Error sharing:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'story': return BookOpen
      case 'resource': return Link2
      case 'tip': return Star
      case 'question': return MessageCircle
      default: return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'story': return 'bg-purple-100 text-purple-600'
      case 'resource': return 'bg-blue-100 text-blue-600'
      case 'tip': return 'bg-yellow-100 text-yellow-600'
      case 'question': return 'bg-green-100 text-green-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
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
          className="orb orb-green w-[600px] h-[600px] -top-48 -right-48"
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
          className="orb orb-emerald w-[500px] h-[500px] -bottom-32 -left-32"
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
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Share & <span className="gradient-text">Connect</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Share your experiences, resources, and insights to help others on their journey
          </p>
          
          <Button 
            onClick={() => setShowShareForm(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Share Something
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
                    <p className="text-sm text-gray-600">Shared Items</p>
                    <p className="text-2xl font-bold text-green-700">1,234</p>
                  </div>
                  <Share2 className="h-8 w-8 text-green-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-green-700">87.5K</p>
                  </div>
                  <Eye className="h-8 w-8 text-green-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Helpful Hearts</p>
                    <p className="text-2xl font-bold text-green-700">23.1K</p>
                  </div>
                  <Heart className="h-8 w-8 text-green-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Contributors</p>
                    <p className="text-2xl font-bold text-green-700">456</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Share Types */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="feature-card">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What can you share?</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-purple-50">
                  <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm text-purple-900">Stories</h3>
                  <p className="text-xs text-purple-600">Recovery journeys, breakthroughs, challenges</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50">
                  <Link2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm text-blue-900">Resources</h3>
                  <p className="text-xs text-blue-600">Apps, books, tools, websites</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-50">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm text-yellow-900">Tips</h3>
                  <p className="text-xs text-yellow-600">Quick advice, life hacks, strategies</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50">
                  <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm text-green-900">Questions</h3>
                  <p className="text-xs text-green-600">Seek advice, start discussions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shared Items */}
        <div className="space-y-6">
          {sharedItems.map((item, index) => {
            const TypeIcon = getTypeIcon(item.type)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`feature-card ${item.featured ? 'border-l-4 border-l-yellow-400' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg hover:text-green-600 cursor-pointer">
                              {item.title}
                            </CardTitle>
                            {item.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">
                                {item.author.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>{item.author}</span>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.type}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-600 mb-4">{item.content}</p>
                    
                    {item.attachments && item.attachments.length > 0 && (
                      <div className="mb-4">
                        {item.attachments.map((attachment, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            {attachment.type === 'link' && <Link2 className="h-4 w-4 text-blue-600" />}
                            {attachment.type === 'file' && <FileText className="h-4 w-4 text-green-600" />}
                            {attachment.type === 'image' && <Image className="h-4 w-4 text-purple-600" />}
                            <span className="text-sm text-gray-700">{attachment.title}</span>
                            <Button size="sm" variant="ghost" className="ml-auto">
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                          <Heart className="h-4 w-4" />
                          <span>{item.likes}</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{item.views}</span>
                        </div>
                        <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span>{item.comments}</span>
                        </button>
                      </div>
                      <Button size="sm" variant="ghost" className="text-green-600">
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </main>

      {/* Share Modal */}
      {showShareForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {!submitted ? (
              <form onSubmit={handleShare} className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Share with Community</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShareForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What are you sharing?
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { value: 'story', label: 'Story', icon: BookOpen },
                        { value: 'resource', label: 'Resource', icon: Link2 },
                        { value: 'tip', label: 'Tip', icon: Star },
                        { value: 'question', label: 'Question', icon: MessageCircle }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setShareForm(prev => ({ ...prev, type: value }))}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            shareForm.type === value
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="h-5 w-5 mx-auto mb-1" />
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <Input
                      placeholder="Give your share a compelling title..."
                      value={shareForm.title}
                      onChange={(e) => setShareForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <Textarea
                      placeholder="Share your experience, resource, tip, or question..."
                      className="min-h-32"
                      value={shareForm.content}
                      onChange={(e) => setShareForm(prev => ({ ...prev, content: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <Input
                      placeholder="recovery, anxiety, mindfulness (comma-separated)"
                      value={shareForm.tags}
                      onChange={(e) => setShareForm(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowShareForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Sharing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Share
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-8 h-8 text-green-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Shared Successfully!</h3>
                <p className="text-gray-600">
                  Your contribution has been shared with the community. Thank you for helping others!
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default function SharePage() {
  return (
    <AuthProvider>
      <ShareContent />
    </AuthProvider>
  )
}