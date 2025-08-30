// Healing Circles - Peer-Led Support Groups System
// Where survivors become guides and monetize their healing journey

export interface HealingCircle {
  id: string
  guide_id: string
  title: string
  tagline: string
  description: string
  category: CircleCategory
  subcategories: string[]
  guide_story: string // The guide's personal transformation story
  what_you_learn: string[]
  who_this_is_for: string[]
  meeting_format: MeetingFormat
  pricing: PricingStructure
  capacity: CircleCapacity
  requirements: string[]
  community_guidelines: string[]
  success_stories: SuccessStory[]
  rating: number
  total_members: number
  total_graduates: number
  created_at: Date
  status: 'pending_review' | 'active' | 'paused' | 'archived'
  verification_status: 'unverified' | 'verified' | 'certified'
  ai_endorsement?: AIEndorsement
}

export interface CircleGuide {
  id: string
  user_id: string
  name: string
  bio: string
  transformation_story: string // Detailed story of their journey
  credentials: GuideCredential[]
  specializations: string[]
  years_of_experience: number // Since overcoming their challenge
  approach: string
  total_circles_led: number
  total_members_helped: number
  average_rating: number
  earnings_total: number
  earnings_this_month: number
  verification_status: VerificationStatus
  testimonials: Testimonial[]
  availability: AvailabilitySchedule
  languages: string[]
  timezone: string
}

export interface GuideCredential {
  type: 'lived_experience' | 'certification' | 'training' | 'education'
  title: string
  description: string
  verified: boolean
  verification_date?: Date
  issuer?: string
}

export interface MeetingFormat {
  type: 'weekly_group' | 'intensive_workshop' | 'ongoing_support' | 'bootcamp'
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  duration: string // "60 minutes", "2 hours", etc.
  platform: 'video' | 'audio' | 'chat' | 'hybrid'
  time_commitment: string // "2 hours/week for 8 weeks"
  schedule: MeetingSchedule[]
}

export interface MeetingSchedule {
  day: string
  time: string
  timezone: string
  recurring: boolean
}

export interface PricingStructure {
  model: 'subscription' | 'one_time' | 'pay_per_session' | 'donation_based'
  amount: number
  currency: string
  billing_period?: 'weekly' | 'monthly' | 'quarterly'
  trial_available: boolean
  trial_duration?: number // days
  refund_policy: string
  scholarships_available: boolean
  sliding_scale: boolean
  group_discounts?: GroupDiscount[]
}

export interface GroupDiscount {
  participant_count: number
  discount_percentage: number
}

export interface CircleCapacity {
  minimum: number // Minimum members to start
  maximum: number // Maximum for quality
  current: number
  waitlist: number
}

export interface CircleMember {
  id: string
  user_id: string
  circle_id: string
  joined_at: Date
  status: 'active' | 'completed' | 'dropped' | 'removed'
  progress: MemberProgress
  payments: Payment[]
  attendance: AttendanceRecord[]
  contributions: Contribution[]
  transformation_story?: string // Their own story after completing
}

export interface MemberProgress {
  sessions_attended: number
  sessions_total: number
  milestones_completed: string[]
  breakthroughs: Breakthrough[]
  current_phase: string
  engagement_score: number
  peer_support_given: number
  peer_support_received: number
}

export interface Breakthrough {
  id: string
  date: Date
  description: string
  impact_level: 'minor' | 'moderate' | 'major' | 'transformational'
  shared_with_group: boolean
}

export interface SuccessStory {
  id: string
  member_id: string
  member_name: string // First name only or anonymous
  story: string
  transformation_metrics: TransformationMetric[]
  date: Date
  verified: boolean
  featured: boolean
}

export interface TransformationMetric {
  area: string // "Anxiety levels", "Relationship quality", etc.
  before: string
  after: string
  improvement_percentage?: number
}

export interface Testimonial {
  id: string
  author_id: string
  author_name: string
  content: string
  rating: number
  date: Date
  verified: boolean
  helpful_count: number
}

export interface AIEndorsement {
  endorsed: boolean
  confidence_score: number
  analysis: string
  strengths: string[]
  growth_areas: string[]
  recommended_for: string[]
  generated_at: Date
}

export interface VerificationStatus {
  level: 'basic' | 'verified' | 'certified' | 'expert'
  verified_at?: Date
  verified_by?: string
  verification_method: string[]
  evidence_provided: string[]
  next_review_date?: Date
}

export type CircleCategory = 
  | 'addiction_recovery'
  | 'trauma_healing'
  | 'grief_loss'
  | 'anxiety_disorders'
  | 'depression_recovery'
  | 'relationship_healing'
  | 'divorce_recovery'
  | 'parenting_challenges'
  | 'career_transition'
  | 'chronic_illness'
  | 'eating_disorders'
  | 'self_worth'
  | 'anger_management'
  | 'codependency'
  | 'narcissistic_abuse_recovery'
  | 'domestic_violence_survivor'
  | 'sexual_trauma'
  | 'childhood_trauma'
  | 'abandonment_issues'
  | 'trust_issues'

