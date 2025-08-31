import { NextResponse } from 'next/server'
import Replicate from 'replicate'

export async function GET() {
  const replicateToken = process.env.REPLICATE_API_TOKEN || process.env.ANTHROPIC_API_KEY
  
  if (!replicateToken || replicateToken === 'YOUR_REPLICATE_TOKEN_HERE') {
    return NextResponse.json({ 
      error: 'No valid Replicate token found',
      token_exists: !!replicateToken,
      is_placeholder: replicateToken === 'YOUR_REPLICATE_TOKEN_HERE'
    })
  }

  try {
    const replicate = new Replicate({
      auth: replicateToken,
    })

    // Test with a simple prompt
    const response = await replicate.run(
      "meta/meta-llama-3.1-405b-instruct:e6cb7fc3ed90eae2c879c48deda8f49152391ad66349fe7694be24089c29f71c",
      {
        input: {
          prompt: "Say 'Hello, I am working!' in one sentence.",
          max_tokens: 50,
          temperature: 0.5
        }
      }
    )

    return NextResponse.json({ 
      success: true,
      response: response,
      model: 'meta-llama-3.1-405b'
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      details: error.response || error
    }, { status: 500 })
  }
}