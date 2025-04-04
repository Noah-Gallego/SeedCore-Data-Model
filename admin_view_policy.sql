ALTER TABLE project_reviews
ALTER COLUMN reviewer_id DROP NOT NULL;

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
    status,
    notes,
    created_at,
    updated_at
  ) VALUES (
    p_project_id,
    'pending',
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
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'projects' AND policyname = 'teacher_view_own_projects'
    ) THEN
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
        RAISE NOTICE 'Policy teacher_view_own_projects created.';
    ELSE
        RAISE NOTICE 'Policy teacher_view_own_projects already exists.';
    END IF;
END
$$;

-- Policy to allow teachers to update their own projects in draft status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'projects' AND policyname = 'teacher_update_own_draft_projects'
    ) THEN
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
        RAISE NOTICE 'Policy teacher_update_own_draft_projects created.';
    ELSE
        RAISE NOTICE 'Policy teacher_update_own_draft_projects already exists.';
    END IF;
END
$$;

-- Policy to allow teachers to create projects
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'projects' AND policyname = 'teacher_create_projects'
    ) THEN
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
        RAISE NOTICE 'Policy teacher_create_projects created.';
    ELSE
        RAISE NOTICE 'Policy teacher_create_projects already exists.';
    END IF;
END
$$;

-- Policy to allow teachers to view their project reviews
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'project_reviews' AND policyname = 'teacher_view_own_project_reviews'
    ) THEN
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
        RAISE NOTICE 'Policy teacher_view_own_project_reviews created.';
    ELSE
        RAISE NOTICE 'Policy teacher_view_own_project_reviews already exists.';
    END IF;
END
$$;

-- Policies for project categories management
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'project_categories' AND policyname = 'teacher_create_project_categories'
    ) THEN
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
        RAISE NOTICE 'Policy teacher_create_project_categories created.';
    ELSE
        RAISE NOTICE 'Policy teacher_create_project_categories already exists.';
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'project_categories' AND policyname = 'teacher_view_project_categories'
    ) THEN
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
        RAISE NOTICE 'Policy teacher_view_project_categories created.';
    ELSE
        RAISE NOTICE 'Policy teacher_view_project_categories already exists.';
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'project_categories' AND policyname = 'teacher_update_project_categories'
    ) THEN
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
        RAISE NOTICE 'Policy teacher_update_project_categories created.';
    ELSE
        RAISE NOTICE 'Policy teacher_update_project_categories already exists.';
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'project_categories' AND policyname = 'teacher_delete_project_categories'
    ) THEN
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
        RAISE NOTICE 'Policy teacher_delete_project_categories created.';
    ELSE
        RAISE NOTICE 'Policy teacher_delete_project_categories already exists.';
    END IF;
END
$$;

-- Allow teachers to view categories
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'categories' AND policyname = 'teacher_view_categories'
    ) THEN
        CREATE POLICY teacher_view_categories ON categories
          FOR SELECT 
          TO authenticated
          USING (TRUE);  -- All authenticated users can view categories
        RAISE NOTICE 'Policy teacher_view_categories created.';
    ELSE
        RAISE NOTICE 'Policy teacher_view_categories already exists.';
    END IF;
END
$$;

-- Modify check constraint on project_reviews to allow 'pending' status
DO $$
BEGIN
    -- Drop the constraint if it exists
    ALTER TABLE project_reviews
    DROP CONSTRAINT IF EXISTS project_reviews_status_check;

    -- Clean up existing rows with invalid statuses (set them to 'rejected' by default)
    UPDATE project_reviews
    SET status = 'rejected'
    WHERE status IS NULL OR status NOT IN ('pending', 'approved', 'rejected');

    -- Add the constraint with the allowed values
    ALTER TABLE project_reviews
    ADD CONSTRAINT project_reviews_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected'));

    RAISE NOTICE 'Constraint project_reviews_status_check updated to allow ''pending'' status and cleaned invalid rows.';
END
$$;