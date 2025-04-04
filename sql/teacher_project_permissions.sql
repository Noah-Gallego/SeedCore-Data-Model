-- Function to allow teachers to submit a project for review
CREATE OR REPLACE FUNCTION submit_project_for_review(p_project_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_teacher_id UUID;
  v_user_id UUID;
  v_project_exists BOOLEAN;
  v_is_owner BOOLEAN;
  v_current_status TEXT;
BEGIN
  -- Get the user ID
  v_user_id := auth.uid();
  
  -- Check if the user exists and is a teacher
  SELECT tp.id INTO v_teacher_id
  FROM users u
  JOIN teacher_profiles tp ON tp.user_id = u.id
  WHERE u.auth_id = v_user_id AND u.role = 'teacher';
  
  IF v_teacher_id IS NULL THEN
    RAISE EXCEPTION 'User is not a teacher or teacher profile not found';
  END IF;
  
  -- Verify project exists
  SELECT EXISTS (
    SELECT 1 FROM projects WHERE id = p_project_id
  ) INTO v_project_exists;
  
  IF NOT v_project_exists THEN
    RAISE EXCEPTION 'Project not found';
  END IF;
  
  -- Verify user owns the project
  SELECT (teacher_id = v_teacher_id) INTO v_is_owner
  FROM projects
  WHERE id = p_project_id;
  
  IF NOT v_is_owner THEN
    RAISE EXCEPTION 'You do not own this project';
  END IF;
  
  -- Check current status allows for submission
  SELECT status INTO v_current_status
  FROM projects
  WHERE id = p_project_id;
  
  IF v_current_status != 'draft' AND v_current_status != 'rejected' THEN
    RAISE EXCEPTION 'Project cannot be submitted for review from its current status: %', v_current_status;
  END IF;
  
  -- Update project status to pending_review
  UPDATE projects
  SET 
    status = 'pending_review',
    updated_at = NOW()
  WHERE id = p_project_id;
  
  -- Create a project review entry to track the submission
  INSERT INTO project_reviews (
    project_id,
    reviewer_id,
    status,
    notes,
    created_at,
    updated_at
  ) VALUES (
    p_project_id,
    (SELECT id FROM users WHERE auth_id = v_user_id),
    'needs_revision',
    'Submitted for review',
    NOW(),
    NOW()
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION submit_project_for_review TO authenticated;

-- Policy to allow teachers to see their own projects regardless of status
DROP POLICY IF EXISTS teacher_view_own_projects ON projects;
CREATE POLICY teacher_view_own_projects ON projects
  FOR SELECT 
  TO authenticated
  USING (
    teacher_id IN (
      SELECT tp.id 
      FROM teacher_profiles tp
      JOIN users u ON u.id = tp.user_id
      WHERE u.auth_id = auth.uid() AND u.role = 'teacher'
    )
  );

-- Policy to allow teachers to update their own projects in draft status
DROP POLICY IF EXISTS teacher_update_own_draft_projects ON projects;
CREATE POLICY teacher_update_own_draft_projects ON projects
  FOR UPDATE 
  TO authenticated
  USING (
    teacher_id IN (
      SELECT tp.id 
      FROM teacher_profiles tp
      JOIN users u ON u.id = tp.user_id
      WHERE u.auth_id = auth.uid() AND u.role = 'teacher'
    ) AND status = 'draft'
  )
  WITH CHECK (
    teacher_id IN (
      SELECT tp.id 
      FROM teacher_profiles tp
      JOIN users u ON u.id = tp.user_id
      WHERE u.auth_id = auth.uid() AND u.role = 'teacher'
    ) AND status = 'draft'
  );

-- Policy to allow teachers to create projects
DROP POLICY IF EXISTS teacher_create_projects ON projects;
CREATE POLICY teacher_create_projects ON projects
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    teacher_id IN (
      SELECT tp.id 
      FROM teacher_profiles tp
      JOIN users u ON u.id = tp.user_id
      WHERE u.auth_id = auth.uid() AND u.role = 'teacher'
    )
  );

-- Policy to allow teachers to view their project reviews
DROP POLICY IF EXISTS teacher_view_own_project_reviews ON project_reviews;
CREATE POLICY teacher_view_own_project_reviews ON project_reviews
  FOR SELECT 
  TO authenticated
  USING (
    project_id IN (
      SELECT id
      FROM projects
      WHERE teacher_id IN (
        SELECT tp.id 
        FROM teacher_profiles tp
        JOIN users u ON u.id = tp.user_id
        WHERE u.auth_id = auth.uid() AND u.role = 'teacher'
      )
    )
  );

-- Policies for project categories management
DROP POLICY IF EXISTS teacher_create_project_categories ON project_categories;
CREATE POLICY teacher_create_project_categories ON project_categories
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id
      FROM projects
      WHERE teacher_id IN (
        SELECT tp.id 
        FROM teacher_profiles tp
        JOIN users u ON u.id = tp.user_id
        WHERE u.auth_id = auth.uid() AND u.role = 'teacher'
      )
    )
  );

DROP POLICY IF EXISTS teacher_view_project_categories ON project_categories;
CREATE POLICY teacher_view_project_categories ON project_categories
  FOR SELECT 
  TO authenticated
  USING (
    project_id IN (
      SELECT id
      FROM projects
      WHERE teacher_id IN (
        SELECT tp.id 
        FROM teacher_profiles tp
        JOIN users u ON u.id = tp.user_id
        WHERE u.auth_id = auth.uid() AND u.role = 'teacher'
      )
    )
  );

DROP POLICY IF EXISTS teacher_update_project_categories ON project_categories;
CREATE POLICY teacher_update_project_categories ON project_categories
  FOR UPDATE 
  TO authenticated
  USING (
    project_id IN (
      SELECT id
      FROM projects
      WHERE teacher_id IN (
        SELECT tp.id 
        FROM teacher_profiles tp
        JOIN users u ON u.id = tp.user_id
        WHERE u.auth_id = auth.uid() AND u.role = 'teacher'
      ) AND status = 'draft'
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id
      FROM projects
      WHERE teacher_id IN (
        SELECT tp.id 
        FROM teacher_profiles tp
        JOIN users u ON u.id = tp.user_id
        WHERE u.auth_id = auth.uid() AND u.role = 'teacher'
      ) AND status = 'draft'
    )
  );

DROP POLICY IF EXISTS teacher_delete_project_categories ON project_categories;
CREATE POLICY teacher_delete_project_categories ON project_categories
  FOR DELETE 
  TO authenticated
  USING (
    project_id IN (
      SELECT id
      FROM projects
      WHERE teacher_id IN (
        SELECT tp.id 
        FROM teacher_profiles tp
        JOIN users u ON u.id = tp.user_id
        WHERE u.auth_id = auth.uid() AND u.role = 'teacher'
      ) AND status = 'draft'
    )
  );

-- Allow teachers to view categories
DROP POLICY IF EXISTS teacher_view_categories ON categories;
CREATE POLICY teacher_view_categories ON categories
  FOR SELECT 
  TO authenticated
  USING (TRUE);  -- All authenticated users can view categories

-- Grant permissions on tables
GRANT SELECT, UPDATE ON projects TO authenticated;
GRANT SELECT ON project_reviews TO authenticated;
-- GRANT USAGE ON SEQUENCE projects_id_seq TO authenticated; -- Removed as table uses UUID, not sequence 