import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const NEWS_API_KEY = Deno.env.get('NEWS_API_KEY');
    
    if (!NEWS_API_KEY) {
      throw new Error('NEWS_API_KEY is not configured');
    }

    console.log('Fetching current affairs from News API...');

    // Fetch news from different categories relevant to competitive exams
    const categories = [
      { category: 'Defense', query: 'India defense military DRDO' },
      { category: 'Banking', query: 'India RBI banking finance policy' },
      { category: 'Railway', query: 'Indian Railways infrastructure transport' },
      { category: 'Science & Tech', query: 'India ISRO technology innovation' },
      { category: 'International', query: 'India international relations diplomacy' },
      { category: 'Sports', query: 'India sports cricket olympics awards' },
      { category: 'General', query: 'India government policy current affairs' }
    ];

    const allArticles = [];

    for (const categoryInfo of categories) {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(categoryInfo.query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`
        );

        if (!response.ok) {
          console.error(`Failed to fetch ${categoryInfo.category} news:`, response.status);
          continue;
        }

        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
          const processedArticles = data.articles
            .filter((article: any) => 
              article.title && 
              article.description && 
              article.url &&
              !article.title.includes('[Removed]') &&
              !article.description.includes('[Removed]')
            )
            .map((article: any) => ({
              title: article.title,
              summary: article.description || article.title,
              content: article.content || article.description,
              category: categoryInfo.category,
              subcategory: determineSubcategory(article.title, categoryInfo.category),
              source: article.source?.name || 'News API',
              source_url: article.url,
              image_url: article.urlToImage,
              priority: determinePriority(article.title, article.description),
              tags: extractTags(article.title, article.description),
              exam_relevance: determineExamRelevance(article.title, article.description, categoryInfo.category),
              published_at: article.publishedAt,
              is_featured: Math.random() > 0.8 // Randomly feature some articles
            }));

          allArticles.push(...processedArticles);
        }
      } catch (error) {
        console.error(`Error fetching ${categoryInfo.category} news:`, error);
      }
    }

    console.log(`Processed ${allArticles.length} articles`);

    // Store articles in database
    if (allArticles.length > 0) {
      const { data, error } = await supabaseClient
        .from('current_affairs')
        .upsert(allArticles, { 
          onConflict: 'title',
          ignoreDuplicates: true 
        });

      if (error) {
        console.error('Error storing articles:', error);
        throw error;
      }

      console.log(`Successfully stored ${allArticles.length} articles in database`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        articlesProcessed: allArticles.length,
        message: 'Current affairs updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-current-affairs:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper functions
function determineSubcategory(title: string, category: string): string {
  const titleLower = title.toLowerCase();
  
  switch (category) {
    case 'Defense':
      if (titleLower.includes('drdo')) return 'DRDO';
      if (titleLower.includes('navy')) return 'Navy';
      if (titleLower.includes('army')) return 'Army';
      if (titleLower.includes('air force')) return 'Air Force';
      return 'General Defense';
      
    case 'Banking':
      if (titleLower.includes('rbi')) return 'RBI';
      if (titleLower.includes('sbi')) return 'SBI';
      if (titleLower.includes('ibps')) return 'IBPS';
      return 'Banking Policy';
      
    case 'Railway':
      if (titleLower.includes('vande bharat')) return 'Vande Bharat';
      if (titleLower.includes('metro')) return 'Metro';
      return 'Infrastructure';
      
    case 'Science & Tech':
      if (titleLower.includes('isro')) return 'Space';
      if (titleLower.includes('ai') || titleLower.includes('artificial intelligence')) return 'AI';
      return 'Innovation';
      
    default:
      return 'General';
  }
}

function determinePriority(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  
  const highPriorityKeywords = ['breaking', 'important', 'major', 'significant', 'critical', 'urgent'];
  const lowPriorityKeywords = ['routine', 'regular', 'minor', 'small'];
  
  if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
    return 'high';
  }
  
  if (lowPriorityKeywords.some(keyword => text.includes(keyword))) {
    return 'low';
  }
  
  return 'medium';
}

function extractTags(title: string, description: string): string[] {
  const text = (title + ' ' + description).toLowerCase();
  const tags: string[] = [];
  
  const tagKeywords = [
    'government', 'policy', 'election', 'economy', 'budget',
    'technology', 'innovation', 'space', 'defense', 'military',
    'banking', 'finance', 'railway', 'transport', 'infrastructure',
    'sports', 'cricket', 'olympics', 'award', 'achievement'
  ];
  
  tagKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  return tags.slice(0, 5); // Limit to 5 tags
}

function determineExamRelevance(title: string, description: string, category: string): string[] {
  const text = (title + ' ' + description).toLowerCase();
  const relevance = [];
  
  // Map categories to exam types
  const examMapping = {
    'Defense': ['NDA', 'CDS', 'AFCAT'],
    'Banking': ['IBPS', 'SBI', 'RBI', 'RRB'],
    'Railway': ['RRB NTPC', 'Group D', 'ALP'],
    'Science & Tech': ['SSC CGL', 'UPSC'],
    'International': ['UPSC', 'SSC CGL'],
    'Sports': ['SSC CGL', 'UPSC'],
    'General': ['SSC CGL', 'UPSC', 'Banking']
  };
  
  if (examMapping[category as keyof typeof examMapping]) {
    relevance.push(...examMapping[category as keyof typeof examMapping]);
  }
  
  // Add general relevance
  relevance.push('General Awareness');
  
  return [...new Set(relevance)]; // Remove duplicates
}