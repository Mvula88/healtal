'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { APP_CONFIG } from '@/lib/config'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Brain,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function SetupAdminPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState('ismaelmvula@gmail.com')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const checkAdminStatus = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`/api/admin/setup?email=${email}`)
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Failed to check admin status')
    } finally {
      setLoading(false)
    }
  }

  const setupAdmin = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to set admin role')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError('An error occurred while setting up admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-primary mr-3" />
            <Shield className="h-10 w-10 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{APP_CONFIG.name} Admin Setup</h1>
          <p className="mt-2 text-gray-600">
            Configure admin access for platform management
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Set Admin User</CardTitle>
            <CardDescription>
              Grant admin privileges to manage the {APP_CONFIG.name} platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current User Info */}
            {user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Currently logged in as:</strong>
                </p>
                <p className="text-sm text-blue-700">{user.email}</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <Label htmlFor="email">Admin Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ismaelmvula@gmail.com"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter the email address to grant admin access
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={checkAdminStatus}
                variant="outline"
                disabled={loading || !email}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                Check Status
              </Button>
              <Button 
                onClick={setupAdmin}
                disabled={loading || !email}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Grant Admin
              </Button>
            </div>

            {/* Results */}
            {result && (
              <div className={`rounded-lg p-4 ${
                result.success || result.isAdmin
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-start gap-3">
                  {result.success || result.isAdmin ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      result.success || result.isAdmin ? 'text-green-900' : 'text-yellow-900'
                    }`}>
                      {result.message}
                    </p>
                    {result.user && (
                      <div className="mt-2 text-xs text-gray-600">
                        <p><strong>ID:</strong> {result.user.id}</p>
                        <p><strong>Name:</strong> {result.user.full_name || 'Not set'}</p>
                        <p><strong>Role:</strong> {result.user.role}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-900">{error}</p>
                </div>
              </div>
            )}

            {/* Important Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-900 font-medium">Important:</p>
                  <ul className="text-xs text-amber-800 mt-1 space-y-1">
                    <li>• Only authorized emails can be set as admin</li>
                    <li>• User must have signed up first</li>
                    <li>• Admin access grants full platform control</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="pt-4 border-t flex justify-between">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Go to Dashboard
                </Button>
              </Link>
              {(result?.success || result?.isAdmin) && (
                <Link href="/admin">
                  <Button size="sm">
                    Go to Admin Panel
                    <Shield className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-xs text-gray-600 space-y-2">
              <li>1. Make sure you're signed up with ismaelmvula@gmail.com</li>
              <li>2. Click "Grant Admin" to set admin privileges</li>
              <li>3. Once successful, access the admin panel at /admin</li>
              <li>4. You can also run the SQL migration in Supabase dashboard</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}