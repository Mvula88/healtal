-- Additional features: Habit Builder, Recovery Support, Gamification

-- Step 1: Create habits table for Habit Builder
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) CHECK (category IN ('health', 'mindfulness', 'productivity', 'relationships', 'recovery', 'custom')),
  frequency VARCHAR(50) CHECK (frequency IN ('daily', 'weekly', 'custom')),
  target_days INTEGER[], -- For weekly: [1,3,5] = Mon, Wed, Fri
  reminder_time TIME,
  is_active BOOLEAN DEFAULT true,
  color VARCHAR(7), -- Hex color for UI
  icon VARCHAR(50), -- Icon name for UI
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE
);

-- Step 2: Create habit_logs table for tracking
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5)
);

-- Create unique index for one completion per day
CREATE UNIQUE INDEX IF NOT EXISTS habit_logs_daily_unique 
ON public.habit_logs (habit_id, user_id, (completed_at::date));

-- Step 3: Create habit_streaks table
CREATE TABLE IF NOT EXISTS public.habit_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed DATE,
  streak_started DATE,
  total_completions INTEGER DEFAULT 0,
  UNIQUE(habit_id, user_id)
);

-- Step 4: Create recovery_programs table for Recovery Support
CREATE TABLE IF NOT EXISTS public.recovery_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) CHECK (category IN ('addiction', 'trauma', 'anxiety', 'depression', 'grief', 'relationships', 'custom')),
  duration_days INTEGER,
  modules JSONB, -- Array of module objects
  is_active BOOLEAN DEFAULT true,
  min_tier subscription_tier DEFAULT 'growth', -- Minimum tier required
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create user_recovery_progress table
CREATE TABLE IF NOT EXISTS public.user_recovery_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.recovery_programs(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  current_module INTEGER DEFAULT 1,
  progress_percentage INTEGER DEFAULT 0,
  journal_entries JSONB DEFAULT '[]'::jsonb,
  milestones_completed JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  UNIQUE(user_id, program_id)
);

-- Step 6: Create achievements table for gamification
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(100) CHECK (category IN ('milestones', 'streaks', 'breakthroughs', 'social', 'special')),
  points INTEGER DEFAULT 10,
  requirement_type VARCHAR(50), -- 'count', 'streak', 'special'
  requirement_value INTEGER, -- e.g., 7 for 7-day streak
  requirement_key VARCHAR(100), -- e.g., 'daily_checkins', 'ai_conversations'
  badge_color VARCHAR(7),
  rarity VARCHAR(20) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_secret BOOLEAN DEFAULT false
);

-- Step 7: Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0, -- For progressive achievements
  notified BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- Step 8: Create breakthroughs_tracking table (extends existing breakthroughs)
CREATE TABLE IF NOT EXISTS public.breakthrough_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  points INTEGER DEFAULT 50
);

-- Step 9: Update existing breakthroughs table to add gamification
ALTER TABLE public.breakthroughs 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.breakthrough_categories(id),
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS celebration_shown BOOLEAN DEFAULT false;

-- Step 10: Create user_stats table for tracking overall progress
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_breakthroughs INTEGER DEFAULT 0,
  total_ai_conversations INTEGER DEFAULT 0,
  total_journal_entries INTEGER DEFAULT 0,
  total_voice_minutes NUMERIC(10,2) DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_active DATE DEFAULT CURRENT_DATE,
  achievements_count INTEGER DEFAULT 0,
  rank VARCHAR(50) DEFAULT 'Beginner', -- Beginner, Explorer, Achiever, Master, Legend
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 11: Create vent_sessions table for Vent & Release mode
CREATE TABLE IF NOT EXISTS public.vent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type VARCHAR(50) DEFAULT 'vent' CHECK (session_type IN ('vent', 'listen', 'comfort')),
  content TEXT, -- Encrypted
  emotion_before VARCHAR(50),
  emotion_after VARCHAR(50),
  relief_level INTEGER CHECK (relief_level >= 1 AND relief_level <= 10),
  duration_seconds INTEGER,
  is_voice BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 12: Insert default achievements
