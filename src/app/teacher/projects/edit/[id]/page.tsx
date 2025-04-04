'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../utils/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [teacherProfileId, setTeacherProfileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [studentImpact, setStudentImpact] = useState('');
  const [fundingGoal, setFundingGoal] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [currentStatus, setCurrentStatus] = useState('');

  useEffect(() => {
    checkAccess();
    fetchCategories();
  }, [params.id]);

  const checkAccess = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsTeacher(false);
        setIsOwner(false);
        setError('You must be logged in to edit projects');
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
        setError('You must be a teacher to edit projects');
        return;
      }
      
      // Get teacher profile ID
      if (!userData.teacher_profiles || !userData.teacher_profiles.id) {
        setError('Teacher profile not found');
        return;
      }
      
      const teacherProfileId = userData.teacher_profiles.id;
      setTeacherProfileId(teacherProfileId);
      
      // Check if this teacher is the owner of the project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          teacher_id,
          title,
          description,
          student_impact,
          funding_goal,
          main_image_url,
          status,
          project_categories(category_id)
        `)
        .eq('id', params.id)
        .single();
      
      if (projectError) {
        console.error('Error checking project ownership:', projectError);
        setError('Error loading project data');
        return;
      }
      
      if (!projectData) {
        setError('Project not found');
        return;
      }
      
      // Check if project is editable (draft status)
      if (projectData.status !== 'draft' && projectData.status !== 'rejected') {
        setError(`Projects in '${projectData.status}' status cannot be edited`);
        return;
      }
      
      const isOwner = projectData.teacher_id === teacherProfileId;
      setIsOwner(isOwner);
      
      if (!isOwner) {
        setError('You do not have permission to edit this project');
        return;
      }
      
      // Populate form with project data
      setTitle(projectData.title);
      setDescription(projectData.description);
      setStudentImpact(projectData.student_impact);
      setFundingGoal(projectData.funding_goal.toString());
      setMainImageUrl(projectData.main_image_url || '');
      setCurrentStatus(projectData.status);
      
      // Set selected categories
      if (projectData.project_categories && projectData.project_categories.length > 0) {
        setSelectedCategories(projectData.project_categories.map((pc: any) => pc.category_id));
      }
      
      // Load the project data
      fetchProject();
    } catch (err) {
      console.error('Error checking access:', err);
      setError('An error occurred while verifying your access');
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          student_impact,
          funding_goal,
          main_image_url,
          status,
          project_categories(category_id)
        `)
        .eq('id', params.id)
        .single();
      
      if (error) {
        console.error('Error fetching project:', error);
        setError('Error loading project data');
        return;
      }
      
      setTitle(data.title);
      setDescription(data.description);
      setStudentImpact(data.student_impact);
      setFundingGoal(data.funding_goal.toString());
      setMainImageUrl(data.main_image_url || '');
      setCurrentStatus(data.status);
      
      // Set selected categories
      if (data.project_categories && data.project_categories.length > 0) {
        setSelectedCategories(data.project_categories.map((pc: any) => pc.category_id));
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to load project data');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isTeacher || !isOwner) {
      setError('You do not have permission to edit this project');
      return;
    }
    
    if (!title || !description || !studentImpact || !fundingGoal) {
      setMessage('Please fill out all required fields.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Parse funding goal to ensure it's a number
      const fundingGoalNumber = parseFloat(fundingGoal);
      if (isNaN(fundingGoalNumber) || fundingGoalNumber <= 0) {
        setMessage('Please enter a valid funding goal amount.');
        setSubmitting(false);
        return;
      }
      
      // Update the project
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          title,
          description,
          student_impact: studentImpact,
          funding_goal: fundingGoalNumber,
          main_image_url: mainImageUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);
      
      if (projectError) {
        console.error('Error updating project:', projectError);
        setMessage(`Error: ${projectError.message}`);
        return;
      }
      
      // Handle category updates
      // First, get current categories
      const { data: currentCategoriesData, error: currentCategoriesError } = await supabase
        .from('project_categories')
        .select('category_id')
        .eq('project_id', params.id);
      
      if (currentCategoriesError) {
        console.error('Error fetching current categories:', currentCategoriesError);
      } else {
        const currentCategoryIds = currentCategoriesData.map((pc: any) => pc.category_id);
        
        // Categories to add
        const categoriesToAdd = selectedCategories.filter(
          id => !currentCategoryIds.includes(id)
        );
        
        // Categories to remove
        const categoriesToRemove = currentCategoryIds.filter(
          id => !selectedCategories.includes(id)
        );
        
        // Add new categories
        if (categoriesToAdd.length > 0) {
          const categoryInserts = categoriesToAdd.map(categoryId => ({
            project_id: params.id,
            category_id: categoryId
          }));
          
          const { error: addCategoriesError } = await supabase
            .from('project_categories')
            .insert(categoryInserts);
          
          if (addCategoriesError) {
            console.error('Error adding project categories:', addCategoriesError);
          }
        }
        
        // Remove categories
        if (categoriesToRemove.length > 0) {
          const { error: removeCategoriesError } = await supabase
            .from('project_categories')
            .delete()
            .eq('project_id', params.id)
            .in('category_id', categoriesToRemove);
          
          if (removeCategoriesError) {
            console.error('Error removing project categories:', removeCategoriesError);
          }
        }
      }
      
      setMessage('Project updated successfully!');
      
      // Redirect back to the project detail page
      setTimeout(() => {
        router.push(`/teacher/projects/${params.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error updating project:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
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
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{error || 'You do not have permission to edit this project.'}</p>
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center mb-8">
          <Link href={`/teacher/projects/${params.id}`} className="text-blue-600 hover:underline flex items-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Project
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Project</h1>
        </div>
        
        {message && (
          <div className={`p-4 mb-6 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Title <span className="text-red-600">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Give your project a descriptive title"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Description <span className="text-red-600">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Describe your project in detail. What will the funds be used for?"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="studentImpact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Student Impact <span className="text-red-600">*</span>
              </label>
              <textarea
                id="studentImpact"
                value={studentImpact}
                onChange={(e) => setStudentImpact(e.target.value)}
                rows={3}
                className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="How will this project benefit your students? How many students will it impact?"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="fundingGoal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Funding Goal <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  id="fundingGoal"
                  type="number"
                  min="1"
                  step="0.01"
                  value={fundingGoal}
                  onChange={(e) => setFundingGoal(e.target.value)}
                  className="block w-full pl-7 pr-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="500.00"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter the total amount needed for your project.</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="mainImageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Main Image URL
              </label>
              <input
                id="mainImageUrl"
                type="url"
                value={mainImageUrl}
                onChange={(e) => setMainImageUrl(e.target.value)}
                className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="https://example.com/image.jpg"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Provide a URL to an image that represents your project.</p>
            </div>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categories
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      id={`category-${category.id}`}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                    />
                    <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Select categories that best describe your project.</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Link
                href={`/teacher/projects/${params.id}`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 