-- Database migrations for new engagement features

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  action_url TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  daily_checkin BOOLEAN DEFAULT TRUE,
  weekly_insights BOOLEAN DEFAULT TRUE,
  pattern_alerts BOOLEAN DEFAULT TRUE,
  community_updates BOOLEAN DEFAULT TRUE,
  buddy_messages BOOLEAN DEFAULT TRUE,
  achievement_milestones BOOLEAN DEFAULT TRUE,
  crisis_support BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled notifications
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  schedule_time TIME NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_sent TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pattern insights cache
CREATE TABLE IF NOT EXISTS pattern_insights_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  insights JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pattern knowledge base (community insights)
CREATE TABLE IF NOT EXISTS pattern_knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_type TEXT UNIQUE NOT NULL,
  prevalence DECIMAL,
  common_triggers TEXT[],
  effective_interventions TEXT[],
  average_resolution_time INTEGER,
  correlated_patterns JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community challenges
CREATE TABLE IF NOT EXISTS community_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('daily', 'weekly', 'monthly')),
  category TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  reward_points INTEGER DEFAULT 0,
  reward_badge TEXT,
  max_participants INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(challenge_id, user_id)
);

-- Success stories
CREATE TABLE IF NOT EXISTS success_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  patterns TEXT[],
  breakthrough_moment TEXT,
  time_to_success TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story reactions
CREATE TABLE IF NOT EXISTS story_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES success_stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_id, reaction_type)
);

-- Story comments
CREATE TABLE IF NOT EXISTS story_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES success_stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_supportive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User points and achievements
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  badges TEXT[],
  rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations for peer messaging
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user1_name TEXT,
  user2_name TEXT,
  is_buddy BOOLEAN DEFAULT FALSE,
  shared_patterns TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  type TEXT DEFAULT 'text',
  metadata JSONB,
  is_delivered BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Functions for pattern analysis

-- Get community pattern statistics
CREATE OR REPLACE FUNCTION get_community_pattern_stats(pattern_type_param TEXT)
RETURNS TABLE (
  pattern_type TEXT,
  avg_severity DECIMAL,
  resolution_rate DECIMAL,
  effective_strategies TEXT[],
  correlated_patterns TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.pattern_type,
    AVG(p.severity)::DECIMAL as avg_severity,
    (COUNT(CASE WHEN p.status = 'resolved' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL * 100) as resolution_rate,
    ARRAY_AGG(DISTINCT pt.trigger_type) FILTER (WHERE pt.trigger_type IS NOT NULL) as effective_strategies,
    ARRAY[]::TEXT[] as correlated_patterns
  FROM pattern_analysis p
  LEFT JOIN pattern_triggers pt ON p.id = pt.pattern_id
  WHERE p.pattern_type = pattern_type_param
  GROUP BY p.pattern_type;
END;
$$ LANGUAGE plpgsql;

-- Get aggregated pattern insights
CREATE OR REPLACE FUNCTION get_aggregated_pattern_insights()
RETURNS TABLE (
  pattern_type TEXT,
  user_count BIGINT,
  total_users BIGINT,
  common_triggers TEXT[],
  avg_resolution_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH total_users AS (
    SELECT COUNT(DISTINCT id) as total FROM auth.users
  ),
  pattern_stats AS (
    SELECT 
      p.pattern_type,
      COUNT(DISTINCT p.user_id) as user_count,
      ARRAY_AGG(DISTINCT pt.trigger_type) FILTER (WHERE pt.trigger_type IS NOT NULL) as common_triggers,
      AVG(EXTRACT(DAY FROM (p.updated_at - p.first_identified))) as avg_resolution_days
    FROM pattern_analysis p
    LEFT JOIN pattern_triggers pt ON p.id = pt.pattern_id
    GROUP BY p.pattern_type
  )
  SELECT 
    ps.pattern_type,
    ps.user_count,
    tu.total,
    ps.common_triggers,
    ps.avg_resolution_days::INTEGER
  FROM pattern_stats ps
  CROSS JOIN total_users tu;
END;
$$ LANGUAGE plpgsql;

-- Get pattern correlations
CREATE OR REPLACE FUNCTION get_pattern_correlations(pattern_type_param TEXT)
RETURNS TABLE (
  correlated_pattern TEXT,
  correlation_strength DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH user_patterns AS (
    SELECT 
      user_id,
      ARRAY_AGG(pattern_type) as patterns
    FROM pattern_analysis
    WHERE user_id IN (
      SELECT user_id 
      FROM pattern_analysis 
      WHERE pattern_type = pattern_type_param
    )
    GROUP BY user_id
  )
  SELECT 
    unnest(patterns) as correlated_pattern,
    COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM user_patterns)::DECIMAL as correlation_strength
  FROM user_patterns
  WHERE pattern_type_param = ANY(patterns)
  GROUP BY unnest(patterns)
  HAVING unnest(patterns) != pattern_type_param
  ORDER BY correlation_strength DESC;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_pattern_analysis_user_id ON pattern_analysis(user_id);
CREATE INDEX idx_pattern_analysis_type ON pattern_analysis(pattern_type);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX idx_success_stories_user ON success_stories(user_id);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_insights_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public challenges" ON community_challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can join challenges" ON challenge_participants
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public stories" ON success_stories
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their stories" ON success_stories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their conversations" ON conversations
  FOR ALL USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can view their messages" ON messages
  FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);