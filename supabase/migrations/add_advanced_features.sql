-- Pattern Analysis Tables
CREATE TABLE IF NOT EXISTS pattern_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_name TEXT NOT NULL,
  pattern_type TEXT,
  severity INTEGER CHECK (severity >= 1 AND severity <= 10),
  frequency INTEGER, -- times per week
  first_identified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_occurred TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active', -- active, improving, resolved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pattern Triggers
CREATE TABLE IF NOT EXISTS pattern_triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_id UUID REFERENCES pattern_analysis(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  trigger_description TEXT,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  occurrence_count INTEGER DEFAULT 1,
  last_triggered TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pattern Timeline Events
CREATE TABLE IF NOT EXISTS pattern_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_id UUID REFERENCES pattern_analysis(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_description TEXT,
  emotional_state TEXT,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  triggers TEXT[],
  coping_used TEXT[],
  outcome TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pattern Connections (how patterns relate to each other)
CREATE TABLE IF NOT EXISTS pattern_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_from UUID REFERENCES pattern_analysis(id) ON DELETE CASCADE,
  pattern_to UUID REFERENCES pattern_analysis(id) ON DELETE CASCADE,
  connection_type TEXT, -- triggers, reinforces, masks, etc.
  strength INTEGER CHECK (strength >= 1 AND strength <= 10),
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice Sessions
CREATE TABLE IF NOT EXISTS voice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  audio_url TEXT,
  transcription TEXT,
  duration_seconds INTEGER,
  emotional_tone JSONB,
  key_insights TEXT[],
  detected_patterns TEXT[],
  crisis_indicators BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Check-ins
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  anxiety_level INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
  triggers_today TEXT[],
  patterns_noticed TEXT[],
  coping_strategies_used TEXT[],
  quick_note TEXT,
  check_in_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crisis Detection & Safety Plans
CREATE TABLE IF NOT EXISTS crisis_safety_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  warning_signs TEXT[],
  coping_strategies TEXT[],
  support_contacts JSONB, -- {name, phone, relationship}
  safe_environments TEXT[],
  professional_contacts JSONB,
  emergency_services JSONB,
  personal_strengths TEXT[],
  reasons_for_living TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buddy System / Accountability Partners
CREATE TABLE IF NOT EXISTS buddy_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_type TEXT DEFAULT 'buddy', -- buddy, mentor, mentee
  shared_patterns TEXT[],
  connection_status TEXT DEFAULT 'pending', -- pending, active, paused, ended
  messages_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Therapeutic Tools Usage
CREATE TABLE IF NOT EXISTS therapeutic_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL, -- cbt_worksheet, emdr, breathwork, meditation, journaling
  tool_name TEXT NOT NULL,
  duration_minutes INTEGER,
  completion_percentage INTEGER,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 10),
  notes TEXT,
  insights_gained TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Groups
CREATE TABLE IF NOT EXISTS community_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_name TEXT NOT NULL,
  description TEXT,
  pattern_focus TEXT[],
  group_type TEXT DEFAULT 'support', -- support, therapy, educational
  is_private BOOLEAN DEFAULT TRUE,
  max_members INTEGER DEFAULT 20,
  moderator_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Members
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- member, moderator, facilitator
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Success Stories
CREATE TABLE IF NOT EXISTS success_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  patterns_overcome TEXT[],
  key_strategies TEXT[],
  time_to_success TEXT,
  is_anonymous BOOLEAN DEFAULT TRUE,
  is_published BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones & Achievements
CREATE TABLE IF NOT EXISTS user_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  milestone_name TEXT NOT NULL,
  description TEXT,
  points_earned INTEGER DEFAULT 0,
  badge_earned TEXT,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outcome Tracking
CREATE TABLE IF NOT EXISTS outcome_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  area_of_life TEXT NOT NULL, -- relationships, work, health, personal_growth
  baseline_score INTEGER CHECK (baseline_score >= 1 AND baseline_score <= 10),
  current_score INTEGER CHECK (current_score >= 1 AND current_score <= 10),
  improvement_percentage DECIMAL(5, 2),
  specific_improvements TEXT[],
  challenges_remaining TEXT[],
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personalized Insights
CREATE TABLE IF NOT EXISTS weekly_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE,
  week_end DATE,
  patterns_identified TEXT[],
  progress_summary TEXT,
  key_achievements TEXT[],
  areas_for_focus TEXT[],
  recommended_actions TEXT[],
  emotional_trend TEXT,
  ai_observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_pattern_analysis_user_id ON pattern_analysis(user_id);
CREATE INDEX idx_pattern_timeline_user_id ON pattern_timeline(user_id);
CREATE INDEX idx_daily_checkins_user_date ON daily_checkins(user_id, created_at);
CREATE INDEX idx_voice_sessions_user_id ON voice_sessions(user_id);
CREATE INDEX idx_buddy_connections_users ON buddy_connections(user_1_id, user_2_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_therapeutic_tools_user ON therapeutic_tools(user_id);

-- Enable Row Level Security
ALTER TABLE pattern_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_safety_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapeutic_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user data access
CREATE POLICY "Users can view own pattern analysis" ON pattern_analysis FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own triggers" ON pattern_triggers FOR ALL USING (
  pattern_id IN (SELECT id FROM pattern_analysis WHERE user_id = auth.uid())
);
CREATE POLICY "Users can view own timeline" ON pattern_timeline FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own voice sessions" ON voice_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own checkins" ON daily_checkins FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own safety plan" ON crisis_safety_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their buddy connections" ON buddy_connections FOR SELECT USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);
CREATE POLICY "Users can view own therapeutic tools" ON therapeutic_tools FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public groups" ON community_groups FOR SELECT USING (true);
CREATE POLICY "Users can view group memberships" ON group_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view published stories" ON success_stories FOR SELECT USING (is_published = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage own milestones" ON user_milestones FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own outcomes" ON outcome_tracking FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own insights" ON weekly_insights FOR ALL USING (auth.uid() = user_id);