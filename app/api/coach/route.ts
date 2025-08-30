import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'

// Debug: Log the API key status (not the key itself)
console.log('ANTHROPIC_API_KEY status:', process.env.ANTHROPIC_API_KEY ? 'Present' : 'Missing')
console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `You are Beneathy's AI Personal Growth Coach specializing in root cause exploration and pattern discovery. Your role is to:

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
    
    console.log('Received request:', { message: message.substring(0, 50), conversationId, userId })

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
    const supabase = await createUntypedServerClient()
    const { data: messages, error: dbError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10)
    
    if (dbError) {
      console.log('Database error (non-fatal):', dbError)
    }

    // Build conversation history for context
    const conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = messages?.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    })) || []

    console.log('Calling Anthropic API...')
    
    // Call Anthropic API with updated model
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Using Claude 3.5 Sonnet
      max_tokens: 500,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [
        ...conversationHistory,
        { role: 'user', content: message }
      ]
    })

    console.log('Anthropic API response received')

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

  } catch (error: any) {
    console.error('Error in coach API:', error)
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      type: error.type,
      stack: error.stack
    })
    
    // Check if it's an authentication error or model not found
    if (error.status === 401 || error.status === 404 || error.message?.includes('invalid x-api-key') || error.message?.includes('Invalid API Key') || error.message?.includes('not_found_error')) {
      return NextResponse.json({
        content: "⚠️ Configuration Issue: The AI coach service needs to be configured. To fix this:\n\n1. Get a valid API key from https://console.anthropic.com/\n2. Update ANTHROPIC_API_KEY in your .env.local file with a new key\n3. Restart the development server\n\nYour current API key appears to be invalid or expired (keys starting with 'sk-ant-api03-' are outdated).\n\nIn the meantime, I encourage you to explore the other features of the platform like wellness tracking, pattern analysis, and journaling.",
        metadata: {
          error: 'api_configuration',
          patterns_detected: [],
          emotional_tone: 'informative',
          growth_opportunities: ['self-reflection', 'journaling']
        }
      })
    }
    
    // Check for network/connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message?.includes('fetch failed')) {
      return NextResponse.json({
        content: "⚠️ Connection Issue: Unable to reach the AI service. This might be due to:\n\n• Network connectivity issues\n• Firewall blocking the connection\n• VPN interference\n\nPlease check your internet connection and try again. In the meantime, consider journaling your thoughts or exploring the wellness features.",
        metadata: {
          error: 'connection_failed',
          patterns_detected: [],
          emotional_tone: 'informative',
          growth_opportunities: ['self-reflection', 'journaling']
        }
      })
    }
    
    // Fallback response if API fails for other reasons
    return NextResponse.json({
      content: "I'm experiencing a temporary connection issue, but I'm still here to support you. While we work on reconnecting, consider taking a moment to reflect on what brought you here today. Sometimes the most powerful insights come from within. What would you like to explore?",
      metadata: {
        error: true,
        patterns_detected: [],
        emotional_tone: 'supportive',
        growth_opportunities: ['self-reflection', 'mindfulness']
      }
    })
  }
}