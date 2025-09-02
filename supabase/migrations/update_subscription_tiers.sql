-- Migration to update subscription tiers from old to new structure
-- This handles the transition from (free, explore, transform, enterprise) to (starter, growth, premium)

-- Step 1: First, add the new tier values to the enum if they don't exist
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'starter';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'growth';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'premium';

-- Step 2: Update existing user data to use new tiers
UPDATE public.users 
SET subscription_tier = CASE 
    WHEN subscription_tier = 'free' THEN 'starter'
    WHEN subscription_tier = 'explore' THEN 'starter'
    WHEN subscription_tier = 'transform' THEN 'growth'
    WHEN subscription_tier = 'enterprise' THEN 'premium'
    ELSE subscription_tier
END
WHERE subscription_tier IN ('free', 'explore', 'transform', 'enterprise');

-- Step 3: Add missing Stripe columns if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_cancel_at TIMESTAMP WITH TIME ZONE;

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON public.users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);

-- Step 5: Update any subscription_plans table references
UPDATE public.subscription_plans 
SET tier = CASE 
    WHEN tier = 'free' THEN 'starter'
    WHEN tier = 'explore' THEN 'starter'
    WHEN tier = 'transform' THEN 'growth'
    WHEN tier = 'enterprise' THEN 'premium'
    ELSE tier
END
WHERE tier IN ('free', 'explore', 'transform', 'enterprise');

-- Step 6: If you want to completely remove old enum values (OPTIONAL - RISKY)
-- NOTE: This is complex because PostgreSQL doesn't allow removing enum values easily
-- Only run this if you're sure no data uses the old values anymore

-- Create a new enum type with only the values we want
DO $$ 
BEGIN
    -- Check if we need to recreate the enum
    IF EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = 'subscription_tier'::regtype 
        AND enumlabel IN ('free', 'explore', 'transform', 'enterprise')
    ) THEN
        -- Create new enum type
        CREATE TYPE subscription_tier_new AS ENUM ('starter', 'growth', 'premium');
        
        -- Update all columns to use the new type
        ALTER TABLE public.users 
            ALTER COLUMN subscription_tier TYPE subscription_tier_new 
            USING subscription_tier::text::subscription_tier_new;
            
        ALTER TABLE public.subscription_plans 
            ALTER COLUMN tier TYPE subscription_tier_new 
            USING tier::text::subscription_tier_new;
        
        -- Drop the old enum type
        DROP TYPE subscription_tier;
        
        -- Rename the new type to the original name
        ALTER TYPE subscription_tier_new RENAME TO subscription_tier;
    END IF;
END $$;

-- Step 7: Add comments for documentation
COMMENT ON COLUMN public.users.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN public.users.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN public.users.subscription_status IS 'Current subscription status (active, past_due, cancelled, etc.)';
COMMENT ON COLUMN public.users.subscription_cancel_at IS 'Timestamp when subscription will be cancelled (for pending cancellations)';

-- Step 8: Verify the changes
SELECT 
    e.enumlabel as tier_value,
    e.enumsortorder as sort_order
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'subscription_tier'
ORDER BY e.enumsortorder;

-- Show current users and their tiers
SELECT 
    subscription_tier,
    COUNT(*) as user_count
FROM public.users
GROUP BY subscription_tier;

-- Show columns in users table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name IN (
    'stripe_customer_id', 
    'stripe_subscription_id', 
    'subscription_tier',
    'subscription_status',
    'subscription_cancel_at'
  )
ORDER BY ordinal_position;