import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const useAIAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (
    message: string, 
    sessionId?: string, 
    sessionType: 'general' | 'doubt_solving' | 'test_prep' = 'general'
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message,
          sessionId,
          sessionType
        }
      });

      if (error) throw error;

      return {
        response: data.response,
        sessionId: data.sessionId,
        success: data.success
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message to AI assistant:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendMessage,
    loading,
    error
  };
};

export const useMockTestGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTest = async (
    category: string,
    numberOfQuestions: number = 10,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    examType?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Generating mock test with params:', { category, numberOfQuestions, difficulty, examType });

      const { data, error } = await supabase.functions.invoke('generate-mock-test', {
        body: {
          category,
          numberOfQuestions,
          difficulty,
          examType
        }
      });

      if (error) throw error;

      return {
        testId: data.testId,
        test: data.test,
        title: data.title,
        totalQuestions: data.totalQuestions,
        timeLimit: data.timeLimit,
        success: data.success
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate mock test';
      setError(errorMessage);
      console.error('Error generating mock test:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateTest,
    loading,
    error
  };
};