-- Migration to add Stripe-related columns to users table
-- Run this migration in your Supabase SQL Editor

-- First, check current schema
-- The users table currently has:
-- - subscription_tier (enum type)
-- The user_subscriptions table has:
-- - stripe_subscription_id
-- - stripe_customer_id

-- We need to add missing columns to the users table for easier access

-- Add Stripe columns to users table if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_cancel_at TIMESTAMP WITH TIME ZONE;

-- Update the subscription_tier enum to include new tiers
-- First, check if we need to update the enum
DO $$ 
BEGIN
    -- Add new values to the enum if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'starter' AND enumtypid = 'subscription_tier'::regtype) THEN
        ALTER TYPE subscription_tier ADD VALUE 'starter';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'growth' AND enumtypid = 'subscription_tier'::regtype) THEN
        ALTER TYPE subscription_tier ADD VALUE 'growth';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'premium' AND enumtypid = 'subscription_tier'::regtype) THEN
        ALTER TYPE subscription_tier ADD VALUE 'premium';
    END IF;
END $$;

-- Create indexes for better query performance on Stripe columns
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON public.users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);

-- Add comments for documentation
COMMENT ON COLUMN public.users.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN public.users.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN public.users.subscription_status IS 'Current subscription status (active, past_due, cancelled, etc.)';
COMMENT ON COLUMN public.users.subscription_cancel_at IS 'Timestamp when subscription will be cancelled (for pending cancellations)';

-- Optional: Migrate data from user_subscriptions table to users table if needed
-- This consolidates subscription data in one place for easier access
UPDATE public.users u
SET 
    stripe_customer_id = COALESCE(u.stripe_customer_id, us.stripe_customer_id),
    stripe_subscription_id = COALESCE(u.stripe_subscription_id, us.stripe_subscription_id),
    subscription_status = COALESCE(u.subscription_status, us.status)
FROM public.user_subscriptions us
WHERE u.id = us.user_id
  AND us.status = 'active';

-- Verify the changes
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