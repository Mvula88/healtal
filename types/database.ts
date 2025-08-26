export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'explore' | 'transform' | 'enterprise'
          created_at: string
          updated_at: string
          onboarding_completed: boolean
          growth_goals: Json
          emergency_contacts: Json
          preferences: Json
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'explore' | 'transform' | 'enterprise'
          created_at?: string
          updated_at?: string
          onboarding_completed?: boolean
          growth_goals?: Json
          emergency_contacts?: Json
          preferences?: Json
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'explore' | 'transform' | 'enterprise'
          created_at?: string
          updated_at?: string
          onboarding_completed?: boolean
          growth_goals?: Json
          emergency_contacts?: Json
          preferences?: Json
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string | null
          created_at: string
          updated_at: string
          conversation_type: 'exploration' | 'reflection' | 'crisis_support' | 'growth_journey'
          tags: string[]
          insights_generated: Json
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          created_at?: string
          updated_at?: string
          conversation_type?: 'exploration' | 'reflection' | 'crisis_support' | 'growth_journey'
          tags?: string[]
          insights_generated?: Json
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          created_at?: string
          updated_at?: string
          conversation_type?: 'exploration' | 'reflection' | 'crisis_support' | 'growth_journey'
          tags?: string[]
          insights_generated?: Json
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'coach'
          content: string
          created_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'coach'
          content: string
          created_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'coach'
          content?: string
          created_at?: string
          metadata?: Json
        }
      }
      personal_insights: {
        Row: {
          id: string
          user_id: string
          insight_type: 'pattern' | 'connection' | 'breakthrough' | 'opportunity'
          content: Json
          confidence_score: number
          created_at: string
          user_validated: boolean
        }
        Insert: {
          id?: string
          user_id: string
          insight_type: 'pattern' | 'connection' | 'breakthrough' | 'opportunity'
          content: Json
          confidence_score?: number
          created_at?: string
          user_validated?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          insight_type?: 'pattern' | 'connection' | 'breakthrough' | 'opportunity'
          content?: Json
          confidence_score?: number
          created_at?: string
          user_validated?: boolean
        }
      }
      wellness_entries: {
        Row: {
          id: string
          user_id: string
          mood_score: number | null
          energy_level: number | null
          life_satisfaction: Json
          notes: string | null
          created_at: string
          context: Json
        }
        Insert: {
          id?: string
          user_id: string
          mood_score?: number | null
          energy_level?: number | null
          life_satisfaction?: Json
          notes?: string | null
          created_at?: string
          context?: Json
        }
        Update: {
          id?: string
          user_id?: string
          mood_score?: number | null
          energy_level?: number | null
          life_satisfaction?: Json
          notes?: string | null
          created_at?: string
          context?: Json
        }
      }
      growth_journeys: {
        Row: {
          id: string
          name: string
          description: string | null
          steps: Json
          focus_areas: string[]
          estimated_duration_weeks: number | null
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          steps?: Json
          focus_areas?: string[]
          estimated_duration_weeks?: number | null
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          steps?: Json
          focus_areas?: string[]
          estimated_duration_weeks?: number | null
          created_at?: string
          is_active?: boolean
        }
      }
      user_journey_progress: {
        Row: {
          id: string
          user_id: string
          journey_id: string
          current_step: number
          started_at: string
          completed_at: string | null
          insights_gained: Json
          progress_notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          journey_id: string
          current_step?: number
          started_at?: string
          completed_at?: string | null
          insights_gained?: Json
          progress_notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          journey_id?: string
          current_step?: number
          started_at?: string
          completed_at?: string | null
          insights_gained?: Json
          progress_notes?: string | null
        }
      }
      life_events: {
        Row: {
          id: string
          user_id: string
          event_title: string
          event_description: string | null
          approximate_date: string | null
          emotional_impact: number | null
          life_area: string | null
          patterns_identified: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_title: string
          event_description?: string | null
          approximate_date?: string | null
          emotional_impact?: number | null
          life_area?: string | null
          patterns_identified?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_title?: string
          event_description?: string | null
          approximate_date?: string | null
          emotional_impact?: number | null
          life_area?: string | null
          patterns_identified?: string[]
          created_at?: string
        }
      }
      coaching_sessions: {
        Row: {
          id: string
          user_id: string
          coach_id: string | null
          scheduled_at: string
          duration_minutes: number
          session_type: string | null
          notes: Json
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          coach_id?: string | null
          scheduled_at: string
          duration_minutes?: number
          session_type?: string | null
          notes?: Json
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          coach_id?: string | null
          scheduled_at?: string
          duration_minutes?: number
          session_type?: string | null
          notes?: Json
          status?: string
          created_at?: string
        }
      }
      community_posts: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string
          is_anonymous: boolean
          tags: string[]
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          content: string
          is_anonymous?: boolean
          tags?: string[]
          likes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string
          is_anonymous?: boolean
          tags?: string[]
          likes?: number
          created_at?: string
          updated_at?: string
        }
      }
      community_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          is_anonymous: boolean
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          is_anonymous?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          is_anonymous?: boolean
          created_at?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          tier: 'free' | 'explore' | 'transform' | 'enterprise'
          price_monthly: number | null
          features: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          tier: 'free' | 'explore' | 'transform' | 'enterprise'
          price_monthly?: number | null
          features?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          tier?: 'free' | 'explore' | 'transform' | 'enterprise'
          price_monthly?: number | null
          features?: Json
          created_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string | null
          status: string
          started_at: string
          expires_at: string | null
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id?: string | null
          status?: string
          started_at?: string
          expires_at?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string | null
          status?: string
          started_at?: string
          expires_at?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string
        }
      }
      wellness_resources: {
        Row: {
          id: string
          category: string
          title: string
          content: string
          resource_type: string
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          title: string
          content: string
          resource_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          title?: string
          content?: string
          resource_type?: string
          created_at?: string
        }
      }
      daily_affirmations: {
        Row: {
          id: string
          affirmation: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          affirmation: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          affirmation?: string
          category?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'explore' | 'transform' | 'enterprise'
      conversation_type: 'exploration' | 'reflection' | 'crisis_support' | 'growth_journey'
      insight_type: 'pattern' | 'connection' | 'breakthrough' | 'opportunity'
      message_role: 'user' | 'coach'
    }
  }
}