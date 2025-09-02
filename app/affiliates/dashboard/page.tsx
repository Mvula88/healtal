'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Navbar } from '@/components/navigation/navbar'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import {
  DollarSign,
  Users,
  TrendingUp,
  Link2,
  Copy,
  Check,
  CheckCircle,
  Download,
  Calendar,
  CreditCard,
  Award,
  Target,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Share2,
  Mail,
  MessageSquare,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  MousePointer,
  UserPlus,
  Settings,
  HelpCircle
} from 'lucide-react'

interface AffiliateStats {
  totalEarnings: number
  currentBalance: number
  totalReferrals: number
  activeReferrals: number
  conversionRate: number
  averageOrderValue: number
  lifetimeValue: number
  pendingPayout: number
  lastPayout: {
    amount: number
    date: string
    method: string
  }
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  commissionRate: number
}

interface Referral {
  id: string
  userId: string
  userName: string
  signupDate: string
  status: 'trial' | 'active' | 'churned'
  plan: 'starter' | 'growth' | 'premium'
  monthlyValue: number
  lifetimeValue: number
  commissionEarned: number
}

interface PayoutHistory {
  id: string
  amount: number
  date: string
  method: 'paypal' | 'stripe' | 'bank'
  status: 'pending' | 'processing' | 'completed'
  invoiceUrl?: string
}

interface MarketingAsset {
  id: string
  type: 'banner' | 'email' | 'social' | 'video'
  title: string
  description: string
  url: string
  thumbnail: string
  clicks: number
  conversions: number
}

