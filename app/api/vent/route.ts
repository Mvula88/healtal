import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase/server';
import Replicate from 'replicate';
import { z } from 'zod';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const ventSchema = z.object({
  mode: z.enum(['vent', 'listen', 'comfort']),
  content: z.string().min(1).max(5000),
  emotionBefore: z.string().optional(),
  isVoice: z.boolean().optional(),
  duration: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = ventSchema.parse(body);

    // Generate empathetic AI response based on mode
    let systemPrompt = '';
    let userPrompt = validatedData.content;

    switch (validatedData.mode) {
      case 'vent':
        systemPrompt = `You are a compassionate listener helping someone release their frustrations. 
        Acknowledge their feelings without judgment. Reflect back what you hear. 
        Ask one gentle follow-up question if appropriate. Keep response under 150 words.
        Be warm, understanding, and validating.`;
        break;
      
      case 'listen':
        systemPrompt = `You are a silent, supportive presence. The user just needs to be heard.
        Provide a brief, warm acknowledgment (under 50 words). 
        Simply validate their experience without advice or questions.
        End with something like "I'm here with you" or "Thank you for sharing this with me."`;
        break;
      
      case 'comfort':
        systemPrompt = `You are a nurturing, comforting presence. The user needs emotional support.
        Offer gentle comfort and reassurance. Remind them of their strength.
        Share a brief supportive insight if appropriate. Keep response under 150 words.
        Be soothing, hopeful, and encouraging.`;
        break;
    }

    // Generate AI response using Replicate
    const output = await replicate.run(
      "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
      {
        input: {
          prompt: userPrompt,
          system_prompt: systemPrompt,
          temperature: 0.8,
          max_new_tokens: 200,
          top_p: 0.95,
        }
      }
    );

    const aiResponse = Array.isArray(output) ? output.join('') : String(output);

    // Save vent session to database
    const { data: session, error: sessionError } = await (supabase as any)
      .from('vent_sessions')
      .insert({
        user_id: user.id,
        session_type: validatedData.mode,
        content: validatedData.content,
        emotion_before: validatedData.emotionBefore,
        is_voice: validatedData.isVoice || false,
        duration_seconds: validatedData.duration,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error saving vent session:', sessionError);
    }

    return NextResponse.json({
      response: aiResponse,
      sessionId: session?.id,
      mode: validatedData.mode,
    });

  } catch (error) {
    console.error('Vent session error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process vent session' },
      { status: 500 }
    );
  }
}

// Get user's vent history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: sessions, error } = await (supabase as any)
      .from('vent_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({ sessions });

  } catch (error) {
    console.error('Error fetching vent sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vent sessions' },
      { status: 500 }
    );
  }
}