import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MockTestQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  difficulty: string;
  category: string;
}

interface MockTestConfig {
  category: string;
  numberOfQuestions: number;
  difficulty: string;
}

export const useMockTestGenerator = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateMockTest = async (config: MockTestConfig) => {
    setLoading(true);
    try {
      // Fetch manual MCQs for the selected category
      const { data: mcqs, error: fetchError } = await supabase
        .from('manual_mcqs')
        .select('*')
        .eq('category', config.category)
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      if (!mcqs || mcqs.length === 0) {
        toast({
          title: "No MCQs Available",
          description: `No MCQs found for ${config.category}. Please add some MCQs first.`,
          variant: "destructive"
        });
        return null;
      }

      // Filter by difficulty if specified
      let filteredMCQs = mcqs;
      if (config.difficulty !== 'mixed') {
        filteredMCQs = mcqs.filter(mcq => mcq.difficulty === config.difficulty);
      }

      if (filteredMCQs.length === 0) {
        toast({
          title: "No MCQs Available",
          description: `No ${config.difficulty} MCQs found for ${config.category}.`,
          variant: "destructive"
        });
        return null;
      }

      // Randomly select questions
      const shuffled = [...filteredMCQs].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, Math.min(config.numberOfQuestions, shuffled.length));

      // Format questions for mock test
      const formattedQuestions = selectedQuestions.map(mcq => ({
        id: mcq.id,
        question: mcq.question,
        options: {
          A: mcq.option_a,
          B: mcq.option_b,
          C: mcq.option_c,
          D: mcq.option_d
        },
        correct_answer: mcq.correct_answer,
        explanation: mcq.explanation,
        difficulty: mcq.difficulty,
        category: mcq.category
      }));

      // Save mock test to database
      const { data: mockTest, error: saveError } = await supabase
        .from('mock_tests')
        .insert({
          title: `${config.category} Mock Test - ${new Date().toLocaleDateString()}`,
          category: config.category,
          difficulty: config.difficulty,
          total_questions: formattedQuestions.length,
          questions: formattedQuestions,
          time_limit: formattedQuestions.length * 60, // 1 minute per question
          created_by: null // Allow anonymous creation for now
        })
        .select()
        .single();

      if (saveError) throw saveError;

      toast({
        title: "Success",
        description: `Mock test created with ${formattedQuestions.length} questions!`
      });

      return {
        testId: mockTest.id,
        questions: formattedQuestions,
        totalQuestions: formattedQuestions.length,
        timeLimit: mockTest.time_limit
      };

    } catch (error) {
      console.error('Error generating mock test:', error);
      toast({
        title: "Error",
        description: "Failed to generate mock test. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateMockTest,
    loading
  };
};