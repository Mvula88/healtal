'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, AlertTriangle } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (!loading) {
      const adminEmail = 'ismaelmvula@gmail.com'
      const userIsAdmin = user?.email === adminEmail
      setIsAdmin(userIsAdmin)
      setAuthChecked(true)
    }
  }, [user, loading])

  // Show loading state while checking auth
  if (!authChecked || loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Subtle animated orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-32 right-32 w-96 h-96 bg-cyan-200/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-200/10 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="relative flex items-center justify-center min-h-screen">
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
              <p className="text-gray-700 font-medium">Verifying admin access...</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Subtle animated orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-32 right-32 w-96 h-96 bg-orange-200/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-yellow-200/10 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Access Restricted
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Administrator privileges required to access this area
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Security Notice</p>
                        <p className="text-sm text-gray-600 mt-1">
                          This administrative interface is protected and monitored.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Current user:</span> {user?.email || 'Not logged in'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <Button 
                      onClick={() => router.push('/dashboard')}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-all duration-200"
                    >
                      Return to Dashboard
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/login')}
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Sign In as Admin
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Show admin layout with sidebar
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle animated orbs for professional background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 left-20 w-72 h-72 bg-teal-200/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 20, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-32 right-32 w-96 h-96 bg-cyan-200/8 rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-200/6 rounded-full blur-3xl"
          animate={{ 
            x: [0, 15, 0],
            y: [0, -15, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Admin sidebar */}
      <AdminSidebar />
      
      {/* Main content area */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  )
}