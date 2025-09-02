'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { 
  Trophy,
  Users,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Award,
  Target,
  Calendar,
  Clock,
  Star,
  ChevronRight,
  Sparkles,
  UserPlus,
  Gift,
  Zap,
  Shield,
  Crown
} from 'lucide-react'

interface Challenge {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly'
  category: string
  participants: number
  startDate: string
  endDate: string
  reward: {
    points: number
    badge?: string
  }
  progress?: number
  isJoined?: boolean
}

interface SuccessStory {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  title: string
  content: string
  patterns: string[]
  breakthroughMoment: string
  timeToSuccess: string
  likes: number
  comments: number
  isLiked?: boolean
  createdAt: string
}

interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  points: number
  streak: number
  badges: number
  helpfulVotes: number
}

interface BuddyMatch {
  id: string
  userName: string
  commonPatterns: string[]
  matchScore: number
  timezone: string
  preferredSupport: string[]
  bio: string
  isOnline: boolean
}

export function CommunityEngagement({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState('challenges')
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [buddyMatches, setBuddyMatches] = useState<BuddyMatch[]>([])
  const [userStats, setUserStats] = useState({
    points: 0,
    rank: 0,
    streak: 0,
    badges: []
  })
  const supabase = createClient()

  useEffect(() => {
    loadCommunityData()
  }, [userId])

  const loadCommunityData = async () => {
    // Load all community data
    await Promise.all([
      loadChallenges(),
      loadSuccessStories(),
      loadLeaderboard(),
      loadBuddyMatches(),
      loadUserStats()
    ])
  }

  const loadChallenges = async () => {
    // Sample challenges data
    setChallenges([
      {
        id: '1',
        title: '7-Day Mindfulness Journey',
        description: 'Practice mindfulness for 10 minutes daily and track your patterns',
        type: 'weekly',
        category: 'Mindfulness',
        participants: 234,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        reward: { points: 100, badge: 'mindful-warrior' },
        progress: 43,
        isJoined: true
      },
      {
        id: '2',
        title: 'Pattern Breaker Challenge',
        description: 'Identify and work on breaking one negative pattern this month',
        type: 'monthly',
        category: 'Growth',
        participants: 567,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        reward: { points: 500, badge: 'pattern-breaker' },
        progress: 0,
        isJoined: false
      },
      {
        id: '3',
        title: 'Daily Gratitude',
        description: 'Share 3 things you\'re grateful for each day',
        type: 'daily',
        category: 'Positivity',
        participants: 892,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        reward: { points: 20 },
        progress: 100,
        isJoined: true
      }
    ])
  }

  const loadSuccessStories = async () => {
    // Sample success stories
    setSuccessStories([
      {
        id: '1',
        userId: 'user1',
        userName: 'Sarah M.',
        title: 'How I Overcame My Anxiety Patterns',
        content: 'After 3 months of tracking my patterns, I finally understood that my anxiety was triggered by perfectionism. Using the pattern insights, I learned to recognize early warning signs and apply coping strategies before spiraling.',
        patterns: ['Anxiety', 'Perfectionism', 'Overthinking'],
        breakthroughMoment: 'Realizing that my fear of failure was actually fear of not being perfect',
        timeToSuccess: '3 months',
        likes: 234,
        comments: 45,
        isLiked: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Michael R.',
        title: 'Breaking Free from Negative Self-Talk',
        content: 'The pattern analysis showed me how my inner critic was connected to childhood experiences. With the community\'s support and daily exercises, I\'ve transformed my self-talk and feel more confident than ever.',
        patterns: ['Self-Criticism', 'Low Self-Esteem'],
        breakthroughMoment: 'Understanding that my inner critic was trying to protect me',
        timeToSuccess: '6 weeks',
        likes: 189,
        comments: 32,
        isLiked: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ])
  }

  const loadLeaderboard = async () => {
    // Sample leaderboard data
    setLeaderboard([
      { rank: 1, userId: 'user1', userName: 'Emma W.', points: 2340, streak: 45, badges: 12, helpfulVotes: 234 },
      { rank: 2, userId: 'user2', userName: 'James L.', points: 2180, streak: 38, badges: 10, helpfulVotes: 189 },
      { rank: 3, userId: 'user3', userName: 'Sofia K.', points: 1950, streak: 31, badges: 9, helpfulVotes: 156 },
      { rank: 4, userId: 'user4', userName: 'David M.', points: 1820, streak: 28, badges: 8, helpfulVotes: 143 },
      { rank: 5, userId: 'user5', userName: 'Luna P.', points: 1750, streak: 25, badges: 7, helpfulVotes: 128 }
    ])
  }

  const loadBuddyMatches = async () => {
    // Sample buddy matches
    setBuddyMatches([
      {
        id: '1',
        userName: 'Alex T.',
        commonPatterns: ['Anxiety', 'Overthinking'],
        matchScore: 92,
        timezone: 'PST',
        preferredSupport: ['Daily check-ins', 'Voice calls'],
        bio: 'Working through anxiety patterns. Love meditation and journaling.',
        isOnline: true
      },
      {
        id: '2',
        userName: 'Jordan K.',
        commonPatterns: ['Perfectionism', 'Stress'],
        matchScore: 87,
        timezone: 'EST',
        preferredSupport: ['Text messages', 'Weekly calls'],
        bio: 'Recovery journey from perfectionism. Here to support and grow together.',
        isOnline: false
      }
    ])
  }

  const loadUserStats = async () => {
    setUserStats({
      points: 1250,
      rank: 23,
      streak: 14,
      badges: ['early-bird', 'helpful-heart', 'pattern-explorer']
    })
  }

  const joinChallenge = async (challengeId: string) => {
    // Join challenge logic
    setChallenges(prev => prev.map(c => 
      c.id === challengeId ? { ...c, isJoined: true, participants: c.participants + 1 } : c
    ))
  }

  const likeStory = async (storyId: string) => {
    // Like story logic
    setSuccessStories(prev => prev.map(s =>
      s.id === storyId ? { ...s, isLiked: !s.isLiked, likes: s.isLiked ? s.likes - 1 : s.likes + 1 } : s
    ))
  }

  const connectWithBuddy = async (buddyId: string) => {
    // Send buddy request
    console.log('Connecting with buddy:', buddyId)
  }

  return (
    <div className="space-y-6">
      {/* User Stats Header */}
      <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">Your Community Impact</h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">{userStats.points} points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold">{userStats.streak} day streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  <span className="font-semibold">Rank #{userStats.rank}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {userStats.badges.slice(0, 3).map((badge, i) => (
                <Badge key={i} className="bg-white text-teal-700">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="stories">Success Stories</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="buddies">Find Buddies</TabsTrigger>
        </TabsList>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4">
            {challenges.map(challenge => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </div>
                    <Badge variant={challenge.type === 'daily' ? 'default' : challenge.type === 'weekly' ? 'secondary' : 'outline'}>
                      {challenge.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{challenge.participants} participants</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span>{challenge.reward.points} points</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days left</span>
                      </div>
                    </div>
                    
                    {challenge.isJoined ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Your progress</span>
                          <span className="font-semibold">{challenge.progress}%</span>
                        </div>
                        <Progress value={challenge.progress} className="h-2" />
                      </div>
                    ) : (
                      <Button 
                        onClick={() => joinChallenge(challenge.id)}
                        className="w-full"
                      >
                        Join Challenge
                        <Sparkles className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Success Stories Tab */}
        <TabsContent value="stories" className="space-y-4">
          {successStories.map(story => (
            <Card key={story.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{story.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{story.userName}</h3>
                      <p className="text-sm text-gray-500">{story.timeToSuccess} journey</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => likeStory(story.id)}
                    className={story.isLiked ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 ${story.isLiked ? 'fill-current' : ''}`} />
                    <span className="ml-1">{story.likes}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-bold text-lg">{story.title}</h4>
                <p className="text-gray-700">{story.content}</p>
                
                <div className="bg-teal-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-teal-700 mb-1">Breakthrough Moment:</p>
                  <p className="text-sm text-gray-700">{story.breakthroughMoment}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {story.patterns.map((pattern, i) => (
                    <Badge key={i} variant="secondary">{pattern}</Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <button className="flex items-center gap-1 hover:text-gray-700">
                    <MessageCircle className="h-4 w-4" />
                    <span>{story.comments} comments</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-gray-700">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Champions</CardTitle>
              <CardDescription>Recognizing members who make a difference</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map(entry => (
                  <div key={entry.userId} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                        entry.rank === 2 ? 'bg-gray-100 text-gray-700' :
                        entry.rank === 3 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {entry.rank}
                      </div>
                      <Avatar>
                        <AvatarFallback>{entry.userName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{entry.userName}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{entry.points} points</span>
                          <span>•</span>
                          <span>{entry.streak} day streak</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-semibold">{entry.badges}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-semibold">{entry.helpfulVotes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Find Buddies Tab */}
        <TabsContent value="buddies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Find Your Support Buddy</CardTitle>
              <CardDescription>Connect with someone on a similar journey</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            {buddyMatches.map(buddy => (
              <Card key={buddy.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{buddy.userName[0]}</AvatarFallback>
                        </Avatar>
                        {buddy.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold">{buddy.userName}</h3>
                          <p className="text-sm text-gray-500">{buddy.timezone} timezone</p>
                        </div>
                        <p className="text-sm text-gray-700">{buddy.bio}</p>
                        <div className="flex flex-wrap gap-2">
                          {buddy.commonPatterns.map((pattern, i) => (
                            <Badge key={i} variant="outline">{pattern}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-1 text-teal-600">
                        <Shield className="h-4 w-4" />
                        <span className="font-semibold">{buddy.matchScore}% match</span>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => connectWithBuddy(buddy.id)}
                      >
                        Connect
                        <UserPlus className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}