// Tier-based feature limits and access control
import { createClient } from '@/lib/supabase/client'

export interface TierLimits {
  ai_messages: number // -1 for unlimited
  voice_minutes: number // -1 for unlimited
  buddy_matching: number // -1 for unlimited
  group_sessions: number // -1 for unlimited
  peer_messaging: boolean
  pattern_insights: 'weekly' | 'daily' | 'real-time'
  community_access: 'none' | 'read' | 'read_post' | 'full'
  therapist_matching: boolean
  export_data: boolean
  custom_ai_personality: boolean
  api_access: boolean
  family_accounts: number
  priority_support: boolean
}

export const TIER_LIMITS: Record<string, TierLimits> = {
  lite: {
    ai_messages: 30,
    voice_minutes: 0,
    buddy_matching: 0,
    group_sessions: 0,
    peer_messaging: false,
    pattern_insights: 'weekly',
    community_access: 'read_post',
    therapist_matching: false,
    export_data: false,
    custom_ai_personality: false,
    api_access: false,
    family_accounts: 0,
    priority_support: false
  },
  starter: {
    ai_messages: 200,
    voice_minutes: 60,
    buddy_matching: 1,
    group_sessions: 0,
    peer_messaging: true,
    pattern_insights: 'daily',
    community_access: 'full',
    therapist_matching: false,
    export_data: true,
    custom_ai_personality: false,
    api_access: false,
    family_accounts: 0,
    priority_support: false
  },
  growth: {
    ai_messages: -1, // unlimited
    voice_minutes: 300,
    buddy_matching: 3,
    group_sessions: 4,
    peer_messaging: true,
    pattern_insights: 'real-time',
    community_access: 'full',
    therapist_matching: true,
    export_data: true,
    custom_ai_personality: true,
    api_access: false,
    family_accounts: 0,
    priority_support: true
  },
  premium: {
    ai_messages: -1,
    voice_minutes: -1,
    buddy_matching: -1,
    group_sessions: -1,
    peer_messaging: true,
    pattern_insights: 'real-time',
    community_access: 'full',
    therapist_matching: true,
    export_data: true,
    custom_ai_personality: true,
    api_access: true,
    family_accounts: 2,
    priority_support: true
  }
}

// Check if user has access to a feature
export async function checkFeatureAccess(
  userId: string, 
  feature: keyof TierLimits
): Promise<boolean> {
  const supabase = createClient()
  
  const { data: user } = await (supabase as any)
    .from('users')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  if (!user) return false
  
  const tier = (user as any).subscription_tier?.toLowerCase() || 'lite'
  const limits = TIER_LIMITS[tier]
  
  if (!limits) return false
  
  const value = limits[feature]
  
  // Boolean features
  if (typeof value === 'boolean') return value
  
  // Numeric features (0 = no access, -1 = unlimited, >0 = has access)
  if (typeof value === 'number') return value !== 0
  
  // String features (check if not 'none')
  if (typeof value === 'string') return value !== 'none'
  
  return false
}

// Get current usage for rate-limited features
export async function getCurrentUsage(
  userId: string,
  period: 'daily' | 'monthly' = 'monthly'
): Promise<{
  ai_messages: number
  voice_minutes: number
  buddy_matches: number
  group_sessions: number
}> {
  const supabase = createClient()
  
  const startDate = period === 'daily' 
    ? new Date(new Date().setHours(0, 0, 0, 0))
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  // Count AI messages
  const { count: aiMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('sender_type', 'ai')
    .gte('created_at', startDate.toISOString())

  // Count voice minutes
  const { data: voiceSessions } = await (supabase as any)
    .from('voice_sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
  
  const voiceMinutes = voiceSessions?.reduce((sum: number, session: any) => 
    sum + (session.duration_seconds / 60), 0) || 0

  // Count buddy matches
  const { count: buddyMatches } = await (supabase as any)
    .from('buddy_connections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  // Count group sessions
  const { count: groupSessions } = await (supabase as any)
    .from('group_session_participants')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  return {
    ai_messages: aiMessages || 0,
    voice_minutes: Math.round(voiceMinutes),
    buddy_matches: buddyMatches || 0,
    group_sessions: groupSessions || 0
  }
}

// Check if user has exceeded limits
export async function checkLimits(
  userId: string,
  feature: 'ai_messages' | 'voice_minutes' | 'buddy_matching' | 'group_sessions'
): Promise<{ allowed: boolean; limit: number; used: number; remaining: number }> {
  const supabase = createClient()
  
  const { data: user } = await (supabase as any)
    .from('users')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  const tier = (user as any)?.subscription_tier?.toLowerCase() || 'lite'
  const limits = TIER_LIMITS[tier]
  const limit = limits[feature] as number
  
  // Unlimited access
  if (limit === -1) {
    return { allowed: true, limit: -1, used: 0, remaining: -1 }
  }
  
  // No access
  if (limit === 0) {
    return { allowed: false, limit: 0, used: 0, remaining: 0 }
  }
  
  // Check current usage
  const usage = await getCurrentUsage(userId)
  const used = usage[feature.replace('_', '') as keyof typeof usage]
  const remaining = limit - used
  
  return {
    allowed: remaining > 0,
    limit,
    used,
    remaining: Math.max(0, remaining)
  }
}

// Middleware to enforce limits in API routes
export async function enforceLimits(
  userId: string,
  feature: 'ai_messages' | 'voice_minutes' | 'buddy_matching' | 'group_sessions'
): Promise<{ success: boolean; error?: string; upgradeRequired?: string }> {
  const limitCheck = await checkLimits(userId, feature)
  
  if (!limitCheck.allowed) {
    const featureNames = {
      ai_messages: 'AI coach messages',
      voice_minutes: 'voice minutes',
      buddy_matching: 'buddy matches',
      group_sessions: 'group sessions'
    }
    
    return {
      success: false,
      error: `You've reached your monthly limit of ${limitCheck.limit} ${featureNames[feature]}.`,
      upgradeRequired: getUpgradeMessage(feature)
    }
  }
  
  return { success: true }
}

// Get upgrade message based on feature
function getUpgradeMessage(feature: string): string {
  switch (feature) {
    case 'ai_messages':
      return 'Upgrade to Growth for unlimited AI coaching'
    case 'voice_minutes':
      return 'Upgrade to Starter to unlock voice features'
    case 'buddy_matching':
      return 'Upgrade to Growth for more buddy connections'
    case 'group_sessions':
      return 'Upgrade to Growth to join group sessions'
    default:
      return 'Upgrade your plan for more features'
  }
}