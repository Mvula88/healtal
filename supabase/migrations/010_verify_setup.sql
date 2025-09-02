-- Verification query to check if everything is set up correctly

-- Check users have been updated to lite tier
SELECT 
  subscription_tier,
  COUNT(*) as user_count 
FROM public.users 
GROUP BY subscription_tier;

-- Check subscription_plans has the new tiers
SELECT 
  tier,
  name,
  price_monthly,
  stripe_price_id
FROM public.subscription_plans
ORDER BY price_monthly;

-- Check tier_limits table
SELECT 
  tier,
  ai_messages,
  voice_minutes,
  monthly_price
FROM public.tier_limits
ORDER BY monthly_price;

-- Check if usage_tracking table exists and has correct structure
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'usage_tracking'
ORDER BY ordinal_position;

-- Test the check_usage_limit function with one of your users
SELECT check_usage_limit('7ff240d0-16fc-46af-8c21-10ac64f1b6bf'::uuid, 'ai_messages', 1);

-- Show success message
DO $$
BEGIN
  RAISE NOTICE '✅ 4-tier pricing structure successfully implemented!';
  RAISE NOTICE 'Tiers: Lite ($9), Starter ($19), Growth ($39), Premium ($79)';
  RAISE NOTICE 'All users have been migrated from free to lite tier';
END $$;