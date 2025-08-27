-- Set Ismael Mvula as admin user
-- This migration updates the user role in the profiles table

-- First, check if the user exists and show current role
SELECT id, email, full_name, role 
FROM public.profiles 
WHERE email = 'ismaelmvula@gmail.com';

-- Update the user's role to admin
UPDATE public.profiles
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'ismaelmvula@gmail.com';

-- Verify the update
SELECT id, email, full_name, role, updated_at
FROM public.profiles 
WHERE email = 'ismaelmvula@gmail.com';

-- If the user doesn't exist in profiles but exists in auth.users, 
-- this will create the profile with admin role
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  'admin' as role,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users
WHERE email = 'ismaelmvula@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();

-- Create a function to ensure admin role persists
CREATE OR REPLACE FUNCTION ensure_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Always keep ismaelmvula@gmail.com as admin
  IF NEW.email = 'ismaelmvula@gmail.com' AND NEW.role != 'admin' THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to protect admin status
DROP TRIGGER IF EXISTS protect_admin_role ON public.profiles;
CREATE TRIGGER protect_admin_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_admin_role();

-- Grant necessary permissions for admin user
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Final verification
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at,
  p.updated_at,
  CASE 
    WHEN p.role = 'admin' THEN '✅ Admin access granted'
    ELSE '❌ Admin access not set'
  END as status
FROM public.profiles p
WHERE p.email = 'ismaelmvula@gmail.com';