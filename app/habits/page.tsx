'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { Navbar } from '@/components/navigation/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  RefreshCw,
  CheckCircle,
  Circle,
  Calendar,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Clock,
  Target,
  Zap,
  Sun,
  Moon,
  Coffee
} from 'lucide-react'

interface Habit {
  id: string
  title: string
  description: string
  frequency: 'daily' | 'weekly' | 'monthly'
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'anytime'
  streak: number
  best_streak: number
  completed_today: boolean
  last_completed: string
  created_at: string
}

function HabitsContent() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewHabit, setShowNewHabit] = useState(false)
  const [newHabit, setNewHabit] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    time_of_day: 'anytime'
  })

  useEffect(() => {
    if (user) {
      fetchHabits()
    }
  }, [user])

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/habits')
      const data = await response.json()
      if (data.success) {
        setHabits(data.habits || [])
      }
    } catch (error) {
      console.error('Error fetching habits:', error)
      setHabits([])
    } finally {
      setLoading(false)
    }
  }

  const createHabit = async () => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHabit)
      })
      const data = await response.json()
      if (data.success) {
        await fetchHabits()
        setShowNewHabit(false)
        setNewHabit({ title: '', description: '', frequency: 'daily', time_of_day: 'anytime' })
      }
    } catch (error) {
      console.error('Error creating habit:', error)
    }
  }

  const markComplete = async (habitId: string) => {
    try {
      await fetch(`/api/habits/${habitId}/complete`, {
        method: 'POST'
      })
      await fetchHabits()
    } catch (error) {
      console.error('Error marking habit complete:', error)
    }
  }

  const deleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return
    
    try {
      await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE'
      })
      await fetchHabits()
    } catch (error) {
      console.error('Error deleting habit:', error)
    }
  }

  const getTimeIcon = (time: string) => {
    switch (time) {
      case 'morning': return Sun
      case 'afternoon': return Coffee
      case 'evening': return Moon
      default: return Clock
    }
  }

  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0)
  const activeHabits = habits.filter(h => h.streak > 0)
  const completedToday = habits.filter(h => h.completed_today)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

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
          <Badge className="mb-4 bg-gradient-to-r from-green-500 to-teal-500 text-white">
            <RefreshCw className="h-3 w-3 mr-1" />
            Habit Tracking
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Build <span className="gradient-text">Healthy Habits</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create positive routines and track your daily progress
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Habits</p>
                  <p className="text-2xl font-bold">{habits.length}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Streaks</p>
                  <p className="text-2xl font-bold">{activeHabits.length}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold">{completedToday.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Streak</p>
                  <p className="text-2xl font-bold">{totalStreak}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add New Habit Button */}
        <div className="flex justify-end mb-6">
          <Button onClick={() => setShowNewHabit(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Habit
          </Button>
        </div>

        {/* New Habit Form */}
        {showNewHabit && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Create New Habit</CardTitle>
                <CardDescription>Start building a positive routine</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Habit Name</Label>
                    <Input
                      placeholder="e.g., Morning meditation"
                      value={newHabit.title}
                      onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Description (optional)</Label>
                    <Input
                      placeholder="10 minutes of mindful breathing"
                      value={newHabit.description}
                      onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Frequency</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={newHabit.frequency}
                        onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value as any })}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <Label>Time of Day</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={newHabit.time_of_day}
                        onChange={(e) => setNewHabit({ ...newHabit, time_of_day: e.target.value as any })}
                      >
                        <option value="anytime">Anytime</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={createHabit} disabled={!newHabit.title}>
                      Create Habit
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewHabit(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Habits Grid */}
        {habits.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <RefreshCw className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No habits yet</h3>
              <p className="text-gray-600 mb-4">Start building your first healthy habit</p>
              <Button onClick={() => setShowNewHabit(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit, index) => {
              const TimeIcon = getTimeIcon(habit.time_of_day)
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className={habit.completed_today ? 'border-green-500' : ''}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{habit.title}</CardTitle>
                          {habit.description && (
                            <CardDescription>{habit.description}</CardDescription>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteHabit(habit.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Streak Display */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">
                              {habit.streak} day streak
                            </span>
                          </div>
                          <Badge variant="outline">
                            Best: {habit.best_streak}
                          </Badge>
                        </div>

                        {/* Frequency and Time */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="capitalize">{habit.frequency}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TimeIcon className="h-3 w-3" />
                            <span className="capitalize">{habit.time_of_day}</span>
                          </div>
                        </div>

                        {/* Complete Button */}
                        <Button
                          className={`w-full ${
                            habit.completed_today
                              ? 'bg-green-600 hover:bg-green-700'
                              : ''
                          }`}
                          variant={habit.completed_today ? 'default' : 'outline'}
                          onClick={() => !habit.completed_today && markComplete(habit.id)}
                          disabled={habit.completed_today}
                        >
                          {habit.completed_today ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Completed Today
                            </>
                          ) : (
                            <>
                              <Circle className="h-4 w-4 mr-2" />
                              Mark Complete
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default function HabitsPage() {
  return (
    <AuthProvider>
      <HabitsContent />
    </AuthProvider>
  )
}