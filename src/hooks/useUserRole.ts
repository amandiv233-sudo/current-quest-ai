// src/hooks/useUserRole.ts

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    if (user) {
      setLoadingRole(true);
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error("useUserRole: Error fetching user role:", error);
            setRole('user');
          } else {
            setRole(data?.role || 'user');
          }
          setLoadingRole(false);
        });
    } else {
      setRole(null);
      setLoadingRole(false);
    }
  }, [user]);

  return { role, loadingRole };
};