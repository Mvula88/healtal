-- Update pricing tiers with new 4-tier structure including Lite tier

-- Add Lite tier to subscription_tier enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'lite' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_tier')
  ) THEN
    ALTER TYPE subscription_tier ADD VALUE 'lite' BEFORE 'starter';
  END IF;
END $$;

-- Create usage_tracking table for tier limits
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  ai_messages_used INTEGER DEFAULT 0,
  voice_minutes_used NUMERIC(10,2) DEFAULT 0,
  buddy_matches_used INTEGER DEFAULT 0,
  group_sessions_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- Create tier_limits table for reference
CREATE TABLE IF NOT EXISTS tier_limits (
  tier subscription_tier PRIMARY KEY,
  ai_messages INTEGER NOT NULL, -- -1 for unlimited
  voice_minutes INTEGER NOT NULL, -- -1 for unlimited
  buddy_matching INTEGER NOT NULL, -- -1 for unlimited
  group_sessions INTEGER NOT NULL, -- -1 for unlimited
  peer_messaging BOOLEAN DEFAULT false,
  pattern_insights VARCHAR(50) DEFAULT 'weekly',
  community_access VARCHAR(50) DEFAULT 'read',
  therapist_matching BOOLEAN DEFAULT false,
  export_data BOOLEAN DEFAULT false,
  custom_ai_personality BOOLEAN DEFAULT false,
  api_access BOOLEAN DEFAULT false,
  family_accounts INTEGER DEFAULT 0,
  priority_support BOOLEAN DEFAULT false,
  monthly_price NUMERIC(10,2) NOT NULL,
  stripe_price_id VARCHAR(255)
);

-- Insert tier limits
INSERT INTO tier_limits (
  tier, ai_messages, voice_minutes, buddy_matching, group_sessions,
  peer_messaging, pattern_insights, community_access, therapist_matching,
  export_data, custom_ai_personality, api_access, family_accounts,
  priority_support, monthly_price, stripe_price_id
) VALUES
  ('lite', 30, 0, 0, 0, false, 'weekly', 'read_post', false, false, false, false, 0, false, 9.00, NULL),
  ('starter', 200, 60, 1, 0, true, 'daily', 'full', false, true, false, false, 0, false, 19.00, NULL),
  ('growth', -1, 300, 3, 4, true, 'real-time', 'full', true, true, true, false, 0, true, 39.00, NULL),
  ('premium', -1, -1, -1, -1, true, 'real-time', 'full', true, true, true, true, 2, true, 79.00, NULL)
ON CONFLICT (tier) DO UPDATE SET
  ai_messages = EXCLUDED.ai_messages,
  voice_minutes = EXCLUDED.voice_minutes,
  buddy_matching = EXCLUDED.buddy_matching,
  group_sessions = EXCLUDED.group_sessions,
  peer_messaging = EXCLUDED.peer_messaging,
  pattern_insights = EXCLUDED.pattern_insights,
  community_access = EXCLUDED.community_access,
  therapist_matching = EXCLUDED.therapist_matching,
  export_data = EXCLUDED.export_data,
  custom_ai_personality = EXCLUDED.custom_ai_personality,
  api_access = EXCLUDED.api_access,
  family_accounts = EXCLUDED.family_accounts,
  priority_support = EXCLUDED.priority_support,
  monthly_price = EXCLUDED.monthly_price;

-- Function to check feature access
CREATE OR REPLACE FUNCTION check_feature_access(
  p_user_id UUID,
  p_feature TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_tier subscription_tier;
  v_limits RECORD;
BEGIN
  -- Get user's tier
  SELECT subscription_tier INTO v_tier
  FROM users
  WHERE id = p_user_id;
  
  -- Default to lite if no tier
  v_tier := COALESCE(v_tier, 'lite');
  
  -- Get tier limits
  SELECT * INTO v_limits
  FROM tier_limits
  WHERE tier = v_tier;
  
  -- Check specific features
  CASE p_feature
    WHEN 'voice' THEN
      RETURN v_limits.voice_minutes != 0;
    WHEN 'peer_messaging' THEN
      RETURN v_limits.peer_messaging;
    WHEN 'buddy_matching' THEN
      RETURN v_limits.buddy_matching != 0;
    WHEN 'group_sessions' THEN
      RETURN v_limits.group_sessions != 0;
    WHEN 'therapist_matching' THEN
      RETURN v_limits.therapist_matching;
    WHEN 'export_data' THEN
      RETURN v_limits.export_data;
    WHEN 'custom_ai_personality' THEN
      RETURN v_limits.custom_ai_personality;
    WHEN 'api_access' THEN
      RETURN v_limits.api_access;
    WHEN 'priority_support' THEN
      RETURN v_limits.priority_support;
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_feature TEXT,
  p_amount INTEGER DEFAULT 1
) RETURNS JSON AS $$
DECLARE
  v_tier subscription_tier;
  v_limits RECORD;
  v_usage RECORD;
  v_period_start DATE;
  v_allowed BOOLEAN;
  v_limit INTEGER;
  v_used NUMERIC;
  v_remaining NUMERIC;
