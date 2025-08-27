'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { APP_CONFIG } from '@/lib/config'
import { 
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Battery,
  BatteryLow,
  Heart,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Shield,
  Target,
  MessageCircle
} from 'lucide-react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'

interface DailyCheckIn {
  id: string
  mood_score: number
  energy_level: number
  anxiety_level: number
  triggers_today: string[]
  patterns_noticed: string[]
  coping_strategies_used: string[]
  quick_note: string
  created_at: string
}

interface MoodEmoji {
  score: number
  emoji: string
  label: string
  color: string
}

const moodEmojis: MoodEmoji[] = [
  { score: 1, emoji: '😔', label: 'Very Low', color: 'text-red-500' },
  { score: 2, emoji: '😟', label: 'Low', color: 'text-orange-500' },
  { score: 3, emoji: '😐', label: 'Neutral', color: 'text-yellow-500' },
  { score: 4, emoji: '🙂', label: 'Good', color: 'text-green-500' },
  { score: 5, emoji: '😊', label: 'Great', color: 'text-emerald-500' }
]

const commonTriggers = [
  'Work stress', 'Relationship conflict', 'Financial worry', 'Health concerns',
  'Social anxiety', 'Isolation', 'Sleep issues', 'Family dynamics',
  'Overwhelming tasks', 'Negative thoughts', 'Past memories', 'Uncertainty'
]

const copingStrategies = [
  'Deep breathing', 'Meditation', 'Exercise', 'Journaling',
  'Talking to friend', 'Music', 'Nature walk', 'Creative activity',
  'Rest', 'Therapy tools', 'Affirmations', 'Boundaries'
]

function CheckInContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null)
  const [weekCheckIns, setWeekCheckIns] = useState<DailyCheckIn[]>([])
  
  // Form state
  const [moodScore, setMoodScore] = useState(3)
  const [energyLevel, setEnergyLevel] = useState(3)
  const [anxietyLevel, setAnxietyLevel] = useState(3)
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [selectedCoping, setSelectedCoping] = useState<string[]>([])
  const [quickNote, setQuickNote] = useState('')
  const [showInsights, setShowInsights] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchCheckIns()
    }
  }, [user])

  const fetchCheckIns = async () => {
    try {
      // Get today's check-in
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data: todayData } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', today.toISOString())
        .single()
      
      if (todayData) {
        setTodayCheckIn(todayData)
        setShowInsights(true)
      }
      
      // Get this week's check-ins
      const weekStart = startOfWeek(new Date())
      const { data: weekData } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', weekStart.toISOString())
        .order('created_at', { ascending: false })
      
      if (weekData) {
        setWeekCheckIns(weekData)
      }
    } catch (error) {
      console.error('Error fetching check-ins:', error)
    }
  }

  const submitCheckIn = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .insert({
          user_id: user.id,
          mood_score: moodScore,
          energy_level: energyLevel,
          anxiety_level: anxietyLevel,
          triggers_today: selectedTriggers,
          patterns_noticed: [],
          coping_strategies_used: selectedCoping,
          quick_note: quickNote
        })
        .select()
        .single()
      
      if (error) throw error
      
      if (data) {
        setTodayCheckIn(data)
        setShowInsights(true)
        await fetchCheckIns()
      }
    } catch (error) {
      console.error('Error submitting check-in:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    )
  }

  const toggleCoping = (strategy: string) => {
    setSelectedCoping(prev => 
      prev.includes(strategy) 
        ? prev.filter(s => s !== strategy)
        : [...prev, strategy]
    )
  }

  const getWeekdayCheckins = () => {
    const weekStart = startOfWeek(new Date())
    const days = []
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i)
      const checkIn = weekCheckIns.find(c => 
        isSameDay(new Date(c.created_at), date)
      )
      days.push({
        date,
        checkIn,
        dayName: format(date, 'EEE')
      })
    }
    
    return days
  }

  const calculateTrend = () => {
    if (weekCheckIns.length < 2) return 'stable'
    
    const recentAvg = weekCheckIns.slice(0, 3).reduce((sum, c) => sum + c.mood_score, 0) / 3
    const olderAvg = weekCheckIns.slice(3, 6).reduce((sum, c) => sum + c.mood_score, 0) / 3
    
    if (recentAvg > olderAvg + 0.5) return 'improving'
    if (recentAvg < olderAvg - 0.5) return 'declining'
    return 'stable'
  }

  const trend = calculateTrend()

  if (todayCheckIn && showInsights) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Today's Check-in Complete!
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setShowInsights(false)}
                >
                  View Check-in Form
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Today's Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl mb-2">
                      {moodEmojis.find(m => m.score === todayCheckIn.mood_score)?.emoji}
                    </div>
                    <p className="text-sm text-gray-600">Mood</p>
                    <p className="font-semibold">
                      {moodEmojis.find(m => m.score === todayCheckIn.mood_score)?.label}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl mb-2">
                      {todayCheckIn.energy_level >= 4 ? '⚡' : todayCheckIn.energy_level >= 2 ? '🔋' : '🪫'}
                    </div>
                    <p className="text-sm text-gray-600">Energy</p>
                    <p className="font-semibold">{todayCheckIn.energy_level}/5</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl mb-2">
                      {todayCheckIn.anxiety_level <= 2 ? '😌' : todayCheckIn.anxiety_level <= 3 ? '😰' : '😟'}
                    </div>
                    <p className="text-sm text-gray-600">Anxiety</p>
                    <p className="font-semibold">{todayCheckIn.anxiety_level}/5</p>
                  </CardContent>
                </Card>
              </div>

              {/* Week Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">This Week's Pattern</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    {getWeekdayCheckins().map((day) => (
                      <div 
                        key={day.dayName}
                        className="text-center"
                      >
                        <p className="text-xs text-gray-600 mb-1">{day.dayName}</p>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isSameDay(day.date, new Date()) ? 'ring-2 ring-primary' : ''
                        } ${
                          day.checkIn ? 'bg-primary/10' : 'bg-gray-100'
                        }`}>
                          {day.checkIn ? (
                            <span className="text-lg">
                              {moodEmojis.find(m => m.score === day.checkIn.mood_score)?.emoji}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {trend === 'improving' ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : trend === 'declining' ? (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      ) : (
                        <Activity className="h-5 w-5 text-blue-500" />
                      )}
                      <span className="font-medium">
                        {trend === 'improving' ? 'Improving trend' :
                         trend === 'declining' ? 'Needs attention' :
                         'Stable pattern'}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => router.push('/insights')}
                    >
                      View Insights
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Triggers & Coping */}
              {(todayCheckIn.triggers_today.length > 0 || todayCheckIn.coping_strategies_used.length > 0) && (
                <div className="grid md:grid-cols-2 gap-4">
                  {todayCheckIn.triggers_today.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          Today's Triggers
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {todayCheckIn.triggers_today.map(trigger => (
                            <Badge key={trigger} variant="secondary">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {todayCheckIn.coping_strategies_used.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Strategies Used
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {todayCheckIn.coping_strategies_used.map(strategy => (
                            <Badge key={strategy} variant="default">
                              {strategy}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Quick Note */}
              {todayCheckIn.quick_note && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Today's Reflection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{todayCheckIn.quick_note}</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Daily Check-in
            </CardTitle>
            <CardDescription>
              Take a moment to reflect on how you're feeling today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mood Selection */}
            <div>
              <Label className="text-base mb-3 block">How's your mood today?</Label>
              <div className="flex justify-between">
                {moodEmojis.map((mood) => (
                  <button
                    key={mood.score}
                    onClick={() => setMoodScore(mood.score)}
                    className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                      moodScore === mood.score 
                        ? 'bg-primary/10 ring-2 ring-primary' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-3xl mb-1">{mood.emoji}</span>
                    <span className="text-xs text-gray-600">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <Label className="text-base mb-3 block">Energy Level</Label>
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setEnergyLevel(level)}
                    className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                      energyLevel === level 
                        ? 'bg-primary/10 ring-2 ring-primary' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {level <= 2 ? (
                      <BatteryLow className="h-6 w-6 mb-1 text-orange-500" />
                    ) : level <= 4 ? (
                      <Battery className="h-6 w-6 mb-1 text-yellow-500" />
                    ) : (
                      <Zap className="h-6 w-6 mb-1 text-green-500" />
                    )}
                    <span className="text-xs text-gray-600">{level}/5</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Anxiety Level */}
            <div>
              <Label className="text-base mb-3 block">Anxiety Level</Label>
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setAnxietyLevel(level)}
                    className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                      anxietyLevel === level 
                        ? 'bg-primary/10 ring-2 ring-primary' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full mb-1 ${
                      level <= 2 ? 'bg-green-500' :
                      level <= 3 ? 'bg-yellow-500' :
                      level <= 4 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`} />
                    <span className="text-xs text-gray-600">{level}/5</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Triggers */}
            <div>
              <Label className="text-base mb-3 block">Any triggers today?</Label>
              <div className="flex flex-wrap gap-2">
                {commonTriggers.map((trigger) => (
                  <Badge
                    key={trigger}
                    variant={selectedTriggers.includes(trigger) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTrigger(trigger)}
                  >
                    {trigger}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Coping Strategies */}
            <div>
              <Label className="text-base mb-3 block">Coping strategies used</Label>
              <div className="flex flex-wrap gap-2">
                {copingStrategies.map((strategy) => (
                  <Badge
                    key={strategy}
                    variant={selectedCoping.includes(strategy) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCoping(strategy)}
                  >
                    {strategy}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Quick Note */}
            <div>
              <Label htmlFor="note" className="text-base mb-3 block">
                Quick reflection (optional)
              </Label>
              <Textarea
                id="note"
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="Any thoughts or patterns you noticed today?"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button 
              onClick={submitCheckIn}
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete Check-in'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckInPage() {
  return (
    <AuthProvider>
      <CheckInContent />
    </AuthProvider>
  )
}