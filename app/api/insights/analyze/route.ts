import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { analyzeUserPatterns } from '@/lib/ai-analysis'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, timeRange = '30d' } = await request.json()
    const targetUserId = userId || session.user.id

    // Fetch user's data for analysis
    const [conversations, checkins, journeys] = await Promise.all([
      // Get conversations
      supabase
        .from('conversations')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(50),
      
      // Get daily check-ins
      supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(30),
      
      // Get journey progress
      supabase
        .from('user_journeys')
        .select('*')
        .eq('user_id', targetUserId)
    ])

    // Analyze patterns using AI
    const analysis = await analyzeUserPatterns({
      conversations: conversations.data || [],
      checkins: checkins.data || [],
      journeys: journeys.data || []
    })

    // Generate insights
    const insights = {
      behavioralPatterns: analysis.patterns,
      growthRecommendations: analysis.recommendations,
      breakthroughIdentification: analysis.breakthroughs,
      progressTrends: analysis.trends,
      riskFactors: analysis.risks,
      strengths: analysis.strengths,
      nextSteps: analysis.nextSteps
    }

    // Store insights in database
    await supabase
      .from('user_insights')
      .upsert({
        user_id: targetUserId,
        insights: insights,
        generated_at: new Date().toISOString(),
        time_range: timeRange
      })

    return NextResponse.json({
      success: true,
      insights,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error analyzing user patterns:', error)
    return NextResponse.json(
      { error: 'Failed to analyze patterns' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const targetUserId = userId || session.user.id

    // Fetch latest insights
    const { data: insights, error } = await supabase
      .from('user_insights')
      .select('*')
      .eq('user_id', targetUserId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !insights) {
      return NextResponse.json({
        message: 'No insights found. Generate new analysis.',
        needsGeneration: true
      })
    }

    return NextResponse.json({
      success: true,
      insights: insights.insights,
      generatedAt: insights.generated_at
    })
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    )
  }
}