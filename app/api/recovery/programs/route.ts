import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's tier to filter available programs
    const { data: userData } = await (supabase as any)
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    // Get all active recovery programs
    const { data: programs, error } = await (supabase as any)
      .from('recovery_programs')
      .select(`
        *,
        user_recovery_progress!left(
          started_at,
          completed_at,
          current_module,
          progress_percentage,
          status
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter programs based on user's tier
    const tierOrder = ['lite', 'starter', 'growth', 'premium'];
    const userTierIndex = tierOrder.indexOf(userData?.subscription_tier || 'lite');
    
    const availablePrograms = programs?.map((program: any) => {
      const minTierIndex = tierOrder.indexOf(program.min_tier);
      const isAvailable = userTierIndex >= minTierIndex;
      
      return {
        ...program,
        is_available: isAvailable,
        user_progress: program.user_recovery_progress?.[0] || null,
      };
    });

    return NextResponse.json({ programs: availablePrograms });

  } catch (error) {
    console.error('Error fetching recovery programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recovery programs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { programId, action } = await request.json();

    if (action === 'start') {
      // Start a new recovery program
      const { data, error } = await (supabase as any)
        .from('user_recovery_progress')
        .insert({
          user_id: user.id,
          program_id: programId,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return NextResponse.json(
            { error: 'You have already started this program' },
            { status: 400 }
          );
        }
        throw error;
      }

      return NextResponse.json({ progress: data });

    } else if (action === 'pause') {
      // Pause an active program
      const { data, error } = await (supabase as any)
        .from('user_recovery_progress')
        .update({ status: 'paused' })
        .eq('user_id', user.id)
        .eq('program_id', programId)
        .eq('status', 'active')
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ progress: data });

    } else if (action === 'resume') {
      // Resume a paused program
      const { data, error } = await (supabase as any)
        .from('user_recovery_progress')
        .update({ status: 'active' })
        .eq('user_id', user.id)
        .eq('program_id', programId)
        .eq('status', 'paused')
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ progress: data });

    } else if (action === 'complete_module') {
      // Mark a module as complete and update progress
      const { moduleNumber } = await request.json();

      // Get current progress
      const { data: currentProgress } = await (supabase as any)
        .from('user_recovery_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('program_id', programId)
        .single();

      if (!currentProgress) {
        return NextResponse.json(
          { error: 'Program not started' },
          { status: 400 }
        );
      }

      // Get program details to calculate progress
      const { data: program } = await (supabase as any)
        .from('recovery_programs')
        .select('modules')
        .eq('id', programId)
        .single();

      const totalModules = program?.modules?.length || 0;
      const newModule = Math.min(moduleNumber + 1, totalModules);
      const progressPercentage = Math.round((moduleNumber / totalModules) * 100);

      // Update progress
      const { data, error } = await (supabase as any)
        .from('user_recovery_progress')
        .update({
          current_module: newModule,
          progress_percentage: progressPercentage,
          status: progressPercentage === 100 ? 'completed' : 'active',
          completed_at: progressPercentage === 100 ? new Date().toISOString() : null,
        })
        .eq('user_id', user.id)
        .eq('program_id', programId)
        .select()
        .single();

      if (error) throw error;

      // Check for achievement if completed
      if (progressPercentage === 100) {
        await (supabase as any).rpc('award_achievement', {
          p_user_id: user.id,
          p_achievement_key: 'programs_completed',
        });
      }

      return NextResponse.json({ progress: data });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error managing recovery program:', error);
    return NextResponse.json(
      { error: 'Failed to manage recovery program' },
      { status: 500 }
    );
  }
}