function AffiliateDashboardContent() {
  const { user } = useAuth()
  const [affiliateCode, setAffiliateCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<AffiliateStats>({
    totalEarnings: 0,
    currentBalance: 0,
    totalReferrals: 0,
    activeReferrals: 0,
    conversionRate: 0,
    averageOrderValue: 0,
    lifetimeValue: 0,
    pendingPayout: 0,
    lastPayout: {
      amount: 0,
      date: '',
      method: 'paypal'
    },
    tier: 'bronze',
    commissionRate: 20
  })
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>([])
  const [marketingAssets, setMarketingAssets] = useState<MarketingAsset[]>([])
  const [timeRange, setTimeRange] = useState('30d')
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadAffiliateData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadAffiliateData = async () => {
    // Generate unique affiliate code
    const code = user?.email?.split('@')[0]?.toUpperCase() + Math.random().toString(36).substring(2, 7).toUpperCase()
    setAffiliateCode(code)

    // Load sample data (would come from database)
    setStats({
      totalEarnings: 4567.89,
      currentBalance: 892.34,
      totalReferrals: 47,
      activeReferrals: 31,
      conversionRate: 65.9,
      averageOrderValue: 39,
      lifetimeValue: 234,
      pendingPayout: 450.00,
      lastPayout: {
        amount: 1250.00,
        date: '2025-08-15',
        method: 'paypal'
      },
      tier: 'silver',
      commissionRate: 25
    })

    setReferrals([
      {
        id: '1',
        userId: 'user1',
        userName: 'Sarah Johnson',
        signupDate: '2025-08-20',
        status: 'active',
        plan: 'growth',
        monthlyValue: 39,
        lifetimeValue: 156,
        commissionEarned: 39
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Mike Chen',
        signupDate: '2025-08-18',
        status: 'active',
        plan: 'premium',
        monthlyValue: 79,
        lifetimeValue: 237,
        commissionEarned: 59.25
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Emily Davis',
        signupDate: '2025-08-15',
        status: 'trial',
        plan: 'starter',
        monthlyValue: 19,
        lifetimeValue: 0,
        commissionEarned: 0
      }
    ])

    setPayoutHistory([
      {
        id: '1',
        amount: 1250.00,
        date: '2025-08-15',
        method: 'paypal',
        status: 'completed',
        invoiceUrl: '/invoice/1'
      },
      {
        id: '2',
        amount: 890.50,
        date: '2025-07-15',
        method: 'stripe',
        status: 'completed',
        invoiceUrl: '/invoice/2'
      }
    ])

    setMarketingAssets([
      {
        id: '1',
        type: 'banner',
        title: 'Mental Wellness Banner 728x90',
        description: 'High-converting banner for mental health blogs',
        url: '/banners/wellness-728x90.jpg',
        thumbnail: '/thumbnails/banner1.jpg',
        clicks: 1234,
        conversions: 45
      },
      {
        id: '2',
        type: 'email',
        title: 'Welcome Email Template',
        description: 'Proven email template with 35% conversion rate',
        url: '/templates/welcome-email.html',
        thumbnail: '/thumbnails/email1.jpg',
        clicks: 567,
        conversions: 198
      },
      {
        id: '3',
        type: 'social',
        title: 'Instagram Story Pack',
        description: '10 story templates for mental health awareness',
        url: '/social/instagram-stories.zip',
        thumbnail: '/thumbnails/social1.jpg',
        clicks: 892,
        conversions: 67
      }
    ])
  }

  const copyAffiliateLink = () => {
    const link = `https://beneathy.com?ref=${affiliateCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const requestPayout = async () => {
    // Handle payout request
    setShowPayoutModal(true)
  }

  const getTierBenefits = (tier: string) => {
    const benefits = {
      bronze: ['20% commission', 'Monthly payouts', 'Basic support'],
      silver: ['25% commission', 'Bi-weekly payouts', 'Priority support', 'Custom links'],
      gold: ['30% commission', 'Weekly payouts', 'Dedicated manager', 'Custom creatives'],
      platinum: ['35% commission', 'Instant payouts', 'White-label options', 'API access']
    }
    return benefits[tier as keyof typeof benefits] || []
  }

  const getNextTierRequirement = (currentTier: string) => {
    const requirements = {
      bronze: { tier: 'Silver', referrals: 10, revenue: 500 },
      silver: { tier: 'Gold', referrals: 50, revenue: 5000 },
      gold: { tier: 'Platinum', referrals: 100, revenue: 20000 },
      platinum: null
    }
    return requirements[currentTier as keyof typeof requirements]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Affiliate Dashboard</h1>
            <p className="text-gray-600">Track your earnings and grow your referral network</p>
          </div>

          {/* Affiliate Link */}
          <Card className="mb-6 bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Your Affiliate Link</h3>
                  <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                    <Link2 className="h-5 w-5" />
                    <code className="text-sm">https://beneathy.com?ref={affiliateCode}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copyAffiliateLink}
                      className="text-white hover:bg-white/20"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-white text-teal-600 mb-2">
                    {stats.tier.toUpperCase()} TIER
                  </Badge>
                  <p className="text-2xl font-bold">{stats.commissionRate}% Commission</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Current Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">${stats.currentBalance.toFixed(2)}</p>
                  <CreditCard className="h-5 w-5 text-blue-500" />
                </div>
                <Button size="sm" className="mt-2" onClick={requestPayout}>
                  Request Payout
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">{stats.activeReferrals}</p>
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalReferrals} total • {stats.conversionRate}% conversion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg. Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">${stats.averageOrderValue}</p>
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Per referral</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Your earnings and referrals over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                    <span className="ml-2 text-gray-500">Chart visualization here</span>
                  </div>
                </CardContent>
              </Card>

              {/* Tier Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Tier Progress</CardTitle>
                  <CardDescription>Your progress to the next tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        Current: {stats.tier.toUpperCase()}
                      </Badge>
                      {getNextTierRequirement(stats.tier) && (
                        <Badge className="text-lg px-3 py-1">
                          Next: {getNextTierRequirement(stats.tier)?.tier}
                        </Badge>
                      )}
                    </div>
                    
                    {getNextTierRequirement(stats.tier) && (
                      <>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Referrals Progress</span>
                            <span>{stats.totalReferrals} / {getNextTierRequirement(stats.tier)?.referrals}</span>
                          </div>
                          <Progress 
                            value={(stats.totalReferrals / (getNextTierRequirement(stats.tier)?.referrals || 1)) * 100} 
                            className="h-2"
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Revenue Progress</span>
                            <span>${stats.totalEarnings} / ${getNextTierRequirement(stats.tier)?.revenue}</span>
                          </div>
                          <Progress 
                            value={(stats.totalEarnings / (getNextTierRequirement(stats.tier)?.revenue || 1)) * 100} 
                            className="h-2"
                          />
                        </div>
                      </>
                    )}

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Your Benefits:</h4>
                      <ul className="space-y-1">
                        {getTierBenefits(stats.tier).map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Referrals Tab */}
            <TabsContent value="referrals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Referrals</CardTitle>
                  <CardDescription>Track and manage your referred users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {referrals.map(referral => (
                      <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                            <UserPlus className="h-5 w-5 text-teal-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{referral.userName}</p>
                            <p className="text-sm text-gray-500">
                              Joined {format(new Date(referral.signupDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            referral.status === 'active' ? 'default' :
                            referral.status === 'trial' ? 'secondary' : 'outline'
                          }>
                            {referral.status}
                          </Badge>
                          <p className="text-sm font-semibold mt-1">
                            ${referral.commissionEarned.toFixed(2)} earned
                          </p>
                          <p className="text-xs text-gray-500">
                            ${referral.monthlyValue}/mo
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payouts Tab */}
            <TabsContent value="payouts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payout History</CardTitle>
                  <CardDescription>Your earnings and payment history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payoutHistory.map(payout => (
                      <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold">${payout.amount.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(payout.date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            payout.status === 'completed' ? 'default' :
                            payout.status === 'processing' ? 'secondary' : 'outline'
                          }>
                            {payout.status}
                          </Badge>
                          {payout.invoiceUrl && (
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Marketing Tab */}
            <TabsContent value="marketing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Assets</CardTitle>
                  <CardDescription>Banners, templates, and promotional materials</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {marketingAssets.map(asset => (
                      <div key={asset.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-32 bg-gray-100 flex items-center justify-center">
                          {asset.type === 'banner' && <Globe className="h-8 w-8 text-gray-400" />}
                          {asset.type === 'email' && <Mail className="h-8 w-8 text-gray-400" />}
                          {asset.type === 'social' && <Share2 className="h-8 w-8 text-gray-400" />}
                          {asset.type === 'video' && <Youtube className="h-8 w-8 text-gray-400" />}
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold mb-1">{asset.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{asset.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <MousePointer className="h-3 w-3" />
                              {asset.clicks} clicks
                            </span>
                            <span className="flex items-center gap-1">
                              <UserPlus className="h-3 w-3" />
                              {asset.conversions} conversions
                            </span>
                          </div>
                          <Button size="sm" className="w-full">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payout Settings</CardTitle>
                  <CardDescription>Configure your payment preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Payout Method</label>
                    <select className="w-full mt-1 p-2 border rounded-lg">
                      <option>PayPal</option>
                      <option>Stripe</option>
                      <option>Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Minimum Payout</label>
                    <select className="w-full mt-1 p-2 border rounded-lg">
                      <option>$50</option>
                      <option>$100</option>
                      <option>$250</option>
                      <option>$500</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tax Information</label>
                    <Button variant="outline" className="w-full mt-1">
                      Upload W-9 / Tax Form
                    </Button>
                  </div>
                  <Button className="w-full">Save Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default function AffiliateDashboard() {
  return (
    <AuthProvider>
      <AffiliateDashboardContent />
    </AuthProvider>
  )
}