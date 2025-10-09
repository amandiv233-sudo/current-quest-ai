// src/hooks/useUserRole.ts

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs whenever the user object changes.
    if (user) {
      setLoading(true);
      // This is the query that was causing issues.
      // By isolating it here, it will no longer block the entire app from loading.
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error("useUserRole: Error fetching user role:", error);
            setRole('user'); // Default to user on error
          } else {
            setRole(data?.role || 'user');
          }
          setLoading(false);
        });
    } else {
      // If there's no user, the role is null and we are not loading.
      setRole(null);
      setLoading(false);
    }
  }, [user]); // The dependency on `user` is key.

  return { role, loadingRole: loading };
};