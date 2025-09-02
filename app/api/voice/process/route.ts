import { NextResponse } from 'next/server'
import { createUntypedServerClient } from '@/lib/supabase/server-untyped'

// Voice processing API endpoint
export async function POST(request: Request) {
  try {
    const { audioUrl, userId, conversationId, duration, transcription } = await request.json()

    // Process with Whisper API (OpenAI)
    const transcriptionResult = await processTranscription(audioUrl)
    
    // Analyze emotional tone
    const emotionalTone = await analyzeEmotionalTone(transcriptionResult || transcription)
    
    // Extract key insights and patterns
    const analysis = await extractInsights(transcriptionResult || transcription, emotionalTone)
    
    // Generate AI response
    const response = await generateVoiceResponse(
      transcriptionResult || transcription,
      emotionalTone,
      analysis
    )

    // Save to database
    const supabase = await createUntypedServerClient()
    await supabase.from('voice_sessions').insert({
      user_id: userId,
      conversation_id: conversationId,
      audio_url: audioUrl,
      transcription: transcriptionResult || transcription,
      duration_seconds: duration,
      emotional_tone: emotionalTone,
      key_insights: analysis.insights,
      detected_patterns: analysis.patterns,
      crisis_indicators: emotionalTone.valence < -0.7 || analysis.crisisDetected
    })

    return NextResponse.json({
      success: true,
      transcription: transcriptionResult || transcription,
      emotionalTone,
      insights: analysis.insights,
      patterns: analysis.patterns,
      response: response.text
    })
  } catch (error) {
    console.error('Voice processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process voice session' },
      { status: 500 }
    )
  }
}

async function processTranscription(audioUrl: string): Promise<string | null> {
  // Use Replicate's Whisper for transcription
  if (process.env.REPLICATE_API_TOKEN) {
    try {
      const Replicate = (await import('replicate')).default
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN
      })

      // Using OpenAI Whisper via Replicate for speech-to-text
      const output = await replicate.run(
        "openai/whisper:4d50797290df275329f202e48c76360b3f22b08d28c196cbc54600319435f8d2",
        {
          input: {
            audio: audioUrl,
            model: "large-v3",
            language: "en",
            temperature: 0,
            transcription: "plain text",
            suppress_tokens: "-1",
            logprob_threshold: -1.0,
            no_speech_threshold: 0.6,
            condition_on_previous_text: true,
            compression_ratio_threshold: 2.4,
            temperature_increment_on_fallback: 0.2
          }
        }
      )

      if (output && output.transcription) {
        return output.transcription as string
      }
    } catch (error) {
      console.error('Replicate Whisper error:', error)
      
      // Try alternative: Incredibly Fast Whisper for faster processing
      try {
        const Replicate = (await import('replicate')).default
        const replicate = new Replicate({
          auth: process.env.REPLICATE_API_TOKEN
        })
        
        const output = await replicate.run(
          "vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c",
          {
            input: {
              audio: audioUrl,
              task: "transcribe",
              language: "english",
              batch_size: 24,
              timestamp: "chunk"
            }
          }
        )
        
        if (output && output.text) {
          return output.text as string
        }
      } catch (fallbackError) {
        console.error('Fast Whisper fallback error:', fallbackError)
      }
    }
  }
  
  // Fallback to browser transcription
  return null
}

