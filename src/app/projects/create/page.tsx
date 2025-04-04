'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/AuthProvider';
import { supabase } from '../../../utils/supabase';
import Link from 'next/link';

type Category = {
  id: string;
  name: string;
  description?: string;
};

export default function CreateProjectPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [studentImpact, setStudentImpact] = useState('');
  const [fundingGoal, setFundingGoal] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Check if user is a teacher and get their profile
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;

      try {
        // First, check user's role
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, role')
          .eq('auth_id', user.id)
          .single();

        if (userError) throw userError;
        
        if (userData.role !== 'teacher') {
          setIsTeacher(false);
          return;
        }

        setIsTeacher(true);

        // Get teacher profile
        const { data: teacherData, error: teacherError } = await supabase
          .from('teacher_profiles')
          .select('*')
          .eq('user_id', userData.id)
          .single();

        if (teacherError) throw teacherError;
        
        setTeacherProfile(teacherData);

        // Fetch available categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, description')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (categoriesError) throw categoriesError;
        
        setCategories(categoriesData || []);
      } catch (error: any) {
        console.error('Error checking user role:', error);
        setError(error.message);
      }
    };

    if (user) {
      checkUserRole();
    }
  }, [user]);

  // Redirect if not a teacher or not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isTeacher || !teacherProfile) {
      setError('You must be a teacher to create projects');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: teacherProfile.id,
          title,
          description,
          studentImpact,
          fundingGoal: parseFloat(fundingGoal),
          endDate: endDate || null,
          mainImageUrl: mainImageUrl || null,
          categories: selectedCategories,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project');
      }

      setSuccess(true);
      
      // Reset form
      setTitle('');
      setDescription('');
      setStudentImpact('');
      setFundingGoal('');
      setEndDate('');
      setMainImageUrl('');
      setSelectedCategories([]);

      // Redirect to project dashboard or projects page after a delay
      setTimeout(() => {
        router.push('/projects');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isTeacher && user) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-8 text-center border border-yellow-200 dark:border-yellow-800 shadow-sm">
        <svg className="h-16 w-16 text-yellow-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-xl font-medium text-yellow-800 dark:text-yellow-300 mb-2">Teacher Account Required</h3>
        <p className="mb-6 text-yellow-700 dark:text-yellow-400">
          You need a teacher account to create projects. Please contact us to upgrade your account.
        </p>
        <Link 
          href="/projects" 
          className="px-4 py-2 bg-white text-yellow-700 rounded-lg border border-yellow-300 hover:bg-yellow-50 transition"
        >
          Browse Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Project</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your classroom needs and inspire donors to support your students
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg">
          <div className="flex">
            <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg">
          <div className="flex">
            <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Project created successfully! Redirecting...</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="E.g., New Science Lab Equipment"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="block w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe your project in detail. What do you need and why?"
              required
            />
          </div>

          <div>
            <label htmlFor="studentImpact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Student Impact *
            </label>
            <textarea
              id="studentImpact"
              value={studentImpact}
              onChange={(e) => setStudentImpact(e.target.value)}
              rows={3}
              className="block w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="How will this project benefit your students? How many students will it impact?"
              required
            />
          </div>

          <div>
            <label htmlFor="fundingGoal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Funding Goal (USD) *
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
                className="block w-full pl-8 pr-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="1000.00"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date (Optional)
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="block w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              When do you need this funding by? Leave blank if there's no specific deadline.
            </p>
          </div>

          <div>
            <label htmlFor="mainImageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Image URL (Optional)
            </label>
            <input
              id="mainImageUrl"
              type="url"
              value={mainImageUrl}
              onChange={(e) => setMainImageUrl(e.target.value)}
              className="block w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="https://example.com/image.jpg"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Add a URL to an image that represents your project.
            </p>
          </div>

          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categories (Optional)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      id={`category-${category.id}`}
                      type="checkbox"
                      value={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category.id]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading || success}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading || success
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : success ? (
                'Project Created!'
              ) : (
                'Create Project'
              )}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              All projects will be reviewed before becoming active.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
} 