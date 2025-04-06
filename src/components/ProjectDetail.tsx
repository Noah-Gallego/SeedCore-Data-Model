'use client';

import { useState, useEffect } from 'react';
import { supabase, isProjectInWishlist, addToWishlist, removeFromWishlist, getDonorProfile, createDonorProfile } from '../utils/supabase';
import Link from 'next/link';
import ProjectActions from './ProjectActions';
import { useAuth } from './AuthProvider';

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

export function ProjectDetail({ projectId, isTeacher = false, isAdmin = false, allowEdit = false }: ProjectDetailProps) {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [donorId, setDonorId] = useState<string | null>(null);
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showDonorSetup, setShowDonorSetup] = useState(false);
  const [creatingDonorProfile, setCreatingDonorProfile] = useState(false);
  const [donorProfile, setDonorProfile] = useState<{ id: string; userId: string } | null>(null);
  const [hasDonorProfile, setHasDonorProfile] = useState(false);

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
        let teacherData = null;
        
        if (data.teacher_profiles) {
          let profileId = null;
          let schoolName = '';
          let schoolCity = '';
          let schoolState = '';
          let displayName = 'Teacher';
          
          // Extract profile data safely
          if (Array.isArray(data.teacher_profiles) && data.teacher_profiles.length > 0) {
            const profile: any = data.teacher_profiles[0];
            profileId = profile.id;
            schoolName = profile.school_name || '';
            schoolCity = profile.school_city || '';
            schoolState = profile.school_state || '';
            // Try to get display name from related user
            if (profile.users && typeof profile.users === 'object') {
              const firstName = profile.users.first_name || '';
              const lastName = profile.users.last_name || '';
              if (firstName || lastName) {
                displayName = `${firstName} ${lastName}`.trim();
              }
            }
          } else if (typeof data.teacher_profiles === 'object' && 'id' in data.teacher_profiles) {
            const profile: any = data.teacher_profiles;
            profileId = profile.id;
            schoolName = profile.school_name || '';
            schoolCity = profile.school_city || '';
            schoolState = profile.school_state || '';
            // Try to get display name from related user
            if (profile.users && typeof profile.users === 'object') {
              const firstName = profile.users.first_name || '';
              const lastName = profile.users.last_name || '';
              if (firstName || lastName) {
                displayName = `${firstName} ${lastName}`.trim();
              }
            }
          }
          
          if (profileId) {
            teacherData = {
              id: profileId,
              display_name: displayName,
              school: {
                name: schoolName,
                city: schoolCity,
                state: schoolState
              }
            };
          }
        }
        
        const formattedData: ProjectData = {
          ...data,
          teacher: teacherData,
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

  const handleSetupDonorProfile = async () => {
    if (!user) return;
    
    setCreatingDonorProfile(true);
    
    try {
      const result = await createDonorProfile(user.id);
      
      if (result.success) {
        // Store the donor profile directly from the result instead of fetching again
        if (result.donorProfile) {
          const profileData = {
            id: result.donorProfile.id,
            userId: result.donorProfile.user_id
          };
          setDonorProfile(profileData);
          setDonorId(profileData.id);
          
          // Force persist to localStorage for extra reliability
          if (typeof window !== 'undefined') {
            localStorage.setItem(`donor_profile_${user.id}`, JSON.stringify(result.donorProfile));
            // Set a flag to remember registration was completed
            localStorage.setItem(`donor_setup_completed_${user.id}`, 'true');
          }
        }
        // Set user role to donor
        setUserRole('donor');
        // Set state to mark setup as completed
        setHasDonorProfile(true);
        setShowDonorSetup(false);
        // Reload page data
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert('Error creating donor profile: ' + result.error);
      }
    } catch (error) {
      console.error('Error setting up donor profile:', error);
      alert('Error setting up donor profile. Please try again.');
    } finally {
      setCreatingDonorProfile(false);
    }
  };

  useEffect(() => {
    const checkUserState = async () => {
      if (user) {
        setLoading(true);
        
        try {
          // First check for direct setup completed flag
          const setupCompleted = typeof window !== 'undefined' ? 
            localStorage.getItem(`donor_setup_completed_${user.id}`) === 'true' : false;
            
          if (setupCompleted) {
            console.log('Donor setup previously completed, loading from localStorage');
            setHasDonorProfile(true);
            setShowDonorSetup(false);
          }
          
          // Fetch user role first
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('auth_id', user.id)
            .single();
            
          if (userError) {
            console.error('Error fetching user role:', userError);
          } else {
            setUserRole(userData?.role || null);
          }
          
          // Check if user has donor profile
          if (donorProfile) {
            // Use the already stored donor profile
            console.log('Using stored donor profile state');
            setDonorId(donorProfile.id);
            setHasDonorProfile(true);
            setShowDonorSetup(false);
          } else {
            // First check localStorage for cached profile before making a database call
            let cachedProfile = null;
            if (typeof window !== 'undefined') {
              const cachedData = localStorage.getItem(`donor_profile_${user.id}`);
              if (cachedData) {
                try {
                  cachedProfile = JSON.parse(cachedData);
                  console.log('Using cached donor profile from localStorage:', cachedProfile);
                } catch (e) {
                  console.error('Error parsing cached profile:', e);
                }
              }
            }
            
            if (cachedProfile) {
              setDonorProfile({
                id: cachedProfile.id,
                userId: cachedProfile.user_id
              });
              setDonorId(cachedProfile.id);
              setHasDonorProfile(true);
              setShowDonorSetup(false);
            } else {
              // If no cached profile, check database
              const profileResult = await getDonorProfile(user.id);
              
              if (profileResult.success && profileResult.exists) {
                setDonorId(profileResult.donorId);
                setHasDonorProfile(true);
                setShowDonorSetup(false);
                
                // Save to local state as well
                if (profileResult.donorId) {
                  setDonorProfile({
                    id: profileResult.donorId,
                    userId: user.id
                  });
                }
              } else if (setupCompleted) {
                // Treat as if the user has a profile if setup was marked as completed
                console.log('Donor setup was previously completed but profile not found');
                setHasDonorProfile(true);
                setShowDonorSetup(false);
              } else {
                console.log('Donor profile not found or not set up properly');
                setHasDonorProfile(false);
                setShowDonorSetup(true);
              }
            }
          }
          
          // Check if project is in wishlist if we have a donor profile
          if (donorId && projectId) {
            const wishlistResult = await isProjectInWishlist(donorId, projectId);
            setIsInWishlist(wishlistResult.inWishlist);
          }
          
        } catch (error) {
          console.error('Error checking user state:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkUserState();
  }, [user, projectId, donorId, refreshTrigger, donorProfile]);

  const handleProjectUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      alert('Please sign in to add projects to your wishlist');
      return;
    }
    
    if (userRole !== 'donor') {
      alert('Only donors can add projects to their wishlist');
      return;
    }
    
    // Double-check for donor setup completion flag
    const setupCompleted = typeof window !== 'undefined' ? 
      localStorage.getItem(`donor_setup_completed_${user.id}`) === 'true' : false;
      
    // Check if we need donor setup
    if (!donorId) {
      // If we previously completed setup but don't have a donorId, try to retrieve it again
      if (setupCompleted) {
        const cachedData = localStorage.getItem(`donor_profile_${user.id}`);
        if (cachedData) {
          try {
            const cachedProfile = JSON.parse(cachedData);
            if (cachedProfile && cachedProfile.id) {
              setDonorProfile({
                id: cachedProfile.id,
                userId: cachedProfile.user_id
              });
              setDonorId(cachedProfile.id);
              setHasDonorProfile(true);
              // Now try to continue with the wishlist toggle
              setTimeout(() => handleWishlistToggle(), 100);
              return;
            }
          } catch (e) {
            console.error('Error parsing cached profile during wishlist toggle:', e);
          }
        }
      }
      
      // Try to directly create a donor profile instead of showing the setup modal
      try {
        setWishlistLoading(true);
        console.log('No donor ID found, attempting to create a donor profile automatically');
        const result = await createDonorProfile(user.id);
        
        if (result.success && result.donorProfile) {
          const profileData = {
            id: result.donorProfile.id,
            userId: result.donorProfile.user_id || user.id
          };
          setDonorProfile(profileData);
          setDonorId(profileData.id);
          setHasDonorProfile(true);
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(`donor_profile_${user.id}`, JSON.stringify(result.donorProfile));
            localStorage.setItem(`donor_setup_completed_${user.id}`, 'true');
          }
          
          // Now continue with the wishlist operation
          setTimeout(() => handleWishlistToggle(), 100);
          return;
        } else {
          // If automatic creation fails, show the setup screen
          alert('Please complete donor registration to use wishlist features.');
          setShowDonorSetup(true);
          return;
        }
      } catch (error) {
        console.error('Error automatically creating donor profile:', error);
        alert('Please complete donor registration to use wishlist features.');
        setShowDonorSetup(true);
        return;
      } finally {
        setWishlistLoading(false);
      }
    }
    
    setWishlistLoading(true);
    
    try {
      if (isInWishlist) {
        // Try to remove from wishlist
        const result = await removeFromWishlist(donorId, projectId);
        if (result.success) {
          setIsInWishlist(false);
          // No need to show any confirmation for removal
        } else {
          console.error('Error removing from wishlist:', result.error);
          throw new Error(result.error || 'Failed to remove from wishlist');
        }
      } else {
        // Try to add to wishlist
        const result = await addToWishlist(donorId, projectId);
        if (result.success) {
          setIsInWishlist(true);
          // Success message (optional)
          // alert('Project added to your wishlist!');
        } else {
          console.error('Error adding to wishlist:', result.error);
          throw new Error(result.error || 'Failed to add to wishlist');
        }
      }
    } catch (error: any) {
      console.error('Error toggling wishlist:', error);
      
      // Check for RLS policy violation
      if (error.message && error.message.includes('row-level security')) {
        console.warn('RLS policy violation detected - donor profile may not match auth user');
        
        // Clear current profile data
        setDonorProfile(null);
        setDonorId(null);
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`donor_profile_${user.id}`);
        }
        
        // Get the correct donor profile directly based on auth user
        try {
          const { data: correctProfile, error: profileError } = await supabase
            .from('donor_profiles')
            .select('id, user_id')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error('Error finding correct donor profile:', profileError);
            throw new Error('Unable to find correct donor profile');
          }
          
          if (correctProfile) {
            console.log('Found correct donor profile for auth user:', correctProfile);
            
            // Update profile data
            setDonorProfile({
              id: correctProfile.id,
              userId: correctProfile.user_id
            });
            setDonorId(correctProfile.id);
            
            // Save to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem(`donor_profile_${user.id}`, JSON.stringify(correctProfile));
              localStorage.setItem(`donor_setup_completed_${user.id}`, 'true');
            }
            
            // Try wishlist operation again
            alert('Please try adding to wishlist again.');
            setWishlistLoading(false);
            return;
          }
        } catch (profileError) {
          console.error('Error finding correct profile:', profileError);
        }
        
        // If we get here, we need to create a new profile
        try {
          // Create a new profile
          const result = await createDonorProfile(user.id);
          
          if (result.success && result.donorProfile) {
            const profileData = {
              id: result.donorProfile.id,
              userId: result.donorProfile.user_id || user.id
            };
            setDonorProfile(profileData);
            setDonorId(profileData.id);
            setHasDonorProfile(true);
            
            // Save to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem(`donor_profile_${user.id}`, JSON.stringify(result.donorProfile));
              localStorage.setItem(`donor_setup_completed_${user.id}`, 'true');
            }
            
            // Try again
            alert('Please try adding to wishlist again.');
            return;
          }
        } catch (recreationError) {
          console.error('Error recreating donor profile for RLS issue:', recreationError);
        }
        
        alert('There was an issue with your donor profile permissions. Please try again later.');
        return;
      }
      
      // Handle donor profile mismatch
      if (error.message === 'donor_profile_mismatch') {
        console.warn('Donor profile mismatch detected, trying to find correct profile');
        
        // Clear existing profile
        setDonorProfile(null);
        setDonorId(null);
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`donor_profile_${user.id}`);
        }
        
        // Find correct profile
        const profileResult = await getDonorProfile(user.id);
        
        if (profileResult.success && profileResult.exists) {
          console.log('Found correct donor profile from getDonorProfile:', profileResult);
          setDonorId(profileResult.donorId);
          setDonorProfile({
            id: profileResult.donorId,
            userId: user.id
          });
          
          // Try again
          alert('Please try adding to wishlist again.');
          return;
        }
        
        // If we get here, we need to recreate the profile
        try {
          const result = await createDonorProfile(user.id);
          
          if (result.success && result.donorProfile) {
            const profileData = {
              id: result.donorProfile.id,
              userId: result.donorProfile.user_id || user.id
            };
            setDonorProfile(profileData);
            setDonorId(profileData.id);
            setHasDonorProfile(true);
            
            // Save to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem(`donor_profile_${user.id}`, JSON.stringify(result.donorProfile));
              localStorage.setItem(`donor_setup_completed_${user.id}`, 'true');
            }
            
            // Try again
            alert('Please try adding to wishlist again.');
            return;
          }
        } catch (recreationError) {
          console.error('Error recreating donor profile for mismatch:', recreationError);
        }
        
        alert('There was an issue with your donor profile. Please try again later.');
        return;
      }
      
      // Check for our special error indicating an invalid donor profile
      if (error.message === 'donor_profile_invalid') {
        console.warn('Invalid donor profile detected, attempting to recreate it');
        
        // Try to recreate the donor profile
        try {
          // Clear existing profile data
          setDonorProfile(null);
          setDonorId(null);
          
          if (typeof window !== 'undefined') {
            localStorage.removeItem(`donor_profile_${user.id}`);
          }
          
          // Create a new profile
          const result = await createDonorProfile(user.id);
          
          if (result.success && result.donorProfile) {
            const profileData = {
              id: result.donorProfile.id,
              userId: result.donorProfile.user_id || user.id
            };
            setDonorProfile(profileData);
            setDonorId(profileData.id);
            setHasDonorProfile(true);
            
            // Save to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem(`donor_profile_${user.id}`, JSON.stringify(result.donorProfile));
              localStorage.setItem(`donor_setup_completed_${user.id}`, 'true');
            }
            
            // Try the wishlist operation again
            setTimeout(() => handleWishlistToggle(), 100);
            return;
          } else {
            // If recreation fails, show the setup screen
            setHasDonorProfile(false);
            if (typeof window !== 'undefined') {
              localStorage.removeItem(`donor_setup_completed_${user.id}`);
            }
            setShowDonorSetup(true);
            alert('Your donor profile needs to be set up again. Please complete the registration.');
          }
        } catch (recreationError) {
          console.error('Error recreating donor profile:', recreationError);
          setHasDonorProfile(false);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(`donor_setup_completed_${user.id}`);
          }
          setShowDonorSetup(true);
          alert('Your donor profile needs to be set up again. Please complete the registration.');
        }
        return;
      }
      
      // Check for specific errors that might require donor setup
      if (error.message && (
        error.message.includes('profile') || 
        error.message.includes('donor') || 
        error.message.includes('permission')
      )) {
        const shouldPrompt = !setupCompleted; // Only prompt if we haven't completed setup
        
        if (shouldPrompt) {
          alert('Please complete your donor profile setup to use wishlist features.');
          setShowDonorSetup(true);
        } else {
          // If we've already completed setup but still got an error, show a generic message
          alert('Error updating wishlist. Please try again later.');
        }
      } else {
        alert('Error updating wishlist. Please try again later.');
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  // Function to get a deterministic color based on the teacher's name
  const getAvatarColor = (name: string) => {
    // List of background colors for the avatars
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500',
      'bg-yellow-500', 'bg-teal-500', 'bg-orange-500'
    ];
    
    // Use the sum of character codes to select a color
    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  // Function to get the initial of teacher's name
  const getInitial = (name: string) => {
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : 'T';
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

  // Donor Setup Message
  const DonorSetupMessage = () => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">Complete your donor setup</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>You need to complete your donor registration to use features like wishlists and donations.</p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleSetupDonorProfile}
              disabled={creatingDonorProfile}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {creatingDonorProfile ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Setting up...
                </>
              ) : (
                'Complete Donor Registration'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
          <div className="mb-6 flex items-center text-sm text-gray-600 dark:text-gray-400">
            <div className="mr-4 flex items-center">
              <div className={`w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0 border border-gray-200 flex items-center justify-center text-white font-medium text-lg ${getAvatarColor(project.teacher.display_name)}`}>
                {getInitial(project.teacher.display_name)}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {project.teacher.display_name}
                </div>
                {project.teacher.school && (
                  <div>
                    {project.teacher.school.name}, {project.teacher.school.city}, {project.teacher.school.state}
                  </div>
                )}
              </div>
            </div>
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
        
        {/* Donor Setup Message */}
        {showDonorSetup && userRole === 'donor' && <DonorSetupMessage />}
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading || showDonorSetup}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              showDonorSetup 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : isInWishlist
                  ? 'bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={isInWishlist ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            {isInWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
          </button>

          {/* View Wishlist link */}
          {userRole === 'donor' && hasDonorProfile && !showDonorSetup && (
            <Link
              href="/account/wishlist"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 !hover:text-white dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z"
                />
              </svg>
              View My Wishlist
            </Link>
          )}

          {/* Donate button */}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            onClick={() => {
              // Donation logic (to be implemented)
              alert('Donation functionality would go here');
            }}
          >
            Donate Now
          </button>
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

// Keep default export for backward compatibility
export default ProjectDetail; 