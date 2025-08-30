'use client'

import { useState, useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import {
  Compass,
  Users,
  Clock,
  TrendingUp,
  ChevronRight,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'
import { format } from 'date-fns'

interface UserJourneyProgress {
  id: string
  user_id: string
  journey_id: string
  current_step: number
  started_at: string
  completed_at: string | null
  journey: {
    name: string
    steps: any[]
    estimated_duration_weeks: number
  }
  user: {
    email: string
    full_name: string
  }
}

export default function JourneysManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeJourneys, setActiveJourneys] = useState<UserJourneyProgress[]>([])
  const [completedJourneys, setCompletedJourneys] = useState<UserJourneyProgress[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (user?.email === 'ismaelmvula@gmail.com') {
      fetchJourneyData()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchJourneyData = async () => {
    try {
      // Fetch active journeys
      const { data: active } = await supabase
        .from('user_journey_progress')
        .select(`
          *,
          journey:growth_journeys(*),
          user:profiles(email, full_name)
        `)
        .is('completed_at', null)
        .order('started_at', { ascending: false })

      if (active) {
        setActiveJourneys(active as any)
      }

      // Fetch completed journeys
      const { data: completed } = await supabase
        .from('user_journey_progress')
        .select(`
          *,
          journey:growth_journeys(*),
          user:profiles(email, full_name)
        `)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(10)

      if (completed) {
        setCompletedJourneys(completed as any)
      }
    } catch (error) {
      console.error('Error fetching journey data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (user?.email !== 'ismaelmvula@gmail.com') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Admin Access Required</CardTitle>
            <CardDescription>
              This page is restricted to administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Journey Management</h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage user progress through growth journeys
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Journeys</p>
                    <p className="text-2xl font-bold">{activeJourneys.length}</p>
                  </div>
                  <Compass className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold">{completedJourneys.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Progress</p>
                    <p className="text-2xl font-bold">
                      {activeJourneys.length > 0 
                        ? Math.round(activeJourneys.reduce((acc, j) => 
                            acc + (j.current_step / j.journey.steps.length * 100), 0) / activeJourneys.length)
                        : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">
                      {new Set([...activeJourneys, ...completedJourneys].map(j => j.user_id)).size}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Journeys */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Active Journeys</CardTitle>
              <CardDescription>Users currently progressing through journeys</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">User</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Journey</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Progress</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Started</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                          Loading journey data...
                        </td>
                      </tr>
                    ) : activeJourneys.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                          No active journeys
                        </td>
                      </tr>
                    ) : (
                      activeJourneys.map((progress) => (
                        <tr key={progress.id} className="border-b">
                          <td className="py-3">
                            <p className="text-sm font-medium">
                              {progress.user?.full_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">{progress.user?.email}</p>
                          </td>
                          <td className="py-3">
                            <p className="text-sm">{progress.journey.name}</p>
                            <p className="text-xs text-gray-500">
                              Step {progress.current_step + 1} of {progress.journey.steps.length}
                            </p>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full"
                                  style={{ 
                                    width: `${(progress.current_step / progress.journey.steps.length) * 100}%` 
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-600">
                                {Math.round((progress.current_step / progress.journey.steps.length) * 100)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-sm text-gray-500">
                            {format(new Date(progress.started_at), 'MMM d, yyyy')}
                          </td>
                          <td className="py-3 text-right">
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Completed Journeys */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Completed</CardTitle>
              <CardDescription>Journeys completed in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {completedJourneys.length === 0 ? (
                <p className="text-center py-4 text-gray-500">No completed journeys yet</p>
              ) : (
                <div className="space-y-3">
                  {completedJourneys.map((progress) => (
                    <div key={progress.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">
                          {progress.user?.full_name || 'Unknown'} completed {progress.journey.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Completed on {format(new Date(progress.completed_at!), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}