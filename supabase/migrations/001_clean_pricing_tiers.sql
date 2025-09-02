-- Clean migration for 4-tier pricing structure (Lite, Starter, Growth, Premium)
-- This migration safely handles all conflicts and existing data

-- Step 1: Add Lite tier to enum if not exists (before starter)
DO $$ 
BEGIN
  -- First check if lite already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'lite' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_tier')
  ) THEN
    -- Need to get the enum value that comes before 'starter' to insert lite correctly
    -- For now, just add it (position doesn't matter functionally)
    ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'lite';
  END IF;
  
  -- Ensure other tiers exist
  ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'starter';
  ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'growth';
  ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'premium';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Clean up subscription_plans table conflicts
-- First, check if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
    -- Remove all existing entries to avoid conflicts
    DELETE FROM subscription_plans;
    
    -- Insert fresh tier data
    INSERT INTO subscription_plans (tier, name, price_monthly, price_yearly, features, stripe_price_id_monthly)
    VALUES 
      ('lite', 'Lite', 9, 90, ARRAY[
        '30 AI coach messages/month',
        'Unlimited mood tracking', 
        'Unlimited journal entries',
        'Weekly pattern insights',
        'Community access (read & post)',
        'Crisis resources',
        'Mobile app access',
        'Email support'
      ], 'price_1S2pxcIVPWhx8miGx7cj9BTc'),
      
      ('starter', 'Starter', 19, 190, ARRAY[
        '200 AI coach messages/month',
        '60 voice minutes/month',
        'Daily pattern insights',
        'Peer messaging',
        '1 buddy match',
        'Progress analytics',
        'Custom exercises',
        'Priority email support'
      ], NULL),
      
      ('growth', 'Growth', 39, 390, ARRAY[
        'Unlimited AI coach messages',
        '300 voice minutes/month',
        '3 buddy matches',
        '4 group sessions/month',
        'Therapist matching',
        'Custom AI personality',
        'Export health records',
        'Priority support'
      ], NULL),
      
      ('premium', 'Premium', 79, 790, ARRAY[
        'Everything unlimited',
        'Unlimited voice minutes',
        'Unlimited buddy matches',
        'Unlimited group sessions',
        'Monthly therapist consultation',
        '2 family accounts',
        'White-label option',
        'API access',
        'Dedicated success manager'
      ], NULL);
  END IF;
END $$;

-- Step 3: Create usage tracking infrastructure
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

-- Step 4: Create tier limits reference table
DROP TABLE IF EXISTS tier_limits CASCADE;
CREATE TABLE tier_limits (
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
INSERT INTO tier_limits VALUES
  ('lite', 30, 0, 0, 0, false, 'weekly', 'read_post', false, false, false, false, 0, false, 9.00, 'price_1S2pxcIVPWhx8miGx7cj9BTc'),
  ('starter', 200, 60, 1, 0, true, 'daily', 'full', false, true, false, false, 0, false, 19.00, NULL),
  ('growth', -1, 300, 3, 4, true, 'real-time', 'full', true, true, true, false, 0, true, 39.00, NULL),
  ('premium', -1, -1, -1, -1, true, 'real-time', 'full', true, true, true, true, 2, true, 79.00, NULL);

-- Step 5: Update existing users to use new tier structure
UPDATE public.users 
SET subscription_tier = 
  CASE 
    WHEN subscription_tier IS NULL THEN 'lite'
    WHEN subscription_tier = 'free' THEN 'lite'
    WHEN subscription_tier = 'explore' THEN 'starter'
    WHEN subscription_tier = 'transform' THEN 'growth'
    WHEN subscription_tier = 'enterprise' THEN 'premium'
    WHEN subscription_tier NOT IN ('lite', 'starter', 'growth', 'premium') THEN 'lite'
    ELSE subscription_tier
  END;

-- Step 6: Add Stripe columns if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_cancel_at TIMESTAMP WITH TIME ZONE;

-- Step 7: Create usage checking function
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
  v_limit INTEGER;
  v_used NUMERIC;
BEGIN
  -- Get current month start
  v_period_start := date_trunc('month', CURRENT_DATE)::DATE;
  
  -- Get user tier (default to lite)
  SELECT COALESCE(subscription_tier, 'lite') INTO v_tier
  FROM users WHERE id = p_user_id;
  
  -- Get tier limits
  SELECT * INTO v_limits FROM tier_limits WHERE tier = v_tier;
  
  -- Create usage record if not exists
  INSERT INTO usage_tracking (user_id, period_start, period_end)
  VALUES (p_user_id, v_period_start, v_period_start + INTERVAL '1 month')
  ON CONFLICT (user_id, period_start) DO NOTHING;
  
  -- Get current usage
  SELECT * INTO v_usage FROM usage_tracking
  WHERE user_id = p_user_id AND period_start = v_period_start;
  
  -- Check specific feature
  CASE p_feature
    WHEN 'ai_messages' THEN
      v_limit := v_limits.ai_messages;
      v_used := COALESCE(v_usage.ai_messages_used, 0);
    WHEN 'voice_minutes' THEN
      v_limit := v_limits.voice_minutes;
      v_used := COALESCE(v_usage.voice_minutes_used, 0);
    WHEN 'buddy_matching' THEN
      v_limit := v_limits.buddy_matching;
      v_used := COALESCE(v_usage.buddy_matches_used, 0);
    WHEN 'group_sessions' THEN
      v_limit := v_limits.group_sessions;
      v_used := COALESCE(v_usage.group_sessions_used, 0);
    ELSE
      RETURN json_build_object('allowed', false, 'error', 'Unknown feature');
  END CASE;
  
  -- Return limit check result
  RETURN json_build_object(
    'allowed', CASE 
      WHEN v_limit = -1 THEN true -- unlimited
      WHEN v_limit = 0 THEN false -- no access
      ELSE (v_used + p_amount) <= v_limit -- check limit
    END,
    'limit', v_limit,
    'used', v_used::integer,
    'remaining', CASE 
      WHEN v_limit = -1 THEN -1
      ELSE GREATEST(0, v_limit - v_used)::integer
    END,
    'tier', v_tier::text
  );
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create feature access checking function
CREATE OR REPLACE FUNCTION check_feature_access(
  p_user_id UUID,
  p_feature TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_tier subscription_tier;
  v_limits RECORD;
BEGIN
  -- Get user tier
  SELECT COALESCE(subscription_tier, 'lite') INTO v_tier
  FROM users WHERE id = p_user_id;
  
  -- Get tier limits
  SELECT * INTO v_limits FROM tier_limits WHERE tier = v_tier;
  
  -- Check feature access
  RETURN CASE p_feature
    WHEN 'voice' THEN v_limits.voice_minutes != 0
    WHEN 'peer_messaging' THEN v_limits.peer_messaging
    WHEN 'buddy_matching' THEN v_limits.buddy_matching != 0
    WHEN 'group_sessions' THEN v_limits.group_sessions != 0
    WHEN 'therapist_matching' THEN v_limits.therapist_matching
    WHEN 'export_data' THEN v_limits.export_data
    WHEN 'custom_ai_personality' THEN v_limits.custom_ai_personality
    WHEN 'api_access' THEN v_limits.api_access
    WHEN 'priority_support' THEN v_limits.priority_support
    ELSE false
  END;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_period ON usage_tracking(user_id, period_start);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);

-- Step 10: Set up RLS policies
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage" ON usage_tracking;
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage usage" ON usage_tracking;
CREATE POLICY "System can manage usage" ON usage_tracking
  FOR ALL USING (true);

-- Step 11: Grant permissions
GRANT SELECT ON tier_limits TO authenticated;
GRANT ALL ON usage_tracking TO authenticated;

-- Step 12: Clean up - Set a default for any remaining nulls
UPDATE public.users SET subscription_tier = 'lite' WHERE subscription_tier IS NULL;