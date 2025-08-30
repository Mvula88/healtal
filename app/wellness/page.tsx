'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { Skeleton, CardSkeleton, StatsSkeleton } from '@/components/ui/skeleton'
import { 
  Heart,
  Activity,
  TrendingUp,
  Calendar,
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Battery,
  Smile,
  Meh,
  Frown,
  CheckCircle,
  Target
} from 'lucide-react'
import { format, subDays } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

interface WellnessEntry {
  id: string
  mood_score: number
  energy_level: number
  life_satisfaction: {
    relationships: number
    work: number
    health: number
    personal_growth: number
  }
  notes: string
  created_at: string
}

const moodEmojis = [
  { value: 1, icon: Frown, label: 'Very Low' },
  { value: 2, icon: Frown, label: 'Low' },
  { value: 3, icon: Meh, label: 'Below Average' },
  { value: 4, icon: Meh, label: 'Slightly Below' },
  { value: 5, icon: Meh, label: 'Neutral' },
  { value: 6, icon: Smile, label: 'Slightly Above' },
  { value: 7, icon: Smile, label: 'Above Average' },
  { value: 8, icon: Smile, label: 'Good' },
  { value: 9, icon: Smile, label: 'Very Good' },
  { value: 10, icon: Smile, label: 'Excellent' }
]

const lifeAreas = [
  { key: 'relationships', label: 'Relationships', icon: Heart },
  { key: 'work', label: 'Work/Career', icon: Target },
  { key: 'health', label: 'Physical Health', icon: Activity },
  { key: 'personal_growth', label: 'Personal Growth', icon: TrendingUp },
]

function WellnessContent() {
  const { user } = useAuth()
  const [todayEntry, setTodayEntry] = useState<WellnessEntry | null>(null)
  const [recentEntries, setRecentEntries] = useState<WellnessEntry[]>([])
  const [moodScore, setMoodScore] = useState(5)
  const [energyLevel, setEnergyLevel] = useState(5)
  const [lifeSatisfaction, setLifeSatisfaction] = useState({
    relationships: 5,
    work: 5,
    health: 5,
    personal_growth: 5
  })
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchWellnessData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchWellnessData = async () => {
    try {
      // Check if there's already an entry for today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data: todayData } = await supabase
        .from('wellness_entries')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', today.toISOString())
        .single()

      if (todayData) {
        setTodayEntry(todayData as any)
        setMoodScore((todayData as any).mood_score || 5)
        setEnergyLevel((todayData as any).energy_level || 5)
        setLifeSatisfaction((todayData as any).life_satisfaction || lifeSatisfaction)
        setNotes((todayData as any).notes || '')
      }

      // Fetch recent entries for the chart
      const { data: recentData } = await supabase
        .from('wellness_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(30)

      if (recentData) {
        setRecentEntries(recentData.reverse())
      }
    } catch (error) {
      console.error('Error fetching wellness data:', error)
    }
  }

  const saveWellnessEntry = async () => {
    setSaving(true)
    try {
      const entryData = {
        user_id: user?.id,
        mood_score: moodScore,
        energy_level: energyLevel,
        life_satisfaction: lifeSatisfaction,
        notes: notes
      }

      if (todayEntry) {
        // Update existing entry
        await supabase
          .from('wellness_entries')
          .update(entryData as any)
          .eq('id', todayEntry.id)
      } else {
        // Create new entry
        const { data } = await supabase
          .from('wellness_entries')
          .insert(entryData as any)
          .select()
          .single()
        
        if (data) setTodayEntry(data as any)
      }

      await fetchWellnessData()
      
      // Show success message
      alert('Wellness entry saved successfully!')
    } catch (error) {
      console.error('Error saving wellness entry:', error)
      alert('Failed to save wellness entry. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const chartData = recentEntries.map(entry => ({
    date: format(new Date(entry.created_at), 'MMM d'),
    mood: entry.mood_score,
    energy: entry.energy_level
  }))

  const getMoodIcon = (score: number) => {
    const mood = moodEmojis.find(m => m.value === score)
    if (mood) {
      const Icon = mood.icon
      return <Icon className="h-6 w-6" />
    }
    return null
  }

  const averageMood = recentEntries.length > 0
    ? (recentEntries.reduce((acc, e) => acc + (e.mood_score || 0), 0) / recentEntries.length).toFixed(1)
    : '0'

  const averageEnergy = recentEntries.length > 0
    ? (recentEntries.reduce((acc, e) => acc + (e.energy_level || 0), 0) / recentEntries.length).toFixed(1)
    : '0'

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="orb orb-teal w-96 h-96 top-20 -right-20 opacity-20"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div 
          className="orb orb-cyan w-80 h-80 bottom-10 left-10 opacity-20"
          animate={{ 
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />
      </div>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Wellness Tracking</h1>
          <p className="text-gray-600 mt-2">Monitor your emotional wellness and life satisfaction</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Daily Check-in */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Today's Check-in
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(), 'EEEE, MMMM d')}
                  </span>
                </CardTitle>
                <CardDescription>
                  Take a moment to reflect on how you're feeling today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mood Score */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    How's your mood today?
                  </Label>
                  <div className="flex justify-between items-center mb-2">
                    {getMoodIcon(moodScore)}
                    <span className="text-2xl font-bold">{moodScore}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={moodScore}
                    onChange={(e) => setMoodScore(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #f59e0b 30%, #10b981 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>Neutral</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Energy Level */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Energy Level
                  </Label>
                  <div className="flex justify-between items-center mb-2">
                    <Battery className="h-6 w-6" />
                    <span className="text-2xl font-bold">{energyLevel}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #f59e0b 30%, #10b981 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Exhausted</span>
                    <span>Moderate</span>
                    <span>Energized</span>
                  </div>
                </div>

                {/* Life Satisfaction Areas */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Life Satisfaction
                  </Label>
                  <div className="space-y-3">
                    {lifeAreas.map((area) => {
                      const Icon = area.icon
                      return (
                        <div key={area.key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm flex items-center">
                              <Icon className="h-4 w-4 mr-2" />
                              {area.label}
                            </span>
                            <span className="text-sm font-medium">
                              {lifeSatisfaction[area.key as keyof typeof lifeSatisfaction]}/10
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={lifeSatisfaction[area.key as keyof typeof lifeSatisfaction]}
                            onChange={(e) => setLifeSatisfaction({
                              ...lifeSatisfaction,
                              [area.key]: parseInt(e.target.value)
                            })}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes" className="text-base font-semibold mb-2 block">
                    Reflections (Optional)
                  </Label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How are you feeling? What's on your mind?"
                    className="w-full p-3 border rounded-lg min-h-[100px] resize-none"
                  />
                </div>

                <Button 
                  onClick={saveWellnessEntry} 
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Saving...' : todayEntry ? 'Update Entry' : 'Save Entry'}
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Insights */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>30-Day Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Mood</span>
                  <span className="text-2xl font-bold">{averageMood}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Energy</span>
                  <span className="text-2xl font-bold">{averageEnergy}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Entries Logged</span>
                  <span className="text-2xl font-bold">{recentEntries.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Trend Chart */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle>Wellness Trends</CardTitle>
                <CardDescription>Your mood and energy patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="mood"
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#colorMood)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="energy"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorEnergy)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Start tracking to see your trends
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Wellness Tips */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Wellness Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Regular wellness tracking helps you identify patterns and triggers in your emotional health. 
                  Try to check in at the same time each day for the most accurate insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function WellnessPage() {
  return (
    <AuthProvider>
      <WellnessContent />
    </AuthProvider>
  )
}