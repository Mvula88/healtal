'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { Navbar } from '@/components/navigation/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Users,
  DollarSign,
  Activity,
  Settings,
  Shield,
  TrendingUp,
  FileText,
  MessageSquare,
  Calendar,
  BarChart3,
  Search,
  Filter,
  Download,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Star,
  Ban,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock
} from 'lucide-react'
import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'

interface UserData {
  id: string
  email: string
  full_name: string
  subscription_tier: string
  created_at: string
  last_active: string
  total_sessions: number
  status: 'active' | 'suspended' | 'inactive'
}

interface Analytics {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  monthlyRevenue: number
  totalSessions: number
  averageSessionTime: string
  conversionRate: number
  churnRate: number
}

interface SupportTicket {
  id: string
  user_name: string
  subject: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  last_updated: string
}

function AdminDashboardContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<UserData[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      checkAdminAccess()
      fetchDashboardData()
    }
  }, [user])

  const checkAdminAccess = async () => {
    // Check if user is admin
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user?.id)
      .single()
    
    if (data?.role !== 'admin') {
      window.location.href = '/dashboard'
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (usersData) {
        setUsers(usersData.map(u => ({
          id: u.id,
          email: u.email || 'N/A',
          full_name: u.full_name || 'Unknown',
          subscription_tier: u.subscription_tier || 'starter',
          created_at: u.created_at,
          last_active: u.last_active || u.created_at,
          total_sessions: u.total_sessions || 0,
          status: u.status || 'active'
        })))
      }

      // Calculate analytics
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const totalUsers = usersData?.length || 0
      const activeUsers = usersData?.filter(u => {
        const lastActive = new Date(u.last_active || u.created_at)
        const daysSinceActive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
        return daysSinceActive <= 7
      }).length || 0
      
      const newUsersToday = usersData?.filter(u => 
        new Date(u.created_at) >= today
      ).length || 0

      // Calculate revenue (simplified)
      const monthlyRevenue = usersData?.reduce((sum, u) => {
        const tier = u.subscription_tier
        if (tier === 'starter') return sum + 19
        if (tier === 'growth') return sum + 39
        if (tier === 'enterprise') return sum + 79
        return sum
      }, 0) || 0

      setAnalytics({
        totalUsers,
        activeUsers,
        newUsersToday,
        monthlyRevenue,
        totalSessions: usersData?.reduce((sum, u) => sum + (u.total_sessions || 0), 0) || 0,
        averageSessionTime: '12 min',
        conversionRate: 23.5,
        churnRate: 5.2
      })

      // Sample support tickets
      setTickets([
        {
          id: '1',
          user_name: 'John Doe',
          subject: 'Cannot access healing circles',
          priority: 'high',
          status: 'open',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          last_updated: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          user_name: 'Jane Smith',
          subject: 'Billing question',
          priority: 'medium',
          status: 'in_progress',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          user_name: 'Mike Johnson',
          subject: 'Feature request: Export data',
          priority: 'low',
          status: 'open',
          created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          last_updated: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        }
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string) => {
    try {
      if (action === 'suspend') {
        await supabase
          .from('users')
          .update({ status: 'suspended' })
          .eq('id', userId)
      } else if (action === 'activate') {
        await supabase
          .from('users')
          .update({ status: 'active' })
          .eq('id', userId)
      } else if (action === 'delete') {
        if (confirm('Are you sure you want to delete this user?')) {
          await supabase
            .from('users')
            .delete()
            .eq('id', userId)
        }
      }
      
      await fetchDashboardData()
    } catch (error) {
      console.error('Error performing user action:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-yellow-100 text-yellow-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage users, content, and platform settings</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => fetchDashboardData()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{analytics.totalUsers}</p>
                    <p className="text-xs text-green-600">+{analytics.newUsersToday} today</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold">${analytics.monthlyRevenue}</p>
                    <p className="text-xs text-green-600">+12% vs last month</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">{analytics.activeUsers}</p>
                    <p className="text-xs text-gray-600">Last 7 days</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold">{analytics.totalSessions}</p>
                    <p className="text-xs text-gray-600">All time</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform events and user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">New user registered: sarah.jones@email.com</span>
                    <span className="text-xs text-gray-500 ml-auto">2 minutes ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">User upgraded to Growth plan</span>
                    <span className="text-xs text-gray-500 ml-auto">15 minutes ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">New support ticket opened</span>
                    <span className="text-xs text-gray-500 ml-auto">1 hour ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Healing circle session completed</span>
                    <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Tickets Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Open Support Tickets</CardTitle>
                <CardDescription>Tickets requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tickets.filter(t => t.status === 'open').map(ticket => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">{ticket.subject}</p>
                          <p className="text-xs text-gray-600">by {ticket.user_name}</p>
                        </div>
                      </div>
                      <Button size="sm">
                        View
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        className="pl-10 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Plan</th>
                        <th className="text-left py-3 px-4">Sessions</th>
                        <th className="text-left py-3 px-4">Joined</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.slice(0, 10).map(user => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{user.full_name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="capitalize">
                              {user.subscription_tier}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{user.total_sessions}</td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={
                              user.status === 'active' ? 'bg-green-100 text-green-700' :
                              user.status === 'suspended' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUserAction(
                                  user.id, 
                                  user.status === 'active' ? 'suspend' : 'activate'
                                )}
                              >
                                {user.status === 'active' ? 
                                  <Ban className="h-4 w-4" /> : 
                                  <Unlock className="h-4 w-4" />
                                }
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUserAction(user.id, 'delete')}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Management</CardTitle>
                  <CardDescription>Manage journeys, resources, and community content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-auto py-4">
                      <div className="text-center">
                        <FileText className="h-6 w-6 mx-auto mb-2" />
                        <span>Manage Journeys</span>
                        <p className="text-xs text-gray-500 mt-1">12 active journeys</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto py-4">
                      <div className="text-center">
                        <Users className="h-6 w-6 mx-auto mb-2" />
                        <span>Healing Circles</span>
                        <p className="text-xs text-gray-500 mt-1">8 active circles</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto py-4">
                      <div className="text-center">
                        <MessageSquare className="h-6 w-6 mx-auto mb-2" />
                        <span>Community Posts</span>
                        <p className="text-xs text-gray-500 mt-1">234 posts this week</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Coach Settings</CardTitle>
                  <CardDescription>Configure AI coaching parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Response Style</Label>
                      <select className="w-full mt-1 px-3 py-2 border rounded-md">
                        <option>Empathetic & Supportive</option>
                        <option>Direct & Solution-Focused</option>
                        <option>Balanced</option>
                      </select>
                    </div>
                    <div>
                      <Label>Crisis Detection Sensitivity</Label>
                      <select className="w-full mt-1 px-3 py-2 border rounded-md">
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                    <Button>Save AI Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Manage customer support requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{ticket.subject}</h4>
                          <p className="text-sm text-gray-600">From: {ticket.user_name}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-xs text-gray-500">
                          Created: {new Date(ticket.created_at).toLocaleString()}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Assign
                          </Button>
                          <Button size="sm">
                            Respond
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>Configure global platform settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Platform Name</Label>
                      <Input defaultValue="Beneathy" />
                    </div>
                    <div>
                      <Label>Support Email</Label>
                      <Input defaultValue="support@beneathy.com" />
                    </div>
                    <div>
                      <Label>Maintenance Mode</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input type="checkbox" id="maintenance" />
                        <label htmlFor="maintenance" className="text-sm">
                          Enable maintenance mode (users will see maintenance page)
                        </label>
                      </div>
                    </div>
                    <Button>Save Settings</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage security and access controls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                      </div>
                      <Button variant="outline">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">API Access</p>
                        <p className="text-sm text-gray-600">Manage API keys and webhooks</p>
                      </div>
                      <Button variant="outline">Manage</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Audit Logs</p>
                        <p className="text-sm text-gray-600">View system audit logs</p>
                      </div>
                      <Button variant="outline">View Logs</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">User Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{selectedUser.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subscription</p>
                  <p className="font-medium capitalize">{selectedUser.subscription_tier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={
                    selectedUser.status === 'active' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }>
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="font-medium">{selectedUser.total_sessions}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
                <Button variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <AuthProvider>
      <AdminDashboardContent />
    </AuthProvider>
  )
}