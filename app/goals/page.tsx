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
import { Textarea } from '@/components/ui/textarea'
import { 
  Target,
  Trophy,
  Clock,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  Calendar,
  TrendingUp,
  Flag,
  Star
} from 'lucide-react'

interface Goal {
  id: string
  title: string
  description: string
  category: string
  target_date: string
  progress: number
  status: 'active' | 'completed' | 'paused'
  milestones: Milestone[]
  created_at: string
}

interface Milestone {
  id: string
  title: string
  completed: boolean
  due_date: string
}

function GoalsContent() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'personal',
    target_date: ''
  })

  useEffect(() => {
    if (user) {
      fetchGoals()
    }
  }, [user])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      const data = await response.json()
      if (data.success) {
        setGoals(data.goals || [])
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const createGoal = async () => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal)
      })
      const data = await response.json()
      if (data.success) {
        await fetchGoals()
        setShowNewGoal(false)
        setNewGoal({ title: '', description: '', category: 'personal', target_date: '' })
      }
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const updateGoalProgress = async (goalId: string, progress: number) => {
    try {
      await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress })
      })
      await fetchGoals()
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return
    
    try {
      await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE'
      })
      await fetchGoals()
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <Target className="h-3 w-3 mr-1" />
            Goal Setting
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Your <span className="gradient-text">Goals & Aspirations</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Set meaningful goals, track your progress, and celebrate your achievements
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
                  <p className="text-sm text-gray-600">Active Goals</p>
                  <p className="text-2xl font-bold">{activeGoals.length}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{completedGoals.length}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On Track</p>
                  <p className="text-2xl font-bold">
                    {activeGoals.filter(g => g.progress >= 50).length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">
                    {goals.filter(g => {
                      const created = new Date(g.created_at)
                      const now = new Date()
                      return created.getMonth() === now.getMonth() && 
                             created.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add New Goal Button */}
        <div className="flex justify-end mb-6">
          <Button onClick={() => setShowNewGoal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Set New Goal
          </Button>
        </div>

        {/* New Goal Form */}
        {showNewGoal && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Create New Goal</CardTitle>
                <CardDescription>Define your goal and set a target date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Goal Title</Label>
                    <Input
                      placeholder="e.g., Complete anxiety management program"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe what you want to achieve..."
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={newGoal.category}
                        onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                      >
                        <option value="personal">Personal</option>
                        <option value="health">Health</option>
                        <option value="career">Career</option>
                        <option value="relationships">Relationships</option>
                        <option value="financial">Financial</option>
                      </select>
                    </div>
                    <div>
                      <Label>Target Date</Label>
                      <Input
                        type="date"
                        value={newGoal.target_date}
                        onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={createGoal} disabled={!newGoal.title || !newGoal.target_date}>
                      Create Goal
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewGoal(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Goals List */}
        <div className="space-y-6">
          {goals.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
                <p className="text-gray-600 mb-4">Start by setting your first goal</p>
                <Button onClick={() => setShowNewGoal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Set Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Active Goals */}
              {activeGoals.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Active Goals</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {activeGoals.map(goal => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{goal.title}</CardTitle>
                                <CardDescription>{goal.description}</CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteGoal(goal.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                  <span>Progress</span>
                                  <span>{goal.progress}%</span>
                                </div>
                                <Progress value={goal.progress} className="h-2" />
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <Badge variant="outline">{goal.category}</Badge>
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {new Date(goal.target_date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => updateGoalProgress(goal.id, Math.min(goal.progress + 10, 100))}
                              >
                                Update Progress
                                <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Goals */}
              {completedGoals.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Completed Goals</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {completedGoals.map(goal => (
                      <Card key={goal.id} className="opacity-75">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{goal.title}</h4>
                              <p className="text-sm text-gray-600">{goal.description}</p>
                            </div>
                            <Trophy className="h-8 w-8 text-yellow-500" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default function GoalsPage() {
  return (
    <AuthProvider>
      <GoalsContent />
    </AuthProvider>
  )
}