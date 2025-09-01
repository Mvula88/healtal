'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  PlayCircle,
  Clock,
  Users,
  Star,
  BookOpen,
  Award,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  Play,
  Lock,
  Unlock,
  CheckCircle,
  TrendingUp,
  Target,
  Brain,
  Heart,
  Shield
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  instructor_bio: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  lessons: number
  students: number
  rating: number
  reviews: number
  price: number
  original_price?: number
  preview_video?: string
  what_you_learn: string[]
  requirements: string[]
  topics: string[]
  featured: boolean
  bestseller: boolean
  new_course: boolean
  completion_certificate: boolean
  created_at: string
  thumbnail: string
  progress?: number
  enrolled?: boolean
}

function CoursesContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [sortBy, setSortBy] = useState('featured')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      // Simulate API call with sample data
      setTimeout(() => {
        setCourses([
          {
            id: '1',
            title: 'Understanding Your Behavioral Patterns',
            description: 'Dive deep into the psychology behind your behaviors. Learn to identify triggers, understand root causes, and develop healthier coping mechanisms.',
            instructor: 'Dr. Sarah Mitchell',
            instructor_bio: 'Licensed psychologist with 15+ years in addiction recovery',
            category: 'self-discovery',
            level: 'beginner',
            duration: '6 weeks',
            lessons: 24,
            students: 2847,
            rating: 4.9,
            reviews: 342,
            price: 97,
            original_price: 147,
            what_you_learn: [
              'Identify your unique behavioral patterns',
              'Understand the psychology of habit formation',
              'Recognize emotional and environmental triggers',
              'Develop personalized coping strategies',
              'Create sustainable behavior change plans'
            ],
            requirements: ['Open mind and willingness to self-reflect', 'Journal or note-taking materials'],
            topics: ['pattern-recognition', 'triggers', 'psychology', 'coping-strategies'],
            featured: true,
            bestseller: true,
            new_course: false,
            completion_certificate: true,
            created_at: '2024-01-15',
            thumbnail: '/course-thumbnails/behavioral-patterns.jpg',
            enrolled: user ? Math.random() > 0.5 : false,
            progress: user && Math.random() > 0.5 ? Math.floor(Math.random() * 100) : undefined
          },
          {
            id: '2',
            title: 'Trauma-Informed Recovery Fundamentals',
            description: 'Learn evidence-based approaches to understanding and healing from trauma. Gentle, compassionate methods for processing difficult experiences.',
            instructor: 'Dr. Elena Rodriguez',
            instructor_bio: 'Trauma specialist and EMDR certified therapist',
            category: 'trauma-healing',
            level: 'intermediate',
            duration: '8 weeks',
            lessons: 32,
            students: 1567,
            rating: 4.8,
            reviews: 198,
            price: 127,
            what_you_learn: [
              'Understand trauma responses and their impact',
              'Learn somatic regulation techniques',
              'Practice self-compassion and grounding',
              'Develop a personal healing toolkit',
              'Create safety in your recovery journey'
            ],
            requirements: ['Basic understanding of mental health concepts', 'Commitment to gentle self-care'],
            topics: ['trauma', 'somatic', 'regulation', 'self-compassion'],
            featured: true,
            bestseller: false,
            new_course: false,
            completion_certificate: true,
            created_at: '2024-01-22',
            thumbnail: '/course-thumbnails/trauma-recovery.jpg'
          },
          {
            id: '3',
            title: 'Mindful Recovery: 30-Day Challenge',
            description: 'A comprehensive 30-day program combining mindfulness meditation with recovery principles. Build a sustainable daily practice.',
            instructor: 'Marcus Chen',
            instructor_bio: 'Meditation teacher and recovery coach with 8 years sobriety',
            category: 'mindfulness',
            level: 'beginner',
            duration: '30 days',
            lessons: 30,
            students: 3421,
            rating: 4.7,
            reviews: 456,
            price: 67,
            original_price: 97,
            what_you_learn: [
              'Establish a daily mindfulness practice',
              'Use meditation for craving management',
              'Develop emotional regulation skills',
              'Practice loving-kindness for self and others',
              'Integrate mindfulness into daily recovery'
            ],
            requirements: ['No prior meditation experience needed', '10-15 minutes daily commitment'],
            topics: ['mindfulness', 'meditation', 'daily-practice', 'emotional-regulation'],
            featured: false,
            bestseller: true,
            new_course: false,
            completion_certificate: true,
            created_at: '2024-02-01',
            thumbnail: '/course-thumbnails/mindful-recovery.jpg'
          },
          {
            id: '4',
            title: 'Building Healthy Relationships After Codependency',
            description: 'Learn to create balanced, healthy relationships. Understand attachment styles, set boundaries, and develop secure relationship patterns.',
            instructor: 'Dr. Jennifer Walsh',
            instructor_bio: 'Relationship therapist specializing in codependency recovery',
            category: 'relationships',
            level: 'intermediate',
            duration: '10 weeks',
            lessons: 40,
            students: 1876,
            rating: 4.6,
            reviews: 234,
            price: 157,
            what_you_learn: [
              'Understand attachment styles and their impact',
              'Learn to set and maintain healthy boundaries',
              'Develop secure relationship communication',
              'Practice self-worth independent of others',
              'Create relationship patterns that serve you'
            ],
            requirements: ['Willingness to examine relationship patterns', 'Basic self-awareness'],
            topics: ['codependency', 'boundaries', 'attachment', 'communication'],
            featured: false,
            bestseller: false,
            new_course: true,
            completion_certificate: true,
            created_at: '2024-02-15',
            thumbnail: '/course-thumbnails/healthy-relationships.jpg'
          },
          {
            id: '5',
            title: 'Digital Detox & Mindful Technology Use',
            description: 'Break free from digital addiction patterns. Learn to use technology intentionally while maintaining real-world connections and presence.',
            instructor: 'Alex Turner',
            instructor_bio: 'Former tech executive, digital wellness advocate',
            category: 'digital-wellness',
            level: 'beginner',
            duration: '4 weeks',
            lessons: 16,
            students: 987,
            rating: 4.5,
            reviews: 134,
            price: 47,
            what_you_learn: [
              'Identify digital addiction patterns',
              'Create healthy technology boundaries',
              'Develop offline activities and hobbies',
              'Practice digital mindfulness techniques',
              'Build sustainable long-term habits'
            ],
            requirements: ['Smartphone and willingness to change habits'],
            topics: ['digital-detox', 'technology', 'mindfulness', 'habits'],
            featured: false,
            bestseller: false,
            new_course: true,
            completion_certificate: true,
            created_at: '2024-02-10',
            thumbnail: '/course-thumbnails/digital-detox.jpg'
          },
          {
            id: '6',
            title: 'Anxiety to Empowerment: Comprehensive Recovery',
            description: 'Transform anxiety from a limitation into a source of strength. Learn evidence-based techniques for managing and overcoming anxiety disorders.',
            instructor: 'Dr. Michael Stevens',
            instructor_bio: 'Clinical psychologist specializing in anxiety disorders',
            category: 'mental-health',
            level: 'intermediate',
            duration: '12 weeks',
            lessons: 48,
            students: 2156,
            rating: 4.8,
            reviews: 289,
            price: 187,
            original_price: 247,
            what_you_learn: [
              'Understand the neuroscience of anxiety',
              'Master cognitive behavioral techniques',
              'Practice exposure therapy safely',
              'Develop panic attack management skills',
              'Create an anxiety recovery action plan'
            ],
            requirements: ['Commitment to practice techniques daily', 'Journal for tracking progress'],
            topics: ['anxiety', 'cbt', 'exposure-therapy', 'neuroscience'],
            featured: true,
            bestseller: false,
            new_course: false,
            completion_certificate: true,
            created_at: '2024-01-08',
            thumbnail: '/course-thumbnails/anxiety-recovery.jpg'
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'All Categories', count: courses.length },
    { id: 'self-discovery', name: 'Self Discovery', count: 8 },
    { id: 'trauma-healing', name: 'Trauma Healing', count: 5 },
    { id: 'mindfulness', name: 'Mindfulness', count: 12 },
    { id: 'relationships', name: 'Relationships', count: 6 },
    { id: 'digital-wellness', name: 'Digital Wellness', count: 4 },
    { id: 'mental-health', name: 'Mental Health', count: 15 }
  ]

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ]

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel
    return matchesSearch && matchesCategory && matchesLevel
  })

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return b.rating - a.rating
      case 'popular':
        return b.students - a.students
      case 'rating':
        return b.rating - a.rating
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      default:
        return 0
    }
  })

  const handleEnrollCourse = (course: Course) => {
    if (!user) {
      router.push('/login')
      return
    }
    // Handle course enrollment
    console.log('Enrolling in course:', course.title)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          className="orb orb-violet w-[600px] h-[600px] -top-48 -right-48"
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
          className="orb orb-fuchsia w-[500px] h-[500px] -bottom-32 -left-32"
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
            Recovery <span className="gradient-text">Courses</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expert-led courses designed to guide you through your healing journey with evidence-based approaches
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
                    <p className="text-sm text-gray-600">Active Courses</p>
                    <p className="text-2xl font-bold text-violet-700">42</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-violet-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="text-2xl font-bold text-violet-700">12.8K</p>
                  </div>
                  <Users className="h-8 w-8 text-violet-600 opacity-20" />
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
                    <p className="text-2xl font-bold text-violet-700">4.8</p>
                  </div>
                  <Star className="h-8 w-8 text-violet-600 opacity-20" />
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
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-violet-700">89%</p>
                  </div>
                  <Award className="h-8 w-8 text-violet-600 opacity-20" />
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
                placeholder="Search courses, instructors, or topics..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="featured">Featured First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
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
                      ? 'bg-violet-500 text-white shadow-lg'
                      : 'bg-white/70 text-gray-600 hover:text-violet-600 hover:bg-violet-50'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            {/* Level Filter */}
            <div className="flex gap-2">
              {levels.map(level => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedLevel === level.id
                      ? 'bg-violet-100 text-violet-700 border-2 border-violet-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-600'
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sortedCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`feature-card ${course.featured ? 'border-l-4 border-l-yellow-400' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {course.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                        )}
                        {course.bestseller && (
                          <Badge className="bg-orange-100 text-orange-800">Bestseller</Badge>
                        )}
                        {course.new_course && (
                          <Badge className="bg-green-100 text-green-800">New</Badge>
                        )}
                        <Badge className={getLevelColor(course.level)}>
                          {course.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl hover:text-violet-600 cursor-pointer mb-2">
                        {course.title}
                      </CardTitle>
                      <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm bg-violet-100 text-violet-600">
                            {course.instructor.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{course.instructor}</p>
                          <p className="text-xs text-gray-500">{course.instructor_bio}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {course.enrolled && course.progress !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-500">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <PlayCircle className="h-4 w-4" />
                      <span>{course.lessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{course.rating}</span>
                      <span className="text-sm text-gray-500">({course.reviews} reviews)</span>
                    </div>
                    {course.completion_certificate && (
                      <Badge variant="outline" className="text-xs border-violet-300 text-violet-600">
                        <Award className="h-3 w-3 mr-1" />
                        Certificate
                      </Badge>
                    )}
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2">What you'll learn:</h4>
                    <ul className="space-y-1">
                      {course.what_you_learn.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {course.what_you_learn.length > 3 && (
                        <li className="text-xs text-gray-500">
                          +{course.what_you_learn.length - 3} more learning objectives
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-violet-700">${course.price}</span>
                      {course.original_price && (
                        <span className="text-sm text-gray-500 line-through">${course.original_price}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {course.preview_video && (
                        <Button size="sm" variant="outline">
                          <Play className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                      )}
                      <Button 
                        className={`${course.enrolled ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => handleEnrollCourse(course)}
                      >
                        {course.enrolled ? (
                          <>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Continue
                          </>
                        ) : (
                          <>
                            <BookOpen className="h-4 w-4 mr-2" />
                            Enroll Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {sortedCourses.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Why Choose Our Courses */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="feature-card bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Why Choose Our Recovery Courses?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-6 w-6 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Evidence-Based Content</h3>
                  <p className="text-gray-600 text-sm">All courses are built on proven therapeutic approaches and scientific research</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-6 w-6 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Compassionate Approach</h3>
                  <p className="text-gray-600 text-sm">Created by experts who understand the challenges of recovery firsthand</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Safe Learning Environment</h3>
                  <p className="text-gray-600 text-sm">Learn at your own pace in a supportive, non-judgmental space</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

export default function CoursesPage() {
  return (
    <AuthProvider>
      <CoursesContent />
    </AuthProvider>
  )
}