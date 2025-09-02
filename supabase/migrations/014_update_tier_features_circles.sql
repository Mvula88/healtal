-- Update tier features to include Healing Circles

-- Update subscription_plans features
UPDATE public.subscription_plans 
SET features = '["30 AI coach messages/month", "Unlimited mood tracking", "Unlimited journal entries", "Weekly pattern insights", "Community access (read & post)", "Crisis resources", "Mobile app access", "Email support", "Browse healing circles"]'::jsonb
WHERE tier = 'lite'::subscription_tier;

UPDATE public.subscription_plans 
SET features = '["200 AI coach messages/month", "60 voice minutes/month", "Daily pattern insights", "Peer messaging", "1 buddy match", "Progress analytics", "Custom exercises", "Priority email support", "Voice journaling", "Emotional analysis", "Browse healing circles & success stories"]'::jsonb
WHERE tier = 'starter'::subscription_tier;

UPDATE public.subscription_plans 
SET features = '["Unlimited AI coach messages", "300 voice minutes/month", "Real-time pattern insights", "3 buddy matches", "JOIN healing circles (10% discount)", "Advanced analytics dashboard", "Export your data (CSV/PDF)", "Custom AI coaching style", "Priority support", "Affiliate program access", "Community leader features"]'::jsonb
WHERE tier = 'growth'::subscription_tier;

UPDATE public.subscription_plans 
SET features = '["Everything unlimited", "Unlimited voice minutes", "Unlimited buddy matches", "JOIN & LEAD healing circles", "20% circle discount + earn 80% as guide", "2 family accounts included", "Priority queue for all features", "Early access to new features", "Monthly progress report", "Dedicated email support", "Business/team features"]'::jsonb
WHERE tier = 'premium'::subscription_tier;

-- Update lib/config.ts pricing tiers
DO $$
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '=== HEALING CIRCLES TIER ACCESS ===';
  RAISE NOTICE ' ';
  RAISE NOTICE 'LITE ($9): Can browse circles only';
  RAISE NOTICE 'STARTER ($19): Can browse circles & read success stories';
  RAISE NOTICE 'GROWTH ($39): Can JOIN circles as member (10%% discount)';
  RAISE NOTICE 'PREMIUM ($79): Can JOIN + LEAD circles (20%% discount + earn 80%% revenue)';
  RAISE NOTICE ' ';
  RAISE NOTICE 'Revenue Model:';
  RAISE NOTICE '- Circles cost $49-149 per 8-week program';
  RAISE NOTICE '- Guide keeps 80%% ($39-119 per member)';
  RAISE NOTICE '- Platform keeps 20%% ($10-30 per member)';
  RAISE NOTICE '- 100 circles × 10 members = $10,000-30,000/month platform revenue';
  RAISE NOTICE ' ';
END $$;