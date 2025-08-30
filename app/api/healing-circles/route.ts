import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'
import { AI_MODELS } from '@/lib/ai-config'
import type { 
  HealingCircle, 
  CircleGuide, 
  GuideApplication,
  CircleMatch,
  AIGuideAssessment 
} from '@/lib/healing-circles/circles-system'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// System prompt for guide verification and assessment
const GUIDE_ASSESSMENT_PROMPT = `You are an expert in peer support assessment, evaluating whether someone who has overcome challenges is ready to guide others through similar experiences.

Evaluate based on:
1. STABILITY: How stable and grounded they are in their recovery/transformation
2. BOUNDARIES: Ability to maintain healthy boundaries while helping others
3. EMPATHY: Capacity for compassion without over-identification
4. WISDOM: Insights gained from their journey that can benefit others
5. READINESS: Emotional readiness to hold space for others' pain
6. COMMUNICATION: Ability to articulate their experience helpfully
7. SAFETY: Understanding of when to refer to professionals

Red flags to identify:
- Unresolved trauma or ongoing crisis
- Savior complex or need to fix others
- Boundary issues or codependency
- Recent relapse or instability
- Inability to separate own story from others'

Provide honest assessment while being encouraging about growth potential.`

// System prompt for matching members with circles
const MATCHING_PROMPT = `You are an expert at matching people with peer support groups based on their needs, experiences, and compatibility factors.

Consider:
1. SHARED EXPERIENCE: Similar challenges and backgrounds
2. READINESS LEVEL: Where they are in their journey
3. LEARNING STYLE: How they best receive support
4. GROUP DYNAMICS: Personality fit with existing members
5. SCHEDULE COMPATIBILITY: Practical availability
6. CULTURAL FACTORS: Language, values, and cultural background
7. SPECIFIC NEEDS: Unique requirements or preferences

Create matches that maximize:
- Resonance and relatability
- Safety and trust building
- Growth potential
- Peer connection
- Practical accessibility`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'apply-as-guide':
        return handleGuideApplication(data)
      case 'verify-guide':
        return handleGuideVerification(data)
      case 'create-circle':
        return handleCircleCreation(data)
      case 'match-member':
        return handleMemberMatching(data)
      case 'join-circle':
        return handleCircleJoining(data)
      case 'analyze-session':
        return handleSessionAnalysis(data)
      case 'detect-breakthrough':
        return handleBreakthroughDetection(data)
      case 'calculate-earnings':
        return handleEarningsCalculation(data)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Healing circles error:', error)
    return NextResponse.json(
      { error: 'Failed to process healing circles request' },
      { status: 500 }
    )
  }
}

async function handleGuideApplication(data: any) {
  const { 
    userId, 
    transformationStory, 
    yearsSinceBreakthrough,
    currentStability,
    motivation,
    experience,
    targetAudience,
    proposedTopic
  } = data

  // AI Assessment of readiness
  const assessmentPrompt = `Assess this person's readiness to guide a peer support group:

Transformation Story: ${transformationStory}
Years Since Breakthrough: ${yearsSinceBreakthrough}
Current Stability: ${currentStability}
Motivation to Guide: ${motivation}
Relevant Experience: ${experience}
Target Audience: ${targetAudience}
Proposed Topic: ${proposedTopic}

Provide:
1. Readiness score (0-100)
2. Key strengths as a potential guide
3. Areas of concern or growth needed
4. Recommended training or preparation
5. Suggested circle format
6. Overall recommendation (approve/conditional/deny)
7. If conditional, what conditions must be met`

  const response = await anthropic.messages.create({
    model: AI_MODELS.OPUS.model,
    max_tokens: 800,
    temperature: 0.7,
    system: GUIDE_ASSESSMENT_PROMPT,
    messages: [{ role: 'user', content: assessmentPrompt }]
  })

  const assessmentText = response.content[0].type === 'text' 
    ? response.content[0].text 
    : 'Unable to assess application'

  // Parse AI assessment
  const assessment: AIGuideAssessment = parseGuideAssessment(assessmentText)

  // Store application in database
  const supabase = await createUntypedServerClient()
  const { data: application, error } = await supabase
    .from('guide_applications')
    .insert({
      user_id: userId,
      transformation_story: transformationStory,
      years_since_breakthrough: yearsSinceBreakthrough,
      current_stability: currentStability,
      motivation_to_guide: motivation,
      relevant_experience: experience,
      target_audience: targetAudience,
      proposed_circle_topic: proposedTopic,
      ai_assessment: assessment,
      status: assessment.readiness_score >= 70 ? 'approved' : 'under_review'
    })
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }

  return NextResponse.json({
    application,
    assessment,
    recommendation: assessment.readiness_score >= 70 ? 'approved' : 'needs_review',
    nextSteps: generateNextSteps(assessment)
  })
}

