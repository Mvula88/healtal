'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { Navbar } from '@/components/navigation/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Award,
  Target,
  Heart,
  Star,
  TrendingUp,
  CheckCircle,
  Edit,
  Save,
  X
} from 'lucide-react'
import { format } from 'date-fns'

interface UserProfile {
  id: string
  full_name: string
  email: string
  phone?: string
  location?: string
  bio?: string
  goals?: string[]
  interests?: string[]
  subscription_tier: 'free' | 'explore' | 'transform' | 'enterprise'
  created_at: string
  total_sessions?: number
  total_breakthroughs?: number
  current_streak?: number
}

function ProfileContent() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Edit form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      
      // First try to get user profile from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single()
      
      if (userData) {
        setProfile({
          id: userData.id,
          full_name: userData.full_name || user?.user_metadata?.full_name || 'User',
          email: user?.email || '',
          phone: userData.phone,
          location: userData.location,
          bio: userData.bio,
          goals: userData.goals || [],
          interests: userData.interests || [],
          subscription_tier: userData.subscription_tier || 'free',
          created_at: userData.created_at || user?.created_at,
          total_sessions: userData.total_sessions || 0,
          total_breakthroughs: userData.total_breakthroughs || 0,
          current_streak: userData.current_streak || 0
        })
        
        // Set edit form values
        setFullName(userData.full_name || user?.user_metadata?.full_name || '')
        setPhone(userData.phone || '')
        setLocation(userData.location || '')
        setBio(userData.bio || '')
      } else {
        // Create basic profile from auth user
        const basicProfile: UserProfile = {
          id: user?.id || '',
          full_name: user?.user_metadata?.full_name || 'User',
          email: user?.email || '',
          subscription_tier: 'free',
          created_at: user?.created_at || new Date().toISOString(),
          total_sessions: 0,
          total_breakthroughs: 0,
          current_streak: 0
        }
        setProfile(basicProfile)
        setFullName(basicProfile.full_name)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user || !profile) return
    
    setSaving(true)
    try {
      // Check if user exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()
      
      const profileData = {
        full_name: fullName,
        phone: phone || null,
        location: location || null,
        bio: bio || null,
        updated_at: new Date().toISOString()
      }
      
      if (existingUser) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update(profileData)
          .eq('id', user.id)
        
        if (error) throw error
      } else {
        // Create new user record
        const { error } = await supabase
          .from('users')
          .insert({
            id: user.id,
            ...profileData,
            subscription_tier: 'free'
          })
        
        if (error) throw error
      }
      
      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        full_name: fullName,
        phone,
        location,
        bio
      } : null)
      
      setEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form to original values
    if (profile) {
      setFullName(profile.full_name)
      setPhone(profile.phone || '')
      setLocation(profile.location || '')
      setBio(profile.bio || '')
    }
    setEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'transform': return 'bg-purple-100 text-purple-700'
      case 'explore': return 'bg-blue-100 text-blue-700'
      case 'enterprise': return 'bg-amber-100 text-amber-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 text-white shadow-xl mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24 border-4 border-white/20">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || '')}&background=fff&color=14b8a6`} />
                  <AvatarFallback className="bg-white text-teal-600 text-2xl font-bold">
                    {getInitials(profile?.full_name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{profile?.full_name}</h1>
                  <div className="flex items-center space-x-4">
                    <Badge className={`${getTierColor(profile?.subscription_tier || 'free')} capitalize`}>
                      {profile?.subscription_tier} Plan
                    </Badge>
                    <span className="text-teal-50">
                      Member since {profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => editing ? handleCancel() : setEditing(true)}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {editing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Sessions</p>
                      <p className="text-2xl font-bold">{profile?.total_sessions || 0}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-teal-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Breakthroughs</p>
                      <p className="text-2xl font-bold">{profile?.total_breakthroughs || 0}</p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Current Streak</p>
                      <p className="text-2xl font-bold">{profile?.current_streak || 0} days</p>
                    </div>
                    <Award className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                {editing ? 'Update your profile details' : 'Your personal information and preferences'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {editing ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile?.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us a bit about yourself and your wellness journey"
                        rows={4}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{profile?.email}</p>
                    </div>
                  </div>
                  
                  {profile?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{profile.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {profile?.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{profile.location}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-medium">
                        {profile?.created_at ? format(new Date(profile.created_at), 'MMMM d, yyyy') : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Subscription</p>
                      <p className="font-medium capitalize">{profile?.subscription_tier} Plan</p>
                    </div>
                  </div>
                  
                  {profile?.bio && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">About</p>
                      <p className="text-gray-700">{profile.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Button 
              variant="outline" 
              className="h-auto py-4"
              onClick={() => window.location.href = '/settings'}
            >
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2" />
                <span>Privacy Settings</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4"
              onClick={() => window.location.href = '/billing'}
            >
              <div className="text-center">
                <Award className="h-6 w-6 mx-auto mb-2" />
                <span>Manage Subscription</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4"
              onClick={() => window.location.href = '/achievements'}
            >
              <div className="text-center">
                <Target className="h-6 w-6 mx-auto mb-2" />
                <span>View Achievements</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfileContent />
    </AuthProvider>
  )
}