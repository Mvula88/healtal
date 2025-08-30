// AI-Powered Growth Paths System
// Structured pathways for personal transformation using Claude AI

export interface GrowthPath {
  id: string
  title: string
  description: string
  category: PathCategory
  duration: string // e.g., "4 weeks", "3 months"
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  modules: PathModule[]
  outcomes: string[]
  prerequisites?: string[]
  aiGuidance: AIGuidanceConfig
}

export interface PathModule {
  id: string
  week: number
  title: string
  description: string
  objectives: string[]
  exercises: Exercise[]
  reflections: ReflectionPrompt[]
  resources: Resource[]
  aiCheckIn: AICheckInConfig
  milestones: Milestone[]
}

export interface Exercise {
  id: string
  type: 'journaling' | 'meditation' | 'behavioral' | 'cognitive' | 'somatic' | 'creative'
  title: string
  instructions: string
  duration: string
  aiSupport: boolean
  expectedInsights: string[]
}

export interface ReflectionPrompt {
  id: string
  question: string
  depth: 'surface' | 'moderate' | 'deep'
  aiAnalysis: boolean
}

export interface Resource {
  type: 'article' | 'video' | 'book' | 'exercise'
  title: string
  url?: string
  description: string
}

export interface Milestone {
  id: string
  title: string
  criteria: string[]
  reward: string
}

export interface AIGuidanceConfig {
  personalizedAdaptation: boolean
  progressAnalysis: boolean
  insightGeneration: boolean
  customPrompts: string[]
}

export interface AICheckInConfig {
  frequency: 'daily' | 'weekly' | 'module-end'
  focusAreas: string[]
  adaptiveDifficulty: boolean
}

export type PathCategory = 
  | 'trauma-healing'
  | 'attachment-repair'
  | 'self-worth'
  | 'emotional-regulation'
  | 'relationship-patterns'
  | 'addiction-recovery'
  | 'anxiety-management'
  | 'depression-recovery'
  | 'grief-processing'
  | 'identity-formation'
  | 'shadow-integration'
  | 'inner-child-healing'

