-- SQL permissions for teacher project submission functionality

-- Create the submit_project_for_review function if it doesn't exist
CREATE OR REPLACE FUNCTION submit_project_for_review(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check authorization - only allow teachers to submit their own projects
    IF NOT EXISTS (
        SELECT 1 FROM projects p
        JOIN teacher_profiles tp ON p.teacher_id = tp.id
        JOIN users u ON tp.user_id = u.id
        WHERE p.id = p_project_id AND u.auth_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Not authorized to submit this project';
    END IF;
    
    -- Update project status
    UPDATE projects 
    SET status = 'pending_review', updated_at = NOW()
    WHERE id = p_project_id AND status = 'draft';
    
    RETURN FOUND;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION submit_project_for_review TO authenticated;

-- Create policies for teachers to manage their projects

-- 1. Teachers can view their own projects
DROP POLICY IF EXISTS "Teachers can view their own projects" ON projects;
CREATE POLICY "Teachers can view their own projects"
ON projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM teacher_profiles tp
    JOIN users u ON tp.user_id = u.id
    WHERE tp.id = projects.teacher_id AND u.auth_id = auth.uid()
  )
);

-- 2. Teachers can update their draft projects
DROP POLICY IF EXISTS "Teachers can update their draft projects" ON projects;
CREATE POLICY "Teachers can update their draft projects"
ON projects
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM teacher_profiles tp
    JOIN users u ON tp.user_id = u.id
    WHERE tp.id = projects.teacher_id AND u.auth_id = auth.uid() AND projects.status = 'draft'
  )
);

-- 3. Teachers can create new projects
DROP POLICY IF EXISTS "Teachers can create projects" ON projects;
CREATE POLICY "Teachers can create projects"
ON projects
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teacher_profiles tp
    JOIN users u ON tp.user_id = u.id
    WHERE tp.id = projects.teacher_id AND u.auth_id = auth.uid()
  )
);

-- Make sure teachers can view project reviews for their projects
DROP POLICY IF EXISTS "Teachers can view reviews of their projects" ON project_reviews;
CREATE POLICY "Teachers can view reviews of their projects"
ON project_reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN teacher_profiles tp ON p.teacher_id = tp.id
    JOIN users u ON tp.user_id = u.id
    WHERE p.id = project_reviews.project_id AND u.auth_id = auth.uid()
  )
);

-- Grant permissions on tables
GRANT SELECT, UPDATE ON projects TO authenticated;
GRANT SELECT ON project_reviews TO authenticated;
GRANT USAGE ON SEQUENCE projects_id_seq TO authenticated; 