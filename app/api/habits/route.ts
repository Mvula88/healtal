import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase/server';
import { z } from 'zod';

const habitSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum(['health', 'mindfulness', 'productivity', 'relationships', 'recovery', 'custom']),
  frequency: z.enum(['daily', 'weekly', 'custom']),
  target_days: z.array(z.number()).optional(),
  reminder_time: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's active habits with streaks
    const { data: habits, error } = await supabase
      .from('habits')
      .select(`
        *,
        habit_streaks!left(
          current_streak,
          longest_streak,
          last_completed,
          total_completions
        ),
        habit_logs!left(
          completed_at
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .is('archived_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Process habits to include today's completion status
    const today = new Date().toISOString().split('T')[0];
    const processedHabits = habits?.map(habit => {
      const todayCompleted = habit.habit_logs?.some(
        (log: any) => log.completed_at?.startsWith(today)
      );
      
      return {
        ...habit,
        streak: habit.habit_streaks?.[0] || {
          current_streak: 0,
          longest_streak: 0,
          total_completions: 0,
        },
        completed_today: todayCompleted,
      };
    });

    return NextResponse.json({ habits: processedHabits });

  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
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

    const body = await request.json();
    const validatedData = habitSchema.parse(body);

    // Create the habit
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        ...validatedData,
      })
      .select()
      .single();

    if (habitError) throw habitError;

    // Initialize streak tracking
    const { error: streakError } = await supabase
      .from('habit_streaks')
      .insert({
        habit_id: habit.id,
        user_id: user.id,
        current_streak: 0,
        longest_streak: 0,
        total_completions: 0,
      });

    if (streakError) throw streakError;

    return NextResponse.json({ habit });

  } catch (error) {
    console.error('Error creating habit:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid habit data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { habitId, action, ...data } = await request.json();

    if (action === 'complete') {
      // Mark habit as completed for today
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already completed today
      const { data: existingLog } = await supabase
        .from('habit_logs')
        .select('id')
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .gte('completed_at', `${today}T00:00:00`)
        .lte('completed_at', `${today}T23:59:59`)
        .single();

      if (existingLog) {
        return NextResponse.json(
          { error: 'Habit already completed today' },
          { status: 400 }
        );
      }

      // Create completion log
      const { data: log, error: logError } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          mood_before: data.moodBefore,
          mood_after: data.moodAfter,
          difficulty: data.difficulty,
          notes: data.notes,
        })
        .select()
        .single();

      if (logError) throw logError;

      // Update streak
      const { data: streak } = await supabase
        .from('habit_streaks')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .single();

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newCurrentStreak = 1;
      if (streak?.last_completed === yesterdayStr) {
        newCurrentStreak = (streak.current_streak || 0) + 1;
      }

      const newLongestStreak = Math.max(
        newCurrentStreak,
        streak?.longest_streak || 0
      );

      const { error: streakError } = await supabase
        .from('habit_streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_completed: today,
          total_completions: (streak?.total_completions || 0) + 1,
        })
        .eq('habit_id', habitId)
        .eq('user_id', user.id);

      if (streakError) throw streakError;

      // Check for streak achievements
      if (newCurrentStreak === 7) {
        await supabase.rpc('award_achievement', {
          p_user_id: user.id,
          p_achievement_key: 'daily_checkins',
        });
      }
      if (newCurrentStreak === 30) {
        await supabase.rpc('award_achievement', {
          p_user_id: user.id,
          p_achievement_key: 'daily_checkins',
        });
      }

      return NextResponse.json({ log, streak: newCurrentStreak });

    } else if (action === 'archive') {
      // Archive a habit
      const { error } = await supabase
        .from('habits')
        .update({ 
          is_active: false,
          archived_at: new Date().toISOString(),
        })
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({ success: true });

    } else if (action === 'update') {
      // Update habit details
      const { error } = await supabase
        .from('habits')
        .update(data)
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json(
      { error: 'Failed to update habit' },
      { status: 500 }
    );
  }
}