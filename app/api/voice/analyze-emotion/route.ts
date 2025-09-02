import { NextResponse } from 'next/server'

// Emotion analysis API endpoint
export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    // Analyze emotional tone
    const analysis = analyzeEmotions(text)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Emotion analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze emotions' },
      { status: 500 }
    )
  }
}

function analyzeEmotions(text: string) {
  // Enhanced emotion detection with more nuanced analysis
  const emotionKeywords = {
    joy: {
      keywords: ['happy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'fantastic', 'blessed', 'grateful', 'joyful'],
      weight: 1.0
    },
    sadness: {
      keywords: ['sad', 'depressed', 'down', 'lonely', 'empty', 'hopeless', 'miserable', 'unhappy', 'blue', 'grief'],
      weight: 1.2 // Slightly higher weight for clinical relevance
    },
    anger: {
      keywords: ['angry', 'frustrated', 'mad', 'annoyed', 'irritated', 'furious', 'rage', 'upset', 'pissed', 'hostile'],
      weight: 1.1
    },
    fear: {
      keywords: ['afraid', 'scared', 'anxious', 'worried', 'nervous', 'panic', 'terrified', 'frightened', 'dread', 'tense'],
      weight: 1.2 // Higher weight for anxiety detection
    },
    surprise: {
      keywords: ['surprised', 'shocked', 'unexpected', 'sudden', 'amazed', 'astonished', 'stunned', 'wow'],
      weight: 0.8
    },
    disgust: {
      keywords: ['disgusted', 'revolted', 'sick', 'horrible', 'repulsed', 'gross', 'awful', 'nasty'],
      weight: 0.9
    },
    trust: {
      keywords: ['trust', 'confident', 'secure', 'safe', 'comfortable', 'believe', 'faith', 'reliable'],
      weight: 1.0
    },
    anticipation: {
      keywords: ['excited', 'looking forward', 'hopeful', 'eager', 'expecting', 'ready', 'prepared'],
      weight: 0.9
    }
  }

  const textLower = text.toLowerCase()
  const words = textLower.split(/\s+/)
  const emotionScores: Record<string, number> = {}
  
  // Calculate emotion scores
  for (const [emotion, config] of Object.entries(emotionKeywords)) {
    let score = 0
    for (const keyword of config.keywords) {
      if (textLower.includes(keyword)) {
        score += config.weight
        // Boost score if keyword appears multiple times
        const occurrences = (textLower.match(new RegExp(keyword, 'g')) || []).length
        score += (occurrences - 1) * 0.5
      }
    }
    emotionScores[emotion] = score
  }

  // Detect intensity modifiers
  const intensifiers = ['very', 'extremely', 'really', 'so', 'incredibly', 'absolutely']
  const diminishers = ['slightly', 'somewhat', 'a bit', 'kind of', 'sort of', 'a little']
  
  let intensityModifier = 1.0
  for (const intensifier of intensifiers) {
    if (textLower.includes(intensifier)) {
      intensityModifier *= 1.3
    }
  }
  for (const diminisher of diminishers) {
    if (textLower.includes(diminisher)) {
      intensityModifier *= 0.7
    }
  }

  // Apply intensity modifier
  for (const emotion in emotionScores) {
    emotionScores[emotion] *= intensityModifier
  }

  // Find primary emotion
  const sortedEmotions = Object.entries(emotionScores).sort((a, b) => b[1] - a[1])
  const primary = sortedEmotions[0]?.[1] > 0 ? sortedEmotions[0][0] : 'neutral'
  
  // Calculate valence (positive/negative)
  const positiveEmotions = ['joy', 'trust', 'anticipation', 'surprise']
  const negativeEmotions = ['sadness', 'anger', 'fear', 'disgust']
  
  const positiveScore = positiveEmotions.reduce((sum, e) => sum + (emotionScores[e] || 0), 0)
  const negativeScore = negativeEmotions.reduce((sum, e) => sum + (emotionScores[e] || 0), 0)
  
  const totalScore = positiveScore + negativeScore
  const valence = totalScore > 0 ? 
    (positiveScore - negativeScore) / totalScore : 0

  // Calculate arousal (calm/excited)
  const highArousalEmotions = ['joy', 'anger', 'fear', 'surprise', 'anticipation']
  const lowArousalEmotions = ['sadness', 'trust']
  
  const highArousalScore = highArousalEmotions.reduce((sum, e) => sum + (emotionScores[e] || 0), 0)
  const lowArousalScore = lowArousalEmotions.reduce((sum, e) => sum + (emotionScores[e] || 0), 0)
  
  const arousal = totalScore > 0 ?
    (highArousalScore - lowArousalScore * 0.5) / totalScore : 0.5

  // Calculate confidence based on emotion clarity
  const maxScore = Math.max(...Object.values(emotionScores))
  const confidence = maxScore > 0 ? 
    Math.min(maxScore / 5, 1) : 0.3

  // Detect emotional complexity
  const activeEmotions = Object.entries(emotionScores)
    .filter(([_, score]) => score > 0)
    .map(([emotion]) => emotion)

  return {
    primary,
    secondary: sortedEmotions[1]?.[1] > 0 ? sortedEmotions[1][0] : null,
    confidence,
    valence: Math.max(-1, Math.min(1, valence)),
    arousal: Math.max(0, Math.min(1, arousal)),
    complexity: activeEmotions.length,
    activeEmotions,
    scores: emotionScores,
    intensityModifier
  }
}