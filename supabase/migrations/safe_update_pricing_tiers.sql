-- Safe migration to update pricing tiers with new 4-tier structure including Lite tier
-- This handles conflicts and existing data properly

-- Step 1: Add Lite tier to subscription_tier enum if not exists
DO $$ 
BEGIN
  -- Check if 'lite' value exists in the enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'lite' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_tier')
  ) THEN
    -- Add 'lite' value to the enum
    ALTER TYPE subscription_tier ADD VALUE 'lite' BEFORE 'starter';
  END IF;
END $$;

-- Step 2: Create usage_tracking table if not exists
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

-- Step 3: Create tier_limits table if not exists
CREATE TABLE IF NOT EXISTS tier_limits (
  tier subscription_tier PRIMARY KEY,
  ai_messages INTEGER NOT NULL,
  voice_minutes INTEGER NOT NULL,
  buddy_matching INTEGER NOT NULL,
  group_sessions INTEGER NOT NULL,
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

-- Step 4: Clear and insert fresh tier limits
TRUNCATE tier_limits;
INSERT INTO tier_limits (
  tier, ai_messages, voice_minutes, buddy_matching, group_sessions,
  peer_messaging, pattern_insights, community_access, therapist_matching,
  export_data, custom_ai_personality, api_access, family_accounts,
  priority_support, monthly_price, stripe_price_id
) VALUES
  ('lite', 30, 0, 0, 0, false, 'weekly', 'read_post', false, false, false, false, 0, false, 9.00, 'price_1S2pxcIVPWhx8miGx7cj9BTc'),
  ('starter', 200, 60, 1, 0, true, 'daily', 'full', false, true, false, false, 0, false, 19.00, NULL),
  ('growth', -1, 300, 3, 4, true, 'real-time', 'full', true, true, true, false, 0, true, 39.00, NULL),
  ('premium', -1, -1, -1, -1, true, 'real-time', 'full', true, true, true, true, 2, true, 79.00, NULL);

-- Step 5: Update subscription_plans table safely
-- First delete any duplicate entries
DELETE FROM subscription_plans 
WHERE tier IN ('lite', 'starter', 'growth', 'premium');

-- Then insert the new plans
INSERT INTO subscription_plans (tier, name, price_monthly, price_yearly, features, stripe_price_id_monthly, stripe_price_id_yearly)
VALUES 
  ('lite', 'Lite', 9, 90, ARRAY[
    '30 AI coach messages/month',
    'Unlimited mood tracking', 
    'Unlimited journal entries',
    'Weekly pattern insights',
    'Community access',
    'Crisis resources',
    'Mobile app access'
  ], 'price_1S2pxcIVPWhx8miGx7cj9BTc', NULL),
  
  ('starter', 'Starter', 19, 190, ARRAY[
    '200 AI coach messages/month',
    '60 voice minutes/month',
    'Daily pattern insights',
    'Peer messaging',
    '1 buddy match',
    'Progress analytics',
    'Custom exercises'
  ], NULL, NULL),
  
  ('growth', 'Growth', 39, 390, ARRAY[
    'Unlimited AI coach messages',
    '300 voice minutes/month',
    '3 buddy matches',
    '4 group sessions/month',
    'Therapist matching',
    'Custom AI personality',
    'Export health records'
  ], NULL, NULL),
  
  ('premium', 'Premium', 79, 790, ARRAY[
    'Everything unlimited',
    'Unlimited voice minutes',
    'Unlimited buddy matches',
    'Unlimited group sessions',
    'Monthly therapist consultation',
    '2 family accounts',
    'API access'
  ], NULL, NULL);

-- Step 6: Create helper functions
CREATE OR REPLACE FUNCTION check_feature_access(
  p_user_id UUID,
  p_feature TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_tier subscription_tier;
  v_limits RECORD;
BEGIN
  SELECT subscription_tier INTO v_tier
  FROM users
  WHERE id = p_user_id;
  
  v_tier := COALESCE(v_tier, 'lite');
  
  SELECT * INTO v_limits
  FROM tier_limits
  WHERE tier = v_tier;
  
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
  v_period_start := date_trunc('month', CURRENT_DATE)::DATE;
  
  SELECT subscription_tier INTO v_tier
  FROM users
  WHERE id = p_user_id;
  
  v_tier := COALESCE(v_tier, 'lite');
  
  SELECT * INTO v_limits
  FROM tier_limits
  WHERE tier = v_tier;
  
  INSERT INTO usage_tracking (
    user_id, period_start, period_end
  ) VALUES (
    p_user_id, v_period_start, v_period_start + INTERVAL '1 month'
  ) ON CONFLICT (user_id, period_start) DO NOTHING;
  
  SELECT * INTO v_usage
  FROM usage_tracking
  WHERE user_id = p_user_id
  AND period_start = v_period_start;
  
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
  
  IF v_limit = -1 THEN
    v_allowed := true;
    v_remaining := -1;
  ELSIF v_limit = 0 THEN
    v_allowed := false;
    v_remaining := 0;
  ELSE
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

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_period 
ON usage_tracking(user_id, period_start);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_period 
ON usage_tracking(period_start);

-- Step 8: Set up RLS
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage" ON usage_tracking;
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can update usage" ON usage_tracking;
CREATE POLICY "System can update usage" ON usage_tracking
  FOR ALL USING (true);

-- Step 9: Grant permissions
GRANT SELECT ON tier_limits TO authenticated;
GRANT ALL ON usage_tracking TO authenticated;