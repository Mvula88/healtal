-- Part 1: Add enum values only (run this first)
-- This migration MUST be run separately before the data migration

-- Add Lite tier to enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'lite' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_tier')
  ) THEN
    ALTER TYPE subscription_tier ADD VALUE 'lite';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'Enum value lite already exists';
END $$;

-- Add other tiers if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'starter' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_tier')
  ) THEN
    ALTER TYPE subscription_tier ADD VALUE 'starter';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'Enum value starter already exists';
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'growth' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_tier')
  ) THEN
    ALTER TYPE subscription_tier ADD VALUE 'growth';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'Enum value growth already exists';
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'premium' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_tier')
  ) THEN
    ALTER TYPE subscription_tier ADD VALUE 'premium';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'Enum value premium already exists';
END $$;

-- IMPORTANT: This migration must be committed before running the next part!