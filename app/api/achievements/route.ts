import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all achievements with user's progress
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select(`
        *,
        user_achievements!left(
          earned_at,
          progress,
          notified
        )
      `)
      .order('points', { ascending: false });

    if (achievementsError) throw achievementsError;

    // Get user stats
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (statsError && statsError.code !== 'PGRST116') { // Ignore "not found" error
      throw statsError;
    }

    // Initialize user stats if they don't exist
    if (!stats) {
      const { data: newStats } = await supabase
        .from('user_stats')
        .insert({
          user_id: user.id,
          total_points: 0,
          level: 1,
          rank: 'Beginner',
        })
        .select()
        .single();
    }

    // Process achievements to show earned status
    const processedAchievements = achievements?.map(achievement => ({
      ...achievement,
      earned: achievement.user_achievements?.length > 0,
      earned_at: achievement.user_achievements?.[0]?.earned_at,
      progress: achievement.user_achievements?.[0]?.progress || 0,
    }));

    // Calculate progress for unearned achievements
    for (const achievement of processedAchievements || []) {
      if (!achievement.earned && achievement.requirement_key) {
        let currentProgress = 0;
        
        switch (achievement.requirement_key) {
          case 'daily_checkins':
            const { data: checkins } = await supabase
              .from('mood_entries')
              .select('id')
              .eq('user_id', user.id)
              .limit(achievement.requirement_value);
            currentProgress = checkins?.length || 0;
            break;
            
          case 'breakthroughs':
            const { data: breakthroughs } = await supabase
              .from('breakthroughs')
              .select('id')
              .eq('user_id', user.id)
              .limit(achievement.requirement_value);
            currentProgress = breakthroughs?.length || 0;
            break;
            
          case 'voice_sessions':
            const { data: voiceSessions } = await supabase
              .from('voice_sessions')
              .select('id')
              .eq('user_id', user.id)
              .limit(achievement.requirement_value);
            currentProgress = voiceSessions?.length || 0;
            break;
        }
        
        achievement.progress = currentProgress;
        achievement.progress_percentage = Math.min(
          100,
          Math.round((currentProgress / achievement.requirement_value) * 100)
        );
      }
    }

    return NextResponse.json({
      achievements: processedAchievements,
      stats: stats || {
        total_points: 0,
        level: 1,
        rank: 'Beginner',
        total_breakthroughs: 0,
        achievements_count: 0,
      },
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, achievementId } = await request.json();

    if (action === 'claim') {
      // Mark achievement as notified
      const { error } = await supabase
        .from('user_achievements')
        .update({ notified: true })
        .eq('user_id', user.id)
        .eq('achievement_id', achievementId);

      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating achievement:', error);
    return NextResponse.json(
      { error: 'Failed to update achievement' },
      { status: 500 }
    );
  }
}