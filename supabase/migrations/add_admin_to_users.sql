-- Add role column to users table if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- Add email column to users table if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update email from auth.users
UPDATE public.users u
SET email = au.email
FROM auth.users au
WHERE u.id = au.id
AND u.email IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);

-- Now set Ismael Mvula as admin
DO $$
DECLARE
  user_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists in auth.users
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'ismaelmvula@gmail.com'
  LIMIT 1;

  IF user_id IS NOT NULL THEN
    -- Check if user exists in public.users
    SELECT EXISTS(SELECT 1 FROM public.users WHERE id = user_id) INTO user_exists;
    
    IF user_exists THEN
      -- Update existing user to admin
      UPDATE public.users
      SET 
        role = 'admin',
        email = 'ismaelmvula@gmail.com',
        full_name = COALESCE(full_name, 'Ismael Mvula'),
        updated_at = NOW()
      WHERE id = user_id;
      
      RAISE NOTICE 'Successfully updated Ismael Mvula as admin';
    ELSE
      -- Insert new user record as admin
      INSERT INTO public.users (
        id, 
        email,
        full_name, 
        role,
        subscription_tier,
        created_at, 
        updated_at
      ) VALUES (
        user_id,
        'ismaelmvula@gmail.com',
        'Ismael Mvula',
        'admin',
        'transform', -- Give admin the highest tier
        NOW(),
        NOW()
      );
      
      RAISE NOTICE 'Successfully created Ismael Mvula as admin';
    END IF;
  ELSE
    RAISE NOTICE 'User ismaelmvula@gmail.com not found. Please sign up first, then run this migration again.';
  END IF;
END $$;

-- Create a function to protect Ismael's admin status
CREATE OR REPLACE FUNCTION protect_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Always keep ismaelmvula@gmail.com as admin
  IF (NEW.email = 'ismaelmvula@gmail.com' OR OLD.email = 'ismaelmvula@gmail.com') 
     AND NEW.role != 'admin' THEN
    NEW.role := 'admin';
    RAISE NOTICE 'Protected admin role for ismaelmvula@gmail.com';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to protect admin status
DROP TRIGGER IF EXISTS protect_admin_role_trigger ON public.users;
CREATE TRIGGER protect_admin_role_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION protect_admin_role();

-- Update RLS policies for admin access
CREATE POLICY "Admins can view all users" 
  ON public.users FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
    OR auth.uid() = id
  );

CREATE POLICY "Admins can update all users" 
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
    OR auth.uid() = id
  );

-- Grant permissions
GRANT ALL ON public.users TO authenticated;

-- Verify the admin setup
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.subscription_tier,
  u.created_at,
  CASE 
    WHEN u.role = 'admin' THEN '✅ Admin access granted'
    ELSE '❌ Not an admin'
  END as admin_status
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'ismaelmvula@gmail.com'
   OR au.email = 'ismaelmvula@gmail.com'
   OR u.role = 'admin'
ORDER BY u.created_at DESC;