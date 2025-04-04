'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../utils/supabase';
import Link from 'next/link';
import ProjectDetail from '../../../../components/ProjectDetail';

export default function TeacherProjectPage({ params }: { params: { id: string } }) {
  const [isTeacher, setIsTeacher] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAccess();
  }, [params.id]);

  const checkAccess = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsTeacher(false);
        setIsOwner(false);
        setError('You must be logged in to view this page');
        return;
      }
      
      // Check if user is a teacher
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          role,
          teacher_profiles(id)
        `)
        .eq('auth_id', user.id)
        .single();
      
      if (userError) {
        console.error('Error checking user role:', userError);
        setError('Error verifying user access');
        return;
      }
      
      const isUserTeacher = userData.role === 'teacher';
      setIsTeacher(isUserTeacher);
      
      if (!isUserTeacher) {
        setError('You must be a teacher to access this page');
        return;
      }
      
      // Get teacher profile ID
      if (!userData.teacher_profiles || !userData.teacher_profiles.id) {
        setError('Teacher profile not found');
        return;
      }
      
      const teacherProfileId = userData.teacher_profiles.id;
      
      // Check if this teacher is the owner of the project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('teacher_id')
        .eq('id', params.id)
        .single();
      
      if (projectError && projectError.code !== 'PGRST116') {
        console.error('Error checking project ownership:', projectError);
        setError('Error verifying project access');
        return;
      }
      
      if (!projectData) {
        setError('Project not found');
        return;
      }
      
      const isProjectOwner = projectData.teacher_id === teacherProfileId;
      setIsOwner(isProjectOwner);
      
      if (!isProjectOwner) {
        setError('You do not have permission to view this project');
      }
    } catch (err) {
      console.error('Error checking access:', err);
      setError('An error occurred while verifying your access');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !isTeacher || !isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{error || 'You do not have permission to access this page.'}</p>
            <Link href="/teacher/projects" className="text-blue-600 hover:underline">
              Return to My Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Link 
            href="/teacher/projects" 
            className="text-blue-600 hover:underline flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to My Projects
          </Link>
        </div>
        
        <ProjectDetail 
          projectId={params.id}
          isTeacher={true}
          allowEdit={true}
        />
      </div>
    </div>
  );
} 