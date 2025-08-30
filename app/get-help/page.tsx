'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GetHelpPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to help page
    router.push('/help')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to help center...</p>
      </div>
    </div>
  )
}