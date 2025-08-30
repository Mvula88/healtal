import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'
import { AI_MODELS, SPECIALIZED_PROMPTS } from '@/lib/ai-config'
import { GROWTH_PATHS, type GrowthPath } from '@/lib/growth-paths/pathways'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// System prompt for Growth Path guidance
const GROWTH_PATH_SYSTEM_PROMPT = `You are an expert growth path guide specializing in personalized transformation journeys. Your role is to:

1. ASSESSMENT: Analyze user responses to identify core issues, patterns, and growth areas
2. PATH RECOMMENDATION: Match users with the most suitable growth paths based on their needs
3. PERSONALIZATION: Adapt path content to individual circumstances and learning styles
4. PROGRESS GUIDANCE: Provide insights on exercises, track breakthroughs, and adjust difficulty
5. MILESTONE CELEBRATION: Recognize achievements and encourage continued growth
6. INTEGRATION SUPPORT: Help users integrate lessons into daily life

When analyzing exercises and reflections:
- Identify breakthrough moments and patterns
- Connect insights to the path's objectives
- Suggest additional explorations when appropriate
- Validate progress while gently challenging growth edges
- Recognize resistance and work with it compassionately

Always maintain a balance of:
- Challenge and support
- Structure and flexibility
- Depth and accessibility
- Individual work and integration

Remember: You're guiding transformation, not just information delivery.`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'recommend':
        return handlePathRecommendation(data)
      case 'analyze-exercise':
        return handleExerciseAnalysis(data)
      case 'check-progress':
        return handleProgressCheck(data)
      case 'generate-insight':
        return handleInsightGeneration(data)
      case 'adapt-path':
        return handlePathAdaptation(data)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Growth path error:', error)
    return NextResponse.json(
      { error: 'Failed to process growth path request' },
      { status: 500 }
    )
  }
}

async function handlePathRecommendation(data: any) {
  const { userResponses, concerns, goals } = data
  
  // Create assessment prompt
  const assessmentPrompt = `Based on the following user information, recommend the most suitable growth paths:

User Concerns: ${concerns}
User Goals: ${goals}
Assessment Responses: ${JSON.stringify(userResponses)}

Available Paths:
${GROWTH_PATHS.map(p => `- ${p.title}: ${p.description}`).join('\n')}

Analyze the user's needs and recommend 1-3 paths in order of suitability. Explain why each path matches their needs and what they can expect to gain.`

  const response = await anthropic.messages.create({
    model: AI_MODELS.OPUS.model,
    max_tokens: 800,
    temperature: 0.7,
    system: GROWTH_PATH_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: assessmentPrompt }]
  })

  const recommendation = response.content[0].type === 'text' 
    ? response.content[0].text 
    : 'Unable to generate recommendation'

  // Parse AI recommendation to match with actual paths
  const recommendedPaths = parseRecommendedPaths(recommendation)
  
  return NextResponse.json({
    recommendation,
    paths: recommendedPaths,
    personalizedInsight: await generatePersonalizedInsight(userResponses, recommendedPaths[0])
  })
}

async function handleExerciseAnalysis(data: any) {
  const { exerciseId, userResponse, pathId, moduleId } = data
  
  const path = GROWTH_PATHS.find(p => p.id === pathId)
  const module = path?.modules.find(m => m.id === moduleId)
  const exercise = module?.exercises.find(e => e.id === exerciseId)
  
  if (!exercise) {
    return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
  }

  const analysisPrompt = `Analyze this user's response to the exercise "${exercise.title}":

Exercise Instructions: ${exercise.instructions}
Expected Insights: ${exercise.expectedInsights.join(', ')}

User Response:
${userResponse}

Provide:
1. Key insights and patterns you observe
2. Connection to their growth journey
3. Breakthrough moments or resistance patterns
4. Suggestions for deeper exploration
5. Validation and encouragement`

  const response = await anthropic.messages.create({
    model: AI_MODELS.OPUS.model,
    max_tokens: 600,
    temperature: 0.8,
    system: GROWTH_PATH_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: analysisPrompt }]
  })

  const analysis = response.content[0].type === 'text' 
    ? response.content[0].text 
    : 'Unable to analyze response'

  // Store insight in database
  const supabase = await createUntypedServerClient()
  await supabase.from('path_insights').insert({
    user_id: data.userId,
    path_id: pathId,
    module_id: moduleId,
    exercise_id: exerciseId,
    user_response: userResponse,
    ai_analysis: analysis,
    breakthrough: analysis.toLowerCase().includes('breakthrough')
  })

  return NextResponse.json({
    analysis,
    breakthrough: analysis.toLowerCase().includes('breakthrough'),
    nextSteps: await generateNextSteps(analysis, exercise)
  })
}