async function analyzeEmotionalTone(text: string) {
  // Analyze emotional tone using keywords and sentiment
  const emotions = {
    joy: ['happy', 'excited', 'great', 'wonderful', 'amazing', 'love'],
    sadness: ['sad', 'depressed', 'down', 'lonely', 'empty', 'hopeless'],
    anger: ['angry', 'frustrated', 'mad', 'annoyed', 'irritated', 'furious'],
    fear: ['afraid', 'scared', 'anxious', 'worried', 'nervous', 'panic'],
    surprise: ['surprised', 'shocked', 'unexpected', 'sudden'],
    disgust: ['disgusted', 'revolted', 'sick', 'horrible']
  }

  const textLower = text.toLowerCase()
  const emotionScores: Record<string, number> = {}
  
  for (const [emotion, keywords] of Object.entries(emotions)) {
    emotionScores[emotion] = keywords.filter(keyword => 
      textLower.includes(keyword)
    ).length
  }

  // Find dominant emotion
  const primary = Object.entries(emotionScores).reduce((a, b) => 
    emotionScores[a[0]] > emotionScores[b[0]] ? a : b
  )[0] || 'neutral'

  // Calculate valence (positive/negative)
  const positiveEmotions = ['joy', 'surprise']
  const negativeEmotions = ['sadness', 'anger', 'fear', 'disgust']
  
  const positiveScore = positiveEmotions.reduce((sum, e) => sum + (emotionScores[e] || 0), 0)
  const negativeScore = negativeEmotions.reduce((sum, e) => sum + (emotionScores[e] || 0), 0)
  
  const valence = positiveScore > negativeScore ? 
    Math.min(positiveScore / 10, 1) : 
    Math.max(-negativeScore / 10, -1)

  // Calculate arousal (calm/excited)
  const highArousalEmotions = ['joy', 'anger', 'fear', 'surprise']
  const arousalScore = highArousalEmotions.reduce((sum, e) => sum + (emotionScores[e] || 0), 0)
  const arousal = Math.min(arousalScore / 10, 1)

  return {
    primary,
    confidence: 0.75, // Would use ML model for real confidence
    valence,
    arousal,
    scores: emotionScores
  }
}

async function extractInsights(text: string, emotionalTone: any) {
  const insights: string[] = []
  const patterns: string[] = []
  let crisisDetected = false

  // Crisis keywords
  const crisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'not worth living',
    'self harm', 'hurt myself', 'hopeless', 'no point'
  ]

  const textLower = text.toLowerCase()
  
  // Check for crisis
  crisisDetected = crisisKeywords.some(keyword => textLower.includes(keyword))

  // Pattern detection
  if (textLower.includes('always') || textLower.includes('never')) {
    patterns.push('All-or-nothing thinking')
    insights.push('Consider situations where exceptions might exist')
  }

  if (textLower.includes('should') || textLower.includes('must')) {
    patterns.push('Rigid expectations')
    insights.push('Try replacing "should" with "would like to"')
  }

  if (textLower.includes('my fault') || textLower.includes('blame myself')) {
    patterns.push('Self-blame')
    insights.push('Consider external factors that contributed to the situation')
  }

  if (emotionalTone.primary === 'sadness' && emotionalTone.valence < -0.5) {
    patterns.push('Low mood pattern')
    insights.push('Your emotional tone suggests you might benefit from mood-lifting activities')
  }

  if (emotionalTone.arousal > 0.7) {
    patterns.push('High stress/anxiety')
    insights.push('Consider calming techniques like deep breathing or grounding exercises')
  }

  // Add insights based on emotional state
  if (emotionalTone.valence < -0.3) {
    insights.push('It sounds like you\'re going through a difficult time. Remember that these feelings are temporary.')
  } else if (emotionalTone.valence > 0.3) {
    insights.push('Your positive emotional state is a great foundation for making progress.')
  }

  return {
    insights,
    patterns,
    crisisDetected
  }
}

async function generateVoiceResponse(
  transcription: string,
  emotionalTone: any,
  analysis: any
) {
  // Generate appropriate response based on analysis
  let response = ''

  if (analysis.crisisDetected) {
    response = "I'm deeply concerned about what you're sharing. Your safety is the most important thing right now. Please reach out to the 988 Suicide & Crisis Lifeline immediately. They have trained counselors available 24/7. You don't have to go through this alone."
  } else if (emotionalTone.valence < -0.5) {
    response = `I hear the ${emotionalTone.primary} in your voice, and I want you to know that what you're feeling is valid. ${analysis.insights[0] || 'Let\'s work through this together.'} Would you like to explore what might be contributing to these feelings?`
  } else if (analysis.patterns.length > 0) {
    response = `I noticed a pattern of ${analysis.patterns[0]} in what you shared. ${analysis.insights[0] || 'This is a common pattern that many people experience.'} How do you think this pattern might be affecting your daily life?`
  } else {
    response = "Thank you for sharing that with me. I'm here to support you in understanding your patterns and emotions. What would you like to explore further?"
  }

  return { text: response }
}