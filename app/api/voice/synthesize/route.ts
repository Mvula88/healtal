import { NextResponse } from 'next/server'
import Replicate from 'replicate'

// Voice synthesis API endpoint using Replicate
export async function POST(request: Request) {
  try {
    const { text, voice = 'v2/en_speaker_0' } = await request.json()

    // Use Replicate for voice synthesis
    if (process.env.REPLICATE_API_TOKEN) {
      try {
        const replicate = new Replicate({
          auth: process.env.REPLICATE_API_TOKEN
        })

        // Using XTTS-v2 for high-quality voice synthesis
        // Alternative models:
        // - suno-ai/bark: More expressive, supports emotions
        // - playht/play-ht-2.0: Natural sounding voices
        // - coqui-ai/xtts-v2: Multilingual, voice cloning capable
        
        const output = await replicate.run(
          "lucataco/xtts-v2:684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e",
          {
            input: {
              text: text,
              speaker: voice, // v2/en_speaker_0 through v2/en_speaker_9
              language: "en",
              cleanup_voice: true
            }
          }
        )

        if (output) {
          // XTTS returns audio URL
          const audioResponse = await fetch(output as unknown as string)
          const audioBuffer = await audioResponse.arrayBuffer()
          
          return new Response(audioBuffer, {
            headers: {
              'Content-Type': 'audio/wav',
              'Cache-Control': 'no-cache'
            }
          })
        }
      } catch (error) {
        console.error('Replicate TTS error:', error)
        
        // Try alternative: Bark model for more expressive speech
        try {
          const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN
          })
          
          const output = await replicate.run(
            "suno-ai/bark:b76242b40d67c76ab6742e987628a2a9ac019e11d56ab96c4e91ce03b79b2787",
            {
              input: {
                prompt: text,
                text_temp: 0.7,
                waveform_temp: 0.7
              }
            }
          )
          
          if (output) {
            const audioResponse = await fetch((output as any).audio_out as string)
            const audioBuffer = await audioResponse.arrayBuffer()
            
            return new Response(audioBuffer, {
              headers: {
                'Content-Type': 'audio/wav',
                'Cache-Control': 'no-cache'
              }
            })
          }
        } catch (barkError) {
          console.error('Bark TTS fallback error:', barkError)
        }
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