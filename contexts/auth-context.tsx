'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
      setIsInitialized(true)
    }

    getSession()

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Path:', window.location.pathname)
      
      // Update user state
      setUser(session?.user ?? null)
      setLoading(false)

      // CRITICAL: Only handle redirects for actual authentication changes
      // Completely ignore TOKEN_REFRESHED which fires when tabs regain focus
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        // Do nothing - these events should not cause any navigation
        return
      }
      
      // Only handle redirects for true auth state changes
      const currentPath = window.location.pathname
      const isAuthPage = currentPath === '/login' || currentPath === '/signup'
      const isHomePage = currentPath === '/'
      
      // Only redirect on initial sign in from login/signup pages
      if (event === 'SIGNED_IN' && isAuthPage) {
        console.log('Redirecting to dashboard from auth page')
        router.push('/dashboard')
      } 
      // Only redirect on sign out if not already on public pages
      else if (event === 'SIGNED_OUT' && !isHomePage && !isAuthPage) {
        console.log('Redirecting to home after sign out')
        router.push('/')
      }
      // For all other cases, maintain current page
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase, router, isInitialized])

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}