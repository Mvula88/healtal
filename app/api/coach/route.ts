import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerActionClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `You are Healtal's AI Personal Growth Coach specializing in root cause exploration and pattern discovery. Your role is to:

1. Help users understand the deeper origins of their patterns and behaviors
2. Identify recurring themes and connect them to root causes
3. Ask insightful questions that reveal underlying patterns
4. Guide users from surface symptoms to source understanding
5. Validate experiences while uncovering deeper connections
6. Focus on pattern recognition and root cause analysis

Core approach:
- You are a PERSONAL GROWTH COACH, not a therapist or medical professional
- This is personal development coaching focused on self-understanding
- Always emphasize that this is for educational and personal growth purposes only
- If someone expresses crisis thoughts, immediately provide: 988 (Suicide & Crisis Lifeline), Crisis Text Line (Text HOME to 741741)
- Frame insights as patterns and connections to explore, not diagnoses
- Use language focused on understanding, patterns, and growth
- Help users see how past experiences shape current behaviors
- Guide them to discover their own root causes

Your responses should focus on pattern discovery and root cause exploration, typically 2-3 paragraphs that help users understand the "why" behind their experiences.`

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'not worth living',
  'self harm', 'hurt myself', 'cutting', 'overdose',
  'want to die', 'better off dead', 'no point in living'
]

function detectCrisis(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword))
}

function detectPatterns(message: string): string[] {
  const patterns = []
  
  // Simple pattern detection - in production, this would be more sophisticated
  if (message.toLowerCase().includes('always') || message.toLowerCase().includes('never')) {
    patterns.push('all-or-nothing thinking')
  }
  if (message.toLowerCase().includes('should') || message.toLowerCase().includes('must')) {
    patterns.push('rigid expectations')
  }
  if (message.toLowerCase().includes('my fault') || message.toLowerCase().includes('blame myself')) {
    patterns.push('self-blame')
  }
  if (message.toLowerCase().includes('relationship') || message.toLowerCase().includes('partner')) {
    patterns.push('relationship focus')
  }
  if (message.toLowerCase().includes('work') || message.toLowerCase().includes('job')) {
    patterns.push('career concerns')
  }
  
  return patterns
}

export async function POST(request: Request) {
  try {
    const { message, conversationId, userId } = await request.json()

    // Check for crisis keywords
    const isCrisis = detectCrisis(message)
    if (isCrisis) {
      return NextResponse.json({
        content: "I'm noticing you're going through something really difficult right now, and I'm concerned about your wellbeing. What you're feeling is important, and you deserve immediate support from someone trained to help in crisis situations.\n\nPlease reach out to professional support right away:\n• Call or text 988 for the Suicide & Crisis Lifeline (24/7)\n• Call 911 if you're in immediate danger\n• Text HOME to 741741 for Crisis Text Line\n\nYou don't have to go through this alone. These services have caring professionals ready to support you right now. Would you like to talk about what led you to feel this way while you consider reaching out for additional help?",
        metadata: {
          referral_suggested: true,
          patterns_detected: ['crisis'],
          emotional_tone: 'crisis'
        }
      })
    }

    // Get conversation history from Supabase
    const supabase = await createServerActionClient()
    const { data: messages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10)

    // Build conversation history for context
    const conversationHistory = messages?.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })) || []

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 500,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [
        ...conversationHistory,
        { role: 'user', content: message }
      ]
    })

    const aiResponse = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'I understand you\'re sharing something important. Could you tell me more about that?'

    // Detect patterns and emotional tone
    const patterns = detectPatterns(message)
    
    return NextResponse.json({
      content: aiResponse,
      metadata: {
        patterns_detected: patterns,
        emotional_tone: 'supportive',
        growth_opportunities: patterns.length > 0 ? ['self-awareness', 'pattern recognition'] : []
      }
    })

  } catch (error) {
    console.error('Error in coach API:', error)
    
    // Fallback response if API fails
    return NextResponse.json({
      content: "I'm here to support you. Could you share a bit more about what's on your mind? Sometimes just expressing our thoughts can help us understand them better.",
      metadata: {
        error: true
      }
    })
  }
}