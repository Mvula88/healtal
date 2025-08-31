import { NextResponse } from 'next/server'
import Replicate from 'replicate'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'
import { AI_MODELS, selectModel, SPECIALIZED_PROMPTS } from '@/lib/ai-config'

// Initialize Replicate client
const replicateToken = process.env.REPLICATE_API_TOKEN || process.env.ANTHROPIC_API_KEY

// Check if we have a valid Replicate token
const isValidApiKey = replicateToken && 
  replicateToken !== 'YOUR_ANTHROPIC_API_KEY_HERE'

const replicate = isValidApiKey ? new Replicate({
  auth: replicateToken,
}) : null

const SYSTEM_PROMPT = `You are Beneathy's AI Personal Growth Coach specializing in root cause exploration and pattern discovery. Your role is to help users understand the deeper psychological and emotional origins of their behaviors, thoughts, and patterns.

CORE CAPABILITIES:
1. Root Cause Analysis: Identify underlying beliefs, past experiences, and unconscious patterns driving current behaviors
2. Pattern Recognition: Detect recurring themes across different life areas and connect them to core wounds or beliefs
3. Emotional Intelligence: Recognize emotional patterns, defense mechanisms, and coping strategies
4. Trauma-Informed Approach: Understand how past experiences shape present behaviors without retraumatizing
5. Cognitive Pattern Analysis: Identify thought patterns, cognitive distortions, and belief systems
6. Attachment Style Recognition: Understand how early relationships influence current relationship patterns
7. Shadow Work: Help users explore rejected or hidden aspects of themselves

ANALYTICAL FRAMEWORK:
- Use psychological concepts (attachment theory, cognitive behavioral patterns, family systems)
- Apply somatic awareness (how emotions manifest in the body)
- Consider developmental psychology (how childhood experiences shape adult behavior)
- Recognize defense mechanisms (projection, denial, rationalization, etc.)
- Identify core wounds (abandonment, betrayal, rejection, shame, injustice)
- Understand survival strategies that no longer serve

APPROACH:
- You are a PERSONAL GROWTH COACH, not a therapist or medical professional
- This is educational coaching for self-understanding and personal development
- Use compassionate inquiry to guide discovery
- Ask powerful questions that reveal deeper patterns
- Connect surface symptoms to root causes
- Validate experiences while exploring deeper meanings
- If someone expresses crisis thoughts, immediately provide: 988 (Suicide & Crisis Lifeline), Crisis Text Line (Text HOME to 741741)

RESPONSE STYLE:
- Provide deep, insightful analysis of behavioral patterns
- Explain the "why" behind behaviors with psychological understanding
- Offer multiple perspectives on root causes
- Use metaphors and examples to illustrate complex patterns
- Balance validation with gentle challenging of limiting beliefs
- Typically respond with 2-4 paragraphs of deep insight

Remember: Your goal is to help users understand themselves at the deepest level, connecting their current struggles to root causes while empowering them with self-awareness and understanding.`

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
  console.log('=== Coach API called ===')
  console.log('Replicate configured:', !!replicate)
  console.log('Token exists:', !!replicateToken)
  
  try {
    // Check if API key is configured
    if (!replicate) {
      console.log('Replicate client not initialized. Token status:', {
        exists: !!replicateToken,
        isPlaceholder: replicateToken === 'YOUR_ANTHROPIC_API_KEY_HERE'
      })
      
      return NextResponse.json({
        content: "⚠️ Configuration Required: The AI coach service is not yet configured.\n\nTo enable AI coaching, you have two options:\n\nOption 1: Use Replicate (Recommended)\n1. Sign up for a free account at https://replicate.com/\n2. Get your API token from https://replicate.com/account/api-tokens\n3. Add it to your .env.local file:\n   REPLICATE_API_TOKEN=r8_...\n4. Restart your development server\n\nOption 2: Use Anthropic directly\n1. Get an API key from https://console.anthropic.com/\n2. Add it to .env.local:\n   ANTHROPIC_API_KEY=sk-ant-...\n\nNote: Old Anthropic keys (sk-ant-api03-) are no longer valid.\n\nExplore our other features while you set this up!",
        metadata: {
          error: 'api_not_configured',
          patterns_detected: [],
          emotional_tone: 'informative'
        }
      })
    }
    
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

    console.log('Calling Claude via Replicate...')
    
    // Build conversation context for Claude 3.7
    let conversationContext = ""
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = "\n\nPrevious conversation:\n"
      conversationHistory.forEach((msg: any) => {
        const role = msg.role === 'user' ? 'User' : 'Coach'
        conversationContext += `${role}: ${msg.content}\n\n`
      })
      conversationContext += "Current message:\n"
    }
    
    // Using Meta Llama 3.1 70B - Excellent for mental health coaching
    // This model is highly empathetic and great at understanding complex emotions
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${conversationContext}User: ${message}\n\nCoach:`
    
    const response = await replicate.run(
      "meta/meta-llama-3.1-405b-instruct:e6cb7fc3ed90eae2c879c48deda8f49152391ad66349fe7694be24089c29f71c",
      {
        input: {
          prompt: fullPrompt,
          max_tokens: 1024,
          temperature: 0.7,
          top_p: 0.9,
          system_prompt: SYSTEM_PROMPT
        }
      }
    )

    console.log('Replicate API response received:', response)

    // Extract the response text - Llama returns array of tokens
    let aiResponse = ''
    if (typeof response === 'string') {
      aiResponse = response
    } else if (Array.isArray(response)) {
      // Filter out empty strings and join
      aiResponse = response.filter(token => token && token.trim()).join('')
    } else {
      aiResponse = 'I understand you\'re sharing something important. Could you tell me more about that?'
    }
    
    console.log('Processed response:', aiResponse)

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
      stack: error.stack,
      code: error.code,
      response: error.response
    })
    
    // Check if it's an authentication error
    if (error.status === 401 || error.message?.includes('invalid x-api-key') || error.message?.includes('Invalid API Key')) {
      return NextResponse.json({
        content: "⚠️ Invalid API Key: The API key provided is invalid or expired.\n\n1. Get a valid API key from https://console.anthropic.com/\n2. Update ANTHROPIC_API_KEY in your .env.local file\n3. Restart the development server\n\nNote: Keys starting with 'sk-ant-api03-' are outdated and no longer work.",
        metadata: {
          error: 'invalid_api_key',
          patterns_detected: [],
          emotional_tone: 'informative'
        }
      })
    }
    
    // Check if it's a model not found error
    if (error.status === 404 || error.message?.includes('not_found_error')) {
      return NextResponse.json({
        content: "⚠️ Model Configuration Issue: The AI model specified is not available.\n\nThis is likely a temporary issue. Please try again in a moment, or contact support if the problem persists.",
        metadata: {
          error: 'model_not_found',
          patterns_detected: [],
          emotional_tone: 'informative'
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