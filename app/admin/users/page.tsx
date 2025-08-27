'use client'

import { useState, useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import {
  Search,
  Filter,
  Download,
  UserPlus,
  MoreVertical,
  Mail,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'

interface User {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin' | 'moderator'
  subscription_tier: 'free' | 'understand' | 'transform'
  status: 'active' | 'suspended' | 'inactive'
  created_at: string
  last_sign_in_at: string
  total_sessions: number
  subscription_status: string
}

export default function UsersManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const supabase = createClient()
  
  const usersPerPage = 10

  useEffect(() => {
    checkAdminAndFetchUsers()
  }, [user])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, filterRole, filterStatus, users])

  const checkAdminAndFetchUsers = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    // Simple email check instead of database
    if (user.email !== 'ismaelmvula@gmail.com') {
      // Don't redirect, just set loading to false
      setLoading(false)
      return
    }

    fetchUsers()
  }

  const fetchUsers = async () => {
    try {
      // Fetch users from auth.users (requires service role)
      const { data: authResponse, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        console.log('Admin API not available, using alternative approach')
        // Fallback: Try to get user data from profiles or other tables
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
        
        if (profiles) {
          const formattedUsers = profiles.map(profile => ({
            id: profile.id,
            email: profile.email || 'N/A',
            full_name: profile.full_name || profile.name || 'Unknown',
            role: profile.email === 'ismaelmvula@gmail.com' ? 'admin' : 'user',
            subscription_tier: 'free',
            status: 'active',
            created_at: profile.created_at,
            last_sign_in_at: profile.updated_at || profile.created_at,
            total_sessions: 0,
            subscription_status: 'active'
          }))
          
          // Get conversation counts for each user
          for (const user of formattedUsers) {
            const { count } = await supabase
              .from('conversations')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
            
            user.total_sessions = count || 0
          }
          
          setUsers(formattedUsers)
        } else {
          // If profiles table doesn't exist, use minimal mock data
          setUsers([{
            id: user?.id || '1',
            email: user?.email || 'ismaelmvula@gmail.com',
            full_name: 'Admin User',
            role: 'admin',
            subscription_tier: 'transform',
            status: 'active',
            created_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            total_sessions: 0,
            subscription_status: 'active'
          }])
        }
      } else {
        // Format auth users data
        const formattedUsers = authResponse.users.map(authUser => ({
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Unknown',
          role: authUser.email === 'ismaelmvula@gmail.com' ? 'admin' : 'user',
          subscription_tier: 'free',
          status: authUser.banned_until ? 'suspended' : 'active',
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at || authUser.created_at,
          total_sessions: 0,
          subscription_status: 'active'
        }))
        
        // Get conversation counts and subscription data
        for (const user of formattedUsers) {
          const { count } = await supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
          
          user.total_sessions = count || 0
          
          // Try to get subscription data
          const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('tier, status')
            .eq('user_id', user.id)
            .single()
          
          if (subscription) {
            user.subscription_tier = subscription.tier
            user.subscription_status = subscription.status
          }
        }
        
        setUsers(formattedUsers)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      // Fallback to minimal data
      setUsers([{
        id: user?.id || '1',
        email: user?.email || 'ismaelmvula@gmail.com',
        full_name: 'Admin User',
        role: 'admin',
        subscription_tier: 'transform',
        status: 'active',
        created_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        total_sessions: 0,
        subscription_status: 'active'
      }])
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus)
    }

    setFilteredUsers(filtered)
    setCurrentPage(1)
  }

  const handleUserAction = async (userId: string, action: string) => {
    switch (action) {
      case 'suspend':
        // Implement user suspension
        console.log('Suspending user:', userId)
        break
      case 'delete':
        // Implement user deletion
        console.log('Deleting user:', userId)
        break
      case 'make_admin':
        // Implement admin promotion
        console.log('Making admin:', userId)
        break
      default:
        break
    }
  }

  const exportUsers = () => {
    // Implement CSV export
    console.log('Exporting users to CSV')
  }

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  )

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  // Check if user is admin
  if (user?.email !== 'ismaelmvula@gmail.com') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">
              Manage user accounts, subscriptions, and permissions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">
                      {users.filter(u => u.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Paid Users</p>
                    <p className="text-2xl font-bold">
                      {users.filter(u => u.subscription_tier !== 'free').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Admins</p>
                    <p className="text-2xl font-bold">
                      {users.filter(u => u.role === 'admin').length}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[300px]">
                  <Label htmlFor="search">Search Users</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <Button variant="outline" onClick={exportUsers}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>

                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sessions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.full_name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.role !== 'user' && (
                              <Badge variant="outline" className="mt-1">
                                {user.role}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={
                            user.subscription_tier === 'transform' ? 'default' :
                            user.subscription_tier === 'understand' ? 'secondary' : 'outline'
                          }>
                            {user.subscription_tier}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">{user.total_sessions}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-500">
                            {format(new Date(user.created_at), 'MMM d, yyyy')}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-500">
                            {user.last_sign_in_at ? 
                              format(new Date(user.last_sign_in_at), 'MMM d, h:mm a') : 
                              'Never'
                            }
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowUserModal(true)
                              }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm"
                              onClick={() => handleUserAction(user.id, 'suspend')}>
                              <Ban className="h-4 w-4 text-orange-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}