// Core Growth Paths with AI Integration
export const GROWTH_PATHS: GrowthPath[] = [
  {
    id: 'trauma-to-triumph',
    title: 'From Trauma to Triumph',
    description: 'A comprehensive journey to process past trauma, build resilience, and reclaim your power through AI-guided healing.',
    category: 'trauma-healing',
    duration: '12 weeks',
    difficulty: 'intermediate',
    outcomes: [
      'Understand your trauma responses and triggers',
      'Develop healthy coping mechanisms',
      'Build emotional resilience',
      'Reclaim personal power and agency',
      'Create new neural pathways for healing'
    ],
    modules: [
      {
        id: 'ttm-1',
        week: 1,
        title: 'Understanding Your Story',
        description: 'Begin by mapping your experiences and understanding trauma\'s impact on your nervous system.',
        objectives: [
          'Identify trauma patterns in your life',
          'Understand the neuroscience of trauma',
          'Establish safety and grounding practices'
        ],
        exercises: [
          {
            id: 'tt-ex-1',
            type: 'journaling',
            title: 'Trauma Timeline',
            instructions: 'Create a timeline of significant life events, noting patterns and themes. AI will help identify connections.',
            duration: '30 minutes',
            aiSupport: true,
            expectedInsights: ['Pattern recognition', 'Core wounds identification', 'Survival strategies']
          },
          {
            id: 'tt-ex-2',
            type: 'somatic',
            title: 'Body Scan for Safety',
            instructions: 'Practice a guided body scan to identify where you hold trauma and establish safety in your body.',
            duration: '20 minutes',
            aiSupport: true,
            expectedInsights: ['Body awareness', 'Tension patterns', 'Safety signals']
          }
        ],
        reflections: [
          {
            id: 'tt-ref-1',
            question: 'What survival strategies did you develop that once protected you but now limit you?',
            depth: 'deep',
            aiAnalysis: true
          }
        ],
        resources: [
          {
            type: 'article',
            title: 'The Body Keeps the Score - Key Concepts',
            description: 'Understanding how trauma lives in the body'
          }
        ],
        aiCheckIn: {
          frequency: 'daily',
          focusAreas: ['emotional state', 'body sensations', 'triggers encountered'],
          adaptiveDifficulty: true
        },
        milestones: [
          {
            id: 'ttm-1-m1',
            title: 'Trauma Map Complete',
            criteria: ['Completed trauma timeline', 'Identified 3+ patterns', 'Established daily grounding practice'],
            reward: 'Unlock advanced somatic exercises'
          }
        ]
      },
      // Additional modules would continue...
    ],
    aiGuidance: {
      personalizedAdaptation: true,
      progressAnalysis: true,
      insightGeneration: true,
      customPrompts: [
        'Analyze trauma patterns and suggest healing approaches',
        'Identify defense mechanisms and their origins',
        'Connect current struggles to past experiences',
        'Suggest somatic practices for nervous system regulation'
      ]
    }
  },
  
  {
    id: 'secure-attachment',
    title: 'Building Secure Attachment',
    description: 'Transform your relationship patterns by healing attachment wounds and developing secure bonding capabilities.',
    category: 'attachment-repair',
    duration: '8 weeks',
    difficulty: 'intermediate',
    outcomes: [
      'Identify your attachment style and its origins',
      'Heal attachment wounds from childhood',
      'Develop secure attachment behaviors',
      'Improve all relationships in your life',
      'Build capacity for intimacy and trust'
    ],
    modules: [
      {
        id: 'sa-1',
        week: 1,
        title: 'Attachment Archaeology',
        description: 'Explore your early attachment experiences and their impact on current relationships.',
        objectives: [
          'Identify your attachment style',
          'Map early caregiver relationships',
          'Recognize attachment patterns in current relationships'
        ],
        exercises: [
          {
            id: 'sa-ex-1',
            type: 'journaling',
            title: 'Caregiver Inventory',
            instructions: 'Describe your relationships with early caregivers. AI will help identify attachment patterns.',
            duration: '45 minutes',
            aiSupport: true,
            expectedInsights: ['Attachment style identification', 'Core attachment wounds', 'Relationship patterns']
          }
        ],
        reflections: [
          {
            id: 'sa-ref-1',
            question: 'How do you recreate your childhood attachment dynamics in adult relationships?',
            depth: 'deep',
            aiAnalysis: true
          }
        ],
        resources: [
          {
            type: 'book',
            title: 'Attached by Amir Levine',
            description: 'Understanding adult attachment theory'
          }
        ],
        aiCheckIn: {
          frequency: 'weekly',
          focusAreas: ['relationship triggers', 'attachment behaviors', 'emotional availability'],
          adaptiveDifficulty: true
        },
        milestones: [
          {
            id: 'sa-1-m1',
            title: 'Attachment Style Identified',
            criteria: ['Completed attachment assessment', 'Mapped caregiver relationships', 'Identified 3+ patterns'],
            reward: 'Personalized attachment healing plan'
          }
        ]
      }
    ],
    aiGuidance: {
      personalizedAdaptation: true,
      progressAnalysis: true,
      insightGeneration: true,
      customPrompts: [
        'Analyze attachment patterns across relationships',
        'Identify attachment triggers and responses',
        'Suggest earned secure attachment strategies',
        'Guide reparenting and inner child work'
      ]
    }
  },
  
  {
    id: 'shadow-integration',
    title: 'Shadow Work Journey',
    description: 'Integrate rejected parts of yourself to achieve wholeness and authentic self-expression.',
    category: 'shadow-integration',
    duration: '6 weeks',
    difficulty: 'advanced',
    outcomes: [
      'Identify and reclaim shadow aspects',
      'Integrate rejected parts of self',
      'Reduce projection and judgment',
      'Achieve greater self-acceptance',
      'Access hidden strengths and creativity'
    ],
    modules: [
      {
        id: 'sw-1',
        week: 1,
        title: 'Meeting Your Shadow',
        description: 'Begin to identify the parts of yourself you\'ve rejected or hidden.',
        objectives: [
          'Understand shadow formation',
          'Identify personal shadow aspects',
          'Recognize projections onto others'
        ],
        exercises: [
          {
            id: 'sw-ex-1',
            type: 'cognitive',
            title: 'Projection Mapping',
            instructions: 'List people who trigger you and what you dislike about them. AI will help identify your shadows.',
            duration: '30 minutes',
            aiSupport: true,
            expectedInsights: ['Shadow identification', 'Projection patterns', 'Disowned qualities']
          }
        ],
        reflections: [
          {
            id: 'sw-ref-1',
            question: 'What parts of yourself were not acceptable in your family of origin?',
            depth: 'deep',
            aiAnalysis: true
          }
        ],
        resources: [
          {
            type: 'article',
            title: 'Jung\'s Shadow Theory Explained',
            description: 'Understanding the shadow self'
          }
        ],
        aiCheckIn: {
          frequency: 'weekly',
          focusAreas: ['shadow encounters', 'projection awareness', 'integration progress'],
          adaptiveDifficulty: true
        },
        milestones: [
          {
            id: 'sw-1-m1',
            title: 'Shadow Map Created',
            criteria: ['Identified 5+ shadow aspects', 'Recognized projection patterns', 'Completed shadow dialogue'],
            reward: 'Advanced shadow integration techniques'
          }
        ]
      }
    ],
    aiGuidance: {
      personalizedAdaptation: true,
      progressAnalysis: true,
      insightGeneration: true,
      customPrompts: [
        'Identify shadow aspects from projections',
        'Guide shadow dialogue and integration',
        'Connect shadows to family/cultural conditioning',
        'Suggest creative expression for shadow work'
      ]
    }
  },
  
  {
    id: 'inner-child-healing',
    title: 'Inner Child Healing Journey',
    description: 'Reconnect with and heal your inner child to resolve childhood wounds and reclaim joy.',
    category: 'inner-child-healing',
    duration: '8 weeks',
    difficulty: 'beginner',
    outcomes: [
      'Connect with your inner child',
      'Heal childhood wounds',
      'Reclaim playfulness and creativity',
      'Develop self-compassion',
      'Reparent yourself with love'
    ],
    modules: [
      {
        id: 'ic-1',
        week: 1,
        title: 'Meeting Your Inner Child',
        description: 'Establish connection with your inner child and begin building trust.',
        objectives: [
          'Visualize and connect with inner child',
          'Identify inner child needs',
          'Begin compassionate dialogue'
        ],
        exercises: [
          {
            id: 'ic-ex-1',
            type: 'meditation',
            title: 'Inner Child Meditation',
            instructions: 'Guided visualization to meet your inner child. AI will help process the experience.',
            duration: '25 minutes',
            aiSupport: true,
            expectedInsights: ['Inner child state', 'Unmet needs', 'Core wounds']
          },
          {
            id: 'ic-ex-2',
            type: 'creative',
            title: 'Letter to Little You',
            instructions: 'Write a loving letter to your child self. AI will help identify healing themes.',
            duration: '30 minutes',
            aiSupport: true,
            expectedInsights: ['Compassion development', 'Healing messages', 'Reparenting needs']
          }
        ],
        reflections: [
          {
            id: 'ic-ref-1',
            question: 'What did your inner child most need but didn\'t receive?',
            depth: 'moderate',
            aiAnalysis: true
          }
        ],
        resources: [
          {
            type: 'book',
            title: 'Homecoming by John Bradshaw',
            description: 'Reclaiming and healing your inner child'
          }
        ],
        aiCheckIn: {
          frequency: 'daily',
          focusAreas: ['inner child connection', 'emotional needs', 'reparenting progress'],
          adaptiveDifficulty: false
        },
        milestones: [
          {
            id: 'ic-1-m1',
            title: 'Inner Child Connection Established',
            criteria: ['Completed visualization', 'Written letter to inner child', 'Identified 3+ needs'],
            reward: 'Unlock play therapy exercises'
          }
        ]
      }
    ],
    aiGuidance: {
      personalizedAdaptation: true,
      progressAnalysis: true,
      insightGeneration: true,
      customPrompts: [
        'Guide inner child dialogue and healing',
        'Identify developmental needs at different ages',
        'Suggest reparenting strategies',
        'Connect inner child wounds to adult patterns'
      ]
    }
  }
]

// AI-Powered Path Selection
export function recommendPath(
  userProfile: any,
  assessmentResults: any
): GrowthPath[] {
  // AI would analyze user data and recommend most suitable paths
  // This would be implemented with Claude API
  return GROWTH_PATHS
}

// Progress Tracking
export interface PathProgress {
  pathId: string
  userId: string
  startedAt: Date
  currentModule: number
  completedExercises: string[]
  insights: PathInsight[]
  milestones: string[]
  overallProgress: number // percentage
}

export interface PathInsight {
  id: string
  moduleId: string
  exerciseId: string
  insight: string
  aiAnalysis: string
  timestamp: Date
  breakthrough: boolean
}