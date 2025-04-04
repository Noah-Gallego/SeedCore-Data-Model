-- Create RLS policy to allow any authenticated user to read their own user record
CREATE POLICY "Allow users to read their own user record"
ON public.users
FOR SELECT
USING (auth.uid() = auth_id);

-- Create a secure function to create a user profile
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_auth_id UUID,
  user_email TEXT,
  first_name TEXT,
  last_name TEXT,
  user_role TEXT DEFAULT 'donor'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with the permissions of the function creator
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert the new user
  INSERT INTO public.users (
    auth_id,
    email,
    first_name,
    last_name,
    role
  ) VALUES (
    user_auth_id,
    user_email,
    first_name,
    last_name,
    user_role
  ) RETURNING id INTO new_user_id;

  -- If this is a donor, create a donor profile
  IF user_role = 'donor' THEN
    INSERT INTO public.donor_profiles (
      user_id,
      donation_total,
      projects_supported
    ) VALUES (
      new_user_id,
      0,
      0
    );
  END IF;

  RETURN new_user_id;
END;
$$;

-- Grant execute permission to the function for authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon;

-- Grant insert permissions on user table for service role only
-- This won't affect normal users but allows our API route to create users
GRANT INSERT ON public.users TO service_role;
GRANT INSERT ON public.donor_profiles TO service_role;

-- Create RLS policy allowing any authenticated user to create a user record IF the auth.uid matches
CREATE POLICY "Allow users to create their own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = auth_id);

-- Create an auto-create profile trigger on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Auto insert a record for the new user
  INSERT INTO public.users (auth_id, email, first_name, last_name, role)
  VALUES (new.id, new.email, '', '', 'donor');
  
  RETURN new;
END;
$$;

-- Add the trigger to automatically create profiles 
-- (Note: Only enable this if you don't need to collect first_name/last_name during signup)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 