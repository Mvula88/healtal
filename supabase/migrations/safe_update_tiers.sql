-- SAFE Migration: Update subscription tiers without removing old enum values
-- This is the recommended approach as it won't break anything

-- Step 1: Add new tier values to existing enum (safe operation)
DO $$ 
BEGIN
    -- Add new values if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'starter' AND enumtypid = 'subscription_tier'::regtype) THEN
        ALTER TYPE subscription_tier ADD VALUE 'starter' AFTER 'free';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'growth' AND enumtypid = 'subscription_tier'::regtype) THEN
        ALTER TYPE subscription_tier ADD VALUE 'growth' AFTER 'starter';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'premium' AND enumtypid = 'subscription_tier'::regtype) THEN
        ALTER TYPE subscription_tier ADD VALUE 'premium' AFTER 'growth';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Migrate existing users from old tiers to new tiers
UPDATE public.users 
SET subscription_tier = CASE 
    WHEN subscription_tier = 'free' THEN 'starter'
    WHEN subscription_tier = 'explore' THEN 'starter'  -- Map explore to starter
    WHEN subscription_tier = 'transform' THEN 'growth' -- Map transform to growth
    WHEN subscription_tier = 'enterprise' THEN 'premium' -- Map enterprise to premium
    ELSE subscription_tier -- Keep any other values as-is
END
WHERE subscription_tier IN ('free', 'explore', 'transform', 'enterprise');

-- Step 3: Add Stripe columns if missing
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_cancel_at TIMESTAMP WITH TIME ZONE;

-- Step 4: Set default tier for any NULL values
UPDATE public.users 
SET subscription_tier = 'starter' 
WHERE subscription_tier IS NULL;

-- Step 5: Update subscription_plans table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
        UPDATE public.subscription_plans 
        SET tier = CASE 
            WHEN tier = 'free' THEN 'starter'
            WHEN tier = 'explore' THEN 'starter'
            WHEN tier = 'transform' THEN 'growth'
            WHEN tier = 'enterprise' THEN 'premium'
            ELSE tier
        END
        WHERE tier IN ('free', 'explore', 'transform', 'enterprise');
    END IF;
END $$;

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON public.users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON public.users(subscription_tier);

-- Step 7: Show migration results
SELECT 'Current Enum Values:' as info;
SELECT enumlabel as tier_value
FROM pg_enum 
WHERE enumtypid = 'subscription_tier'::regtype
ORDER BY enumsortorder;

SELECT '---' as separator;
SELECT 'User Distribution:' as info;
SELECT 
    subscription_tier,
    COUNT(*) as user_count
FROM public.users
GROUP BY subscription_tier
ORDER BY subscription_tier;

SELECT '---' as separator;
SELECT 'Stripe Columns Status:' as info;
SELECT 
    column_name,
    data_type,
    CASE WHEN is_nullable = 'YES' THEN 'Nullable' ELSE 'Not Null' END as nullable
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