INSERT INTO public.achievements (name, description, category, points, requirement_type, requirement_value, requirement_key, rarity) VALUES
  ('First Step', 'Complete your first daily check-in', 'milestones', 10, 'count', 1, 'daily_checkins', 'common'),
  ('Week Warrior', 'Complete 7 daily check-ins in a row', 'streaks', 50, 'streak', 7, 'daily_checkins', 'rare'),
  ('Month Master', '30-day check-in streak', 'streaks', 200, 'streak', 30, 'daily_checkins', 'epic'),
  ('Breakthrough Moment', 'Experience your first breakthrough', 'breakthroughs', 100, 'count', 1, 'breakthroughs', 'rare'),
  ('Pattern Hunter', 'Identify 5 patterns', 'milestones', 75, 'count', 5, 'patterns_identified', 'rare'),
  ('Voice Pioneer', 'Complete first voice session', 'milestones', 30, 'count', 1, 'voice_sessions', 'common'),
  ('Healing Helper', 'Join your first healing circle', 'social', 100, 'count', 1, 'circles_joined', 'rare'),
  ('Guide Star', 'Lead your first healing circle', 'social', 500, 'count', 1, 'circles_led', 'legendary'),
  ('Night Owl', 'Use late night talk 5 times', 'milestones', 40, 'count', 5, 'late_night_sessions', 'common'),
  ('Habit Hero', 'Maintain 3 habits for a week', 'streaks', 75, 'special', 3, 'habits_maintained', 'rare'),
  ('Recovery Warrior', 'Complete a recovery program', 'milestones', 300, 'count', 1, 'programs_completed', 'epic'),
  ('Transformation Legend', 'Reach 42 breakthroughs', 'breakthroughs', 1000, 'count', 42, 'breakthroughs', 'legendary');

-- Step 13: Insert default recovery programs
INSERT INTO public.recovery_programs (name, description, category, duration_days, min_tier, modules) VALUES
  ('Anxiety Relief Journey', 'Evidence-based program for managing anxiety', 'anxiety', 30, 'growth', 
   '[{"week": 1, "title": "Understanding Anxiety", "exercises": ["Anxiety mapping", "Trigger identification"]},
     {"week": 2, "title": "Calming Techniques", "exercises": ["Breathing exercises", "Grounding methods"]},
     {"week": 3, "title": "Thought Patterns", "exercises": ["CBT basics", "Thought challenging"]},
     {"week": 4, "title": "Building Resilience", "exercises": ["Exposure therapy", "Confidence building"]}]'::jsonb),
  
  ('Addiction Recovery Path', '12-step inspired digital recovery program', 'addiction', 90, 'growth',
   '[{"week": 1, "title": "Acknowledgment", "exercises": ["Acceptance exercises", "Support building"]},
     {"week": 2, "title": "Understanding Triggers", "exercises": ["Trigger mapping", "Craving management"]},
     {"week": 3, "title": "Building New Habits", "exercises": ["Replacement behaviors", "Routine building"]},
     {"week": 4, "title": "Healing Relationships", "exercises": ["Making amends", "Setting boundaries"]}]'::jsonb),
  
  ('Grief Processing Program', 'Gentle support through loss and grief', 'grief', 42, 'growth',
   '[{"week": 1, "title": "Acknowledging Loss", "exercises": ["Memory honoring", "Emotion validation"]},
     {"week": 2, "title": "Processing Pain", "exercises": ["Grief waves", "Expression exercises"]},
     {"week": 3, "title": "Finding Meaning", "exercises": ["Legacy work", "Gratitude practice"]},
     {"week": 4, "title": "Moving Forward", "exercises": ["Integration", "New normal planning"]}]'::jsonb);

