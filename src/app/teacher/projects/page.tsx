'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import Link from 'next/link';
import ProjectActions from '../../../components/ProjectActions';

type Project = {
  id: string;
  title: string;
  description: string;
  funding_goal: number;
  current_funding: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function TeacherProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [teacherProfileId, setTeacherProfileId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    checkUserRole();
  }, []);

  useEffect(() => {
    if (teacherProfileId) {
      fetchProjects();
    }
  }, [teacherProfileId, refreshTrigger]);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsTeacher(false);
        setError('You must be logged in to view this page');
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('users')
        .select(`
          role,
          teacher_profiles(id)
        `)
        .eq('auth_id', user.id)
        .single();
      
      if (error) {
        console.error('Error checking user role:', error);
        setIsTeacher(false);
        setError('Error verifying user role');
        setIsLoading(false);
        return;
      }
      
      setIsTeacher(data.role === 'teacher');
      
      if (data.role !== 'teacher') {
        setError('You must be a teacher to view this page');
        setIsLoading(false);
        return;
      }
      
      // Get teacher profile ID
      if (data.teacher_profiles && data.teacher_profiles.id) {
        setTeacherProfileId(data.teacher_profiles.id);
      } else {
        setError('Teacher profile not found. Please complete your profile setup.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsTeacher(false);
      setError('An error occurred while verifying your account');
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    if (!teacherProfileId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching projects for teacher ID:', teacherProfileId);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('teacher_id', teacherProfileId)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching projects:', error);
        setError(error.message);
        return;
      }
      
      console.log('Projects fetched:', data);
      setProjects(data || []);
    } catch (err) {
      console.error('Error in fetchProjects:', err);
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectUpdated = () => {
    // Trigger a refresh of the projects list
    setRefreshTrigger(prev => prev + 1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
      pending_review: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Review' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      funded: { color: 'bg-blue-100 text-blue-800', text: 'Funded' },
      completed: { color: 'bg-purple-100 text-purple-800', text: 'Completed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
      { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`${config.color} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
        {config.text}
      </span>
    );
  };

  if (!isTeacher) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{error || 'You do not have permission to access this page.'}</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Projects</h1>
          <Link
            href="/teacher/projects/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create New Project
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {projects.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">No Projects Found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven't created any projects yet. Click the button below to create your first project.
                </p>
                <Link
                  href="/teacher/projects/create"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Create Your First Project
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {projects.map(project => (
                  <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{project.title}</h2>
                        {getStatusBadge(project.status)}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {project.description}
                      </p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <span>Goal: ${project.funding_goal}</span>
                          {project.current_funding > 0 && (
                            <span className="ml-2">| Raised: ${project.current_funding}</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(project.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Link
                          href={`/teacher/projects/${project.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          View Details
                        </Link>
                        
                        <div className="flex space-x-2">
                          <Link
                            href={`/teacher/projects/edit/${project.id}`}
                            className="px-3 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                          >
                            Edit
                          </Link>
                          
                          <ProjectActions
                            projectId={project.id}
                            currentStatus={project.status}
                            isTeacher={true}
                            onProjectUpdated={handleProjectUpdated}
                            buttonVariant="small"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 