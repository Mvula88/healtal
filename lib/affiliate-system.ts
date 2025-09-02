import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'

export interface AffiliateProgram {
  id: string
  userId: string
  affiliateCode: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  commissionRate: number
  totalEarnings: number
  currentBalance: number
  totalReferrals: number
  activeReferrals: number
  createdAt: Date
  approvedAt?: Date
  status: 'pending' | 'approved' | 'suspended'
}

export interface AffiliateLink {
  id: string
  affiliateId: string
  url: string
  customSlug?: string
  clicks: number
  conversions: number
  revenue: number
  createdAt: Date
}

export interface Commission {
  id: string
  affiliateId: string
  referralId: string
  amount: number
  percentage: number
  status: 'pending' | 'approved' | 'paid'
  orderValue: number
  planType: string
  createdAt: Date
  paidAt?: Date
}

export interface Payout {
  id: string
  affiliateId: string
  amount: number
  method: 'paypal' | 'stripe' | 'bank' | 'crypto'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  transactionId?: string
  notes?: string
  requestedAt: Date
  processedAt?: Date
}

export class AffiliateSystem {
  private supabase: any

  constructor() {
    this.supabase = createClient()
  }

  // Generate unique affiliate code
  generateAffiliateCode(email: string): string {
    const prefix = email.split('@')[0].substring(0, 5).toUpperCase()
    const suffix = Math.random().toString(36).substring(2, 7).toUpperCase()
    return `${prefix}${suffix}`
  }

