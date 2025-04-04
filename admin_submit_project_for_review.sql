-- Function for admins to submit projects for review
CREATE OR REPLACE FUNCTION admin_submit_project_for_review(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check authorization - only allow admins
    IF NOT EXISTS (
        SELECT 1 FROM users
        WHERE auth_id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only administrators can submit projects on behalf of teachers';
    END IF;
    
    -- Update project status
    UPDATE projects 
    SET status = 'pending_review', updated_at = NOW()
    WHERE id = p_project_id AND status = 'draft';
    
    -- Create a project review entry to track the submission
    INSERT INTO project_reviews (
        project_id,
        reviewer_id,
        status,
        notes
    ) 
    SELECT 
        p_project_id,
        u.id,
        'needs_revision',
        'Submitted for review by administrator'
    FROM 
        users u
    WHERE 
        u.auth_id = auth.uid();
    
    RETURN FOUND;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION admin_submit_project_for_review TO authenticated; 