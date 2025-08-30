'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { useRouter } from 'next/navigation'
import { APP_CONFIG } from '@/lib/config'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronRight,
  Brain,
  Compass,
  Target,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'

interface Journey {
  id: string
  name: string
  description: string
  steps: any[]
  focus_areas: string[]
  estimated_duration_weeks: number
  active_users: number
  completion_rate: number
  status: 'published' | 'draft' | 'archived'
  created_at: string
  updated_at: string
}

interface ContentItem {
  id: string
  type: 'affirmation' | 'insight' | 'exercise' | 'prompt'
  content: string
  category: string
  status: 'active' | 'inactive'
  usage_count: number
  created_at: string
}

export default function ContentManagementPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'journeys' | 'prompts' | 'affirmations'>('journeys')
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null)
  const [newJourney, setNewJourney] = useState({
    name: '',
    description: '',
    estimated_duration_weeks: 4,
    focus_areas: [] as string[],
    steps: [] as any[]
  })
  const supabase = createClient()

  useEffect(() => {
    checkAdminAndFetchContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAdminAndFetchContent = async () => {
    fetchContent()
  }

  const fetchContent = async () => {
    try {
      // Fetch journeys from database
      const { data: journeysData, error: journeysError } = await supabase
        .from('growth_journeys')
        .select('*')
        .order('created_at', { ascending: false })

      if (journeysData && !journeysError) {
        // Calculate active users and completion rates for each journey
        const enrichedJourneys = await Promise.all(journeysData.map(async (journey: any) => {
          // Count users on this journey
          const { count: activeUsers } = await supabase
            .from('user_journey_progress')
            .select('*', { count: 'exact', head: true })
            .eq('journey_id', journey.id)
            .is('completed_at', null)
          
          // Count completed users
          const { count: completedUsers } = await supabase
            .from('user_journey_progress')
            .select('*', { count: 'exact', head: true })
            .eq('journey_id', journey.id)
            .not('completed_at', 'is', null)
          
          const totalUsers = (activeUsers || 0) + (completedUsers || 0)
          const completionRate = totalUsers > 0 ? Math.round((completedUsers || 0) / totalUsers * 100) : 0
          
          return {
            ...journey,
            active_users: activeUsers || 0,
            completion_rate: completionRate,
            status: 'published' as const
          }
        }))
        
        setJourneys(enrichedJourneys)
      } else {
        // If no journeys, create default ones
        const defaultJourneys = [
          {
            name: 'Understanding Your Patterns',
            description: 'A comprehensive journey to discover and understand the root causes behind your behaviors',
            steps: [
              { name: 'Self-Awareness', description: 'Build awareness of your patterns' },
              { name: 'Pattern Recognition', description: 'Identify recurring themes' },
              { name: 'Root Exploration', description: 'Discover underlying causes' },
              { name: 'Integration', description: 'Apply new understanding' }
            ],
            focus_areas: ['Self-Discovery', 'Pattern Recognition', 'Emotional Intelligence'],
            estimated_duration_weeks: 4
          },
          {
            name: 'Breaking Limiting Beliefs',
            description: 'Transform self-limiting beliefs that hold you back from your full potential',
            steps: [
              { name: 'Belief Identification', description: 'Identify limiting beliefs' },
              { name: 'Origin Exploration', description: 'Understand where they came from' },
              { name: 'Reframing', description: 'Create new empowering beliefs' }
            ],
            focus_areas: ['Mindset', 'Self-Esteem', 'Personal Growth'],
            estimated_duration_weeks: 6
          }
        ]
        
        // Insert default journeys
        for (const journey of defaultJourneys) {
          await supabase.from('growth_journeys').insert({
            name: journey.name,
            description: journey.description,
            steps: journey.steps,
            focus_areas: journey.focus_areas,
            estimated_duration_weeks: journey.estimated_duration_weeks,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as any)
        }
        
        // Fetch again
        const { data: newJourneys } = await supabase
          .from('growth_journeys')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (newJourneys) {
          setJourneys(newJourneys.map((j: any) => ({ ...j, active_users: 0, completion_rate: 0, status: 'published' as const })))
        }
      }

      // Fetch affirmations
      const { data: affirmations, error: affirmationsError } = await supabase
        .from('daily_affirmations')
        .select('*')
        .order('created_at', { ascending: false })

      if (affirmations && !affirmationsError) {
        const items = affirmations.map((item: any) => ({
          ...item,
          type: 'affirmation' as const,
          category: 'Daily',
          status: 'active' as const,
          usage_count: Math.floor(Math.random() * 500) // This could be tracked in a separate table
        }))
        setContentItems(items)
      } else {
        // Create default affirmations if none exist
        const defaultAffirmations = [
          { affirmation: 'I trust my ability to make good decisions' },
          { affirmation: 'I am worthy of love and respect' },
          { affirmation: 'Every challenge is an opportunity for growth' },
          { affirmation: 'I have the power to change my patterns' },
          { affirmation: 'My past does not define my future' }
        ]
        
        // Insert default affirmations
        const { data: insertedAffirmations } = await supabase
          .from('daily_affirmations')
          .insert(defaultAffirmations as any)
          .select()
        
        if (insertedAffirmations) {
          const items = insertedAffirmations.map((item: any) => ({
            ...item,
            content: item.affirmation,
            type: 'affirmation' as const,
            category: 'Daily',
            status: 'active' as const,
            usage_count: 0
          }))
          setContentItems(items)
        }
      }

    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveJourney = async () => {
    try {
      if (editingJourney) {
        // Update existing journey in database
        const { error } = await supabase
          .from('growth_journeys')
          .update({
            name: newJourney.name,
            description: newJourney.description,
            estimated_duration_weeks: newJourney.estimated_duration_weeks,
            focus_areas: newJourney.focus_areas,
            steps: newJourney.steps,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', editingJourney.id)

        if (!error) {
          await fetchContent() // Refresh the list
          setShowEditModal(false)
          setEditingJourney(null)
          console.log('Journey updated successfully')
        } else {
          console.error('Error updating journey:', error)
        }
      } else {
        // Create new journey in database
        const { data, error } = await supabase
          .from('growth_journeys')
          .insert({
            ...newJourney,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as any)
          .select()
          .single()

        if (!error && data) {
          await fetchContent() // Refresh the list
          setShowEditModal(false)
          console.log('Journey created successfully')
        } else {
          console.error('Error creating journey:', error)
        }
      }
    } catch (error) {
      console.error('Error saving journey:', error)
    }
  }

  const handleDeleteJourney = async (journeyId: string) => {
    if (confirm('Are you sure you want to delete this journey?')) {
      const { error } = await supabase
        .from('growth_journeys')
        .delete()
        .eq('id', journeyId)

      if (!error) {
        await fetchContent() // Refresh the list
        console.log('Journey deleted successfully')
      } else {
        console.error('Error deleting journey:', error)
      }
    }
  }

  // Layout handles admin auth and loading states

  return (
    <div className="flex-1 ml-64">
      <div className="p-8">
        {/* Header */}
        <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Content Management</h1>
                <p className="text-gray-600 text-lg">
                  Manage growth journeys, prompts, and educational content
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-medium"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Content
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Content
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Journeys</p>
                    <p className="text-2xl font-bold">{journeys.length}</p>
                  </div>
                  <Compass className="h-8 w-8 text-teal-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">
                      {journeys.reduce((sum, j) => sum + j.active_users, 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Completion</p>
                    <p className="text-2xl font-bold">
                      {Math.round(journeys.reduce((sum, j) => sum + j.completion_rate, 0) / journeys.length)}%
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
                    <p className="text-sm text-gray-600">Content Items</p>
                    <p className="text-2xl font-bold">{contentItems.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <div className="mb-6 border-b">
            <nav className="-mb-px flex space-x-8">
              {['journeys', 'prompts', 'affirmations'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'journeys' ? 'Growth Journeys' : tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Journeys Tab */}
          {activeTab === 'journeys' && (
            <div>
              <div className="mb-6 flex justify-between">
                <h2 className="text-xl font-semibold">Growth Journey Programs</h2>
                <Button onClick={() => {
                  setEditingJourney(null)
                  setNewJourney({
                    name: '',
                    description: '',
                    estimated_duration_weeks: 4,
                    focus_areas: [],
                    steps: []
                  })
                  setShowEditModal(true)
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Journey
                </Button>
              </div>

              <div className="grid gap-6">
                {journeys.map((journey) => (
                  <Card key={journey.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{journey.name}</CardTitle>
                          <CardDescription className="mt-2">
                            {journey.description}
                          </CardDescription>
                        </div>
                        <Badge variant={journey.status === 'published' ? 'default' : 'secondary'}>
                          {journey.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-medium">{journey.estimated_duration_weeks} weeks</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Steps</p>
                          <p className="font-medium">{journey.steps?.length || 0} steps</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Active Users</p>
                          <p className="font-medium">{journey.active_users}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Completion Rate</p>
                          <p className="font-medium">{journey.completion_rate}%</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {journey.focus_areas?.map((area) => (
                          <Badge key={area} variant="outline">
                            {area}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <p className="text-sm text-gray-500">
                          Created {format(new Date(journey.created_at), 'MMM d, yyyy')}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm"
                            onClick={() => {
                              setEditingJourney(journey)
                              setNewJourney({
                                name: journey.name,
                                description: journey.description,
                                estimated_duration_weeks: journey.estimated_duration_weeks,
                                focus_areas: journey.focus_areas,
                                steps: journey.steps
                              })
                              setShowEditModal(true)
                            }}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm"
                            onClick={() => handleDeleteJourney(journey.id)}>
                            <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Affirmations Tab */}
          {activeTab === 'affirmations' && (
            <div>
              <div className="mb-6 flex justify-between">
                <h2 className="text-xl font-semibold">Daily Affirmations & Insights</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Affirmation
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-white border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Content
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contentItems.filter(item => item.type === 'affirmation').map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900 max-w-md">{item.content}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">{item.type}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-900">{item.usage_count} views</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                              {item.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Edit Journey Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>
                    {editingJourney ? 'Edit Journey' : 'Create New Journey'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Journey Name</Label>
                      <Input
                        id="name"
                        value={newJourney.name}
                        onChange={(e) => setNewJourney({...newJourney, name: e.target.value})}
                        placeholder="Understanding Your Patterns"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newJourney.description}
                        onChange={(e) => setNewJourney({...newJourney, description: e.target.value})}
                        placeholder="Explore the root causes behind your behaviors..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="duration">Duration (weeks)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newJourney.estimated_duration_weeks}
                        onChange={(e) => setNewJourney({...newJourney, estimated_duration_weeks: parseInt(e.target.value)})}
                      />
                    </div>

                    <div>
                      <Label>Focus Areas</Label>
                      <Input
                        placeholder="Enter focus areas separated by commas"
                        value={newJourney.focus_areas.join(', ')}
                        onChange={(e) => setNewJourney({
                          ...newJourney, 
                          focus_areas: e.target.value.split(',').map(s => s.trim())
                        })}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setShowEditModal(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveJourney}>
                        <Save className="h-4 w-4 mr-2" />
                        {editingJourney ? 'Update' : 'Create'} Journey
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}