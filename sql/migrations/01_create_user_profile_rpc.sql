-- Function to create a basic user profile as a fallback
CREATE OR REPLACE FUNCTION create_user_profile(
  user_auth_id UUID,
  user_email TEXT,
  first_name TEXT,
  last_name TEXT,
  user_role TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
  v_normalized_role TEXT;
BEGIN
  -- Normalize role
  v_normalized_role := LOWER(user_role);
  
  -- Start transaction
  BEGIN
    -- Insert user record
    INSERT INTO users (
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
      v_normalized_role
    )
    RETURNING id INTO v_user_id;
    
    -- Create profile based on role
    IF v_normalized_role = 'donor' THEN
      INSERT INTO donor_profiles (
        user_id,
        donation_total,
        projects_supported
      ) VALUES (
        v_user_id,
        0,
        0
      );
    ELSIF v_normalized_role = 'teacher' THEN
      -- Create minimal teacher profile, will need to be updated later
      INSERT INTO teacher_profiles (
        user_id,
        school_name,
        school_address,
        school_city,
        school_state,
        school_postal_code,
        position_title,
        account_status
      ) VALUES (
        v_user_id,
        'TBD',  -- These will need to be updated
        'TBD',
        'TBD',
        'TBD',
        'TBD',
        'TBD',
        'pending'
      );
    ELSE
      RAISE EXCEPTION 'Invalid role: %', user_role;
    END IF;
    
    -- Build result object
    SELECT jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'first_name', u.first_name,
      'last_name', u.last_name,
      'role', u.role,
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