import { NextResponse } from 'next/server'

// Voice synthesis API endpoint
export async function POST(request: Request) {
  try {
    const { text, voice = 'alloy' } = await request.json()

    // In production, use OpenAI TTS API
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: voice // alloy, echo, fable, onyx, nova, shimmer
          })
        })

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer()
          return new Response(audioBuffer, {
            headers: {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'no-cache'
            }
          })
        }
      } catch (error) {
        console.error('OpenAI TTS error:', error)
      }
    }

    // Fallback: Return empty audio (browser will use native TTS)
    return NextResponse.json({ 
      fallback: true,
      message: 'Using browser text-to-speech'
    })

  } catch (error) {
    console.error('Voice synthesis error:', error)
    return NextResponse.json(
      { error: 'Failed to synthesize voice' },
      { status: 500 }
    )
  }
}