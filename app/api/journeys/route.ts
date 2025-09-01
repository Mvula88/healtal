import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Pre-defined journey templates
const JOURNEY_TEMPLATES = [
  {
    id: 'anxiety-management',
    title: 'Mastering Anxiety',
    description: 'Learn to understand and manage anxiety with proven techniques',
    category: 'Mental Health',
    duration: '4 weeks',
    difficulty: 'beginner',
    milestones: [
      { step: 1, title: 'Understanding Your Anxiety', description: 'Identify triggers and patterns', duration: '3 days' },
      { step: 2, title: 'Breathing Techniques', description: 'Master calming breathing exercises', duration: '5 days' },
      { step: 3, title: 'Cognitive Restructuring', description: 'Challenge anxious thoughts', duration: '7 days' },
      { step: 4, title: 'Exposure Practice', description: 'Gradually face your fears', duration: '7 days' },
      { step: 5, title: 'Maintenance Plan', description: 'Create long-term strategies', duration: '5 days' }
    ]
  },
  {
    id: 'relationship-healing',
    title: 'Healing Relationships',
    description: 'Rebuild trust and improve communication in relationships',
    category: 'Relationships',
    duration: '6 weeks',
    difficulty: 'intermediate',
    milestones: [
      { step: 1, title: 'Self-Reflection', description: 'Understand your relationship patterns', duration: '5 days' },
      { step: 2, title: 'Communication Skills', description: 'Learn healthy communication', duration: '7 days' },
      { step: 3, title: 'Setting Boundaries', description: 'Establish healthy boundaries', duration: '7 days' },
      { step: 4, title: 'Trust Building', description: 'Rebuild and maintain trust', duration: '10 days' },
      { step: 5, title: 'Conflict Resolution', description: 'Handle disagreements constructively', duration: '7 days' },
      { step: 6, title: 'Intimacy & Connection', description: 'Deepen emotional bonds', duration: '7 days' }
    ]
  },
  {
    id: 'self-esteem-boost',
    title: 'Building Self-Esteem',
    description: 'Develop unshakeable confidence and self-worth',
    category: 'Personal Growth',
    duration: '5 weeks',
    difficulty: 'beginner',
    milestones: [
      { step: 1, title: 'Self-Assessment', description: 'Understand your self-image', duration: '3 days' },
      { step: 2, title: 'Challenging Negative Beliefs', description: 'Identify and change limiting beliefs', duration: '7 days' },
      { step: 3, title: 'Self-Compassion Practice', description: 'Develop kindness toward yourself', duration: '7 days' },
      { step: 4, title: 'Strength Discovery', description: 'Identify and celebrate your strengths', duration: '7 days' },
      { step: 5, title: 'Confidence Building', description: 'Practice confident behaviors', duration: '7 days' },
      { step: 6, title: 'Integration', description: 'Make self-esteem a lifestyle', duration: '4 days' }
    ]
  },
  {
    id: 'trauma-recovery',
    title: 'Trauma Recovery Path',
    description: 'Gentle, structured approach to healing from trauma',
    category: 'Healing',
    duration: '8 weeks',
    difficulty: 'advanced',
    milestones: [
      { step: 1, title: 'Safety & Stabilization', description: 'Create a safe foundation', duration: '7 days' },
      { step: 2, title: 'Understanding Trauma', description: 'Learn about trauma responses', duration: '7 days' },
      { step: 3, title: 'Emotional Regulation', description: 'Manage intense emotions', duration: '10 days' },
      { step: 4, title: 'Processing Memories', description: 'Safely process traumatic memories', duration: '14 days' },
      { step: 5, title: 'Rebuilding Trust', description: 'Restore trust in yourself and others', duration: '10 days' },
      { step: 6, title: 'Post-Traumatic Growth', description: 'Find meaning and growth', duration: '10 days' }
    ]
  },
  {
    id: 'addiction-recovery',
    title: 'Breaking Free from Addiction',
    description: 'Comprehensive recovery journey with daily support',
    category: 'Recovery',
    duration: '12 weeks',
    difficulty: 'advanced',
    milestones: [
      { step: 1, title: 'Acknowledgment', description: 'Accept and understand addiction', duration: '3 days' },
      { step: 2, title: 'Detox Support', description: 'Navigate withdrawal safely', duration: '7 days' },
      { step: 3, title: 'Trigger Identification', description: 'Map your triggers', duration: '7 days' },
      { step: 4, title: 'Coping Strategies', description: 'Build healthy alternatives', duration: '14 days' },
      { step: 5, title: 'Relapse Prevention', description: 'Create prevention plan', duration: '14 days' },
      { step: 6, title: 'Life Reconstruction', description: 'Build a fulfilling life', duration: '21 days' },
      { step: 7, title: 'Long-term Maintenance', description: 'Sustain your recovery', duration: '21 days' }
    ]
  }
]

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'user' // 'user' or 'templates'
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (type === 'templates') {
      // Return available journey templates
      return NextResponse.json({
        success: true,
        templates: JOURNEY_TEMPLATES
      })
    }

    // Fetch user's journeys
    const { data: userJourneys, error } = await supabase
      .from('user_journeys')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calculate progress for each journey
    const journeysWithProgress = userJourneys?.map(journey => {
      const template = JOURNEY_TEMPLATES.find(t => t.id === journey.template_id)
      const totalSteps = template?.milestones.length || 1
      const completedSteps = journey.completed_milestones?.length || 0
      const progress = Math.round((completedSteps / totalSteps) * 100)
      
      return {
        ...journey,
        template,
        progress,
        completedSteps,
        totalSteps,
        nextMilestone: template?.milestones[completedSteps]
      }
    })

    return NextResponse.json({
      success: true,
      journeys: journeysWithProgress || []
    })
  } catch (error) {
    console.error('Error fetching journeys:', error)
    return NextResponse.json(
      { error: 'Failed to fetch journeys' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { templateId, customGoals } = await request.json()
    
    // Find the template
    const template = JOURNEY_TEMPLATES.find(t => t.id === templateId)
    if (!template) {
      return NextResponse.json({ error: 'Invalid template' }, { status: 400 })
    }

    // Check if user already has this journey active
    const { data: existingJourney } = await supabase
      .from('user_journeys')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('template_id', templateId)
      .eq('status', 'active')
      .single()

    if (existingJourney) {
      return NextResponse.json({
        error: 'You already have this journey active'
      }, { status: 400 })
    }

    // Create new journey
    const { data: newJourney, error } = await supabase
      .from('user_journeys')
      .insert({
        user_id: session.user.id,
        template_id: templateId,
        title: template.title,
        description: template.description,
        category: template.category,
        status: 'active',
        progress: 0,
        current_milestone: 1,
        completed_milestones: [],
        custom_goals: customGoals || [],
        started_at: new Date().toISOString(),
        estimated_completion: calculateEstimatedCompletion(template.duration)
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      journey: newJourney,
      message: `Started ${template.title} journey!`
    })
  } catch (error) {
    console.error('Error creating journey:', error)
    return NextResponse.json(
      { error: 'Failed to create journey' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { journeyId, action, milestoneId } = await request.json()

    // Fetch the journey
    const { data: journey, error: fetchError } = await supabase
      .from('user_journeys')
      .select('*')
      .eq('id', journeyId)
      .eq('user_id', session.user.id)
      .single()

    if (fetchError || !journey) {
      return NextResponse.json({ error: 'Journey not found' }, { status: 404 })
    }

    let updateData: any = {}

    if (action === 'complete_milestone') {
      const template = JOURNEY_TEMPLATES.find(t => t.id === journey.template_id)
      const completedMilestones = [...(journey.completed_milestones || []), milestoneId]
      const progress = Math.round((completedMilestones.length / template!.milestones.length) * 100)
      
      updateData = {
        completed_milestones: completedMilestones,
        current_milestone: journey.current_milestone + 1,
        progress,
        last_activity: new Date().toISOString()
      }

      // Check if journey is complete
      if (completedMilestones.length === template!.milestones.length) {
        updateData.status = 'completed'
        updateData.completed_at = new Date().toISOString()
      }
    } else if (action === 'pause') {
      updateData = {
        status: 'paused',
        paused_at: new Date().toISOString()
      }
    } else if (action === 'resume') {
      updateData = {
        status: 'active',
        resumed_at: new Date().toISOString()
      }
    } else if (action === 'abandon') {
      updateData = {
        status: 'abandoned',
        abandoned_at: new Date().toISOString()
      }
    }

    // Update the journey
    const { data: updatedJourney, error: updateError } = await supabase
      .from('user_journeys')
      .update(updateData)
      .eq('id', journeyId)
      .select()
      .single()

    if (updateError) throw updateError

    // Log achievement if journey completed
    if (updateData.status === 'completed') {
      await supabase
        .from('achievements')
        .insert({
          user_id: session.user.id,
          type: 'journey_completed',
          title: `Completed ${journey.title}`,
          description: `Successfully completed the ${journey.title} journey`,
          points: 100,
          metadata: { journey_id: journeyId }
        })
    }

    return NextResponse.json({
      success: true,
      journey: updatedJourney,
      message: action === 'complete_milestone' 
        ? 'Milestone completed!' 
        : `Journey ${action}d successfully`
    })
  } catch (error) {
    console.error('Error updating journey:', error)
    return NextResponse.json(
      { error: 'Failed to update journey' },
      { status: 500 }
    )
  }
}

function calculateEstimatedCompletion(duration: string): string {
  const weeks = parseInt(duration.split(' ')[0])
  const completionDate = new Date()
  completionDate.setDate(completionDate.getDate() + (weeks * 7))
  return completionDate.toISOString()
}