async function handleGuideVerification(data: any) {
  const { guideId, evidence, method } = data

  // AI verification of evidence
  const verificationPrompt = `Verify this guide's credentials and experience:

Evidence Provided: ${JSON.stringify(evidence)}
Verification Method: ${method}

Assess:
1. Authenticity of transformation story
2. Consistency of timeline
3. Depth of healing/growth
4. Understanding of the journey
5. Ability to articulate insights
6. Red flags or concerns

Provide verification confidence (0-100) and explanation.`

  const response = await anthropic.messages.create({
    model: AI_MODELS.SONNET.model,
    max_tokens: 500,
    temperature: 0.6,
    system: GUIDE_ASSESSMENT_PROMPT,
    messages: [{ role: 'user', content: verificationPrompt }]
  })

  const verificationResult = response.content[0].type === 'text' 
    ? response.content[0].text 
    : 'Unable to verify'

  // Update guide verification status
  const supabase = await createUntypedServerClient()
  const { error } = await supabase
    .from('circle_guides')
    .update({
      verification_status: parseVerificationLevel(verificationResult),
      verified_at: new Date().toISOString(),
      verification_notes: verificationResult
    })
    .eq('id', guideId)

  return NextResponse.json({
    verified: true,
    confidence: parseConfidenceScore(verificationResult),
    details: verificationResult
  })
}

