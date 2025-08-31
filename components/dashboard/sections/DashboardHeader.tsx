import { motion } from 'framer-motion'
import { Bell, Settings, Search, Menu, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface DashboardHeaderProps {
  user: any
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Friend'

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Image 
                src="/beneathy-dash.png" 
                alt="Beneathy" 
                width={120} 
                height={40}
                className="object-contain cursor-pointer hover:opacity-90 transition-opacity"
                priority
              />
            </Link>
            <div className="hidden md:block text-gray-500">|</div>
            <div className="hidden md:block">
              <p className="text-gray-900 font-medium">
                {getGreeting()}, {firstName}
              </p>
            </div>
          </div>

          {/* Center - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search features, paths, circles..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </Button>
              
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
                >
                  <h3 className="font-semibold text-gray-900 mb-3">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="h-2 w-2 bg-teal-500 rounded-full mt-2" />
                      <div>
                        <p className="text-sm text-gray-900">New breakthrough detected!</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                      <div>
                        <p className="text-sm text-gray-900">Healing Circle starting soon</p>
                        <p className="text-xs text-gray-500">Tomorrow at 7:00 PM</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Settings */}
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>

            {/* Profile */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="rounded-full"
              >
                <div className="h-8 w-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {firstName[0]?.toUpperCase()}
                  </span>
                </div>
              </Button>

              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                >
                  <Link href="/settings">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Profile Settings
                    </a>
                  </Link>
                  <Link href="/billing">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Billing
                    </a>
                  </Link>
                  <hr className="my-2" />
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Sign Out
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}