-- Fix for teacher signup issue where accounts default to donor role

-- First, check if there's an active trigger for auto user creation
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created';
    
    IF trigger_count > 0 THEN
        -- Drop the trigger if it exists
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        RAISE NOTICE 'Removed automatic user creation trigger that was forcing donor role';
    ELSE
        RAISE NOTICE 'No automatic trigger found';
    END IF;
END $$;

-- Ensure function exists and has proper role assignment
CREATE OR REPLACE FUNCTION create_user_with_profile(
  p_auth_id UUID,
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_role TEXT,
  p_school_name TEXT DEFAULT NULL,
  p_school_address TEXT DEFAULT NULL,
  p_school_city TEXT DEFAULT NULL,
  p_school_state TEXT DEFAULT NULL,
  p_school_postal_code TEXT DEFAULT NULL,
  p_position_title TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
  v_profile_type TEXT;
BEGIN
  -- Start transaction
  BEGIN
    -- Insert user record with explicit role from parameters
    INSERT INTO users (
      auth_id,
      email,
      first_name,
      last_name,
      role
    ) VALUES (
      p_auth_id,
      p_email,
      p_first_name,
      p_last_name,
      LOWER(p_role) -- Ensure lowercase for consistency
    )
    RETURNING id INTO v_user_id;
    
    -- Create profile based on role
    v_profile_type := 'none';
    
    IF LOWER(p_role) = 'donor' THEN
      v_profile_type := 'donor';
      
      INSERT INTO donor_profiles (
        user_id,
        donation_total,
        projects_supported
      ) VALUES (
        v_user_id,
        0,
        0
      );
    ELSIF LOWER(p_role) = 'teacher' THEN
      v_profile_type := 'teacher';
      
      -- Validate teacher fields
      IF p_school_name IS NULL OR p_school_address IS NULL OR p_school_city IS NULL OR 
         p_school_state IS NULL OR p_school_postal_code IS NULL OR p_position_title IS NULL THEN
        RAISE EXCEPTION 'Missing required teacher fields';
      END IF;
      
      INSERT INTO teacher_profiles (
        user_id,
        school_name,
        school_address,
        school_city,
        school_state,
        school_postal_code,
        position_title,
        account_status,
        employment_verified,
        nonprofit_status_verified
      ) VALUES (
        v_user_id,
        p_school_name,
        p_school_address,
        p_school_city,
        p_school_state,
        p_school_postal_code,
        p_position_title,
        'pending',
        FALSE,
        FALSE
      );
    ELSE
      RAISE EXCEPTION 'Invalid role: %', p_role;
    END IF;
    
    -- Build result object
    SELECT jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'first_name', u.first_name,
      'last_name', u.last_name,
      'role', u.role,
      'profile_type', v_profile_type,
      'created_at', u.created_at
    ) INTO v_result
    FROM users u
    WHERE u.id = v_user_id;
    
    -- If successful, return result
    RETURN v_result;
  -- Handle exceptions
  EXCEPTION
    WHEN OTHERS THEN
      RAISE;
  END;
END;
$$;

-- Add comment for clarity
COMMENT ON FUNCTION create_user_with_profile IS 'Creates a user with the specified role (teacher or donor) and associated profile'; 