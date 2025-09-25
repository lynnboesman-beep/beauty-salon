'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface UseAdminCheckReturn {
  isAdmin: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

export function useAdminCheck(): UseAdminCheckReturn {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`);
        }

        if (!session) {
          setError('Not authenticated');
          setUser(null);
          setIsAdmin(false);
          return;
        }

        setUser(session.user);

        // Check if user is in staff table with admin role
        const { data: staffMember, error: staffError } = await supabase
          .from('staff')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (staffError) {
          // If error is because user is not found in staff table
          if (staffError.code === 'PGRST116') {
            setError('User is not a staff member');
            setIsAdmin(false);
            return;
          }
          throw new Error(`Staff lookup error: ${staffError.message}`);
        }

        // Check if user has admin role
        if (staffMember && staffMember.role === 'admin') {
          setIsAdmin(true);
        } else {
          setError('User does not have admin privileges');
          setIsAdmin(false);
        }

      } catch (err) {
        console.error('Admin check error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsAdmin(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check
    checkAdminStatus();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        setError(null);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' && session) {
        checkAdminStatus();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    isAdmin,
    isLoading,
    user,
    error
  };
}

// Hook for admin-protected pages that automatically redirects non-admins
export function useAdminProtection(): UseAdminCheckReturn {
  const router = useRouter();
  const adminCheck = useAdminCheck();

  useEffect(() => {
    if (!adminCheck.isLoading && !adminCheck.isAdmin) {
      // Redirect to login with a return URL
      router.push('/login?message=admin_required&redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [adminCheck.isAdmin, adminCheck.isLoading, router]);

  return adminCheck;
}