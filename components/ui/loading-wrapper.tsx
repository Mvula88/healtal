'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PageSkeleton, 
  CardSkeleton, 
  ListSkeleton, 
  TableSkeleton,
  FormSkeleton,
  StatsSkeleton,
  ArticleSkeleton,
  ChatSkeleton,
  ProfileSkeleton,
  NavSkeleton
} from './skeleton'

interface LoadingWrapperProps {
  loading: boolean
  children: React.ReactNode
  skeleton?: 'page' | 'card' | 'list' | 'table' | 'form' | 'stats' | 'article' | 'chat' | 'profile' | 'nav' | 'custom'
  customSkeleton?: React.ReactNode
  delay?: number
  transition?: boolean
}

export function LoadingWrapper({ 
  loading, 
  children, 
  skeleton = 'page',
  customSkeleton,
  delay = 0,
  transition = true
}: LoadingWrapperProps) {
  const [showSkeleton, setShowSkeleton] = useState(loading)

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowSkeleton(true)
      }, delay)
      return () => clearTimeout(timer)
    } else {
      setShowSkeleton(false)
    }
  }, [loading, delay])

  const renderSkeleton = () => {
    if (customSkeleton) return customSkeleton
    
    switch (skeleton) {
      case 'card':
        return <CardSkeleton />
      case 'list':
        return <ListSkeleton />
      case 'table':
        return <TableSkeleton />
      case 'form':
        return <FormSkeleton />
      case 'stats':
        return <StatsSkeleton />
      case 'article':
        return <ArticleSkeleton />
      case 'chat':
        return <ChatSkeleton />
      case 'profile':
        return <ProfileSkeleton />
      case 'nav':
        return <NavSkeleton />
      case 'page':
      default:
        return <PageSkeleton />
    }
  }

  if (!transition) {
    return showSkeleton ? renderSkeleton() : <>{children}</>
  }

  return (
    <AnimatePresence mode="wait">
      {showSkeleton ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderSkeleton()}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for managing loading states
export function useLoadingState(initialState = true) {
  const [loading, setLoading] = useState(initialState)
  const [error, setError] = useState<Error | null>(null)

  const startLoading = () => setLoading(true)
  const stopLoading = () => setLoading(false)
  
  const withLoading = async <T,>(promise: Promise<T>): Promise<T> => {
    setLoading(true)
    setError(null)
    try {
      const result = await promise
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    withLoading,
    setLoading,
    setError
  }
}

// Shimmer effect component
export function ShimmerEffect({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
        <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  )
}

// Pulse loader component
export function PulseLoader({ size = 'md', color = 'teal' }: { size?: 'sm' | 'md' | 'lg'; color?: string }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} relative`}>
        <div className={`absolute inset-0 bg-${color}-400 rounded-full animate-ping opacity-75`} />
        <div className={`relative ${sizeClasses[size]} bg-${color}-500 rounded-full`} />
      </div>
    </div>
  )
}

// Spinner component
export function Spinner({ size = 'md', color = 'teal' }: { size?: 'sm' | 'md' | 'lg'; color?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-${color}-600`} />
    </div>
  )
}

// Dots loader component
export function DotsLoader({ color = 'teal' }: { color?: string }) {
  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`h-3 w-3 bg-${color}-500 rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

// Progress bar loader
export function ProgressLoader({ progress = 0 }: { progress?: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Loading...</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}