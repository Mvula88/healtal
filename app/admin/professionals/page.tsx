'use client'

import { useState, useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import {
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react'

interface Professional {
  id: string
  name: string
  title: string
  specialization: string
  email: string
  phone: string
  location: string
  website: string
  bio: string
  verified: boolean
  rating: number
  referral_count: number
  created_at: string
}

export default function ProfessionalsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null)
  const [newProfessional, setNewProfessional] = useState({
    name: '',
    title: '',
    specialization: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    bio: '',
    verified: false
  })
  const supabase = createClient()

  useEffect(() => {
    if (user?.email === 'ismaelmvula@gmail.com') {
      fetchProfessionals()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchProfessionals = async () => {
    try {
      // Check if professionals table exists, if not use mock data
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error && error.code === '42P01') {
        // Table doesn't exist, use mock data
        const mockProfessionals: Professional[] = [
          {
            id: '1',
            name: 'Dr. Sarah Johnson',
            title: 'Clinical Psychologist',
            specialization: 'Anxiety & Depression',
            email: 'sarah.johnson@example.com',
            phone: '+1 234-567-8900',
            location: 'New York, NY',
            website: 'www.drsarahjohnson.com',
            bio: 'Specializing in cognitive behavioral therapy with 15 years of experience.',
            verified: true,
            rating: 4.8,
            referral_count: 23,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Michael Chen',
            title: 'Licensed Therapist',
            specialization: 'Relationship Counseling',
            email: 'michael.chen@example.com',
            phone: '+1 234-567-8901',
            location: 'Los Angeles, CA',
            website: 'www.chentherapy.com',
            bio: 'Helping couples and individuals navigate relationship challenges.',
            verified: true,
            rating: 4.9,
            referral_count: 18,
            created_at: new Date().toISOString()
          }
        ]
        setProfessionals(mockProfessionals)
      } else if (data) {
        setProfessionals(data)
      }
    } catch (error) {
      console.error('Error fetching professionals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfessional = async () => {
    try {
      if (editingProfessional) {
        // Update existing
        const { error } = await supabase
          .from('professionals')
          .update(newProfessional)
          .eq('id', editingProfessional.id)

        if (!error) {
          await fetchProfessionals()
          setShowAddModal(false)
          setEditingProfessional(null)
        }
      } else {
        // Create new
        const { error } = await supabase
          .from('professionals')
          .insert({
            ...newProfessional,
            rating: 0,
            referral_count: 0
          })

        if (!error) {
          await fetchProfessionals()
          setShowAddModal(false)
        }
      }
    } catch (error) {
      console.error('Error saving professional:', error)
      // For mock data, just update local state
      if (editingProfessional) {
        setProfessionals(professionals.map(p => 
          p.id === editingProfessional.id 
            ? { ...p, ...newProfessional }
            : p
        ))
      } else {
        setProfessionals([...professionals, {
          id: String(Date.now()),
          ...newProfessional,
          rating: 0,
          referral_count: 0,
          created_at: new Date().toISOString()
        } as Professional])
      }
      setShowAddModal(false)
      setEditingProfessional(null)
    }
  }

  const handleDeleteProfessional = async (id: string) => {
    if (confirm('Are you sure you want to remove this professional?')) {
      try {
        const { error } = await supabase
          .from('professionals')
          .delete()
          .eq('id', id)

        if (!error) {
          await fetchProfessionals()
        }
      } catch (error) {
        // For mock data
        setProfessionals(professionals.filter(p => p.id !== id))
      }
    }
  }

  const filteredProfessionals = professionals.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <h1 className="text-3xl font-bold text-gray-900">Professional Network</h1>
            <p className="text-gray-600 mt-2">
              Manage verified mental health professionals for referrals
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Professionals</p>
                    <p className="text-2xl font-bold">{professionals.length}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Verified</p>
                    <p className="text-2xl font-bold">
                      {professionals.filter(p => p.verified).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Referrals</p>
                    <p className="text-2xl font-bold">
                      {professionals.reduce((sum, p) => sum + p.referral_count, 0)}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold">
                      {professionals.length > 0 
                        ? (professionals.reduce((sum, p) => sum + p.rating, 0) / professionals.length).toFixed(1)
                        : '0.0'}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Actions */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search professionals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => {
                  setEditingProfessional(null)
                  setNewProfessional({
                    name: '',
                    title: '',
                    specialization: '',
                    email: '',
                    phone: '',
                    location: '',
                    website: '',
                    bio: '',
                    verified: false
                  })
                  setShowAddModal(true)
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Professional
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Professionals List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <Card className="col-span-2">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">Loading professionals...</p>
                </CardContent>
              </Card>
            ) : filteredProfessionals.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No professionals found</p>
                </CardContent>
              </Card>
            ) : (
              filteredProfessionals.map((professional) => (
                <Card key={professional.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{professional.name}</h3>
                        <p className="text-sm text-gray-600">{professional.title}</p>
                      </div>
                      <div className="flex gap-1">
                        {professional.verified && (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{professional.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{professional.email}</span>
                      </div>
                      {professional.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{professional.phone}</span>
                        </div>
                      )}
                      {professional.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span>{professional.website}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Specialization:</strong> {professional.specialization}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {professional.rating.toFixed(1)}
                        </span>
                        <span>{professional.referral_count} referrals</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1"
                        onClick={() => {
                          setEditingProfessional(professional)
                          setNewProfessional({
                            name: professional.name,
                            title: professional.title,
                            specialization: professional.specialization,
                            email: professional.email,
                            phone: professional.phone,
                            location: professional.location,
                            website: professional.website,
                            bio: professional.bio,
                            verified: professional.verified
                          })
                          setShowAddModal(true)
                        }}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm"
                        onClick={() => handleDeleteProfessional(professional.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Add/Edit Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl">
                <CardHeader>
                  <CardTitle>
                    {editingProfessional ? 'Edit Professional' : 'Add Professional'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newProfessional.name}
                          onChange={(e) => setNewProfessional({...newProfessional, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newProfessional.title}
                          onChange={(e) => setNewProfessional({...newProfessional, title: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={newProfessional.specialization}
                        onChange={(e) => setNewProfessional({...newProfessional, specialization: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newProfessional.email}
                          onChange={(e) => setNewProfessional({...newProfessional, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newProfessional.phone}
                          onChange={(e) => setNewProfessional({...newProfessional, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={newProfessional.location}
                          onChange={(e) => setNewProfessional({...newProfessional, location: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={newProfessional.website}
                          onChange={(e) => setNewProfessional({...newProfessional, website: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={newProfessional.bio}
                        onChange={(e) => setNewProfessional({...newProfessional, bio: e.target.value})}
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="verified"
                        checked={newProfessional.verified}
                        onChange={(e) => setNewProfessional({...newProfessional, verified: e.target.checked})}
                      />
                      <Label htmlFor="verified">Verified Professional</Label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setShowAddModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfessional}>
                        {editingProfessional ? 'Update' : 'Add'} Professional
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