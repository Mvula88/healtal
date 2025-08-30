// AI Model Configuration for Behavioral Analysis
// This configuration optimizes Claude models for deep psychological insights

export const AI_MODELS = {
  // Claude 3 Opus - Most powerful for deep analysis
  OPUS: {
    model: 'claude-3-opus-20240229',
    description: 'Most powerful model for deep psychological analysis and root cause discovery',
    maxTokens: 1024,
    temperature: 0.8,
    strengths: [
      'Deep pattern recognition',
      'Complex psychological analysis',
      'Nuanced understanding of trauma and attachment',
      'Comprehensive root cause exploration'
    ]
  },
  
  // Claude 3.5 Sonnet - Balanced performance
  SONNET: {
    model: 'claude-3-5-sonnet-20241022',
    description: 'Latest balanced model with excellent analysis and faster response times',
    maxTokens: 800,
    temperature: 0.7,
    strengths: [
      'Quick pattern identification',
      'Good balance of depth and speed',
      'Excellent for real-time coaching',
      'Strong emotional intelligence'
    ]
  },
  
  // Claude 3 Haiku - Fast responses
  HAIKU: {
    model: 'claude-3-haiku-20240307',
    description: 'Fastest model for quick insights and pattern recognition',
    maxTokens: 500,
    temperature: 0.7,
    strengths: [
      'Rapid response times',
      'Good for initial assessments',
      'Pattern identification',
      'Cost-effective for high volume'
    ]
  }
}

// Model selection based on conversation type
export function selectModel(conversationType: string): typeof AI_MODELS.OPUS {
  switch (conversationType) {
    case 'deep_analysis':
    case 'trauma_exploration':
    case 'root_cause':
      return AI_MODELS.OPUS
    
    case 'daily_coaching':
    case 'pattern_recognition':
      return AI_MODELS.SONNET
    
    case 'quick_insight':
    case 'initial_assessment':
      return AI_MODELS.HAIKU
    
    default:
      return AI_MODELS.SONNET // Default to balanced model
  }
}

// Enhanced prompts for specific analysis types
export const SPECIALIZED_PROMPTS = {
  ATTACHMENT_ANALYSIS: `Focus on attachment patterns, early relationship dynamics, and how childhood bonds influence current relationships. Identify attachment style (secure, anxious, avoidant, disorganized) and its manifestations.`,
  
  TRAUMA_INFORMED: `Use trauma-informed language. Recognize signs of trauma responses (fight, flight, freeze, fawn). Connect current triggers to past experiences while maintaining safety and avoiding retraumatization.`,
  
  COGNITIVE_PATTERNS: `Identify cognitive distortions (all-or-nothing thinking, catastrophizing, mind-reading, etc.). Explore underlying core beliefs and automatic thoughts. Connect thought patterns to emotional and behavioral outcomes.`,
  
  SHADOW_WORK: `Explore rejected, hidden, or unconscious aspects of self. Identify projections, denied qualities, and disowned parts. Help integrate shadow aspects for wholeness.`,
  
  FAMILY_SYSTEMS: `Analyze family dynamics, roles, and intergenerational patterns. Identify family rules, boundaries, and systemic influences on current behavior.`,
  
  SOMATIC_AWARENESS: `Notice body sensations, tensions, and physical manifestations of emotions. Connect bodily experiences to emotional states and memories stored in the body.`
}

// Response quality optimization
export const RESPONSE_OPTIMIZATION = {
  // Depth levels for analysis
  DEPTH_LEVELS: {
    SURFACE: { maxTokens: 300, temperature: 0.6 },
    MODERATE: { maxTokens: 600, temperature: 0.7 },
    DEEP: { maxTokens: 1024, temperature: 0.8 },
    PROFOUND: { maxTokens: 1500, temperature: 0.85 }
  },
  
  // Empathy and validation balance
  EMPATHY_SETTINGS: {
    HIGH_SUPPORT: { temperature: 0.9, style: 'warm, validating, gentle' },
    BALANCED: { temperature: 0.8, style: 'supportive yet challenging' },
    GROWTH_FOCUSED: { temperature: 0.7, style: 'direct, growth-oriented' }
  }
}

// API Usage Optimization
export const API_OPTIMIZATION = {
  // Cache frequently used insights
  ENABLE_CACHING: true,
  CACHE_DURATION: 3600, // 1 hour in seconds
  
  // Rate limiting
  MAX_REQUESTS_PER_USER: 50, // per day
  MAX_TOKENS_PER_USER: 25000, // per day
  
  // Fallback strategy
  FALLBACK_MODEL: AI_MODELS.HAIKU,
  
  // Error handling
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // milliseconds
}

// Export configuration function
export function getOptimalConfiguration(
  analysisType: string,
  userTier: 'free' | 'understand' | 'transform'
): {
  model: string,
  maxTokens: number,
  temperature: number,
  systemPrompt?: string
} {
  // Premium users get access to more powerful models
  if (userTier === 'transform') {
    return {
      ...AI_MODELS.OPUS,
      systemPrompt: SPECIALIZED_PROMPTS[analysisType as keyof typeof SPECIALIZED_PROMPTS]
    }
  } else if (userTier === 'understand') {
    return {
      ...AI_MODELS.SONNET,
      maxTokens: 600
    }
  } else {
    return {
      ...AI_MODELS.HAIKU,
      maxTokens: 300
    }
  }
}