// Guide Application and Verification Process
export interface GuideApplication {
  id: string
  user_id: string
  transformation_story: string // Detailed story of overcoming
  years_since_breakthrough: number
  current_stability: string // How stable they are now
  motivation_to_guide: string
  relevant_experience: string[]
  target_audience: string
  proposed_circle_topic: string
  availability_commitment: string
  references: Reference[]
  background_check_consent: boolean
  terms_accepted: boolean
  submitted_at: Date
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'additional_info_needed'
  review_notes?: string
  ai_assessment?: AIGuideAssessment
}

export interface Reference {
  name: string
  relationship: string
  contact: string
  years_known: number
}

export interface AIGuideAssessment {
  readiness_score: number // 0-100
  strengths: string[]
  concerns: string[]
  recommended_training: string[]
  suggested_circle_format: string
  estimated_impact_potential: 'low' | 'medium' | 'high' | 'exceptional'
  analysis: string
}

// Revenue Sharing and Payments
export interface RevenueModel {
  platform_fee_percentage: number // e.g., 20%
  guide_earnings_percentage: number // e.g., 80%
  payment_processing_fee: number // e.g., 2.9% + $0.30
  minimum_payout: number // e.g., $50
  payout_frequency: 'weekly' | 'biweekly' | 'monthly'
  tax_reporting: boolean
}

export interface Payment {
  id: string
  circle_id: string
  member_id: string
  guide_id: string
  amount: number
  currency: string
  platform_fee: number
  guide_earnings: number
  processing_fee: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method: string
  transaction_id: string
  created_at: Date
  paid_at?: Date
}

export interface GuidePayout {
  id: string
  guide_id: string
  period_start: Date
  period_end: Date
  total_earnings: number
  platform_fees: number
  net_payout: number
  payment_method: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  transaction_id?: string
  paid_at?: Date
}

// Matching Algorithm
export interface CircleMatch {
  circle: HealingCircle
  guide: CircleGuide
  match_score: number // 0-100
  match_reasons: string[]
  compatibility_factors: CompatibilityFactor[]
  recommended_priority: 'low' | 'medium' | 'high' | 'perfect'
}

export interface CompatibilityFactor {
  factor: string
  score: number
  weight: number
  explanation: string
}

// Quality Assurance
export interface CircleQualityMetrics {
  circle_id: string
  completion_rate: number
  satisfaction_score: number
  transformation_score: number
  engagement_level: number
  peer_support_index: number
  breakthrough_frequency: number
  recommendation_rate: number // NPS
  retention_rate: number
  last_evaluated: Date
}

export interface SafetyProtocol {
  crisis_resources: CrisisResource[]
  reporting_mechanism: string
  moderation_policy: string
  guide_training_required: string[]
  member_agreements: string[]
  boundary_guidelines: string[]
  escalation_process: string[]
}

export interface CrisisResource {
  type: 'hotline' | 'text' | 'online_chat' | 'emergency'
  name: string
  contact: string
  availability: string
  specialization?: string
}

// AI Integration for Circles
export interface CircleAISupport {
  session_insights: boolean // AI analyzes group dynamics
  progress_tracking: boolean // AI tracks member progress
  breakthrough_detection: boolean // AI identifies breakthroughs
  risk_monitoring: boolean // AI monitors for crisis situations
  content_suggestions: boolean // AI suggests discussion topics
  matching_algorithm: boolean // AI matches members to circles
  guide_coaching: boolean // AI provides guidance to guides
}

// Success Metrics
export interface CircleSuccessMetrics {
  total_circles: number
  active_circles: number
  total_members: number
  total_guides: number
  average_transformation_score: number
  total_breakthroughs: number
  member_satisfaction: number
  guide_satisfaction: number
  revenue_generated: number
  lives_transformed: number
}

// Search and Discovery
export interface CircleSearchFilters {
  category?: CircleCategory
  price_range?: { min: number; max: number }
  meeting_format?: string
  language?: string
  guide_rating?: number
  verified_only?: boolean
  has_openings?: boolean
  starting_soon?: boolean
  time_zone_compatible?: boolean
}

// Promotional Tools for Guides
export interface CirclePromotion {
  featured_placement: boolean
  social_media_templates: string[]
  email_templates: string[]
  success_story_highlights: string[]
  seo_optimized_description: string
  promotional_video_url?: string
  free_discovery_call: boolean
  referral_program: ReferralProgram
}

export interface ReferralProgram {
  enabled: boolean
  referrer_reward: number // percentage or fixed amount
  referee_discount: number
  tracking_code: string
  total_referrals: number
  total_earned: number
}

// Community Features
export interface CircleForumPost {
  id: string
  circle_id: string
  author_id: string
  author_role: 'guide' | 'member' | 'graduate'
  content: string
  type: 'question' | 'share' | 'celebration' | 'resource'
  replies: ForumReply[]
  reactions: Reaction[]
  created_at: Date
  pinned: boolean
  anonymous: boolean
}

export interface ForumReply {
  id: string
  author_id: string
  content: string
  helpful_count: number
  created_at: Date
}

export interface Reaction {
  type: 'support' | 'celebrate' | 'relate' | 'inspire'
  user_id: string
  created_at: Date
}

export interface CircleEvent {
  id: string
  circle_id: string
  title: string
  description: string
  type: 'regular_session' | 'special_workshop' | 'guest_speaker' | 'celebration'
  date: Date
  duration: number // minutes
  is_mandatory: boolean
  recording_available: boolean
  attendees: string[]
}