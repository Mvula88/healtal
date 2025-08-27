'use client'

import { useState, useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { PRICING_TIERS } from '@/lib/config'
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'

interface Subscription {
  id: string
  user_id: string
  user_email: string
  user_name: string
  tier: 'free' | 'understand' | 'transform'
  status: 'active' | 'cancelled' | 'past_due'
  amount: number
  billing_cycle: 'monthly' | 'yearly'
  current_period_start: string
  current_period_end: string
  created_at: string
}

interface Transaction {
  id: string
  user_id: string
  amount: number
  type: 'subscription' | 'refund'
  status: 'successful' | 'pending' | 'failed'
  description: string
  created_at: string
}

export default function BillingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [revenue, setRevenue] = useState({
    monthly: 0,
    yearly: 0,
    total: 0,
    growth: 12.5
  })
  const supabase = createClient()

  useEffect(() => {
    if (user?.email === 'ismaelmvula@gmail.com') {
      fetchBillingData()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchBillingData = async () => {
    try {
      // Mock data for demonstration
      const mockSubscriptions: Subscription[] = [
        {
          id: '1',
          user_id: 'user1',
          user_email: 'john@example.com',
          user_name: 'John Doe',
          tier: 'transform',
          status: 'active',
          amount: 79,
          billing_cycle: 'monthly',
          current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          user_id: 'user2',
          user_email: 'jane@example.com',
          user_name: 'Jane Smith',
          tier: 'understand',
          status: 'active',
          amount: 29,
          billing_cycle: 'monthly',
          current_period_start: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          current_period_end: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      const mockTransactions: Transaction[] = [
        {
          id: 't1',
          user_id: 'user1',
          amount: 79,
          type: 'subscription',
          status: 'successful',
          description: 'Transform Plan - Monthly',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 't2',
          user_id: 'user2',
          amount: 29,
          type: 'subscription',
          status: 'successful',
          description: 'Understand Plan - Monthly',
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        }
      ]

      setSubscriptions(mockSubscriptions)
      setTransactions(mockTransactions)

      // Calculate revenue
      const monthlyRevenue = mockSubscriptions
        .filter(s => s.status === 'active' && s.billing_cycle === 'monthly')
        .reduce((sum, s) => sum + s.amount, 0)

      setRevenue({
        monthly: monthlyRevenue,
        yearly: monthlyRevenue * 12,
        total: 5450,
        growth: 12.5
      })
    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportTransactions = () => {
    console.log('Exporting transactions to CSV...')
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
            <h1 className="text-3xl font-bold text-gray-900">Billing & Revenue</h1>
            <p className="text-gray-600 mt-2">
              Manage subscriptions and monitor revenue metrics
            </p>
          </div>

          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold">${revenue.monthly}</p>
                    <p className="text-xs text-green-600 mt-1">+{revenue.growth}% vs last month</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Yearly Revenue</p>
                    <p className="text-2xl font-bold">${revenue.yearly}</p>
                    <p className="text-xs text-gray-500 mt-1">Projected</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Subscriptions</p>
                    <p className="text-2xl font-bold">{subscriptions.filter(s => s.status === 'active').length}</p>
                    <p className="text-xs text-gray-500 mt-1">Paid users</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">${revenue.total}</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Distribution */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Subscription Distribution</CardTitle>
              <CardDescription>Breakdown by pricing tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(PRICING_TIERS).map(([key, tier]) => {
                  const count = subscriptions.filter(s => s.tier === key && s.status === 'active').length
                  const revenue = count * tier.price
                  return (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{tier.name} Plan</h4>
                        <p className="text-sm text-gray-600">${tier.price}/month</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{count} users</p>
                        <p className="text-sm text-gray-600">${revenue}/mo revenue</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Active Subscriptions */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Active Subscriptions</CardTitle>
                  <CardDescription>Currently active paid subscriptions</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Billing
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{subscription.user_name}</p>
                            <p className="text-sm text-gray-500">{subscription.user_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">
                            {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">${subscription.amount}/{subscription.billing_cycle}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                            {subscription.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest payment activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {transaction.status === 'successful' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : transaction.status === 'failed' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(transaction.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {transaction.type === 'refund' ? '-' : '+'}${transaction.amount}
                      </p>
                      <Badge variant={
                        transaction.status === 'successful' ? 'default' :
                        transaction.status === 'failed' ? 'destructive' : 'secondary'
                      } className="text-xs">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}