BEGIN
  -- Get current period start (first of month)
  v_period_start := date_trunc('month', CURRENT_DATE)::DATE;
  
  -- Get user's tier
  SELECT subscription_tier INTO v_tier
  FROM users
  WHERE id = p_user_id;
  
  v_tier := COALESCE(v_tier, 'lite');
  
  -- Get tier limits
  SELECT * INTO v_limits
  FROM tier_limits
  WHERE tier = v_tier;
  
  -- Get or create usage record
  INSERT INTO usage_tracking (
    user_id, period_start, period_end
  ) VALUES (
    p_user_id, v_period_start, v_period_start + INTERVAL '1 month'
  ) ON CONFLICT (user_id, period_start) DO NOTHING;
  
  SELECT * INTO v_usage
  FROM usage_tracking
  WHERE user_id = p_user_id
  AND period_start = v_period_start;
  
  -- Check specific feature limit
  CASE p_feature
    WHEN 'ai_messages' THEN
      v_limit := v_limits.ai_messages;
      v_used := v_usage.ai_messages_used;
    WHEN 'voice_minutes' THEN
      v_limit := v_limits.voice_minutes;
      v_used := v_usage.voice_minutes_used;
    WHEN 'buddy_matching' THEN
      v_limit := v_limits.buddy_matching;
      v_used := v_usage.buddy_matches_used;
    WHEN 'group_sessions' THEN
      v_limit := v_limits.group_sessions;
      v_used := v_usage.group_sessions_used;
    ELSE
      RETURN json_build_object(
        'allowed', false,
        'error', 'Unknown feature'
      );
  END CASE;
  
  -- Check if allowed
  IF v_limit = -1 THEN
    -- Unlimited
    v_allowed := true;
    v_remaining := -1;
  ELSIF v_limit = 0 THEN
    -- No access
    v_allowed := false;
    v_remaining := 0;
  ELSE
    -- Check against limit
    v_allowed := (v_used + p_amount) <= v_limit;
    v_remaining := GREATEST(0, v_limit - v_used);
  END IF;
  
  RETURN json_build_object(
    'allowed', v_allowed,
    'limit', v_limit,
    'used', v_used,
    'remaining', v_remaining,
    'tier', v_tier
  );
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_feature TEXT,
  p_amount NUMERIC DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  v_period_start DATE;
  v_check_result JSON;
BEGIN
  -- Check if allowed first
  v_check_result := check_usage_limit(p_user_id, p_feature, p_amount::INTEGER);
  
  IF NOT (v_check_result->>'allowed')::BOOLEAN THEN
    RETURN false;
  END IF;
  
  -- Get current period
  v_period_start := date_trunc('month', CURRENT_DATE)::DATE;
  
  -- Update usage
  CASE p_feature
    WHEN 'ai_messages' THEN
      UPDATE usage_tracking
      SET ai_messages_used = ai_messages_used + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id
      AND period_start = v_period_start;
    WHEN 'voice_minutes' THEN
      UPDATE usage_tracking
      SET voice_minutes_used = voice_minutes_used + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id
      AND period_start = v_period_start;
    WHEN 'buddy_matching' THEN
      UPDATE usage_tracking
      SET buddy_matches_used = buddy_matches_used + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id
      AND period_start = v_period_start;
    WHEN 'group_sessions' THEN
      UPDATE usage_tracking
      SET group_sessions_used = group_sessions_used + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id
      AND period_start = v_period_start;
  END CASE;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_period 
ON usage_tracking(user_id, period_start);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_period 
ON usage_tracking(period_start);

-- Grant appropriate permissions
GRANT SELECT ON tier_limits TO authenticated;
GRANT ALL ON usage_tracking TO authenticated;

-- RLS policies for usage_tracking
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can update usage" ON usage_tracking
  FOR ALL USING (true);