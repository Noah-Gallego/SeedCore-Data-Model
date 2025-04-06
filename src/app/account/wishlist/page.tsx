'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import { supabase, getDonorProfile, getWishlistedProjects, removeFromWishlist, createDonorProfile } from '../../../utils/supabase';
import Link from 'next/link';

type Project = {
  id: string;
  title: string;
  description: string;
  student_impact: string;
  funding_goal: number;
  current_amount: number;
  main_image_url: string | null;
  status: string;
};

export default function WishlistPage() {
  const { user } = useAuth();
  const [donorId, setDonorId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showDonorSetup, setShowDonorSetup] = useState(false);
  const [creatingDonorProfile, setCreatingDonorProfile] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSetupDonorProfile = async () => {
    if (!user) return;
    
    setCreatingDonorProfile(true);
    
    try {
      const result = await createDonorProfile(user.id);
      
      if (result.success) {
        // Store the donor profile directly from the result
        if (result.donorProfile) {
          setDonorId(result.donorProfile.id);
        }
        // Set user role to donor
        setUserRole('donor');
        // Reload data
        setRefreshTrigger(prev => prev + 1);
        setShowDonorSetup(false);
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
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // First check if user is a donor
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('auth_id', user.id)
          .single();
        
        if (userError) throw userError;
        
        setUserRole(userData?.role || null);
        
        if (userData?.role !== 'donor') {
          setError('This feature is only available for donors.');
          setLoading(false);
          return;
        }
        
        // Check if we already have a donor profile from a previous registration
        const cachedDonorProfile = typeof window !== 'undefined' ? 
          localStorage.getItem(`donor_profile_${user.id}`) : null;
          
        if (cachedDonorProfile) {
          try {
            // Use cached data
            const profile = JSON.parse(cachedDonorProfile);
            console.log("Using cached donor profile:", profile);
            setDonorId(profile.id);
            setShowDonorSetup(false);
            
            // Fetch wishlisted projects
            const { success: projectSuccess, projects: wishlistedProjects } = await getWishlistedProjects(profile.id);
            if (projectSuccess) {
              setProjects(wishlistedProjects);
            }
            setLoading(false);
            return;
          } catch (e) {
            console.error("Error parsing cached donor profile:", e);
            if (typeof window !== 'undefined') {
              localStorage.removeItem(`donor_profile_${user.id}`);
            }
          }
        }
        
        // If no cached profile, fetch from database
        const donorResult = await getDonorProfile(user.id);
        if (donorResult.success && donorResult.exists && donorResult.donorId) {
          setDonorId(donorResult.donorId);
          setShowDonorSetup(false);
          
          // Fetch wishlisted projects
          const { success: projectSuccess, projects: wishlistedProjects } = await getWishlistedProjects(donorResult.donorId);
          if (projectSuccess) {
            setProjects(wishlistedProjects);
          }
        } else {
          setShowDonorSetup(true);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load wishlist');
        console.error('Error loading wishlist:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, refreshTrigger]);
  
  const handleRemoveFromWishlist = async (projectId: string) => {
    if (!donorId) return;
    
    try {
      const result = await removeFromWishlist(donorId, projectId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to remove from wishlist');
      }
      
      // Update the projects list
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Error removing project from wishlist:', err);
      alert('Failed to remove from wishlist. Please try again.');
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Wishlist</h1>
          <p className="mb-6">Please sign in to view your wishlist.</p>
          <Link 
            href="/auth/signin" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <h3 className="text-lg font-medium mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (showDonorSetup) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
      
      {projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium">Your wishlist is empty</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Save projects you're interested in by clicking the heart icon on project pages.
          </p>
          <Link 
            href="/projects" 
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Browse Projects
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Project Image */}
              <Link href={`/projects/${project.id}`}>
                <div className="h-40 overflow-hidden">
                  <img 
                    src={project.main_image_url || '/images/project-placeholder.svg'} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/project-placeholder.svg';
                    }}
                  />
                </div>
              </Link>
              
              <div className="p-4">
                {/* Project Title */}
                <Link href={`/projects/${project.id}`}>
                  <h2 className="text-lg font-semibold mb-2 hover:text-blue-600 transition-colors">{project.title}</h2>
                </Link>
                
                {/* Project Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
                
                {/* Funding Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{formatCurrency(project.current_amount || 0)}</span>
                    <span>Goal: {formatCurrency(project.funding_goal)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${Math.min(((project.current_amount || 0) / project.funding_goal) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={() => handleRemoveFromWishlist(project.id)}
                    className="text-gray-600 hover:text-red-600 transition-colors text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 mr-1">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    Remove
                  </button>
                  
                  <Link 
                    href={`/projects/${project.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    View Project
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 