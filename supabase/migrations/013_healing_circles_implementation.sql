-- Complete Healing Circles implementation with database structure

-- Step 1: Create circle_guides table for verified guides
CREATE TABLE IF NOT EXISTS public.circle_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transformation_story TEXT NOT NULL,
  years_since_breakthrough INTEGER NOT NULL,
  current_stability TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'basic', 'verified', 'certified')),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  total_circles_led INTEGER DEFAULT 0,
  total_members_helped INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_earnings NUMERIC(10,2) DEFAULT 0,
  stripe_account_id TEXT, -- For Connect payouts
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Step 2: Create guide_applications table
CREATE TABLE IF NOT EXISTS public.guide_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transformation_story TEXT NOT NULL,
  years_since_breakthrough INTEGER NOT NULL,
  current_stability TEXT,
  motivation_to_guide TEXT,
  relevant_experience TEXT,
  target_audience TEXT,
  proposed_circle_topic TEXT,
  ai_assessment JSONB,
  status TEXT DEFAULT 'under_review' CHECK (status IN ('under_review', 'approved', 'denied', 'needs_info')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Step 3: Create healing_circles table
CREATE TABLE IF NOT EXISTS public.healing_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES public.circle_guides(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  optimized_description TEXT,
  category VARCHAR(100),
  target_audience TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stripe_price_id TEXT, -- Stripe price object for recurring payment
  stripe_product_id TEXT, -- Stripe product object
  currency VARCHAR(3) DEFAULT 'USD',
  capacity JSONB DEFAULT '{"minimum": 5, "current": 0, "maximum": 15}'::jsonb,
  schedule JSONB, -- {"frequency": "weekly", "day": "Tuesday", "time": "7pm EST", "duration": "90 minutes"}
  duration_weeks INTEGER DEFAULT 8,
  total_sessions INTEGER DEFAULT 8,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'paused', 'completed', 'cancelled')),
  ai_endorsed BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  tags TEXT[],
  requirements TEXT[],
  learning_outcomes TEXT[],
  success_metrics JSONB,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create circle_members table
CREATE TABLE IF NOT EXISTS public.circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.healing_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intro_message TEXT,
  readiness_assessment TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'dropped')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'trial', 'active', 'failed', 'cancelled')),
  stripe_subscription_id TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  sessions_attended INTEGER DEFAULT 0,
  last_attendance TIMESTAMP WITH TIME ZONE,
  progress_notes JSONB DEFAULT '[]'::jsonb,
  breakthroughs_count INTEGER DEFAULT 0,
  UNIQUE(circle_id, user_id)
);

-- Step 5: Create circle_sessions table
CREATE TABLE IF NOT EXISTS public.circle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.healing_circles(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  topic VARCHAR(255),
  description TEXT,
  attendance_count INTEGER DEFAULT 0,
  session_notes TEXT,
  ai_analysis JSONB,
  breakthrough_detected BOOLEAN DEFAULT false,
  recording_url TEXT,
  materials JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(circle_id, session_number)
);

-- Step 6: Create session_attendance table
CREATE TABLE IF NOT EXISTS public.session_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.circle_sessions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.circle_members(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT false,
  contribution_quality TEXT CHECK (contribution_quality IN ('observer', 'participant', 'active', 'leader')),
  breakthrough_moment BOOLEAN DEFAULT false,
  notes TEXT,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(session_id, member_id)
);

