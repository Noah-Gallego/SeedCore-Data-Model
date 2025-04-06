'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export default function CheckDatabase() {
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);
  const [hasDonors, setHasDonors] = useState<boolean | null>(null);
  const [hasTeachers, setHasTeachers] = useState<boolean | null>(null);
  const [hasCategories, setHasCategories] = useState<boolean | null>(null);
  const [hasProjects, setHasProjects] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCheckingDatabase, setIsCheckingDatabase] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkTables = async () => {
      try {
        // Set a timeout to prevent blocking indefinitely
        const timeoutPromise = new Promise<void>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Database connection timed out after 5 seconds'));
          }, 5000);
        });

        // Check users table with a timeout
        const checkUsersPromise = async () => {
          const { error: usersError } = await supabase
            .from('users')
            .select('id')
            .limit(1);
          
          if (isMounted) {
            setHasUsers(!usersError);
            if (usersError) {
              console.error('Error checking users table:', usersError);
              setError(usersError.message);
            }
          }

          // Check other tables
          if (isMounted && !usersError) {
            // Check donor_profiles table
            const { error: donorsError } = await supabase
              .from('donor_profiles')
              .select('id')
              .limit(1);
            
            setHasDonors(!donorsError);
            
            // Check teacher_profiles table
            const { error: teachersError } = await supabase
              .from('teacher_profiles')
              .select('id')
              .limit(1);
            
            setHasTeachers(!teachersError);
            
            // Check categories table
            const { error: categoriesError } = await supabase
              .from('categories')
              .select('id')
              .limit(1);
            
            setHasCategories(!categoriesError);
            
            // Check projects table
            const { error: projectsError } = await supabase
              .from('projects')
              .select('id')
              .limit(1);
            
            setHasProjects(!projectsError);
          }
        };

        // Race between timeout and database check
        await Promise.race([checkUsersPromise(), timeoutPromise]);
      } catch (err: any) {
        if (isMounted) {
          console.error('Exception when checking database:', err);
          setError(err.message);
          // Set all states to false on timeout
          setHasUsers(false);
          setHasDonors(false);
          setHasTeachers(false);
          setHasCategories(false);
          setHasProjects(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingDatabase(false);
          clearTimeout(timeoutId);
        }
      }
    };

    checkTables();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // If still checking, show a minimal loading indicator
  if (isCheckingDatabase) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Checking database...</p>
        </div>
      </div>
    );
  }

  const allTablesExist = hasUsers && hasDonors && hasTeachers && hasCategories && hasProjects;

  if (hasUsers === null) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking database setup...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return <span className="flex h-2.5 w-2.5 bg-gray-400 rounded-full"></span>;
    if (status) return <span className="flex h-2.5 w-2.5 bg-green-500 rounded-full"></span>;
    return <span className="flex h-2.5 w-2.5 bg-red-500 rounded-full"></span>;
  };

  return (
    <div className={`p-4 ${allTablesExist ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'} rounded-lg transition-all duration-300`}>
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          {allTablesExist ? (
            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          <h3 className={`font-medium ${allTablesExist ? 'text-green-800 dark:text-green-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
            {allTablesExist ? 'Database is properly configured' : 'Database configuration incomplete'}
          </h3>
        </div>
        <svg 
          className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-6">{getStatusBadge(hasUsers)}</div>
            <p className="text-gray-700 dark:text-gray-300">Users table</p>
          </div>
          <div className="flex items-center">
            <div className="w-6">{getStatusBadge(hasDonors)}</div>
            <p className="text-gray-700 dark:text-gray-300">Donor profiles table</p>
          </div>
          <div className="flex items-center">
            <div className="w-6">{getStatusBadge(hasTeachers)}</div>
            <p className="text-gray-700 dark:text-gray-300">Teacher profiles table</p>
          </div>
          <div className="flex items-center">
            <div className="w-6">{getStatusBadge(hasCategories)}</div>
            <p className="text-gray-700 dark:text-gray-300">Categories table</p>
          </div>
          <div className="flex items-center">
            <div className="w-6">{getStatusBadge(hasProjects)}</div>
            <p className="text-gray-700 dark:text-gray-300">Projects table</p>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg">
              <div className="flex">
                <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Error:</p>
                  <p className="text-sm">{error}</p>
                  <p className="mt-2 text-sm">
                    Please run the SQL scripts in the Supabase dashboard to set up the database.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 