import { NextRequest, NextResponse } from 'next/server'

// Crisis keywords and phrases that trigger alerts
const CRISIS_INDICATORS = {
  high_risk: [
    'want to die',
    'kill myself',
    'end it all',
    'suicide',
    'not worth living',
    'better off dead',
    'can\'t go on',
    'no point anymore',
    'give up on life',
    'harm myself',
    'self harm',
    'cutting',
    'overdose'
  ],
  moderate_risk: [
    'hopeless',
    'worthless',
    'no way out',
    'burden to everyone',
    'everyone would be better',
    'can\'t take it',
    'want to disappear',
    'wish I wasn\'t here',
    'too much pain',
    'nothing matters',
    'alone forever',
    'no one cares'
  ],
  warning_signs: [
    'giving away',
    'saying goodbye',
    'getting affairs in order',
    'sudden calmness',
    'withdrawn',
    'increased substance',
    'reckless behavior',
    'dramatic mood changes'
  ]
}

// Protective factors that might reduce risk
const PROTECTIVE_FACTORS = [
  'support',
  'help',
  'therapy',
  'counselor',
  'doctor',
  'medication',
  'family',
  'friends',
  'hope',
  'future',
  'goals',
  'faith',
  'children',
  'pets',
  'responsibilities'
]

export async function POST(req: NextRequest) {
  try {
    const { message, userId, conversationId } = await req.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }
    
    const analysis = analyzeCrisisRisk(message)
    
    // Log high-risk detections (in production, alert crisis team)
    if (analysis.risk_level === 'high') {
      console.error(`CRISIS ALERT: User ${userId} - High risk detected`)
      // In production: Send immediate alert to crisis team
      // await notifyCrisisTeam({ userId, message, conversationId })
    }
    
    return NextResponse.json({
      ...analysis,
      resources: getCrisisResources(analysis.risk_level),
      suggested_actions: getSuggestedActions(analysis)
    })
  } catch (error) {
    console.error('Crisis detection error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}

function analyzeCrisisRisk(message: string) {
  const lowerMessage = message.toLowerCase()
  
  // Check for high-risk indicators
  const highRiskMatches = CRISIS_INDICATORS.high_risk.filter(phrase => 
    lowerMessage.includes(phrase)
  )
  
  // Check for moderate risk indicators
  const moderateRiskMatches = CRISIS_INDICATORS.moderate_risk.filter(phrase => 
    lowerMessage.includes(phrase)
  )
  
  // Check for warning signs
  const warningSignMatches = CRISIS_INDICATORS.warning_signs.filter(phrase => 
    lowerMessage.includes(phrase)
  )
  
  // Check for protective factors
  const protectiveMatches = PROTECTIVE_FACTORS.filter(phrase => 
    lowerMessage.includes(phrase)
  )
  
  // Calculate risk score
  const riskScore = 
    (highRiskMatches.length * 10) +
    (moderateRiskMatches.length * 5) +
    (warningSignMatches.length * 3) -
    (protectiveMatches.length * 2)
  
  // Determine risk level
  let risk_level: 'high' | 'moderate' | 'low' | 'none'
  if (highRiskMatches.length > 0 || riskScore >= 15) {
    risk_level = 'high'
  } else if (moderateRiskMatches.length > 0 || riskScore >= 8) {
    risk_level = 'moderate'
  } else if (warningSignMatches.length > 0 || riskScore >= 3) {
    risk_level = 'low'
  } else {
    risk_level = 'none'
  }
  
  return {
    risk_level,
    risk_score: Math.max(0, riskScore),
    indicators_found: {
      high_risk: highRiskMatches,
      moderate_risk: moderateRiskMatches,
      warning_signs: warningSignMatches
    },
    protective_factors: protectiveMatches,
    confidence: calculateConfidence(highRiskMatches, moderateRiskMatches, warningSignMatches),
    timestamp: new Date().toISOString()
  }
}

function calculateConfidence(high: string[], moderate: string[], warning: string[]) {
  const totalIndicators = high.length + moderate.length + warning.length
  
  if (high.length > 0) return 0.9
  if (moderate.length >= 2) return 0.8
  if (moderate.length === 1) return 0.6
  if (warning.length >= 2) return 0.5
  if (warning.length === 1) return 0.3
  
  return 0.1
}

function getCrisisResources(riskLevel: string) {
  const baseResources = [
    {
      name: '988 Suicide & Crisis Lifeline',
      number: '988',
      available: '24/7',
      type: 'phone/text'
    },
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      available: '24/7',
      type: 'text'
    }
  ]
  
  if (riskLevel === 'high' || riskLevel === 'moderate') {
    return [
      ...baseResources,
      {
        name: 'Emergency Services',
        number: '911',
        available: '24/7',
        type: 'emergency'
      },
      {
        name: 'Go to nearest Emergency Room',
        number: 'N/A',
        available: '24/7',
        type: 'in-person'
      }
    ]
  }
  
  return baseResources
}

function getSuggestedActions(analysis: any) {
  const actions = []
  
  switch (analysis.risk_level) {
    case 'high':
      actions.push(
        'Immediately display crisis resources',
        'Offer to connect to crisis hotline',
        'Suggest emergency contacts',
        'Provide safety plan if available',
        'Log incident for follow-up'
      )
      break
    case 'moderate':
      actions.push(
        'Display crisis resources prominently',
        'Check in on safety',
        'Suggest coping strategies',
        'Recommend professional support',
        'Schedule follow-up check-in'
      )
      break
    case 'low':
      actions.push(
        'Monitor conversation closely',
        'Provide supportive responses',
        'Suggest self-care activities',
        'Offer resources subtly'
      )
      break
    default:
      actions.push(
        'Continue normal support',
        'Keep resources accessible'
      )
  }
  
  return actions
}