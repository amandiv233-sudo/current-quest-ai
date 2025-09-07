import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CurrentAffair {
  id: string;
  title: string;
  summary: string;
  content?: string;
  category: string;
  subcategory?: string;
  source: string;
  source_url?: string;
  image_url?: string;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  exam_relevance?: string[];
  published_at: string;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  view_count: number;
}

export const useCurrentAffairs = (category?: string, limit = 20) => {
  const [articles, setArticles] = useState<CurrentAffair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('current_affairs')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      setArticles((data || []) as CurrentAffair[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
      console.error('Error fetching current affairs:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      console.log('Triggering current affairs refresh...');
      
      const { data, error } = await supabase.functions.invoke('fetch-current-affairs', {
        body: {}
      });

      if (error) {
        console.error('Error refreshing data:', error);
        throw error;
      }

      console.log('Data refresh response:', data);
      
      // Refetch articles after refresh
      await fetchArticles();
      
      return data;
    } catch (err) {
      console.error('Failed to refresh current affairs:', err);
      throw err;
    }
  };

  const incrementViewCount = async (articleId: string) => {
    try {
      await supabase.rpc('increment_view_count', { article_id: articleId });
      
      // Update local state
      setArticles(prev => 
        prev.map(article => 
          article.id === articleId 
            ? { ...article, view_count: article.view_count + 1 }
            : article
        )
      );
    } catch (err) {
      console.error('Failed to increment view count:', err);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [category, limit]);

  return {
    articles,
    loading,
    error,
    refreshData,
    incrementViewCount,
    refetch: fetchArticles
  };
};