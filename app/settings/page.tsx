'use client'

import { motion } from 'framer-motion'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'
import { 
  User,
  Bell,
  Shield,
  CreditCard,
  Download,
  Trash2,
  Settings,
  ChevronRight,
  Moon,
  Sun,
  Volume2,
  AlertCircle,
  Check,
  X,
  Eye,
  EyeOff
} from 'lucide-react'
import { format } from 'date-fns'

interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  subscription_tier: 'free' | 'understand' | 'transform'
  created_at: string
  onboarding_completed: boolean
  preferences: {
    notifications?: {
      email_updates: boolean
      wellness_reminders: boolean
      journey_updates: boolean
      community_activity: boolean
    }
    privacy?: {
      anonymous_posts: boolean
      share_insights: boolean
      profile_visible: boolean
    }
    dark_mode?: boolean
  } | null
  emergency_contacts: Array<{ name: string; phone: string }>
  growth_goals: string[] | null
}

function SettingsContent() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [emergencyContact, setEmergencyContact] = useState({ name: '', phone: '' })
  const [notifications, setNotifications] = useState({
    email_updates: true,
    wellness_reminders: true,
    journey_updates: true,
    community_activity: false
  })
  const [privacy, setPrivacy] = useState({
    anonymous_posts: false,
    share_insights: false,
    profile_visible: true
  })
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchProfile()
      setEmail(user.email || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // User doesn't exist in users table yet - this is okay for new users
        console.log('User profile not found, will create on first save')
      } else if (data) {
        setProfile(data as any)
        setFullName((data as any).full_name || '')
        setEmergencyContact((data as any).emergency_contacts?.[0] || { name: '', phone: '' })
        setNotifications((data as any).preferences?.notifications || notifications)
        setPrivacy((data as any).preferences?.privacy || privacy)
        setDarkMode((data as any).preferences?.dark_mode || false)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    if (!user?.id) {
      alert('Please log in to update settings')
      return
    }

    setSaving(true)
    try {
      // First check if user exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingUser) {
        // Create user if doesn't exist
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            full_name: fullName,
            emergency_contacts: emergencyContact.name ? [emergencyContact] : [],
            preferences: {
              notifications,
              privacy,
              dark_mode: darkMode
            }
          })
        
        if (insertError) {
          console.error('Insert error:', insertError)
          throw insertError
        }
      } else {
        // Update existing user
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: fullName,
            emergency_contacts: emergencyContact.name ? [emergencyContact] : [],
            preferences: {
              notifications,
              privacy,
              dark_mode: darkMode
            }
          })
          .eq('id', user.id)
        
        if (updateError) {
          console.error('Update error:', updateError)
          throw updateError
        }
      }
      
      alert('Settings updated successfully!')
      await fetchProfile()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      alert(`Failed to update settings: ${error.message || 'Please try again.'}`)
    } finally {
      setSaving(false)
    }
  }

  const updatePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters long')
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      
      alert('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
    } catch (error) {
      console.error('Error updating password:', error)
      alert('Failed to update password. Please try again.')
    }
  }

  const exportData = async () => {
    try {
      // Fetch all user data
      const [
        { data: conversations },
        { data: insights },
        { data: wellness },
        { data: journeys }
      ] = await Promise.all([
        supabase.from('conversations').select('*').eq('user_id', user?.id as string),
        supabase.from('personal_insights').select('*').eq('user_id', user?.id as string),
        supabase.from('wellness_entries').select('*').eq('user_id', user?.id as string),
        supabase.from('user_journey_progress').select('*').eq('user_id', user?.id as string)
      ])

      const exportData = {
        profile,
        conversations,
        insights,
        wellness,
        journeys,
        exported_at: new Date().toISOString()
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `innerroot-data-${format(new Date(), 'yyyy-MM-dd')}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  const deleteAccount = async () => {
    try {
      // In production, this would also delete the auth user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user?.id as string)

      if (error) throw error

      await signOut()
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <motion.div className="absolute inset-0 -z-10">
        <motion.div 
          className="orb orb-teal w-[600px] h-[600px] -top-48 -right-48"
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
          className="orb orb-cyan w-[500px] h-[500px] -bottom-32 -left-32"
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
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Account <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your account preferences and privacy settings
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
          <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Settings
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label>Emergency Contact</Label>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <Input
                    placeholder="Contact Name"
                    value={emergencyContact.name}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                  />
                  <Input
                    placeholder="Phone Number"
                    value={emergencyContact.phone}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This contact will be suggested during crisis situations
                </p>
              </div>

              <div>
                <Label>Member Since</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {profile && format(new Date(profile.created_at), 'MMMM d, yyyy')}
                </p>
              </div>

              <div>
                <Label>Subscription</Label>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-medium capitalize">
                    {profile?.subscription_tier} Plan
                  </span>
                  <Button variant="outline" size="sm">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
          <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security
              </CardTitle>
              <CardDescription>Update your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
              </div>

              <Button onClick={updatePassword} variant="outline">
                Update Password
              </Button>
            </CardContent>
          </Card>
          </motion.div>

          {/* Notification Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
          <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
              <CardDescription>Choose what updates you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-sm">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <button
                    onClick={() => setNotifications({ ...notifications, [key]: !value })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-teal-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              ))}
            </CardContent>
          </Card>
          </motion.div>

          {/* Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
          <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy
              </CardTitle>
              <CardDescription>Control your privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(privacy).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-sm">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <button
                    onClick={() => setPrivacy({ ...privacy, [key]: !value })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-teal-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              ))}
            </CardContent>
          </Card>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
          <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent>
              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span className="text-sm">Dark Mode</span>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-teal-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </CardContent>
          </Card>
          </motion.div>

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
          <Card className="rounded-2xl bg-white/70 backdrop-blur-sm border border-teal-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export or delete your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Export Your Data</p>
                  <p className="text-sm text-gray-500">Download all your personal data</p>
                </div>
                <Button onClick={exportData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-600">Delete Account</p>
                    <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                  </div>
                  <Button 
                    onClick={() => setShowDeleteConfirm(true)} 
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div 
            className="flex justify-end space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Button className="btn-secondary" onClick={() => window.location.reload()}>
              Cancel
            </Button>
            <Button className="btn-primary" onClick={updateProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </motion.div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md rounded-2xl bg-white/90 backdrop-blur-sm border border-red-100 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Delete Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete your account? This action cannot be undone and will permanently delete:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>• All your conversations and messages</li>
                  <li>• Your wellness tracking data</li>
                  <li>• Personal insights and journey progress</li>
                  <li>• Community posts and comments</li>
                </ul>
                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={deleteAccount}
                    className="flex-1"
                  >
                    Delete Forever
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <AuthProvider>
      <SettingsContent />
    </AuthProvider>
  )
}