import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

export function LoadingState() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </motion.div>
            </Card>
          ))}
        </div>

        {/* Main content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart skeleton */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="flex space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
            </Card>

            {/* Activity skeleton */}
            <Card className="p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Quick actions skeleton */}
            <Card className="p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-xl">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse mb-3" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommendations skeleton */}
            <Card className="p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-3 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <Card className="p-6">
      <div className="animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    </Card>
  )
}