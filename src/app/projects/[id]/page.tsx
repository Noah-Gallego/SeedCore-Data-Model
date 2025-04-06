'use client';

import { useEffect, useState } from 'react';
import { ProjectDetail } from '../../../components/ProjectDetail';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../../components/AuthProvider';
import { useParams } from 'next/navigation';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const { user } = useAuth();
  const [isTeacher, setIsTeacher] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDonor, setIsDonor] = useState(false);
  
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('auth_id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setIsTeacher(data.role === 'teacher');
          setIsAdmin(data.role === 'admin');
          setIsDonor(data.role === 'donor');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };
    
    checkUserRole();
  }, [user]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ProjectDetail 
        projectId={projectId} 
        isTeacher={isTeacher}
        isAdmin={isAdmin}
      />
    </div>
  );
} 