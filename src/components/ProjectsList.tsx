'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthProvider';
import Link from 'next/link';
import './ProjectsGrid.css';

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

interface ProjectsListProps {
  searchQuery?: string;
  categoryFilter?: string;
}

export default function ProjectsList({ searchQuery = '', categoryFilter = 'all' }: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if user prefers dark mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);
    
    // Listen for changes to the color scheme preference
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select(`
            id, 
            title, 
            description, 
            student_impact, 
            funding_goal, 
            current_amount, 
            main_image_url,
            status
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects(data || []);
        setFilteredProjects(data || []);
      } catch (error: any) {
        console.error('Error fetching projects:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter projects when search query or category changes
  useEffect(() => {
    if (!projects.length) return;
    
    let filtered = [...projects];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(query) || 
        project.description.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter (this is a placeholder since we don't have categories in the data yet)
    if (categoryFilter && categoryFilter !== 'all') {
      // In a real implementation, you would filter by category
      // filtered = filtered.filter(project => project.category === categoryFilter);
    }
    
    setFilteredProjects(filtered);
  }, [searchQuery, categoryFilter, projects]);

  const handleDonate = async (projectId: string) => {
    if (!user) {
      alert('Please sign in to donate');
      return;
    }
    
    // This would be replaced with a proper donation flow using Stripe
    alert(`Donation functionality would be implemented with Stripe for project ${projectId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (filteredProjects.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="mx-auto h-24 w-24 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No projects found</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {searchQuery ? 'Try adjusting your search or filter criteria.' : 'Check back soon for new projects!'}
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Default image to use when a project has no image, based on color scheme
  const defaultImageUrl = darkMode
    ? "/images/project-placeholder-dark.svg"
    : "/images/project-placeholder.svg";

  // Handle image error by replacing with default image
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = defaultImageUrl;
    e.currentTarget.onerror = null; // Prevent infinite loops
  };

  return (
    <div className="projects-grid">
      {filteredProjects.map((project) => (
        <Link 
          href={`/projects/${project.id}`} 
          key={project.id} 
          className="card project-card"
        >
          <div className="project-image-container">
            <img
              src={project.main_image_url || defaultImageUrl}
              alt={project.title || "Educational project"}
              onError={handleImageError}
            />
            <div className="project-funding-badge">
              {Math.round((project.current_amount / project.funding_goal) * 100)}% Funded
            </div>
          </div>
          
          <div className="project-content">
            <h3 className="project-title">
              {project.title || "Untitled Project"}
            </h3>
            <p className="project-description">
              {project.description || "Help support this educational project for students."}
            </p>
            
            <div className="project-progress">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Progress</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formatCurrency(project.current_amount)} <span className="mx-1">of</span> {formatCurrency(project.funding_goal)}
                </span>
              </div>
              <div className="project-progress-bar-container">
                <div
                  className="project-progress-bar"
                  style={{
                    width: `${Math.min(
                      (project.current_amount / project.funding_goal) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
            
            <div className="project-impact">
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm1-6a1 1 0 11-2 0 1 1 0 012 0zm-1-4a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="line-clamp-1">{project.student_impact || "Impact students with this project"}</span>
            </div>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDonate(project.id);
              }}
              className="btn btn-primary project-donate-button"
            >
              Donate Now
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
} 