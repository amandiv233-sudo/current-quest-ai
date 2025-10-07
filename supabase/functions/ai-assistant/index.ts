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
    const { message, sessionId, sessionType = 'general' } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Processing AI assistant request:', { sessionType, message: message.substring(0, 100) });

    // Get chat history if session exists
    let chatHistory = [];
    if (sessionId) {
      const { data: session } = await supabaseClient
        .from('ai_chat_sessions')
        .select('messages')
        .eq('id', sessionId)
        .maybeSingle();
      
      if (session?.messages) {
        chatHistory = session.messages;
      }
    }

    // Prepare system prompt based on session type
    const systemPrompts = {
      general: `You are an expert AI assistant specializing in Indian current affairs and competitive exam preparation. 
                You help students understand current events, government policies, and their relevance to various competitive exams like SSC, Banking, Railway, Defense, and UPSC.
                Provide clear, concise explanations with exam relevance context.`,
      
      doubt_solving: `You are a doubt-solving AI tutor for competitive exam aspirants. 
                     Break down complex current affairs topics into simple, easy-to-understand explanations.
                     Always provide practical examples and relate topics to exam patterns.
                     Ask follow-up questions to ensure understanding.`,
      
      test_prep: `You are an AI test preparation assistant. Help students prepare for competitive exams by:
                  1. Explaining current affairs topics relevant to their target exam
                  2. Providing memory techniques and shortcuts
                  3. Suggesting practice questions and mock test strategies
                  4. Offering exam-specific tips and insights`
    };

    const systemPrompt = systemPrompts[sessionType as keyof typeof systemPrompts] || systemPrompts.general;

    // Prepare messages for Gemini
    const prompt = `${systemPrompt}\n\nConversation History:\n${chatHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n\nUser: ${message}\n\nAssistant:`;

    // Call Gemini API
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
          maxOutputTokens: 1000,
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid Gemini API response structure');
    }
    
    const aiResponse = data.candidates[0].content.parts[0].text;

    // Update chat history
    const updatedHistory = [
      ...chatHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
    ];

    // Save or update chat session
    let finalSessionId = sessionId;
    if (sessionId) {
      await supabaseClient
        .from('ai_chat_sessions')
        .update({ 
          messages: updatedHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    } else {
      // Create new session if user is authenticated
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const { data: newSession } = await supabaseClient
          .from('ai_chat_sessions')
          .insert({
            messages: updatedHistory,
            session_type: sessionType
          })
          .select('id')
          .single();
        
        if (newSession) {
          finalSessionId = newSession.id;
        }
      }
    }

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        sessionId: finalSessionId,
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-assistant:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});