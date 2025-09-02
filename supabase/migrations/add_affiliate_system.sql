-- Affiliate System Database Schema

-- Affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  affiliate_code TEXT UNIQUE NOT NULL,
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')) DEFAULT 'bronze',
  commission_rate DECIMAL(5,2) DEFAULT 20.00,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  current_balance DECIMAL(10,2) DEFAULT 0.00,
  pending_payout DECIMAL(10,2) DEFAULT 0.00,
  total_referrals INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'approved', 'suspended')) DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  tier_updated_at TIMESTAMP WITH TIME ZONE,
  last_payout_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT,
  plan_value DECIMAL(10,2),
  status TEXT CHECK (status IN ('trial', 'active', 'churned', 'cancelled')) DEFAULT 'trial',
  signup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversion_date TIMESTAMP WITH TIME ZONE,
  churn_date TIMESTAMP WITH TIME ZONE,
  lifetime_value DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate links table
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  custom_slug TEXT UNIQUE,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0.00,
  last_clicked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate clicks tracking
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  url TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  metadata JSONB,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commissions table
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')) DEFAULT 'pending',
  order_value DECIMAL(10,2),
  plan_type TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT CHECK (method IN ('paypal', 'stripe', 'bank', 'crypto')),
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  transaction_id TEXT,
  payment_details JSONB,
  notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT
);

-- Payout history for record keeping
CREATE TABLE IF NOT EXISTS payout_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  payout_id UUID REFERENCES payouts(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT,
  transaction_id TEXT,
  invoice_url TEXT,
  tax_document_url TEXT,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate tier benefits configuration
CREATE TABLE IF NOT EXISTS affiliate_tier_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  payout_frequency TEXT,
  minimum_payout DECIMAL(10,2),
  benefits JSONB,
  requirements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default tier benefits
INSERT INTO affiliate_tier_benefits (tier, commission_rate, payout_frequency, minimum_payout, benefits, requirements)
VALUES 
  ('bronze', 20.00, 'monthly', 100.00, 
   '{"support": "basic", "marketing_assets": true, "custom_links": false}',
   '{"min_referrals": 0, "min_revenue": 0}'),
  ('silver', 25.00, 'bi-weekly', 50.00,
   '{"support": "priority", "marketing_assets": true, "custom_links": true, "dedicated_manager": false}',
   '{"min_referrals": 10, "min_revenue": 500}'),
  ('gold', 30.00, 'weekly', 25.00,
   '{"support": "dedicated", "marketing_assets": true, "custom_links": true, "dedicated_manager": true, "custom_creatives": true}',
   '{"min_referrals": 50, "min_revenue": 5000}'),
  ('platinum', 35.00, 'instant', 0.00,
   '{"support": "white_glove", "marketing_assets": true, "custom_links": true, "dedicated_manager": true, "custom_creatives": true, "api_access": true, "white_label": true}',
   '{"min_referrals": 100, "min_revenue": 20000}')
ON CONFLICT (tier) DO NOTHING;

-- Marketing assets table
CREATE TABLE IF NOT EXISTS affiliate_marketing_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('banner', 'email', 'social', 'video', 'landing_page')),
  url TEXT,
  thumbnail_url TEXT,
  file_url TEXT,
  dimensions TEXT,
  tier_required TEXT,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate notifications
CREATE TABLE IF NOT EXISTS affiliate_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Functions

-- Function to calculate affiliate statistics
CREATE OR REPLACE FUNCTION calculate_affiliate_stats(affiliate_id_param UUID)
RETURNS TABLE (
  total_clicks BIGINT,
  total_conversions BIGINT,
  conversion_rate DECIMAL,
  average_order_value DECIMAL,
  monthly_recurring_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT ac.id) as total_clicks,
    COUNT(DISTINCT r.id) as total_conversions,
    CASE 
      WHEN COUNT(DISTINCT ac.id) > 0 
      THEN (COUNT(DISTINCT r.id)::DECIMAL / COUNT(DISTINCT ac.id)::DECIMAL * 100)
      ELSE 0
    END as conversion_rate,
    AVG(c.order_value) as average_order_value,
    SUM(CASE WHEN r.status = 'active' THEN r.plan_value ELSE 0 END) as monthly_recurring_revenue
  FROM affiliates a
  LEFT JOIN affiliate_clicks ac ON a.id = ac.affiliate_id
  LEFT JOIN referrals r ON a.id = r.affiliate_id
  LEFT JOIN commissions c ON a.id = c.affiliate_id
  WHERE a.id = affiliate_id_param
  GROUP BY a.id;
END;
$$ LANGUAGE plpgsql;

-- Function to process recurring commissions
CREATE OR REPLACE FUNCTION process_recurring_commissions()
RETURNS void AS $$
DECLARE
  referral_record RECORD;
  commission_amount DECIMAL;
BEGIN
  FOR referral_record IN 
    SELECT r.*, a.commission_rate
    FROM referrals r
    JOIN affiliates a ON r.affiliate_id = a.id
    WHERE r.status = 'active'
    AND DATE_PART('day', CURRENT_DATE - r.conversion_date::DATE) % 30 = 0
  LOOP
    commission_amount := (referral_record.plan_value * referral_record.commission_rate) / 100;
    
    INSERT INTO commissions (
      affiliate_id,
      referral_id,
      amount,
      percentage,
      order_value,
      plan_type,
      status
    ) VALUES (
      referral_record.affiliate_id,
      referral_record.id,
      commission_amount,
      referral_record.commission_rate,
      referral_record.plan_value,
      referral_record.plan_type,
      'approved'
    );
    
    UPDATE affiliates
    SET 
      current_balance = current_balance + commission_amount,
      total_earnings = total_earnings + commission_amount
    WHERE id = referral_record.affiliate_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX idx_affiliates_status ON affiliates(status);
CREATE INDEX idx_referrals_affiliate ON referrals(affiliate_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_commissions_affiliate ON commissions(affiliate_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_payouts_affiliate ON payouts(affiliate_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_clicks_affiliate ON affiliate_clicks(affiliate_id);
CREATE INDEX idx_clicks_timestamp ON affiliate_clicks(clicked_at);

-- Enable Row Level Security
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Affiliates can view own data" ON affiliates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Affiliates can update own profile" ON affiliates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Affiliates can view own referrals" ON referrals
  FOR SELECT USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Affiliates can view own commissions" ON commissions
  FOR SELECT USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Affiliates can view own payouts" ON payouts
  FOR SELECT USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Affiliates can request payouts" ON payouts
  FOR INSERT WITH CHECK (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );