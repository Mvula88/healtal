-- Diagnostic migration to check existing structures

DO $$
DECLARE
  col_record RECORD;
  table_info TEXT := '';
BEGIN
  -- Check if usage_tracking table exists and show its structure
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usage_tracking') THEN
    RAISE NOTICE 'usage_tracking table EXISTS. Columns:';
    
    FOR col_record IN 
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'usage_tracking'
      ORDER BY ordinal_position
    LOOP
      RAISE NOTICE '  - %: % (nullable: %)', col_record.column_name, col_record.data_type, col_record.is_nullable;
    END LOOP;
    
    -- Drop the problematic table to recreate it properly
    DROP TABLE IF EXISTS public.usage_tracking CASCADE;
    RAISE NOTICE 'Dropped existing usage_tracking table';
  ELSE
    RAISE NOTICE 'usage_tracking table does NOT exist';
  END IF;
  
  -- Check users table structure
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    RAISE NOTICE 'users table columns:';
    FOR col_record IN 
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('id', 'subscription_tier', 'stripe_customer_id')
      ORDER BY ordinal_position
    LOOP
      RAISE NOTICE '  - %: %', col_record.column_name, col_record.data_type;
    END LOOP;
  END IF;
END $$;

-- Now create the table fresh
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  ai_messages_used INTEGER DEFAULT 0,
  voice_minutes_used NUMERIC(10,2) DEFAULT 0,
  buddy_matches_used INTEGER DEFAULT 0,
  group_sessions_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT usage_tracking_user_period_unique UNIQUE (user_id, period_start)
);

-- Add foreign key separately to avoid issues
DO $$
BEGIN
  -- Only add foreign key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'usage_tracking_user_id_fkey'
  ) THEN
    ALTER TABLE public.usage_tracking 
    ADD CONSTRAINT usage_tracking_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create tier_limits table
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

-- Update subscription_plans
DO $$
BEGIN
  -- Clean up old data
  DELETE FROM subscription_plans 
  WHERE tier::text IN ('lite', 'starter', 'growth', 'premium', 'free', 'explore', 'transform', 'enterprise');
  
  -- Insert new tiers
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
  
  -- Add stripe column if needed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' 
    AND column_name = 'stripe_price_id'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN stripe_price_id VARCHAR(255);
  END IF;
  
  UPDATE subscription_plans 
  SET stripe_price_id = 'price_1S2pxcIVPWhx8miGx7cj9BTc' 
  WHERE tier = 'lite'::subscription_tier;
END $$;

-- Update users from 'free' to 'lite'
UPDATE public.users 
SET subscription_tier = 'lite'::subscription_tier
WHERE subscription_tier::text = 'free';

-- Add Stripe columns to users if missing
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_cancel_at TIMESTAMP WITH TIME ZONE;

-- Create the usage checking function
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
  FROM public.users WHERE id = p_user_id;
  
  IF v_tier IS NULL THEN
    v_tier := 'lite'::subscription_tier;
  END IF;
  
  SELECT * INTO v_limits FROM public.tier_limits WHERE tier = v_tier;
  
  INSERT INTO public.usage_tracking (user_id, period_start, period_end)
  VALUES (p_user_id, v_period_start, v_period_start + INTERVAL '1 month')
  ON CONFLICT (user_id, period_start) DO NOTHING;
  
  SELECT * INTO v_usage FROM public.usage_tracking
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_period 
ON public.usage_tracking(user_id, period_start);

-- Setup RLS carefully
DO $$
BEGIN
  ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
  
  -- Drop any existing policies
  DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_tracking;
  DROP POLICY IF EXISTS "System can manage usage" ON public.usage_tracking;
  
  -- Create new policies - be very explicit about the column reference
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'usage_tracking' 
    AND column_name = 'user_id'
  ) THEN
    CREATE POLICY "Users can view own usage" 
    ON public.usage_tracking
    FOR SELECT 
    USING (auth.uid() = user_id);
    
    CREATE POLICY "System can manage usage" 
    ON public.usage_tracking
    FOR ALL 
    USING (true);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'RLS setup error: %', SQLERRM;
END $$;

-- Grant permissions
GRANT SELECT ON public.tier_limits TO authenticated;
GRANT ALL ON public.usage_tracking TO authenticated;
GRANT EXECUTE ON FUNCTION check_usage_limit TO authenticated;

-- Final verification
DO $$
DECLARE
  user_count INTEGER;
  lite_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users;
  SELECT COUNT(*) INTO lite_count FROM public.users WHERE subscription_tier = 'lite'::subscription_tier;
  
  RAISE NOTICE 'Migration complete! Total users: %, Lite tier users: %', user_count, lite_count;
  
  -- Check if usage_tracking was created successfully
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usage_tracking') THEN
    RAISE NOTICE 'usage_tracking table created successfully';
  ELSE
    RAISE NOTICE 'WARNING: usage_tracking table was not created';
  END IF;
END $$;