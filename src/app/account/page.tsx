'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { supabase } from '../../utils/supabase';

export default function AccountPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      router.push('/auth');
      return;
    }

    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        // First get the user record
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', user.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          setLoading(false);
          return;
        }

        // Now fetch role-specific profile data
        let profileData = { ...userData };
        
        if (userData.role === 'teacher') {
          const { data: teacherProfile, error: teacherError } = await supabase
            .from('teacher_profiles')
            .select('*')
            .eq('user_id', userData.id)
            .single();

          if (!teacherError) {
            profileData = { ...profileData, profile: teacherProfile };
          }
        } else if (userData.role === 'donor') {
          const { data: donorProfile, error: donorError } = await supabase
            .from('donor_profiles')
            .select('*')
            .eq('user_id', userData.id)
            .single();

          if (!donorError) {
            profileData = { ...profileData, profile: donorProfile };
          }
        }

        setProfileData(profileData);
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !profileData) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Account not found</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Please sign in to view your account.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Account</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Personal Information</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="w-full md:w-1/3 text-gray-500 dark:text-gray-400 font-medium">Full Name</div>
            <div className="w-full md:w-2/3 text-gray-900 dark:text-white font-medium">
              {profileData.first_name} {profileData.last_name}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="w-full md:w-1/3 text-gray-500 dark:text-gray-400 font-medium">Email</div>
            <div className="w-full md:w-2/3 text-gray-900 dark:text-white">{profileData.email}</div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="w-full md:w-1/3 text-gray-500 dark:text-gray-400 font-medium">Account Type</div>
            <div className="w-full md:w-2/3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
              </span>
            </div>
          </div>
          
          {profileData.created_at && (
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="w-full md:w-1/3 text-gray-500 dark:text-gray-400 font-medium">Member Since</div>
              <div className="w-full md:w-2/3 text-gray-900 dark:text-white">
                {new Date(profileData.created_at).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Display role-specific information */}
      {profileData.role === 'teacher' && profileData.profile && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Teacher Information</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="w-full md:w-1/3 text-gray-500 dark:text-gray-400 font-medium">School</div>
              <div className="w-full md:w-2/3 text-gray-900 dark:text-white">{profileData.profile.school_name}</div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="w-full md:w-1/3 text-gray-500 dark:text-gray-400 font-medium">Position</div>
              <div className="w-full md:w-2/3 text-gray-900 dark:text-white">{profileData.profile.position_title}</div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="w-full md:w-1/3 text-gray-500 dark:text-gray-400 font-medium">Account Status</div>
              <div className="w-full md:w-2/3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                  ${profileData.profile.account_status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                  {profileData.profile.account_status.charAt(0).toUpperCase() + profileData.profile.account_status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="w-full md:w-1/3 text-gray-500 dark:text-gray-400 font-medium">School Address</div>
              <div className="w-full md:w-2/3 text-gray-900 dark:text-white">
                {profileData.profile.school_address}<br />
                {profileData.profile.school_city}, {profileData.profile.school_state} {profileData.profile.school_postal_code}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {profileData.role === 'donor' && profileData.profile && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Donor Information</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="w-full md:w-1/3 text-gray-500 dark:text-gray-400 font-medium">Total Donations</div>
              <div className="w-full md:w-2/3 text-gray-900 dark:text-white">
                ${profileData.profile.donation_total ? profileData.profile.donation_total.toFixed(2) : '0.00'}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="w-full md:w-1/3 text-gray-500 dark:text-gray-400 font-medium">Projects Supported</div>
              <div className="w-full md:w-2/3 text-gray-900 dark:text-white">{profileData.profile.projects_supported || 0}</div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="w-full md:w-1/3 text-gray-500 dark:text-gray-400 font-medium">Anonymous Donations</div>
              <div className="w-full md:w-2/3 text-gray-900 dark:text-white">
                {profileData.profile.is_anonymous_by_default ? 'Enabled' : 'Disabled'} by default
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="w-full md:w-1/3 text-gray-500 dark:text-gray-400 font-medium">Email Updates</div>
              <div className="w-full md:w-2/3 text-gray-900 dark:text-white">
                {profileData.profile.receives_updates_email ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* <div className="mt-6">
        <button 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Edit Profile
        </button>
      </div> */}
    </div>
  );
} 