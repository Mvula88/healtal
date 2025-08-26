'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { 
  Users,
  Heart,
  MessageCircle,
  TrendingUp,
  Shield,
  Plus,
  Search,
  Filter,
  ThumbsUp,
  Share2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

interface CommunityPost {
  id: string
  user_id: string
  title: string | null
  content: string
  is_anonymous: boolean
  tags: string[]
  likes: number
  created_at: string
  updated_at: string
  user?: {
    full_name: string
    avatar_url: string | null
  }
  comments_count?: number
  has_liked?: boolean
}

interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  is_anonymous: boolean
  created_at: string
  user?: {
    full_name: string
    avatar_url: string | null
  }
}

const popularTags = [
  'relationships',
  'self-discovery',
  'healing',
  'boundaries',
  'growth',
  'anxiety',
  'depression',
  'family',
  'career',
  'self-care'
]

function CommunityContent() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostTitle, setNewPostTitle] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filterTag, setFilterTag] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewPost, setShowNewPost] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPosts()
  }, [filterTag, searchQuery])

  useEffect(() => {
    if (selectedPost) {
      fetchComments(selectedPost.id)
    }
  }, [selectedPost])

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          user:users(full_name, avatar_url),
          comments:community_comments(count)
        `)
        .order('created_at', { ascending: false })

      if (filterTag) {
        query = query.contains('tags', [filterTag])
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) throw error

      if (data) {
        const postsWithCounts = data.map(post => ({
          ...post,
          comments_count: post.comments?.[0]?.count || 0,
          has_liked: false // In production, check if current user has liked
        }))
        setPosts(postsWithCounts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      const { data } = await supabase
        .from('community_comments')
        .select(`
          *,
          user:users(full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (data) setComments(data)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const createPost = async () => {
    if (!newPostContent.trim()) return

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user?.id,
          title: newPostTitle || null,
          content: newPostContent,
          is_anonymous: isAnonymous,
          tags: selectedTags
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        await fetchPosts()
        setNewPostContent('')
        setNewPostTitle('')
        setSelectedTags([])
        setIsAnonymous(false)
        setShowNewPost(false)
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    }
  }

  const addComment = async () => {
    if (!newComment.trim() || !selectedPost) return

    try {
      const { error } = await supabase
        .from('community_comments')
        .insert({
          post_id: selectedPost.id,
          user_id: user?.id,
          content: newComment,
          is_anonymous: isAnonymous
        })

      if (error) throw error

      setNewComment('')
      await fetchComments(selectedPost.id)
      await fetchPosts()
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const likePost = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId)
      if (!post) return

      await supabase
        .from('community_posts')
        .update({ likes: post.likes + 1 })
        .eq('id', postId)

      await fetchPosts()
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-600 mt-2">Connect, share, and grow with others on similar journeys</p>
        </div>

        {/* Community Guidelines Banner */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium">Community Guidelines</p>
                <p className="text-xs text-blue-700 mt-1">
                  This is a safe space for sharing and support. Be kind, respectful, and mindful of others' experiences. 
                  If you're in crisis, please seek professional help immediately (call 988).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* New Post Button/Form */}
            {!showNewPost ? (
              <Button onClick={() => setShowNewPost(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Share Your Story
              </Button>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Share with the Community</CardTitle>
                  <CardDescription>Your story can inspire and help others</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title (Optional)</Label>
                    <Input
                      id="title"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Give your post a title..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Your Story</Label>
                    <textarea
                      id="content"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share your thoughts, experiences, or questions..."
                      className="w-full mt-1 p-3 border rounded-lg min-h-[120px] resize-none"
                    />
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {popularTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-600">Post anonymously</span>
                      {isAnonymous ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </label>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={createPost} disabled={!newPostContent.trim()}>
                      Post to Community
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setShowNewPost(false)
                      setNewPostContent('')
                      setNewPostTitle('')
                      setSelectedTags([])
                    }}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search and Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search posts..."
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                      value={filterTag}
                      onChange={(e) => setFilterTag(e.target.value)}
                      className="text-sm border rounded-lg px-3 py-2"
                    >
                      <option value="">All Topics</option>
                      {popularTags.map((tag) => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">Loading community posts...</div>
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {post.is_anonymous ? (
                            <EyeOff className="h-5 w-5 text-gray-500" />
                          ) : (
                            <span className="text-sm font-medium">
                              {post.user?.full_name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {post.is_anonymous ? 'Anonymous' : post.user?.full_name || 'Community Member'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                    {post.title && (
                      <CardTitle className="text-lg mt-3">{post.title}</CardTitle>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                    
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => likePost(post.id)}
                          className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
                        >
                          <Heart className={`h-4 w-4 ${post.has_liked ? 'fill-current text-red-500' : ''}`} />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">{post.comments_count || 0}</span>
                        </button>

                        <button className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No posts yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Be the first to share your story with the community
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Posts</span>
                  <span className="font-bold">{posts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Today</span>
                  <span className="font-bold">
                    {posts.filter(p => 
                      new Date(p.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                    ).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Support Given</span>
                  <span className="font-bold">
                    {posts.reduce((acc, p) => acc + p.likes, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
                <CardDescription>Most discussed themes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {popularTags.slice(0, 5).map((tag) => {
                    const count = posts.filter(p => p.tags.includes(tag)).length
                    return (
                      <button
                        key={tag}
                        onClick={() => setFilterTag(tag)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm">{tag}</span>
                        <span className="text-xs text-gray-500">{count} posts</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Support Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                  Need Immediate Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  If you're experiencing a crisis, please reach out:
                </p>
                <div className="space-y-2">
                  <a href="tel:988" className="flex items-center text-sm text-primary hover:underline">
                    <Heart className="h-4 w-4 mr-2" />
                    988 Crisis Lifeline
                  </a>
                  <a href="sms:741741" className="flex items-center text-sm text-primary hover:underline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Text HOME to 741741
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comments Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Comments</CardTitle>
                  <button
                    onClick={() => {
                      setSelectedPost(null)
                      setComments([])
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Original Post Summary */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 line-clamp-3">{selectedPost.content}</p>
                </div>

                {/* Comments */}
                <div className="space-y-4 mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        {comment.is_anonymous ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <span className="text-xs font-medium">
                            {comment.user?.full_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {comment.is_anonymous ? 'Anonymous' : comment.user?.full_name || 'Community Member'}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {comments.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No comments yet. Be the first to respond!</p>
                  )}
                </div>

                {/* Add Comment */}
                <div className="space-y-3 border-t pt-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a supportive comment..."
                    className="w-full p-3 border rounded-lg min-h-[80px] resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-600">Comment anonymously</span>
                    </label>
                    <Button onClick={addComment} disabled={!newComment.trim()}>
                      Post Comment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
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