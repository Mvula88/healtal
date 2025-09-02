-- Fix: Add missing columns to tier_limits table for Healing Circles

-- Step 1: Add the missing columns
ALTER TABLE public.tier_limits 
ADD COLUMN IF NOT EXISTS can_join_circles BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_lead_circles BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS circle_discount_percent INTEGER DEFAULT 0;

-- Step 2: Update tier permissions for Healing Circles
UPDATE public.tier_limits SET
  can_join_circles = false,
  can_lead_circles = false,
  circle_discount_percent = 0
WHERE tier = 'lite'::subscription_tier;

UPDATE public.tier_limits SET
  can_join_circles = false, -- Can browse but not join
  can_lead_circles = false,
  circle_discount_percent = 0
WHERE tier = 'starter'::subscription_tier;

UPDATE public.tier_limits SET
  can_join_circles = true,
  can_lead_circles = false,
  circle_discount_percent = 10 -- 10% discount on circles
WHERE tier = 'growth'::subscription_tier;

UPDATE public.tier_limits SET
  can_join_circles = true,
  can_lead_circles = true,
  circle_discount_percent = 20 -- 20% discount + can earn as guide
WHERE tier = 'premium'::subscription_tier;

-- Step 3: Verify the update
SELECT 
  tier,
  monthly_price,
  can_join_circles,
  can_lead_circles,
  circle_discount_percent
FROM public.tier_limits
ORDER BY monthly_price;

-- Step 4: Show success
DO $$
BEGIN
  RAISE NOTICE '✅ Tier limits updated for Healing Circles!';
  RAISE NOTICE ' ';
  RAISE NOTICE 'Access levels configured:';
  RAISE NOTICE '- Lite: Browse only (no joining)';
  RAISE NOTICE '- Starter: Browse only (no joining)';
  RAISE NOTICE '- Growth: Can JOIN circles (10%% discount)';
  RAISE NOTICE '- Premium: Can JOIN + LEAD circles (20%% discount)';
END $$;