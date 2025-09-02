-- Update tier features to be realistic and deliverable

-- Update subscription_plans with honest, deliverable features
UPDATE public.subscription_plans 
SET features = '["30 AI coach messages/month", "Unlimited mood tracking", "Unlimited journal entries", "Weekly pattern insights", "Community access (read & post)", "Crisis resources", "Mobile app access", "Email support"]'::jsonb
WHERE tier = 'lite'::subscription_tier;

UPDATE public.subscription_plans 
SET features = '["200 AI coach messages/month", "60 voice minutes/month", "Daily pattern insights", "Peer messaging", "1 buddy match", "Progress analytics", "Custom exercises", "Priority email support", "Voice journaling", "Emotional analysis"]'::jsonb
WHERE tier = 'starter'::subscription_tier;

UPDATE public.subscription_plans 
SET features = '["Unlimited AI coach messages", "300 voice minutes/month", "Real-time pattern insights", "3 buddy matches", "Advanced analytics dashboard", "Export your data (CSV/PDF)", "Custom AI coaching style", "Priority support", "Affiliate program access", "Community leader features"]'::jsonb
WHERE tier = 'growth'::subscription_tier;

UPDATE public.subscription_plans 
SET features = '["Everything unlimited", "Unlimited voice minutes", "Unlimited buddy matches", "2 family accounts included", "Priority queue for all features", "Early access to new features", "Monthly progress report", "Dedicated email support", "Custom integrations support", "Business/team features"]'::jsonb
WHERE tier = 'premium'::subscription_tier;

-- Update config.ts pricing tiers to match
DO $$
BEGIN
  RAISE NOTICE 'Tier features updated to be realistic and deliverable:';
  RAISE NOTICE '';
  RAISE NOTICE 'LITE ($9): Basic features, community access';
  RAISE NOTICE 'STARTER ($19): Voice features unlocked, peer support';
  RAISE NOTICE 'GROWTH ($39): Unlimited AI, data export, affiliate access';
  RAISE NOTICE 'PREMIUM ($79): Everything unlimited, 2 family accounts, priority support';
  RAISE NOTICE '';
  RAISE NOTICE 'All advertised features are now actually implementable!';
END $$;