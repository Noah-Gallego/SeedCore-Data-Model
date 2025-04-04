-- Function to create a new user profile with proper role
CREATE OR REPLACE FUNCTION create_user_profile(
    p_auth_id UUID,
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_role TEXT DEFAULT 'donor'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the privileges of the creator
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Insert the user
    INSERT INTO users (
        auth_id,
        email,
        first_name,
        last_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        p_auth_id,
        p_email,
        p_first_name,
        p_last_name,
        p_role,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_user_id;
    
    -- If role is donor, create donor profile
    IF p_role = 'donor' THEN
        INSERT INTO donor_profiles (
            user_id,
            donation_total,
            projects_supported,
            is_anonymous_by_default,
            receives_updates_email,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            0.00,
            0,
            FALSE,
            TRUE,
            NOW(),
            NOW()
        );
    -- If role is teacher, create teacher profile (placeholder, they would complete this later)
    ELSIF p_role = 'teacher' THEN
        -- Teacher profiles require more info, but we can create a placeholder
        -- The teacher would need to fill in the required fields later
        NULL; -- This is just a placeholder, you'd implement the teacher profile creation logic
    END IF;
    
    RETURN v_user_id;
END;
$$; 