-- Step 14: Create functions for gamification
CREATE OR REPLACE FUNCTION calculate_user_level(p_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: every 100 points = 1 level, with exponential growth
  RETURN FLOOR(SQRT(p_points / 50)) + 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_rank(p_level INTEGER)
RETURNS VARCHAR AS $$
BEGIN
  RETURN CASE
    WHEN p_level < 5 THEN 'Beginner'
    WHEN p_level < 10 THEN 'Explorer'
    WHEN p_level < 20 THEN 'Achiever'
    WHEN p_level < 50 THEN 'Master'
    ELSE 'Legend'
  END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION award_achievement(p_user_id UUID, p_achievement_key VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_achievement RECORD;
  v_already_earned BOOLEAN;
BEGIN
  -- Find the achievement
  SELECT * INTO v_achievement 
  FROM public.achievements 
  WHERE requirement_key = p_achievement_key;
  
  IF v_achievement IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if already earned
  SELECT EXISTS(
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = p_user_id 
    AND achievement_id = v_achievement.id
  ) INTO v_already_earned;
  
  IF v_already_earned THEN
    RETURN false;
  END IF;
  
  -- Award the achievement
  INSERT INTO public.user_achievements (user_id, achievement_id)
  VALUES (p_user_id, v_achievement.id);
  
  -- Update user stats
  UPDATE public.user_stats 
  SET 
    total_points = total_points + v_achievement.points,
    achievements_count = achievements_count + 1,
    level = calculate_user_level(total_points + v_achievement.points),
    rank = get_user_rank(calculate_user_level(total_points + v_achievement.points))
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Step 15: Create triggers for automatic achievement tracking
CREATE OR REPLACE FUNCTION check_achievements_on_action()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for first step achievement
  IF TG_TABLE_NAME = 'mood_entries' THEN
    PERFORM award_achievement(NEW.user_id, 'daily_checkins');
  END IF;
  
  -- Check for breakthrough achievement
  IF TG_TABLE_NAME = 'breakthroughs' THEN
    PERFORM award_achievement(NEW.user_id, 'breakthroughs');
    
    -- Check for 42 breakthroughs
    IF (SELECT COUNT(*) FROM public.breakthroughs WHERE user_id = NEW.user_id) >= 42 THEN
      PERFORM award_achievement(NEW.user_id, 'breakthroughs');
    END IF;
  END IF;
  
  -- Check for voice session achievement
  IF TG_TABLE_NAME = 'voice_sessions' THEN
    PERFORM award_achievement(NEW.user_id, 'voice_sessions');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER check_achievements_mood
  AFTER INSERT ON public.mood_entries
  FOR EACH ROW EXECUTE FUNCTION check_achievements_on_action();

CREATE TRIGGER check_achievements_breakthrough
  AFTER INSERT ON public.breakthroughs
  FOR EACH ROW EXECUTE FUNCTION check_achievements_on_action();

-- Step 16: Initialize user stats for existing users
INSERT INTO public.user_stats (user_id)
SELECT id FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- Step 17: Set up RLS policies
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recovery_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vent_sessions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own data
CREATE POLICY "Users manage own habits" ON public.habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own habit logs" ON public.habit_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own progress" ON public.user_recovery_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own stats" ON public.user_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own vent sessions" ON public.vent_sessions FOR ALL USING (auth.uid() = user_id);

-- Everyone can view recovery programs and achievements
CREATE POLICY "View recovery programs" ON public.recovery_programs FOR SELECT USING (true);
CREATE POLICY "View achievements" ON public.achievements FOR SELECT USING (true);

-- Done!
DO $$
BEGIN
  RAISE NOTICE '✅ Additional features implemented!';
  RAISE NOTICE '- Habit Builder with streaks';
  RAISE NOTICE '- Recovery Support programs';
  RAISE NOTICE '- Gamification with 12 achievements';
  RAISE NOTICE '- Vent & Release sessions';
  RAISE NOTICE '- User stats and leveling system';
END $$;