async function handleProgressCheck(data: any) {
  const { userId, pathId } = data
  
  const supabase = await createUntypedServerClient()
  
  // Get user's progress data
  const { data: progress } = await supabase
    .from('path_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('path_id', pathId)
    .single()
  
  // Get all insights for this path
  const { data: insights } = await supabase
    .from('path_insights')
    .select('*')
    .eq('user_id', userId)
    .eq('path_id', pathId)
    .order('created_at', { ascending: false })
  
  const progressPrompt = `Analyze this user's progress on their growth path:

Completed Exercises: ${progress?.completed_exercises?.length || 0}
Total Insights: ${insights?.length || 0}
Breakthroughs: ${insights?.filter((i: any) => i.breakthrough).length || 0}

Recent Insights Summary:
${insights?.slice(0, 5).map((i: any) => i.ai_analysis).join('\n---\n')}

Provide:
1. Overall progress assessment
2. Key patterns and themes emerging
3. Areas of growth and resistance
4. Recommendations for continued progress
5. Celebration of achievements`

  const response = await anthropic.messages.create({
    model: AI_MODELS.SONNET.model,
    max_tokens: 600,
    temperature: 0.7,
    system: GROWTH_PATH_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: progressPrompt }]
  })

  const assessment = response.content[0].type === 'text' 
    ? response.content[0].text 
    : 'Unable to generate assessment'

  return NextResponse.json({
    assessment,
    progress: {
      completionPercentage: calculateProgress(progress, pathId),
      breakthroughs: insights?.filter((i: any) => i.breakthrough).length || 0,
      currentStreak: calculateStreak(progress),
      nextMilestone: getNextMilestone(progress, pathId)
    }
  })
}

async function handleInsightGeneration(data: any) {
  const { theme, depth, userId } = data
  
  const insightPrompt = `Generate a profound insight about ${theme} that will help the user understand themselves more deeply.

Depth level: ${depth}
Focus: Root causes and unconscious patterns

The insight should:
- Reveal hidden connections
- Challenge assumptions gently
- Offer a new perspective
- Be actionable and transformative
- Connect to universal human experiences while being personally relevant`

  const response = await anthropic.messages.create({
    model: AI_MODELS.OPUS.model,
    max_tokens: 400,
    temperature: 0.85,
    system: GROWTH_PATH_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: insightPrompt }]
  })

  const insight = response.content[0].type === 'text' 
    ? response.content[0].text 
    : 'Unable to generate insight'

  return NextResponse.json({ insight })
}

async function handlePathAdaptation(data: any) {
  const { userId, pathId, strugglingAreas, progressRate } = data
  
  const adaptationPrompt = `This user is on a growth path but needs adaptation:

Struggling Areas: ${strugglingAreas}
Progress Rate: ${progressRate}

Suggest adaptations to:
1. Adjust difficulty level appropriately
2. Provide additional support for struggling areas
3. Modify exercises for better engagement
4. Add supplementary resources
5. Adjust pacing to prevent overwhelm or boredom`

  const response = await anthropic.messages.create({
    model: AI_MODELS.SONNET.model,
    max_tokens: 500,
    temperature: 0.7,
    system: GROWTH_PATH_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: adaptationPrompt }]
  })

  const adaptations = response.content[0].type === 'text' 
    ? response.content[0].text 
    : 'Unable to generate adaptations'

  return NextResponse.json({ adaptations })
}

// Helper functions
function parseRecommendedPaths(recommendation: string): GrowthPath[] {
  // This would use more sophisticated parsing in production
  // For now, return top 3 paths based on keyword matching
  const pathScores = GROWTH_PATHS.map(path => {
    let score = 0
    if (recommendation.toLowerCase().includes(path.title.toLowerCase())) score += 10
    if (recommendation.toLowerCase().includes(path.category.replace('-', ' '))) score += 5
    return { path, score }
  })
  
  return pathScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(ps => ps.path)
}

async function generatePersonalizedInsight(userResponses: any, path: GrowthPath): Promise<string> {
  const prompt = `Generate a personalized insight for a user starting the "${path.title}" journey based on their assessment responses.`
  
  const response = await anthropic.messages.create({
    model: AI_MODELS.SONNET.model,
    max_tokens: 200,
    temperature: 0.8,
    system: GROWTH_PATH_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  })
  
  return response.content[0].type === 'text' 
    ? response.content[0].text 
    : 'Your journey begins with understanding...'
}

async function generateNextSteps(analysis: string, exercise: any): Promise<string[]> {
  // Generate next steps based on the analysis
  return [
    'Reflect on the patterns identified',
    'Practice the awareness exercise daily',
    'Journal about any resistance that arises'
  ]
}

function calculateProgress(progress: any, pathId: string): number {
  const path = GROWTH_PATHS.find(p => p.id === pathId)
  if (!path || !progress) return 0
  
  const totalExercises = path.modules.reduce((sum, m) => sum + m.exercises.length, 0)
  const completedExercises = progress.completed_exercises?.length || 0
  
  return Math.round((completedExercises / totalExercises) * 100)
}

function calculateStreak(progress: any): number {
  // Calculate consecutive days of engagement
  return progress?.current_streak || 0
}

function getNextMilestone(progress: any, pathId: string): string {
  const path = GROWTH_PATHS.find(p => p.id === pathId)
  if (!path) return 'Continue your journey'
  
  const currentModule = progress?.current_module || 0
  const module = path.modules[currentModule]
  
  if (module && module.milestones.length > 0) {
    const uncompletedMilestone = module.milestones.find(
      m => !progress?.completed_milestones?.includes(m.id)
    )
    return uncompletedMilestone?.title || 'Complete current module'
  }
  
  return 'Complete current module'
}