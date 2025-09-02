-- Fixed migration with proper JSONB casting for features column

-- Step 1: Update subscription_plans table with proper JSONB casting
DO $$
DECLARE
  has_yearly_column BOOLEAN := false;
  has_stripe_column BOOLEAN := false;
  has_stripe_monthly_column BOOLEAN := false;
BEGIN
  -- Check if subscription_plans table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
    
    -- Check which columns exist
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'subscription_plans' AND column_name = 'price_yearly'
    ) INTO has_yearly_column;
    
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'subscription_plans' AND column_name = 'stripe_price_id'
    ) INTO has_stripe_column;
    
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'subscription_plans' AND column_name = 'stripe_price_id_monthly'
    ) INTO has_stripe_monthly_column;
    
    -- Remove old entries
    DELETE FROM subscription_plans 
    WHERE tier::text IN ('lite', 'starter', 'growth', 'premium', 'free', 'explore', 'transform', 'enterprise');
    
    -- Build dynamic INSERT based on actual columns
    IF has_yearly_column AND has_stripe_monthly_column THEN
      -- Has both yearly and stripe_monthly columns
      INSERT INTO subscription_plans (tier, name, price_monthly, price_yearly, features, stripe_price_id_monthly)
      VALUES 
        ('lite'::subscription_tier, 'Lite', 9, 90, 
          '["30 AI coach messages/month", "Unlimited mood tracking", "Unlimited journal entries", "Weekly pattern insights", "Community access (read & post)", "Crisis resources", "Mobile app access", "Email support"]'::jsonb,
          'price_1S2pxcIVPWhx8miGx7cj9BTc'),
        ('starter'::subscription_tier, 'Starter', 19, 190,
          '["200 AI coach messages/month", "60 voice minutes/month", "Daily pattern insights", "Peer messaging", "1 buddy match", "Progress analytics", "Custom exercises", "Priority email support"]'::jsonb,
          NULL),
        ('growth'::subscription_tier, 'Growth', 39, 390,
          '["Unlimited AI coach messages", "300 voice minutes/month", "3 buddy matches", "4 group sessions/month", "Therapist matching", "Custom AI personality", "Export health records", "Priority support"]'::jsonb,
          NULL),
        ('premium'::subscription_tier, 'Premium', 79, 790,
          '["Everything unlimited", "Unlimited voice minutes", "Unlimited buddy matches", "Unlimited group sessions", "Monthly therapist consultation", "2 family accounts", "White-label option", "API access", "Dedicated success manager"]'::jsonb,
          NULL);
          
    ELSIF has_yearly_column AND has_stripe_column THEN
      -- Has yearly and stripe_price_id columns
      INSERT INTO subscription_plans (tier, name, price_monthly, price_yearly, features, stripe_price_id)
      VALUES 
        ('lite'::subscription_tier, 'Lite', 9, 90,
          '["30 AI coach messages/month", "Unlimited mood tracking", "Unlimited journal entries", "Weekly pattern insights", "Community access (read & post)", "Crisis resources", "Mobile app access", "Email support"]'::jsonb,
          'price_1S2pxcIVPWhx8miGx7cj9BTc'),
        ('starter'::subscription_tier, 'Starter', 19, 190,
          '["200 AI coach messages/month", "60 voice minutes/month", "Daily pattern insights", "Peer messaging", "1 buddy match", "Progress analytics", "Custom exercises", "Priority email support"]'::jsonb,
          NULL),
        ('growth'::subscription_tier, 'Growth', 39, 390,
          '["Unlimited AI coach messages", "300 voice minutes/month", "3 buddy matches", "4 group sessions/month", "Therapist matching", "Custom AI personality", "Export health records", "Priority support"]'::jsonb,
          NULL),
        ('premium'::subscription_tier, 'Premium', 79, 790,
          '["Everything unlimited", "Unlimited voice minutes", "Unlimited buddy matches", "Unlimited group sessions", "Monthly therapist consultation", "2 family accounts", "White-label option", "API access", "Dedicated success manager"]'::jsonb,
          NULL);
          
    ELSIF has_yearly_column THEN
      -- Has only yearly, no stripe columns
      INSERT INTO subscription_plans (tier, name, price_monthly, price_yearly, features)
      VALUES 
        ('lite'::subscription_tier, 'Lite', 9, 90,
          '["30 AI coach messages/month", "Unlimited mood tracking", "Unlimited journal entries", "Weekly pattern insights", "Community access (read & post)", "Crisis resources", "Mobile app access", "Email support"]'::jsonb),
        ('starter'::subscription_tier, 'Starter', 19, 190,
          '["200 AI coach messages/month", "60 voice minutes/month", "Daily pattern insights", "Peer messaging", "1 buddy match", "Progress analytics", "Custom exercises", "Priority email support"]'::jsonb),
        ('growth'::subscription_tier, 'Growth', 39, 390,
          '["Unlimited AI coach messages", "300 voice minutes/month", "3 buddy matches", "4 group sessions/month", "Therapist matching", "Custom AI personality", "Export health records", "Priority support"]'::jsonb),
        ('premium'::subscription_tier, 'Premium', 79, 790,
          '["Everything unlimited", "Unlimited voice minutes", "Unlimited buddy matches", "Unlimited group sessions", "Monthly therapist consultation", "2 family accounts", "White-label option", "API access", "Dedicated success manager"]'::jsonb);
          
    ELSIF has_stripe_column THEN
      -- Has stripe but no yearly
      INSERT INTO subscription_plans (tier, name, price_monthly, features, stripe_price_id)
      VALUES 
        ('lite'::subscription_tier, 'Lite', 9,
          '["30 AI coach messages/month", "Unlimited mood tracking", "Unlimited journal entries", "Weekly pattern insights", "Community access (read & post)", "Crisis resources", "Mobile app access", "Email support"]'::jsonb,
          'price_1S2pxcIVPWhx8miGx7cj9BTc'),
        ('starter'::subscription_tier, 'Starter', 19,
          '["200 AI coach messages/month", "60 voice minutes/month", "Daily pattern insights", "Peer messaging", "1 buddy match", "Progress analytics", "Custom exercises", "Priority email support"]'::jsonb,
          NULL),
        ('growth'::subscription_tier, 'Growth', 39,
          '["Unlimited AI coach messages", "300 voice minutes/month", "3 buddy matches", "4 group sessions/month", "Therapist matching", "Custom AI personality", "Export health records", "Priority support"]'::jsonb,
          NULL),
        ('premium'::subscription_tier, 'Premium', 79,
          '["Everything unlimited", "Unlimited voice minutes", "Unlimited buddy matches", "Unlimited group sessions", "Monthly therapist consultation", "2 family accounts", "White-label option", "API access", "Dedicated success manager"]'::jsonb,
          NULL);
          
    ELSE
      -- Minimal columns (tier, name, price_monthly, features)
      INSERT INTO subscription_plans (tier, name, price_monthly, features)
      VALUES 
        ('lite'::subscription_tier, 'Lite', 9,
          '["30 AI coach messages/month", "Unlimited mood tracking", "Unlimited journal entries", "Weekly pattern insights", "Community access (read & post)", "Crisis resources", "Mobile app access", "Email support"]'::jsonb),
        ('starter'::subscription_tier, 'Starter', 19,
          '["200 AI coach messages/month", "60 voice minutes/month", "Daily pattern insights", "Peer messaging", "1 buddy match", "Progress analytics", "Custom exercises", "Priority email support"]'::jsonb),
        ('growth'::subscription_tier, 'Growth', 39,
          '["Unlimited AI coach messages", "300 voice minutes/month", "3 buddy matches", "4 group sessions/month", "Therapist matching", "Custom AI personality", "Export health records", "Priority support"]'::jsonb),
        ('premium'::subscription_tier, 'Premium', 79,
          '["Everything unlimited", "Unlimited voice minutes", "Unlimited buddy matches", "Unlimited group sessions", "Monthly therapist consultation", "2 family accounts", "White-label option", "API access", "Dedicated success manager"]'::jsonb);
    END IF;
    
    -- Add stripe column if it doesn't exist
    IF NOT has_stripe_column AND NOT has_stripe_monthly_column THEN
      ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);
      UPDATE subscription_plans SET stripe_price_id = 'price_1S2pxcIVPWhx8miGx7cj9BTc' WHERE tier = 'lite'::subscription_tier;
    END IF;
  END IF;
