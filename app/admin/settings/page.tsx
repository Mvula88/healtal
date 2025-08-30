'use client'

import { motion } from 'framer-motion'

import { useState } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { APP_CONFIG } from '@/lib/config'
import {
  Settings,
  Save,
  Bell,
  Shield,
  Globe,
  Mail,
  Database,
  Key,
  Users,
  CreditCard,
  CheckCircle
} from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    // General Settings
    siteName: APP_CONFIG.name,
    siteDescription: APP_CONFIG.description,
    siteUrl: APP_CONFIG.url,
    contactEmail: 'support@healtal.com',
    
    // Feature Flags
    enableSignups: true,
    enableProfessionalReferrals: true,
    enableCommunityFeatures: true,
    maintenanceMode: false,
    
    // Email Settings
    emailProvider: 'sendgrid',
    emailFrom: 'noreply@healtal.com',
    sendWelcomeEmail: true,
    sendActivityDigest: true,
    
    // Security Settings
    requireEmailVerification: true,
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    
    // Payment Settings
    paymentProvider: 'stripe',
    enableSubscriptions: true,
    trialDays: 7,
    
    // AI Settings
    aiModel: 'gpt-4',
    maxTokensPerSession: 2000,
    temperatureSetting: 0.7,
    
    // Analytics
    enableAnalytics: true,
    analyticsProvider: 'google',
    trackUserBehavior: true,
    
    // Backup Settings
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30
  })

  const handleSave = () => {
    // Save settings (in real app, would save to database)
    console.log('Saving settings:', settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (user?.email !== 'ismaelmvula@gmail.com') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
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
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
              <p className="text-gray-600 mt-2">
                Configure platform-wide settings and features
              </p>
            </div>
            <Button onClick={handleSave} disabled={saved}>
              {saved ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          {/* General Settings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Flags */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Flags
              </CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableSignups">Enable New Signups</Label>
                  <p className="text-sm text-gray-500">Allow new users to create accounts</p>
                </div>
                <Switch
                  id="enableSignups"
                  checked={settings.enableSignups}
                  onCheckedChange={(checked) => setSettings({...settings, enableSignups: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableProfessionalReferrals">Professional Referrals</Label>
                  <p className="text-sm text-gray-500">Show professional referral suggestions</p>
                </div>
                <Switch
                  id="enableProfessionalReferrals"
                  checked={settings.enableProfessionalReferrals}
                  onCheckedChange={(checked) => setSettings({...settings, enableProfessionalReferrals: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableCommunityFeatures">Community Features</Label>
                  <p className="text-sm text-gray-500">Enable community forum and discussions</p>
                </div>
                <Switch
                  id="enableCommunityFeatures"
                  checked={settings.enableCommunityFeatures}
                  onCheckedChange={(checked) => setSettings({...settings, enableCommunityFeatures: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">Show maintenance page to all users</p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                  <p className="text-sm text-gray-500">Users must verify email before access</p>
                </div>
                <Switch
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => setSettings({...settings, requireEmailVerification: checked})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="passwordMinLength">Min Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (days)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                />
                <p className="text-sm text-gray-500 mt-1">Lock account after this many failed attempts</p>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Settings
              </CardTitle>
              <CardDescription>Configure email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emailProvider">Email Provider</Label>
                  <select
                    id="emailProvider"
                    value={settings.emailProvider}
                    onChange={(e) => setSettings({...settings, emailProvider: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="sendgrid">SendGrid</option>
                    <option value="mailgun">Mailgun</option>
                    <option value="ses">Amazon SES</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="emailFrom">From Email</Label>
                  <Input
                    id="emailFrom"
                    type="email"
                    value={settings.emailFrom}
                    onChange={(e) => setSettings({...settings, emailFrom: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sendWelcomeEmail">Send Welcome Email</Label>
                  <Switch
                    id="sendWelcomeEmail"
                    checked={settings.sendWelcomeEmail}
                    onCheckedChange={(checked) => setSettings({...settings, sendWelcomeEmail: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sendActivityDigest">Send Activity Digest</Label>
                  <Switch
                    id="sendActivityDigest"
                    checked={settings.sendActivityDigest}
                    onCheckedChange={(checked) => setSettings({...settings, sendActivityDigest: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup Settings
              </CardTitle>
              <CardDescription>Configure automatic backups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackup">Automatic Backups</Label>
                  <p className="text-sm text-gray-500">Enable automatic database backups</p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <select
                    id="backupFrequency"
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={!settings.autoBackup}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="backupRetention">Retention (days)</Label>
                  <Input
                    id="backupRetention"
                    type="number"
                    value={settings.backupRetention}
                    onChange={(e) => setSettings({...settings, backupRetention: parseInt(e.target.value)})}
                    disabled={!settings.autoBackup}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}