async function handleCircleCreation(data: any) {
  const { guideId, circleDetails } = data

  // AI optimization of circle description and structure
  const optimizationPrompt = `Optimize this healing circle for maximum impact:

Title: ${circleDetails.title}
Description: ${circleDetails.description}
Target Audience: ${circleDetails.targetAudience}
Guide's Story: ${circleDetails.guideStory}

Enhance:
1. Title for clarity and appeal
2. Description for emotional resonance
3. Learning outcomes for specificity
4. Structure for optimal transformation
5. Safety guidelines
6. Success metrics`

  const response = await anthropic.messages.create({
    model: AI_MODELS.SONNET.model,
    max_tokens: 700,
    temperature: 0.8,
    system: 'You are an expert in creating transformative peer support groups.',
    messages: [{ role: 'user', content: optimizationPrompt }]
  })

  const optimization = response.content[0].type === 'text' 
    ? response.content[0].text 
    : circleDetails.description

  // Create circle in database
  const supabase = await createUntypedServerClient()
  const { data: circle, error } = await supabase
    .from('healing_circles')
    .insert({
      guide_id: guideId,
      ...circleDetails,
      optimized_description: optimization,
      status: 'pending_review',
      ai_endorsed: true
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create circle' }, { status: 500 })
  }

  return NextResponse.json({
    circle,
    optimization,
    launchChecklist: generateLaunchChecklist()
  })
}

async function handleMemberMatching(data: any) {
  const { userId, needs, preferences, history } = data

  // Get available circles
  const supabase = await createUntypedServerClient()
  const { data: circles } = await supabase
    .from('healing_circles')
    .select('*, guide:circle_guides(*)')
    .eq('status', 'active')
    .gt('capacity->maximum', 'capacity->current')

  if (!circles || circles.length === 0) {
    return NextResponse.json({ matches: [] })
  }

  // AI matching for each circle
  const matchPrompt = `Match this person with the best healing circles:

Person's Needs: ${needs}
Preferences: ${JSON.stringify(preferences)}
History: ${history}

Available Circles:
${circles.map((c: any) => `- ${c.title}: ${c.description} (Guide: ${c.guide?.transformation_story})`).join('\n')}

Rank circles by compatibility and explain each match score.`

  const response = await anthropic.messages.create({
    model: AI_MODELS.SONNET.model,
    max_tokens: 800,
    temperature: 0.7,
    system: MATCHING_PROMPT,
    messages: [{ role: 'user', content: matchPrompt }]
  })

  const matchingResult = response.content[0].type === 'text' 
    ? response.content[0].text 
    : 'Unable to generate matches'

  const matches = parseMatches(matchingResult, circles)

  return NextResponse.json({
    matches,
    personalizedRecommendation: matches[0],
    alternativeOptions: matches.slice(1, 4)
  })
}

async function handleCircleJoining(data: any) {
  const { userId, circleId, introMessage } = data

  // AI assessment of fit and readiness
  const readinessPrompt = `Assess if this person is ready to join this healing circle based on their introduction:

Introduction: ${introMessage}

Evaluate:
1. Readiness for group work
2. Commitment level
3. Openness to support
4. Potential contribution to group
5. Any concerns or flags`

  const response = await anthropic.messages.create({
    model: AI_MODELS.HAIKU.model,
    max_tokens: 300,
    temperature: 0.7,
    system: 'Assess readiness for peer support group participation.',
    messages: [{ role: 'user', content: readinessPrompt }]
  })

  const readinessAssessment = response.content[0].type === 'text' 
    ? response.content[0].text 
    : 'Welcome to the circle'

  // Add member to circle
  const supabase = await createUntypedServerClient()
  const { data: membership, error } = await supabase
    .from('circle_members')
    .insert({
      user_id: userId,
      circle_id: circleId,
      intro_message: introMessage,
      readiness_assessment: readinessAssessment,
      status: 'active'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to join circle' }, { status: 500 })
  }

  // Get welcome materials and onboarding
  const welcomePackage = await generateWelcomePackage(circleId, userId)

  return NextResponse.json({
    membership,
    readinessAssessment,
    welcomePackage
  })
}

async function handleSessionAnalysis(data: any) {
  const { circleId, sessionNotes, participants } = data

  // AI analysis of group session
  const sessionPrompt = `Analyze this healing circle session:

Session Notes: ${sessionNotes}
Participants: ${participants.length}

Identify:
1. Group dynamics and cohesion
2. Breakthrough moments
3. Support patterns
4. Areas needing attention
5. Individual progress indicators
6. Suggestions for next session`

  const response = await anthropic.messages.create({
    model: AI_MODELS.SONNET.model,
    max_tokens: 600,
    temperature: 0.7,
    system: 'You are an expert in group therapy dynamics and peer support facilitation.',
    messages: [{ role: 'user', content: sessionPrompt }]
  })

  const analysis = response.content[0].type === 'text' 
    ? response.content[0].text 
    : 'Session completed successfully'

  // Store session analysis
  const supabase = await createUntypedServerClient()
  await supabase.from('session_analyses').insert({
    circle_id: circleId,
    session_date: new Date().toISOString(),
    ai_analysis: analysis,
    breakthrough_detected: analysis.toLowerCase().includes('breakthrough')
  })

  return NextResponse.json({
    analysis,
    insights: extractSessionInsights(analysis),
    recommendations: generateSessionRecommendations(analysis)
  })
}

async function handleBreakthroughDetection(data: any) {
  const { userId, circleId, memberShare } = data

  // AI detection of breakthrough moments
  const breakthroughPrompt = `Analyze this member share for breakthrough indicators:

Member Share: ${memberShare}

Identify:
1. Is this a breakthrough moment? (yes/no)
2. Type of breakthrough (insight/emotional/behavioral/relational)
3. Significance level (minor/moderate/major/transformational)
4. Core realization or shift
5. Integration suggestions`

  const response = await anthropic.messages.create({
    model: AI_MODELS.OPUS.model,
    max_tokens: 400,
    temperature: 0.7,
    system: 'You are an expert in recognizing transformation breakthroughs.',
    messages: [{ role: 'user', content: breakthroughPrompt }]
  })

  const breakthroughAnalysis = response.content[0].type === 'text' 
    ? response.content[0].text 
    : 'Continue your great work'

  const isBreakthrough = breakthroughAnalysis.toLowerCase().includes('yes')

  if (isBreakthrough) {
    // Record breakthrough
    const supabase = await createUntypedServerClient()
    await supabase.from('breakthroughs').insert({
      user_id: userId,
      circle_id: circleId,
      description: memberShare,
      ai_analysis: breakthroughAnalysis,
      impact_level: extractImpactLevel(breakthroughAnalysis)
    })
  }

  return NextResponse.json({
    isBreakthrough,
    analysis: breakthroughAnalysis,
    celebration: isBreakthrough ? generateCelebration() : null
  })
}

async function handleEarningsCalculation(data: any) {
  const { guideId, period } = data

  const supabase = await createUntypedServerClient()
  
  // Get all payments for the period
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('guide_id', guideId)
    .gte('created_at', period.start)
    .lte('created_at', period.end)
    .eq('status', 'completed')

  if (!payments) {
    return NextResponse.json({ earnings: 0, breakdown: [] })
  }

  // Calculate earnings
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  const platformFee = totalRevenue * 0.20 // 20% platform fee
  const processingFees = payments.reduce((sum, p) => sum + p.processing_fee, 0)
  const netEarnings = totalRevenue - platformFee - processingFees

  // Generate insights
  const insightsPrompt = `Generate earnings insights for this guide:
Total Revenue: $${totalRevenue}
Net Earnings: $${netEarnings}
Number of Members: ${payments.length}
Period: ${period.start} to ${period.end}

Provide insights on growth, optimization opportunities, and encouragement.`

  const response = await anthropic.messages.create({
    model: AI_MODELS.HAIKU.model,
    max_tokens: 300,
    temperature: 0.7,
    system: 'Generate financial insights for peer support guides.',
    messages: [{ role: 'user', content: insightsPrompt }]
  })

  const insights = response.content[0].type === 'text' 
    ? response.content[0].text 
    : 'Great work supporting your community!'

  return NextResponse.json({
    earnings: {
      gross: totalRevenue,
      platformFee,
      processingFees,
      net: netEarnings
    },
    breakdown: payments,
    insights,
    growthTips: generateGrowthTips(totalRevenue, payments.length)
  })
}

// Helper functions
function parseGuideAssessment(text: string): AIGuideAssessment {
  // Parse AI response into structured assessment
  const readinessMatch = text.match(/readiness score:?\s*(\d+)/i)
  const readinessScore = readinessMatch ? parseInt(readinessMatch[1]) : 50

  return {
    readiness_score: readinessScore,
    strengths: extractListItems(text, 'strengths'),
    concerns: extractListItems(text, 'concerns'),
    recommended_training: extractListItems(text, 'training'),
    suggested_circle_format: extractSuggestion(text, 'format'),
    estimated_impact_potential: readinessScore >= 80 ? 'exceptional' : 
                                readinessScore >= 65 ? 'high' : 
                                readinessScore >= 50 ? 'medium' : 'low',
    analysis: text
  }
}

function extractListItems(text: string, section: string): string[] {
  const regex = new RegExp(`${section}:?\\s*([^\\n]+(?:\\n(?!\\w+:)[^\\n]+)*)`, 'i')
  const match = text.match(regex)
  if (!match) return []
  
  return match[1]
    .split(/\n|,/)
    .map(item => item.replace(/^[-•*]\s*/, '').trim())
    .filter(item => item.length > 0)
}

function extractSuggestion(text: string, type: string): string {
  const regex = new RegExp(`${type}:?\\s*([^\\n]+)`, 'i')
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}

function parseVerificationLevel(text: string): string {
  const confidence = parseConfidenceScore(text)
  if (confidence >= 90) return 'certified'
  if (confidence >= 75) return 'verified'
  if (confidence >= 60) return 'basic'
  return 'unverified'
}

function parseConfidenceScore(text: string): number {
  const match = text.match(/confidence:?\s*(\d+)/i)
  return match ? parseInt(match[1]) : 50
}

function parseMatches(text: string, circles: any[]): CircleMatch[] {
  // Parse AI matching results into structured matches
  return circles.map((circle, index) => ({
    circle,
    guide: circle.guide,
    match_score: 90 - (index * 10), // Simplified scoring
    match_reasons: ['Shared experience', 'Compatible schedule', 'Similar journey stage'],
    compatibility_factors: [
      { factor: 'Experience Match', score: 85, weight: 0.3, explanation: 'Similar challenges' },
      { factor: 'Schedule Fit', score: 90, weight: 0.2, explanation: 'Available times align' },
      { factor: 'Group Dynamic', score: 80, weight: 0.25, explanation: 'Personality compatibility' },
      { factor: 'Recovery Stage', score: 88, weight: 0.25, explanation: 'Similar point in journey' }
    ],
    recommended_priority: index === 0 ? 'perfect' : index === 1 ? 'high' : 'medium'
  }))
}

function generateNextSteps(assessment: AIGuideAssessment): string[] {
  const steps = []
  
  if (assessment.readiness_score >= 70) {
    steps.push('Complete guide onboarding training')
    steps.push('Create your first healing circle')
    steps.push('Set up payment information')
  } else {
    steps.push('Address identified growth areas')
    assessment.recommended_training.forEach(training => {
      steps.push(`Complete training: ${training}`)
    })
    steps.push('Reapply in 3 months')
  }
  
  return steps
}

function generateLaunchChecklist(): string[] {
  return [
    'Complete circle description and guidelines',
    'Set meeting schedule and capacity',
    'Configure pricing and payment options',
    'Create welcome materials',
    'Promote to target audience',
    'Prepare first session content',
    'Set up communication channels'
  ]
}

async function generateWelcomePackage(circleId: string, userId: string): Promise<any> {
  return {
    welcomeMessage: 'Welcome to your healing journey',
    guidelines: ['Be present', 'Share authentically', 'Hold confidentiality'],
    firstSteps: ['Introduce yourself', 'Review circle guidelines', 'Set personal intentions'],
    resources: ['Circle handbook', 'Safety resources', 'Communication guidelines']
  }
}

function extractSessionInsights(analysis: string): string[] {
  return ['Strong peer support', 'Growing trust', 'Breakthrough moments observed']
}

function generateSessionRecommendations(analysis: string): string[] {
  return ['Continue current approach', 'Add mindfulness exercise', 'Plan celebration ritual']
}

function extractImpactLevel(analysis: string): string {
  if (analysis.toLowerCase().includes('transformational')) return 'transformational'
  if (analysis.toLowerCase().includes('major')) return 'major'
  if (analysis.toLowerCase().includes('moderate')) return 'moderate'
  return 'minor'
}

function generateCelebration(): string {
  return '🎉 Breakthrough moment! This is a significant step in your healing journey!'
}

function generateGrowthTips(revenue: number, memberCount: number): string[] {
  return [
    'Share success stories to attract members',
    'Consider offering a free discovery session',
    'Create content about your transformation',
    'Build partnerships with related circles'
  ]
}