END $$;

-- Step 2: Create usage tracking table (check if exists first)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usage_tracking') THEN
    CREATE TABLE usage_tracking (
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
  END IF;
END $$;

-- Step 3: Create tier limits table
DROP TABLE IF EXISTS tier_limits CASCADE;
CREATE TABLE tier_limits (
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

-- Insert tier limits
INSERT INTO tier_limits VALUES
  ('lite'::subscription_tier, 30, 0, 0, 0, false, 'weekly', 'read_post', false, false, false, false, 0, false, 9.00, 'price_1S2pxcIVPWhx8miGx7cj9BTc'),
  ('starter'::subscription_tier, 200, 60, 1, 0, true, 'daily', 'full', false, true, false, false, 0, false, 19.00, NULL),
  ('growth'::subscription_tier, -1, 300, 3, 4, true, 'real-time', 'full', true, true, true, false, 0, true, 39.00, NULL),
  ('premium'::subscription_tier, -1, -1, -1, -1, true, 'real-time', 'full', true, true, true, true, 2, true, 79.00, NULL);

-- Step 4: Update existing users
UPDATE public.users 
SET subscription_tier = 
  CASE 
    WHEN subscription_tier IS NULL THEN 'lite'::subscription_tier
    WHEN subscription_tier::text = 'free' THEN 'lite'::subscription_tier
    WHEN subscription_tier::text = 'explore' THEN 'starter'::subscription_tier
    WHEN subscription_tier::text = 'transform' THEN 'growth'::subscription_tier
    WHEN subscription_tier::text = 'enterprise' THEN 'premium'::subscription_tier
    WHEN subscription_tier::text NOT IN ('lite', 'starter', 'growth', 'premium') THEN 'lite'::subscription_tier
    ELSE subscription_tier
  END
WHERE subscription_tier IS NULL 
   OR subscription_tier::text NOT IN ('lite', 'starter', 'growth', 'premium');

-- Step 5: Add Stripe columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_cancel_at TIMESTAMP WITH TIME ZONE;

-- Step 6: Create usage limit checking function
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
  v_period_start := date_trunc('month', CURRENT_DATE)::DATE;
  
  SELECT COALESCE(subscription_tier, 'lite'::subscription_tier) INTO v_tier
  FROM users WHERE id = p_user_id;
  
  SELECT * INTO v_limits FROM tier_limits WHERE tier = v_tier;
  
  INSERT INTO usage_tracking (user_id, period_start, period_end)
  VALUES (p_user_id, v_period_start, v_period_start + INTERVAL '1 month')
  ON CONFLICT (user_id, period_start) DO NOTHING;
  
  SELECT * INTO v_usage FROM usage_tracking
  WHERE user_id = p_user_id AND period_start = v_period_start;
  
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
  
  RETURN json_build_object(
    'allowed', CASE 
      WHEN v_limit = -1 THEN true
      WHEN v_limit = 0 THEN false
      ELSE (v_used + p_amount) <= v_limit
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

-- Step 7: Create feature access checking function
CREATE OR REPLACE FUNCTION check_feature_access(
  p_user_id UUID,
  p_feature TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_tier subscription_tier;
  v_limits RECORD;
BEGIN
  SELECT COALESCE(subscription_tier, 'lite'::subscription_tier) INTO v_tier
  FROM users WHERE id = p_user_id;
  
  SELECT * INTO v_limits FROM tier_limits WHERE tier = v_tier;
  
  IF v_limits IS NULL THEN
    RETURN false;
  END IF;
  
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

-- Step 8: Create usage increment function
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_feature TEXT,
  p_amount NUMERIC DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  v_period_start DATE;
  v_check_result JSON;
BEGIN
  v_check_result := check_usage_limit(p_user_id, p_feature, p_amount::INTEGER);
  
  IF NOT (v_check_result->>'allowed')::BOOLEAN THEN
    RETURN false;
  END IF;
  
  v_period_start := date_trunc('month', CURRENT_DATE)::DATE;
  
  CASE p_feature
    WHEN 'ai_messages' THEN
      UPDATE usage_tracking
      SET ai_messages_used = ai_messages_used + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id AND period_start = v_period_start;
    WHEN 'voice_minutes' THEN
      UPDATE usage_tracking
      SET voice_minutes_used = voice_minutes_used + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id AND period_start = v_period_start;
    WHEN 'buddy_matching' THEN
      UPDATE usage_tracking
      SET buddy_matches_used = buddy_matches_used + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id AND period_start = v_period_start;
    WHEN 'group_sessions' THEN
      UPDATE usage_tracking
      SET group_sessions_used = group_sessions_used + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id AND period_start = v_period_start;
  END CASE;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_period ON usage_tracking(user_id, period_start);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON public.users(subscription_tier);

-- Step 10: Setup RLS
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage" ON usage_tracking;
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = usage_tracking.user_id);

DROP POLICY IF EXISTS "System can manage usage" ON usage_tracking;
CREATE POLICY "System can manage usage" ON usage_tracking
  FOR ALL USING (true);

-- Step 11: Grant permissions
GRANT SELECT ON tier_limits TO authenticated;
GRANT ALL ON usage_tracking TO authenticated;
GRANT EXECUTE ON FUNCTION check_usage_limit TO authenticated;
GRANT EXECUTE ON FUNCTION check_feature_access TO authenticated;
GRANT EXECUTE ON FUNCTION increment_usage TO authenticated;

-- Migration complete!
DO $$
BEGIN
  RAISE NOTICE 'Pricing tiers migration completed successfully with JSONB features';
END $$;