// src/hooks/usePageTracking.ts
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export const usePageTracking = (category: string) => {
  const { user } = useAuth();

  useEffect(() => {
    if (category) {
      const logVisit = async () => {
        await supabase.from('page_visits').insert({
          category,
          user_id: user?.id || null,
        });
      };
      logVisit();
    }
  }, [category, user]);
};