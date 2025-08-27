'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { APP_CONFIG } from '@/lib/config'
import {
  LayoutDashboard,
  Users,
  Brain,
  BarChart3,
  MessageSquare,
  Settings,
  Shield,
  Database,
  UserCheck,
  FileText,
  CreditCard,
  Activity,
  LogOut,
  ChevronLeft,
  Compass,
  Sparkles
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Content', href: '/admin/content', icon: Brain },
  { name: 'Journeys', href: '/admin/journeys', icon: Compass },
  { name: 'Professionals', href: '/admin/professionals', icon: UserCheck },
  { name: 'Support', href: '/admin/support', icon: MessageSquare },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  { name: 'System', href: '/admin/system', icon: Database },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <span className="text-xl font-bold">{APP_CONFIG.name}</span>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <button
                key={item.name}
                onClick={() => {
                  console.log(`Admin sidebar navigating to: ${item.href}`)
                  window.location.href = item.href
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-400">Super Admin</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={() => {
                console.log('Exiting admin panel to dashboard')
                window.location.href = '/dashboard'
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Exit Admin
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}