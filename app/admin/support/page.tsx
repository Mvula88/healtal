'use client'

import { useState, useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import {
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Mail,
  Calendar,
  ChevronRight,
  Reply,
  Archive,
  Trash2,
  Flag
} from 'lucide-react'
import { format } from 'date-fns'

interface SupportTicket {
  id: string
  user_id: string
  user_email: string
  user_name: string
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  created_at: string
  updated_at: string
  response?: string
}

export default function SupportPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [response, setResponse] = useState('')
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all')
  const supabase = createClient()

  useEffect(() => {
    if (user?.email === 'ismaelmvula@gmail.com') {
      fetchTickets()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchTickets = async () => {
    try {
      // Mock data since support tickets table might not exist
      const mockTickets: SupportTicket[] = [
        {
          id: '1',
          user_id: 'user1',
          user_email: 'user1@example.com',
          user_name: 'John Doe',
          subject: 'Cannot access my journey progress',
          message: 'I started the "Understanding Your Patterns" journey but cannot see my progress anymore.',
          status: 'open',
          priority: 'high',
          category: 'Technical',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          user_id: 'user2',
          user_email: 'user2@example.com',
          user_name: 'Jane Smith',
          subject: 'Billing question about subscription',
          message: 'I was charged twice for my Transform plan subscription. Please help.',
          status: 'in_progress',
          priority: 'urgent',
          category: 'Billing',
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          response: "We're looking into this issue and will refund the duplicate charge."
        },
        {
          id: '3',
          user_id: 'user3',
          user_email: 'user3@example.com',
          user_name: 'Mike Johnson',
          subject: 'Feature request: Export conversation history',
          message: 'It would be great to export my conversation history for personal records.',
          status: 'resolved',
          priority: 'low',
          category: 'Feature Request',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          response: "Thank you for the suggestion. We've added this to our roadmap."
        }
      ]
      setTickets(mockTickets)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (ticketId: string, newStatus: SupportTicket['status']) => {
    // Update ticket status
    setTickets(tickets.map(t => 
      t.id === ticketId 
        ? { ...t, status: newStatus, updated_at: new Date().toISOString() }
        : t
    ))
  }

  const handleResponseSubmit = async () => {
    if (selectedTicket && response) {
      // Update ticket with response
      setTickets(tickets.map(t => 
        t.id === selectedTicket.id 
          ? { 
              ...t, 
              response, 
              status: 'in_progress' as const,
              updated_at: new Date().toISOString() 
            }
          : t
      ))
      setResponse('')
      setSelectedTicket(null)
    }
  }

  const filteredTickets = filter === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filter)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100'
      case 'in_progress': return 'text-yellow-600 bg-yellow-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-gray-600 mt-2">
              Manage and respond to user support requests
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Open Tickets</p>
                    <p className="text-2xl font-bold">
                      {tickets.filter(t => t.status === 'open').length}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold">
                      {tickets.filter(t => t.status === 'in_progress').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Resolved</p>
                    <p className="text-2xl font-bold">
                      {tickets.filter(t => t.status === 'resolved').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Urgent</p>
                    <p className="text-2xl font-bold">
                      {tickets.filter(t => t.priority === 'urgent').length}
                    </p>
                  </div>
                  <Flag className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-2">
            {(['all', 'open', 'in_progress', 'resolved'] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Button>
            ))}
          </div>

          {/* Tickets List */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">
                    Loading tickets...
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No tickets found
                  </div>
                ) : (
                  filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {ticket.user_name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {ticket.user_email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(ticket.created_at), 'MMM d, h:mm a')}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline">{ticket.category}</Badge>
                            </div>
                          </div>
                          
                          <p className="mt-3 text-gray-700">{ticket.message}</p>
                          
                          {ticket.response && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-600 mb-1">Response:</p>
                              <p className="text-sm text-gray-700">{ticket.response}</p>
                            </div>
                          )}
                          
                          <div className="mt-4 flex gap-2">
                            {ticket.status === 'open' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedTicket(ticket)
                                    setResponse(ticket.response || '')
                                  }}
                                >
                                  <Reply className="h-4 w-4 mr-1" />
                                  Respond
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                                >
                                  Mark In Progress
                                </Button>
                              </>
                            )}
                            {ticket.status === 'in_progress' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(ticket.id, 'resolved')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Resolved
                              </Button>
                            )}
                            {ticket.status === 'resolved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(ticket.id, 'closed')}
                              >
                                <Archive className="h-4 w-4 mr-1" />
                                Close Ticket
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Response Modal */}
          {selectedTicket && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl">
                <CardHeader>
                  <CardTitle>Respond to Ticket</CardTitle>
                  <CardDescription>{selectedTicket.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 mb-1">Original Message:</p>
                      <p className="text-sm text-gray-700">{selectedTicket.message}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Response
                      </label>
                      <Textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        rows={5}
                        placeholder="Type your response..."
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => {
                        setSelectedTicket(null)
                        setResponse('')
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={handleResponseSubmit}>
                        Send Response
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}