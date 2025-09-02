import { createUntypedClient as createClient } from '@/lib/supabase/client-untyped'

export interface NotificationPreferences {
  dailyCheckIn: boolean
  weeklyInsights: boolean
  patternAlerts: boolean
  communityUpdates: boolean
  buddyMessages: boolean
  achievementMilestones: boolean
  crisisSupport: boolean
  pushEnabled: boolean
  emailEnabled: boolean
  smsEnabled: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: Date
  readAt?: Date
  actionUrl?: string
}

export type NotificationType = 
  | 'daily_checkin'
  | 'pattern_detected'
  | 'pattern_improved'
  | 'weekly_insights'
  | 'buddy_message'
  | 'group_activity'
  | 'achievement_unlocked'
  | 'crisis_check'
  | 'session_reminder'
  | 'challenge_invite'
  | 'success_story'
  | 'community_milestone'

class NotificationService {
  private supabase: any
  private vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  private swRegistration: ServiceWorkerRegistration | null = null

  constructor() {
    this.supabase = createClient()
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      this.initializeServiceWorker()
    }
  }

  private async initializeServiceWorker() {
    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered successfully')
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  async subscribeToPush(userId: string): Promise<PushSubscription | null> {
    if (!this.swRegistration || !this.vapidPublicKey) {
      console.error('Service Worker not ready or VAPID key missing')
      return null
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      })

      // Save subscription to database
      await this.supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          subscription: subscription.toJSON(),
          updated_at: new Date().toISOString()
        })

      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      priority?: 'low' | 'medium' | 'high' | 'urgent'
      actionUrl?: string
      data?: any
    }
  ): Promise<void> {
    // Save notification to database
    const { data: notification, error } = await this.supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        priority: options?.priority || 'medium',
        action_url: options?.actionUrl,
        data: options?.data,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to save notification:', error)
      return
    }

    // Check user preferences
    const { data: preferences } = await this.supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!preferences?.pushEnabled) {
      return
    }

    // Check quiet hours
    if (this.isQuietHours(preferences)) {
      return
    }

    // Send push notification
    await this.triggerPushNotification(userId, notification)

    // Send email if enabled
    if (preferences?.emailEnabled) {
      await this.sendEmailNotification(userId, notification)
    }
  }

  private isQuietHours(preferences: any): boolean {
    if (!preferences?.quietHoursStart || !preferences?.quietHoursEnd) {
      return false
    }

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number)
    const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number)
    
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime
    } else {
      return currentTime >= startTime || currentTime <= endTime
    }
  }

  private async triggerPushNotification(userId: string, notification: any) {
    try {
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          notification
        })
      })

      if (!response.ok) {
        console.error('Failed to send push notification')
      }
    } catch (error) {
      console.error('Error sending push notification:', error)
    }
  }

  private async sendEmailNotification(userId: string, notification: any) {
    try {
      await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          notification
        })
      })
    } catch (error) {
      console.error('Error sending email notification:', error)
    }
  }

  async getNotifications(userId: string, limit = 20): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch notifications:', error)
      return []
    }

    return data || []
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('read', false)
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    await this.supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
  }

  // Automated notification triggers
  async scheduleDailyCheckIn(userId: string, time: string = '09:00') {
    await this.supabase
      .from('scheduled_notifications')
      .upsert({
        user_id: userId,
        type: 'daily_checkin',
        schedule_time: time,
        is_active: true,
        title: 'Time for your daily check-in',
        message: 'How are you feeling today? Take a moment to reflect on your patterns.',
        updated_at: new Date().toISOString()
      })
  }

  async triggerPatternAlert(
    userId: string,
    pattern: {
      name: string
      type: string
      severity: number
    }
  ) {
    const title = `Pattern Alert: ${pattern.name}`
    const message = pattern.severity > 7 
      ? `High severity ${pattern.type} pattern detected. Consider using your coping strategies.`
      : `We noticed a ${pattern.type} pattern emerging. Would you like to explore this?`

    await this.sendNotification(
      userId,
      'pattern_detected',
      title,
      message,
      {
        priority: pattern.severity > 7 ? 'high' : 'medium',
        actionUrl: '/patterns',
        data: { pattern }
      }
    )
  }

  async notifyPatternImprovement(
    userId: string,
    pattern: string,
    improvement: number
  ) {
    await this.sendNotification(
      userId,
      'pattern_improved',
      'Great Progress!',
      `Your ${pattern} pattern has improved by ${improvement}%. Keep up the excellent work!`,
      {
        priority: 'medium',
        actionUrl: '/patterns',
        data: { pattern, improvement }
      }
    )
  }

  async notifyAchievement(
    userId: string,
    achievement: {
      name: string
      description: string
      badge?: string
    }
  ) {
    await this.sendNotification(
      userId,
      'achievement_unlocked',
      `Achievement Unlocked: ${achievement.name}`,
      achievement.description,
      {
        priority: 'low',
        actionUrl: '/profile',
        data: { achievement }
      }
    )
  }

  async notifyCommunityMilestone(
    userId: string,
    milestone: string
  ) {
    await this.sendNotification(
      userId,
      'community_milestone',
      'Community Milestone!',
      milestone,
      {
        priority: 'low',
        actionUrl: '/community'
      }
    )
  }
}

export const notificationService = new NotificationService()