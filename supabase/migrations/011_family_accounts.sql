-- Add family accounts support for Premium tier

-- Step 1: Create family_accounts table
CREATE TABLE IF NOT EXISTS public.family_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_member_email TEXT NOT NULL,
  family_member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invitation_status TEXT DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'declined')),
  invitation_code TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(primary_user_id, family_member_email)
);

-- Step 2: Add family account tracking to users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_family_member BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS primary_account_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Step 3: Create function to check family account eligibility
CREATE OR REPLACE FUNCTION can_add_family_member(p_user_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
  v_tier subscription_tier;
  v_existing_count INTEGER;
  v_tier_limits RECORD;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO v_tier FROM public.users WHERE id = p_user_id;
  
  -- Get tier limits
  SELECT family_accounts INTO v_tier_limits FROM public.tier_limits WHERE tier = v_tier;
  
  -- If no family accounts allowed, return false
  IF v_tier_limits.family_accounts = 0 THEN
    RETURN false;
  END IF;
  
  -- Count existing family members
  SELECT COUNT(*) INTO v_existing_count 
  FROM public.family_accounts 
  WHERE primary_user_id = p_user_id 
  AND invitation_status = 'accepted';
  
  -- Check if under limit
  RETURN v_existing_count < v_tier_limits.family_accounts;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create function to invite family member
CREATE OR REPLACE FUNCTION invite_family_member(
  p_primary_user_id UUID,
  p_family_email TEXT
) RETURNS JSON AS $$
DECLARE
  v_can_add BOOLEAN;
  v_invitation_code TEXT;
BEGIN
  -- Check if user can add family members
  v_can_add := can_add_family_member(p_primary_user_id);
  
  IF NOT v_can_add THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You have reached your family account limit or your plan does not support family accounts'
    );
  END IF;
  
  -- Generate invitation code
  v_invitation_code := encode(gen_random_bytes(16), 'hex');
  
  -- Create invitation
  INSERT INTO public.family_accounts (
    primary_user_id,
    family_member_email,
    invitation_code
  ) VALUES (
    p_primary_user_id,
    p_family_email,
    v_invitation_code
  ) ON CONFLICT (primary_user_id, family_member_email) 
  DO UPDATE SET 
    invitation_code = v_invitation_code,
    invitation_status = 'pending',
    created_at = NOW();
  
  RETURN json_build_object(
    'success', true,
    'invitation_code', v_invitation_code,
    'message', 'Family member invitation sent'
  );
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create function to accept family invitation
CREATE OR REPLACE FUNCTION accept_family_invitation(
  p_invitation_code TEXT,
  p_family_member_id UUID
) RETURNS JSON AS $$
DECLARE
  v_invitation RECORD;
  v_primary_tier subscription_tier;
BEGIN
  -- Find the invitation
  SELECT * INTO v_invitation 
  FROM public.family_accounts 
  WHERE invitation_code = p_invitation_code 
  AND invitation_status = 'pending';
  
  IF v_invitation IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired invitation code'
    );
  END IF;
  
  -- Get primary user's tier
  SELECT subscription_tier INTO v_primary_tier 
  FROM public.users 
  WHERE id = v_invitation.primary_user_id;
  
  -- Update invitation
  UPDATE public.family_accounts 
  SET 
    family_member_id = p_family_member_id,
    invitation_status = 'accepted',
    accepted_at = NOW()
  WHERE id = v_invitation.id;
  
  -- Update family member's account
  UPDATE public.users 
  SET 
    is_family_member = true,
    primary_account_id = v_invitation.primary_user_id,
    subscription_tier = v_primary_tier -- Inherit primary's tier
  WHERE id = p_family_member_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Successfully joined family account'
  );
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create view for family account management
CREATE OR REPLACE VIEW family_account_overview AS
SELECT 
  fa.id,
  fa.primary_user_id,
  pu.full_name as primary_user_name,
  pu.email as primary_user_email,
  fa.family_member_email,
  fm.full_name as family_member_name,
  fa.invitation_status,
  fa.created_at,
  fa.accepted_at,
  tl.family_accounts as allowed_members,
  (
    SELECT COUNT(*) 
    FROM family_accounts 
    WHERE primary_user_id = fa.primary_user_id 
    AND invitation_status = 'accepted'
  ) as active_members
FROM public.family_accounts fa
JOIN public.users pu ON fa.primary_user_id = pu.id
LEFT JOIN public.users fm ON fa.family_member_id = fm.id
JOIN public.tier_limits tl ON pu.subscription_tier = tl.tier;

-- Step 7: Set up RLS policies
ALTER TABLE public.family_accounts ENABLE ROW LEVEL SECURITY;

-- Primary users can view and manage their family accounts
CREATE POLICY "Users can view own family accounts" ON public.family_accounts
  FOR SELECT USING (auth.uid() = primary_user_id OR auth.uid() = family_member_id);

CREATE POLICY "Users can create family invitations" ON public.family_accounts
  FOR INSERT WITH CHECK (auth.uid() = primary_user_id);

CREATE POLICY "Users can update own family accounts" ON public.family_accounts
  FOR UPDATE USING (auth.uid() = primary_user_id);

CREATE POLICY "Users can delete own family accounts" ON public.family_accounts
  FOR DELETE USING (auth.uid() = primary_user_id);

-- Step 8: Create indexes
CREATE INDEX IF NOT EXISTS idx_family_accounts_primary_user 
ON public.family_accounts(primary_user_id);

CREATE INDEX IF NOT EXISTS idx_family_accounts_invitation_code 
ON public.family_accounts(invitation_code) 
WHERE invitation_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_users_primary_account 
ON public.users(primary_account_id) 
WHERE is_family_member = true;

-- Step 9: Grant permissions
GRANT ALL ON public.family_accounts TO authenticated;
GRANT SELECT ON family_account_overview TO authenticated;
GRANT EXECUTE ON FUNCTION can_add_family_member TO authenticated;
GRANT EXECUTE ON FUNCTION invite_family_member TO authenticated;
GRANT EXECUTE ON FUNCTION accept_family_invitation TO authenticated;

-- Done
DO $$
BEGIN
  RAISE NOTICE 'Family accounts feature implemented successfully!';
END $$;