-- Step 7: Create breakthroughs table
CREATE TABLE IF NOT EXISTS public.breakthroughs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circle_id UUID REFERENCES public.healing_circles(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.circle_sessions(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  ai_analysis TEXT,
  impact_level TEXT CHECK (impact_level IN ('minor', 'moderate', 'major', 'transformational')),
  breakthrough_type TEXT CHECK (breakthrough_type IN ('insight', 'emotional', 'behavioral', 'relational', 'spiritual')),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 8: Create circle_reviews table
CREATE TABLE IF NOT EXISTS public.circle_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.healing_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES public.circle_guides(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  would_recommend BOOLEAN DEFAULT true,
  transformation_level TEXT CHECK (transformation_level IN ('none', 'minor', 'moderate', 'significant', 'life_changing')),
  verified_purchase BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

-- Step 9: Create circle_payments table for tracking
CREATE TABLE IF NOT EXISTS public.circle_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.healing_circles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.circle_members(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES public.circle_guides(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL, -- 20% platform fee
  processing_fee NUMERIC(10,2) NOT NULL, -- Stripe fees
  guide_payout NUMERIC(10,2) NOT NULL, -- 80% to guide
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_payment_id TEXT,
  stripe_transfer_id TEXT, -- For guide payout
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_out_at TIMESTAMP WITH TIME ZONE
);

-- Step 10: Update tier_limits to include healing circles access
ALTER TABLE public.tier_limits 
ADD COLUMN IF NOT EXISTS can_join_circles BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_lead_circles BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS circle_discount_percent INTEGER DEFAULT 0;

-- Update tier permissions
UPDATE public.tier_limits SET
  can_join_circles = false,
  can_lead_circles = false,
  circle_discount_percent = 0
WHERE tier = 'lite';

UPDATE public.tier_limits SET
  can_join_circles = false, -- Can browse but not join
  can_lead_circles = false,
  circle_discount_percent = 0
WHERE tier = 'starter';

UPDATE public.tier_limits SET
  can_join_circles = true,
  can_lead_circles = false,
  circle_discount_percent = 10 -- 10% discount on circles
WHERE tier = 'growth';

UPDATE public.tier_limits SET
  can_join_circles = true,
  can_lead_circles = true,
  circle_discount_percent = 20 -- 20% discount + can earn as guide
WHERE tier = 'premium';

-- Step 11: Create functions for circle management
CREATE OR REPLACE FUNCTION can_join_circle(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier subscription_tier;
  v_can_join BOOLEAN;
BEGIN
  SELECT subscription_tier INTO v_tier FROM public.users WHERE id = p_user_id;
  SELECT can_join_circles INTO v_can_join FROM public.tier_limits WHERE tier = v_tier;
  RETURN COALESCE(v_can_join, false);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION can_lead_circle(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier subscription_tier;
  v_can_lead BOOLEAN;
BEGIN
  SELECT subscription_tier INTO v_tier FROM public.users WHERE id = p_user_id;
  SELECT can_lead_circles INTO v_can_lead FROM public.tier_limits WHERE tier = v_tier;
  RETURN COALESCE(v_can_lead, false);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_circle_price_for_user(p_circle_id UUID, p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_base_price NUMERIC;
  v_tier subscription_tier;
  v_discount INTEGER;
  v_final_price NUMERIC;
BEGIN
  -- Get base price
  SELECT price INTO v_base_price FROM public.healing_circles WHERE id = p_circle_id;
  
  -- Get user's tier and discount
  SELECT subscription_tier INTO v_tier FROM public.users WHERE id = p_user_id;
  SELECT circle_discount_percent INTO v_discount FROM public.tier_limits WHERE tier = v_tier;
  
  -- Calculate final price
  v_final_price := v_base_price * (1 - (COALESCE(v_discount, 0) / 100.0));
  
  RETURN v_final_price;
END;
$$ LANGUAGE plpgsql;

-- Step 12: Create views for easier querying
CREATE OR REPLACE VIEW circle_overview AS
SELECT 
  hc.*,
  cg.user_id as guide_user_id,
  cg.transformation_story as guide_story,
  cg.verification_status as guide_verification,
  cg.average_rating as guide_rating,
  u.full_name as guide_name,
  u.avatar_url as guide_avatar,
  (SELECT COUNT(*) FROM circle_members WHERE circle_id = hc.id AND status = 'active') as active_members,
  (SELECT AVG(rating) FROM circle_reviews WHERE circle_id = hc.id) as circle_rating,
  (SELECT COUNT(*) FROM circle_reviews WHERE circle_id = hc.id) as review_count
FROM public.healing_circles hc
JOIN public.circle_guides cg ON hc.guide_id = cg.id
JOIN public.users u ON cg.user_id = u.id;

-- Step 13: Set up RLS policies
ALTER TABLE public.circle_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healing_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breakthroughs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_payments ENABLE ROW LEVEL SECURITY;

-- Guides policies
CREATE POLICY "Users can view all guides" ON public.circle_guides FOR SELECT USING (true);
CREATE POLICY "Users can update own guide profile" ON public.circle_guides FOR UPDATE USING (auth.uid() = user_id);

-- Applications policies
CREATE POLICY "Users can view own applications" ON public.guide_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create applications" ON public.guide_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Circles policies
CREATE POLICY "Anyone can view active circles" ON public.healing_circles FOR SELECT USING (status = 'active');
CREATE POLICY "Guides can manage own circles" ON public.healing_circles FOR ALL USING (
  guide_id IN (SELECT id FROM public.circle_guides WHERE user_id = auth.uid())
);

-- Members policies
CREATE POLICY "Members can view circle membership" ON public.circle_members FOR SELECT USING (
  user_id = auth.uid() OR 
  circle_id IN (SELECT id FROM public.healing_circles WHERE guide_id IN (SELECT id FROM public.circle_guides WHERE user_id = auth.uid()))
);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.circle_reviews FOR SELECT USING (true);
CREATE POLICY "Members can create reviews" ON public.circle_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 14: Create indexes for performance
CREATE INDEX idx_circle_guides_user_id ON public.circle_guides(user_id);
CREATE INDEX idx_healing_circles_guide_id ON public.healing_circles(guide_id);
CREATE INDEX idx_healing_circles_status ON public.healing_circles(status);
CREATE INDEX idx_circle_members_circle_id ON public.circle_members(circle_id);
CREATE INDEX idx_circle_members_user_id ON public.circle_members(user_id);
CREATE INDEX idx_circle_sessions_circle_id ON public.circle_sessions(circle_id);
CREATE INDEX idx_breakthroughs_user_id ON public.breakthroughs(user_id);
CREATE INDEX idx_circle_reviews_circle_id ON public.circle_reviews(circle_id);
CREATE INDEX idx_circle_payments_guide_id ON public.circle_payments(guide_id);

-- Step 15: Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Done!
DO $$
BEGIN
  RAISE NOTICE 'Healing Circles database structure created successfully!';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '- Growth tier: Can join circles (10% discount)';
  RAISE NOTICE '- Premium tier: Can join AND lead circles (20% discount + earn 80% revenue)';
END $$;