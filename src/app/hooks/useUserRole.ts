"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchRole() {
      setLoading(true);
      setError(null);
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        if (isMounted) {
          setError('Not authenticated');
          setRole(null);
          setLoading(false);
        }
        return;
      }
      // Fetch role from users table
      const { data, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      if (isMounted) {
        if (roleError || !data) {
          setError('Could not fetch user role');
          setRole(null);
        } else {
          setRole(data.role);
        }
        setLoading(false);
      }
    }
    fetchRole();
    return () => {
      isMounted = false;
    };
  }, []);

  return { role, loading, error };
} 