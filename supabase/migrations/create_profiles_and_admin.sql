-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'understand', 'transform')),
  subscription_status TEXT DEFAULT 'inactive',
  avatar_url TEXT,
  bio TEXT,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" 
  ON public.profiles FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update last_sign_in_at
CREATE OR REPLACE FUNCTION public.handle_user_sign_in()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET last_sign_in_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at DESC);

-- Now insert or update Ismael Mvula as admin
-- First check if the user exists in auth.users
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'ismaelmvula@gmail.com'
  LIMIT 1;

  -- If user exists in auth.users, create or update their profile
  IF user_id IS NOT NULL THEN
    INSERT INTO public.profiles (
      id, 
      email, 
      full_name, 
      role, 
      created_at, 
      updated_at
    ) VALUES (
      user_id,
      'ismaelmvula@gmail.com',
      'Ismael Mvula',
      'admin',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) 
    DO UPDATE SET 
      role = 'admin',
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      updated_at = NOW();
    
    RAISE NOTICE 'Successfully set Ismael Mvula (ismaelmvula@gmail.com) as admin';
  ELSE
    RAISE NOTICE 'User ismaelmvula@gmail.com not found in auth.users. Please sign up first, then run this migration again.';
  END IF;
END $$;

-- Create a function to ensure Ismael always remains admin
CREATE OR REPLACE FUNCTION ensure_ismael_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Always keep ismaelmvula@gmail.com as admin
  IF NEW.email = 'ismaelmvula@gmail.com' AND NEW.role != 'admin' THEN
    NEW.role := 'admin';
    RAISE NOTICE 'Attempted to change Ismael admin status - keeping as admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to protect Ismael's admin status
DROP TRIGGER IF EXISTS protect_ismael_admin ON public.profiles;
CREATE TRIGGER protect_ismael_admin
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_ismael_admin();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Final check - show all admin users
SELECT 
  id,
  email,
  full_name,
  role,
  created_at,
  CASE 
    WHEN role = 'admin' THEN '✅ Admin access granted'
    ELSE '❌ Not an admin'
  END as admin_status
FROM public.profiles
WHERE email = 'ismaelmvula@gmail.com'
   OR role = 'admin'
ORDER BY created_at DESC;