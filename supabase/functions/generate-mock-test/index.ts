import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { category, numberOfQuestions = 10, difficulty = 'medium', examType } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Generating mock test:', { category, numberOfQuestions, difficulty, examType });

    // Get recent current affairs from the specified category
    const { data: recentArticles } = await supabaseClient
      .from('current_affairs')
      .select('title, summary, category, subcategory, tags, exam_relevance')
      .eq('category', category)
      .order('published_at', { ascending: false })
      .limit(20);

    // Prepare context for AI
    let currentAffairsContext;
    
    if (!recentArticles || recentArticles.length === 0) {
      // If no current affairs found, create a fallback test with general knowledge
      console.log(`No current affairs found for category: ${category}, creating general knowledge test`);
      
      currentAffairsContext = `General ${category} knowledge questions based on standard competitive exam patterns. 
      Focus on fundamental concepts, important facts, and commonly asked questions in ${category} category for competitive exams.
      Create questions that would typically appear in ${examType || 'competitive'} exams for ${category} category.`;
    } else {
      // Prepare context for AI with actual current affairs
      currentAffairsContext = recentArticles.map(article => 
        `Title: ${article.title}\nSummary: ${article.summary}\nCategory: ${article.category}\nSubcategory: ${article.subcategory || 'N/A'}\nTags: ${article.tags?.join(', ') || 'N/A'}\n`
      ).join('\n---\n');
    }

    const difficultyInstructions = {
      easy: 'Create straightforward questions that test basic knowledge and recall.',
      medium: 'Create moderately challenging questions that require understanding and application.',
      hard: 'Create advanced questions that require critical thinking and deep analysis.'
    };

    const examTypeInstructions = {
      'SSC CGL': 'Focus on questions suitable for SSC CGL exam pattern with emphasis on reasoning and general awareness.',
      'Banking': 'Focus on financial awareness, banking terminology, and economic policies.',
      'Railway': 'Focus on railway infrastructure, transportation policies, and technical developments.',
      'Defense': 'Focus on defense technology, military affairs, and strategic developments.',
      'UPSC': 'Create comprehensive questions suitable for civil services examination.',
      'General': 'Create general awareness questions suitable for multiple competitive exams.'
    };

    const systemPrompt = `You are an expert test creator for Indian competitive exams. Create a mock test based on the provided current affairs content.

Instructions:
- Generate exactly ${numberOfQuestions} multiple choice questions
- Difficulty level: ${difficulty} - ${difficultyInstructions[difficulty]}
- Exam focus: ${examType || 'General'} - ${examTypeInstructions[examType] || examTypeInstructions['General']}
- Each question should have 4 options (A, B, C, D) with only one correct answer
- Include detailed explanations for each correct answer
- Questions should be directly related to the current affairs provided
- Ensure questions are exam-relevant and test important concepts

Format your response as a valid JSON object with this structure:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": {
        "A": "Option A text",
        "B": "Option B text", 
        "C": "Option C text",
        "D": "Option D text"
      },
      "correct_answer": "A",
      "explanation": "Detailed explanation of why this is correct and why other options are incorrect",
      "topic": "Main topic/subject area",
      "difficulty": "${difficulty}",
      "source_article": "Title of the source article from current affairs"
    }
  ]
}`;

    const prompt = `${systemPrompt}\n\nBased on these current affairs, create a ${numberOfQuestions}-question mock test:\n\n${currentAffairsContext}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 4000,
          temperature: 0.3,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    // Parse the JSON response
    let mockTest;
    try {
      mockTest = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('Failed to generate properly formatted test');
    }

    // Validate the response structure
    if (!mockTest.questions || !Array.isArray(mockTest.questions)) {
      throw new Error('Invalid test format received from AI');
    }

    // Create test title
    const testTitle = `${category} Mock Test - ${numberOfQuestions} Questions (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`;

    // Save the mock test to database
    const { data: savedTest, error: saveError } = await supabaseClient
      .from('mock_tests')
      .insert({
        title: testTitle,
        category,
        difficulty,
        questions: mockTest.questions,
        total_questions: numberOfQuestions,
        time_limit: numberOfQuestions * 1.5, // 1.5 minutes per question
        is_public: true
      })
      .select('id')
      .single();

    if (saveError) {
      console.error('Error saving mock test:', saveError);
      throw saveError;
    }

    console.log('Mock test generated and saved successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        testId: savedTest.id,
        test: mockTest,
        title: testTitle,
        totalQuestions: numberOfQuestions,
        timeLimit: numberOfQuestions * 1.5
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-mock-test:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});