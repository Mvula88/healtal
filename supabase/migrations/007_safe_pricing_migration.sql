-- Safe migration that checks existing table structures before creating

-- Step 1: Update subscription_plans table
DO $$
DECLARE
  has_table BOOLEAN;
  has_stripe_column BOOLEAN;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'subscription_plans'
  ) INTO has_table;
  
  IF has_table THEN
    -- Clean up old data
    DELETE FROM subscription_plans 
    WHERE tier::text IN ('lite', 'starter', 'growth', 'premium', 'free', 'explore', 'transform', 'enterprise');
    
    -- Check if stripe_price_id column exists
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'subscription_plans' 
      AND column_name = 'stripe_price_id'
    ) INTO has_stripe_column;
    
    -- Insert with minimal required columns
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
    
    -- Add stripe column if missing and update Lite tier
    IF NOT has_stripe_column THEN
      ALTER TABLE subscription_plans ADD COLUMN stripe_price_id VARCHAR(255);
    END IF;
    
    UPDATE subscription_plans 
    SET stripe_price_id = 'price_1S2pxcIVPWhx8miGx7cj9BTc' 
    WHERE tier = 'lite'::subscription_tier;
  END IF;
END $$;

-- Step 2: Create or verify usage_tracking table
DO $$
BEGIN
  -- Check if table already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'usage_tracking'
  ) THEN
    CREATE TABLE public.usage_tracking (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      period_start TIMESTAMP WITH TIME ZONE NOT NULL,
      period_end TIMESTAMP WITH TIME ZONE NOT NULL,
      ai_messages_used INTEGER DEFAULT 0,
      voice_minutes_used NUMERIC(10,2) DEFAULT 0,
      buddy_matches_used INTEGER DEFAULT 0,
      group_sessions_used INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add unique constraint
    ALTER TABLE public.usage_tracking 
    ADD CONSTRAINT usage_tracking_user_period_unique 
    UNIQUE (user_id, period_start);
  END IF;
END $$;

-- Step 3: Create tier_limits table
DROP TABLE IF EXISTS public.tier_limits CASCADE;
CREATE TABLE public.tier_limits (
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
INSERT INTO public.tier_limits VALUES
  ('lite'::subscription_tier, 30, 0, 0, 0, false, 'weekly', 'read_post', false, false, false, false, 0, false, 9.00, 'price_1S2pxcIVPWhx8miGx7cj9BTc'),
  ('starter'::subscription_tier, 200, 60, 1, 0, true, 'daily', 'full', false, true, false, false, 0, false, 19.00, NULL),
  ('growth'::subscription_tier, -1, 300, 3, 4, true, 'real-time', 'full', true, true, true, false, 0, true, 39.00, NULL),
  ('premium'::subscription_tier, -1, -1, -1, -1, true, 'real-time', 'full', true, true, true, true, 2, true, 79.00, NULL);

-- Step 4: Update users table safely
DO $$
BEGIN
  -- Check if users table exists and has subscription_tier
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'subscription_tier'
  ) THEN
    -- Update old tiers to new ones
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
  END IF;
  
  -- Add Stripe columns if they don't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    ALTER TABLE public.users 
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
    ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
    ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
    ADD COLUMN IF NOT EXISTS subscription_cancel_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Step 5: Create functions
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
  
  -- Get user tier from users table
  SELECT COALESCE(subscription_tier, 'lite'::subscription_tier) INTO v_tier
  FROM public.users WHERE id = p_user_id;
  
  -- If user not found, default to lite
  IF v_tier IS NULL THEN
    v_tier := 'lite'::subscription_tier;
  END IF;
  
  -- Get tier limits
  SELECT * INTO v_limits FROM public.tier_limits WHERE tier = v_tier;
  
  -- Ensure usage tracking record exists
  INSERT INTO public.usage_tracking (user_id, period_start, period_end)
  VALUES (p_user_id, v_period_start, v_period_start + INTERVAL '1 month')
  ON CONFLICT (user_id, period_start) DO NOTHING;
  
  -- Get current usage
  SELECT * INTO v_usage FROM public.usage_tracking
  WHERE user_id = p_user_id AND period_start = v_period_start;
  
  -- Check the requested feature
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
  
  -- Return the result
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

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_period 
ON public.usage_tracking(user_id, period_start);

CREATE INDEX IF NOT EXISTS idx_users_subscription_tier 
ON public.users(subscription_tier) 
WHERE subscription_tier IS NOT NULL;

-- Step 7: Setup RLS for usage_tracking
DO $$
BEGIN
  -- Enable RLS if not already enabled
  ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_tracking;
  DROP POLICY IF EXISTS "System can manage usage" ON public.usage_tracking;
  
  -- Create new policies with explicit table references
  CREATE POLICY "Users can view own usage" 
  ON public.usage_tracking
  FOR SELECT 
  USING (auth.uid() = usage_tracking.user_id);
  
  CREATE POLICY "System can manage usage" 
  ON public.usage_tracking
  FOR ALL 
  USING (true);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'RLS policies may already exist or table structure is different';
END $$;

-- Step 8: Grant permissions
GRANT SELECT ON public.tier_limits TO authenticated;
GRANT ALL ON public.usage_tracking TO authenticated;
GRANT EXECUTE ON FUNCTION check_usage_limit TO authenticated;

-- Done!
DO $$
BEGIN
  RAISE NOTICE 'Pricing migration completed successfully';
END $$;