'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../utils/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [teacherProfileId, setTeacherProfileId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [studentImpact, setStudentImpact] = useState('');
  const [fundingGoal, setFundingGoal] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    checkUserRole();
    fetchCategories();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsTeacher(false);
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
        return;
      }
      
      setIsTeacher(data.role === 'teacher');
      
      if (data.role !== 'teacher') {
        setMessage('You do not have permission to access this page.');
        return;
      }
      
      // Get teacher profile ID
      if (data.teacher_profiles && data.teacher_profiles.id) {
        setTeacherProfileId(data.teacher_profiles.id);
      } else {
        setMessage('Teacher profile not found. Please complete your profile setup.');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsTeacher(false);
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
    
    if (!teacherProfileId) {
      setMessage('Teacher profile not found. Unable to create project.');
      return;
    }
    
    if (!title || !description || !studentImpact || !fundingGoal) {
      setMessage('Please fill out all required fields.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Parse funding goal to ensure it's a number
      const fundingGoalNumber = parseFloat(fundingGoal);
      if (isNaN(fundingGoalNumber) || fundingGoalNumber <= 0) {
        setMessage('Please enter a valid funding goal amount.');
        setLoading(false);
        return;
      }
      
      // Insert the project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          teacher_id: teacherProfileId,
          title,
          description,
          student_impact: studentImpact,
          funding_goal: fundingGoalNumber,
          main_image_url: mainImageUrl || null,
          status: 'draft'
        })
        .select()
        .single();
      
      if (projectError) {
        console.error('Error creating project:', projectError);
        setMessage(`Error: ${projectError.message}`);
        return;
      }
      
      // Add project categories if selected
      if (selectedCategories.length > 0 && projectData) {
        const categoryInserts = selectedCategories.map(categoryId => ({
          project_id: projectData.id,
          category_id: categoryId
        }));
        
        const { error: categoriesError } = await supabase
          .from('project_categories')
          .insert(categoryInserts);
        
        if (categoriesError) {
          console.error('Error adding project categories:', categoriesError);
          // Continue anyway, not critical
        }
      }
      
      setMessage('Project created successfully!');
      
      // Redirect to the project detail page
      setTimeout(() => {
        router.push(`/teacher/projects/${projectData.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error creating project:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (!isTeacher) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700 dark:text-gray-300">{message || 'You do not have permission to access this page.'}</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center mb-8">
          <Link href="/teacher/projects" className="text-blue-600 hover:underline flex items-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 !dark:text-white">Create New Project</h1>
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
                href="/teacher/projects"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 