  // Create new affiliate account
  async createAffiliate(userId: string, email: string): Promise<AffiliateProgram> {
    const affiliateCode = this.generateAffiliateCode(email)
    
    const { data, error } = await this.supabase
      .from('affiliates')
      .insert({
        user_id: userId,
        affiliate_code: affiliateCode,
        tier: 'bronze',
        commission_rate: 20,
        total_earnings: 0,
        current_balance: 0,
        total_referrals: 0,
        active_referrals: 0,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Track affiliate link click
  async trackClick(affiliateCode: string, url: string, metadata?: any): Promise<void> {
    // Get affiliate ID from code
    const { data: affiliate } = await this.supabase
      .from('affiliates')
      .select('id')
      .eq('affiliate_code', affiliateCode)
      .single()

    if (!affiliate) return

    // Record click
    await this.supabase
      .from('affiliate_clicks')
      .insert({
        affiliate_id: affiliate.id,
        url,
        metadata,
        clicked_at: new Date().toISOString()
      })

    // Update link stats
    await this.supabase
      .from('affiliate_links')
      .update({ 
        clicks: this.supabase.raw('clicks + 1'),
        last_clicked: new Date().toISOString()
      })
      .eq('affiliate_id', affiliate.id)
      .eq('url', url)
  }

  // Process referral signup
  async processReferral(
    affiliateCode: string,
    newUserId: string,
    planType: string,
    planValue: number
  ): Promise<Commission> {
    // Get affiliate details
    const { data: affiliate } = await this.supabase
      .from('affiliates')
      .select('*')
      .eq('affiliate_code', affiliateCode)
      .single()

    if (!affiliate || affiliate.status !== 'approved') {
      throw new Error('Invalid or inactive affiliate code')
    }

    // Create referral record
    const { data: referral } = await this.supabase
      .from('referrals')
      .insert({
        affiliate_id: affiliate.id,
        referred_user_id: newUserId,
        plan_type: planType,
        plan_value: planValue,
        status: 'trial',
        signup_date: new Date().toISOString()
      })
      .select()
      .single()

    // Calculate commission
    const commissionAmount = (planValue * affiliate.commission_rate) / 100

    // Create commission record
    const { data: commission } = await this.supabase
      .from('commissions')
      .insert({
        affiliate_id: affiliate.id,
        referral_id: referral.id,
        amount: commissionAmount,
        percentage: affiliate.commission_rate,
        status: 'pending',
        order_value: planValue,
        plan_type: planType
      })
      .select()
      .single()

    // Update affiliate stats
    await this.updateAffiliateStats(affiliate.id)

    // Send notification
    await this.notifyAffiliateOfReferral(affiliate.id, newUserId, commissionAmount)

    return commission
  }

  // Process commission payment (when referral converts)
  async processCommission(referralId: string): Promise<void> {
    // Get commission details
    const { data: commission } = await this.supabase
      .from('commissions')
      .select('*')
      .eq('referral_id', referralId)
      .eq('status', 'pending')
      .single()

    if (!commission) return

    // Update commission status
    await this.supabase
      .from('commissions')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', commission.id)

    // Update affiliate balance
    await this.supabase
      .from('affiliates')
      .update({
        current_balance: this.supabase.raw(`current_balance + ${commission.amount}`),
        total_earnings: this.supabase.raw(`total_earnings + ${commission.amount}`)
      })
      .eq('id', commission.affiliate_id)

    // Update referral status
    await this.supabase
      .from('referrals')
      .update({ status: 'active' })
      .eq('id', referralId)
  }

  // Request payout
  async requestPayout(
    affiliateId: string,
    amount: number,
    method: 'paypal' | 'stripe' | 'bank' | 'crypto',
    details: any
  ): Promise<Payout> {
    // Check balance
    const { data: affiliate } = await this.supabase
      .from('affiliates')
      .select('current_balance')
      .eq('id', affiliateId)
      .single()

    if (!affiliate || affiliate.current_balance < amount) {
      throw new Error('Insufficient balance')
    }

    // Create payout request
    const { data: payout } = await this.supabase
      .from('payouts')
      .insert({
        affiliate_id: affiliateId,
        amount,
        method,
        status: 'pending',
        payment_details: details,
        requested_at: new Date().toISOString()
      })
      .select()
      .single()

    // Deduct from balance
    await this.supabase
      .from('affiliates')
      .update({
        current_balance: this.supabase.raw(`current_balance - ${amount}`),
        pending_payout: amount
      })
      .eq('id', affiliateId)

    // Notify admin for processing
    await this.notifyAdminOfPayoutRequest(payout)

    return payout
  }

  // Process payout (admin action)
  async processPayout(payoutId: string, transactionId?: string): Promise<void> {
    const { data: payout } = await this.supabase
      .from('payouts')
      .select('*')
      .eq('id', payoutId)
      .single()

    if (!payout) throw new Error('Payout not found')

    // Update payout status
    await this.supabase
      .from('payouts')
      .update({
        status: 'completed',
        transaction_id: transactionId,
        processed_at: new Date().toISOString()
      })
      .eq('id', payoutId)

    // Update affiliate
    await this.supabase
      .from('affiliates')
      .update({
        pending_payout: 0,
        last_payout_at: new Date().toISOString()
      })
      .eq('id', payout.affiliate_id)

    // Create payout history record
    await this.supabase
      .from('payout_history')
      .insert({
        affiliate_id: payout.affiliate_id,
        amount: payout.amount,
        method: payout.method,
        transaction_id: transactionId,
        processed_at: new Date().toISOString()
      })
  }

  // Update affiliate tier based on performance
  async updateAffiliateTier(affiliateId: string): Promise<void> {
    const { data: affiliate } = await this.supabase
      .from('affiliates')
      .select('*')
      .eq('id', affiliateId)
      .single()

    if (!affiliate) return

    let newTier = affiliate.tier
    let newRate = affiliate.commission_rate

    // Tier progression logic
    if (affiliate.total_earnings >= 20000 && affiliate.total_referrals >= 100) {
      newTier = 'platinum'
      newRate = 35
    } else if (affiliate.total_earnings >= 5000 && affiliate.total_referrals >= 50) {
      newTier = 'gold'
      newRate = 30
    } else if (affiliate.total_earnings >= 500 && affiliate.total_referrals >= 10) {
      newTier = 'silver'
      newRate = 25
    }

    if (newTier !== affiliate.tier) {
      await this.supabase
        .from('affiliates')
        .update({
          tier: newTier,
          commission_rate: newRate,
          tier_updated_at: new Date().toISOString()
        })
        .eq('id', affiliateId)

      // Notify affiliate of tier upgrade
      await this.notifyAffiliateOfTierUpgrade(affiliateId, newTier)
    }
  }

  // Get affiliate statistics
  async getAffiliateStats(affiliateId: string): Promise<any> {
    const [affiliate, referrals, commissions, payouts] = await Promise.all([
      this.supabase
        .from('affiliates')
        .select('*')
        .eq('id', affiliateId)
        .single(),
      
      this.supabase
        .from('referrals')
        .select('*')
        .eq('affiliate_id', affiliateId),
      
      this.supabase
        .from('commissions')
        .select('*')
        .eq('affiliate_id', affiliateId),
      
      this.supabase
        .from('payouts')
        .select('*')
        .eq('affiliate_id', affiliateId)
    ])

    const activeReferrals = referrals.data?.filter((r: any) => r.status === 'active').length || 0
    const conversionRate = referrals.data?.length > 0 
      ? (activeReferrals / referrals.data.length) * 100 
      : 0

    const totalCommissions = commissions.data?.reduce((sum: number, c: any) => sum + c.amount, 0) || 0
    const averageOrderValue = commissions.data?.length > 0
      ? totalCommissions / commissions.data.length
      : 0

    return {
      affiliate: affiliate.data,
      stats: {
        totalReferrals: referrals.data?.length || 0,
        activeReferrals,
        conversionRate,
        totalCommissions,
        averageOrderValue,
        totalPayouts: payouts.data?.filter((p: any) => p.status === 'completed').length || 0
      },
      referrals: referrals.data || [],
      commissions: commissions.data || [],
      payouts: payouts.data || []
    }
  }

  // Generate custom affiliate link
  async createCustomLink(
    affiliateId: string,
    url: string,
    customSlug?: string
  ): Promise<AffiliateLink> {
    const { data: affiliate } = await this.supabase
      .from('affiliates')
      .select('affiliate_code')
      .eq('id', affiliateId)
      .single()

    if (!affiliate) throw new Error('Affiliate not found')

    const finalUrl = customSlug 
      ? `https://beneathy.com/${customSlug}?ref=${affiliate.affiliate_code}`
      : `${url}?ref=${affiliate.affiliate_code}`

    const { data: link } = await this.supabase
      .from('affiliate_links')
      .insert({
        affiliate_id: affiliateId,
        url: finalUrl,
        custom_slug: customSlug,
        clicks: 0,
        conversions: 0,
        revenue: 0
      })
      .select()
      .single()

    return link
  }

  // Private helper methods
  private async updateAffiliateStats(affiliateId: string): Promise<void> {
    const { data: referrals } = await this.supabase
      .from('referrals')
      .select('status')
      .eq('affiliate_id', affiliateId)

    const totalReferrals = referrals?.length || 0
    const activeReferrals = referrals?.filter((r: any) => r.status === 'active').length || 0

    await this.supabase
      .from('affiliates')
      .update({
        total_referrals: totalReferrals,
        active_referrals: activeReferrals
      })
      .eq('id', affiliateId)

    // Check for tier upgrade
    await this.updateAffiliateTier(affiliateId)
  }

  private async notifyAffiliateOfReferral(
    affiliateId: string,
    referredUserId: string,
    commissionAmount: number
  ): Promise<void> {
    // Send email/notification to affiliate about new referral
    console.log(`Notifying affiliate ${affiliateId} of new referral worth $${commissionAmount}`)
  }

  private async notifyAffiliateOfTierUpgrade(
    affiliateId: string,
    newTier: string
  ): Promise<void> {
    // Send congratulations email about tier upgrade
    console.log(`Notifying affiliate ${affiliateId} of tier upgrade to ${newTier}`)
  }

  private async notifyAdminOfPayoutRequest(payout: Payout): Promise<void> {
    // Send notification to admin about payout request
    console.log(`Admin notification: Payout request ${payout.id} for $${payout.amount}`)
  }
}

export const affiliateSystem = new AffiliateSystem()