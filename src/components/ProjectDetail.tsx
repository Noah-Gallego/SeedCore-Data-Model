'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import Link from 'next/link';
import ProjectActions from './ProjectActions';

export type ProjectDetailProps = {
  projectId: string;
  isTeacher?: boolean;
  isAdmin?: boolean;
  allowEdit?: boolean;
};

type ProjectData = {
  id: string;
  title: string;
  description: string;
  student_impact: string;
  funding_goal: number;
  current_amount: number;
  status: string;
  main_image_url: string | null;
  created_at: string;
  updated_at: string;
  teacher: {
    id: string;
    display_name: string;
    school: {
      name: string;
      city: string;
      state: string;
    } | null;
  } | null;
  categories: {
    id: string;
    name: string;
  }[];
};

const statusLabels = {
  draft: { text: 'Draft', color: 'bg-gray-100 text-gray-800' },
  pending_review: { text: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
  approved: { text: 'Approved', color: 'bg-green-100 text-green-800' },
  rejected: { text: 'Rejected', color: 'bg-red-100 text-red-800' },
  funded: { text: 'Funded', color: 'bg-blue-100 text-blue-800' },
  completed: { text: 'Completed', color: 'bg-purple-100 text-purple-800' }
};

export default function ProjectDetail({ projectId, isTeacher = false, isAdmin = false, allowEdit = false }: ProjectDetailProps) {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!projectId) return;
    
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Query for the project with related data
        const { data, error } = await supabase
          .from('projects')
          .select(`
            id, title, description, student_impact, funding_goal, current_amount, status, 
            main_image_url, created_at, updated_at,
            teacher_profiles:teacher_id(
              id, user_id,
              school_name, school_city, school_state,
              users:user_id(first_name, last_name)
            ),
            categories:project_categories(
              category:categories(id, name)
            )
          `)
          .eq('id', projectId)
          .single();
        
        if (error) {
          console.error('Error fetching project:', error);
          setError(error.message);
          return;
        }
        
        if (!data) {
          setError('Project not found');
          return;
        }
        
        // Transform data to match expected format
        const formattedData: ProjectData = {
          ...data,
          teacher: data.teacher_profiles ? {
            id: data.teacher_profiles.id,
            display_name: data.teacher_profiles.users ? 
              `${data.teacher_profiles.users.first_name} ${data.teacher_profiles.users.last_name}` :
              'Teacher',
            school: {
              name: data.teacher_profiles.school_name,
              city: data.teacher_profiles.school_city,
              state: data.teacher_profiles.school_state
            }
          } : null,
          categories: data.categories.map((c: any) => ({
            id: c.category.id,
            name: c.category.name
          }))
        };
        
        setProject(formattedData);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId, refreshTrigger]);

  const handleProjectUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <h3 className="text-lg font-medium mb-2">Error Loading Project</h3>
        <p>{error || 'Project not found'}</p>
        <Link href="/teacher/projects" className="text-blue-600 hover:underline mt-2 inline-block">
          Return to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="relative">
        {project.main_image_url ? (
          <div className="h-48 sm:h-64 md:h-80 overflow-hidden">
            <img 
              src={project.main_image_url} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex justify-between items-end">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{project.title}</h1>
            <span className={`${statusLabels[project.status as keyof typeof statusLabels]?.color || 'bg-gray-100 text-gray-800'} text-xs font-medium px-2.5 py-1 rounded-full`}>
              {statusLabels[project.status as keyof typeof statusLabels]?.text || project.status}
            </span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Teacher & School Info */}
        {project.teacher && (
          <div className="mb-6 flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400">
            <div className="mr-4 mb-2">
              <span className="font-medium">Teacher:</span> {project.teacher.display_name}
            </div>
            {project.teacher.school && (
              <div className="mb-2">
                <span className="font-medium">School:</span> {project.teacher.school.name}, {project.teacher.school.city}, {project.teacher.school.state}
              </div>
            )}
          </div>
        )}
        
        {/* Funding Progress */}
        <div className="mb-6">
          <div className="flex justify-between mb-1 text-sm font-medium">
            <span>${project.current_amount || 0} raised</span>
            <span>Goal: ${project.funding_goal}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${Math.min(((project.current_amount || 0) / project.funding_goal) * 100, 100)}%` }}
            ></div>
          </div>
          {project.status === 'approved' && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {Math.round(((project.current_amount || 0) / project.funding_goal) * 100)}% funded
            </div>
          )}
        </div>
        
        {/* Categories */}
        {project.categories && project.categories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {project.categories.map(category => (
                <span 
                  key={category.id} 
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300"
                >
                  {category.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {project.description}
          </div>
        </div>
        
        {/* Student Impact */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Student Impact</h3>
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {project.student_impact}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-0">
              <div>Created: {new Date(project.created_at).toLocaleDateString()}</div>
              <div>Last updated: {new Date(project.updated_at).toLocaleDateString()}</div>
            </div>
            
            <div className="flex space-x-3">
              {isTeacher && allowEdit && (
                <Link 
                  href={`/teacher/projects/edit/${project.id}`}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  Edit Project
                </Link>
              )}
              
              <ProjectActions 
                projectId={project.id} 
                currentStatus={project.status} 
                isTeacher={isTeacher}
                isAdmin={isAdmin}
                onProjectUpdated={handleProjectUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 