-- Comprehensive SQL fix for admin project viewing and related tables

-- First, make sure admins can see all projects
CREATE POLICY "Admins can view all projects" 
ON projects 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);

-- Ensure admins can see all teacher profiles
CREATE POLICY "Admins can view all teacher profiles" 
ON teacher_profiles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);

-- Ensure admins can also see user data for teachers
CREATE POLICY "Admins can view all users" 
ON users 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update projects for status changes
CREATE POLICY "Admins can update projects" 
ON projects 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);

-- Check for projects in draft status
SELECT status, COUNT(*) as count
FROM projects
GROUP BY status
ORDER BY status;

-- Let's check if there are projects without valid teacher relations
SELECT p.id, p.title, p.status, p.teacher_id, 
       EXISTS(SELECT 1 FROM teacher_profiles tp WHERE tp.id = p.teacher_id) as has_teacher_profile,
       EXISTS(SELECT 1 FROM teacher_profiles tp JOIN users u ON tp.user_id = u.id WHERE tp.id = p.teacher_id) as has_teacher_user
FROM projects p
WHERE p.status = 'draft'; 