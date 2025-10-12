import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MockTestConfig {
  category: string;
  numberOfQuestions: number;
}

export const useMockTestGenerator = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateMockTest = async (config: MockTestConfig) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You must be signed in to generate a mock test.",
          variant: "destructive",
        });
        return null;
      }

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
      
      const filteredMCQs = mcqs;

      const shuffled = [...filteredMCQs].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, Math.min(config.numberOfQuestions, shuffled.length));

      if (selectedQuestions.length === 0) {
        toast({
          title: "Not Enough Questions",
          description: `Could not find enough questions for the ${config.category} category.`,
          variant: "destructive"
        });
        return null;
      }

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

      const { data: mockTest, error: saveError } = await supabase
        .from('mock_tests')
        .insert({
          title: `${config.category} Mock Test - ${new Date().toLocaleDateString()}`,
          category: config.category,
          difficulty: null,
          total_questions: formattedQuestions.length,
          questions: formattedQuestions,
          // --- THIS IS THE FIX ---
          // Multiply by 60 to set the time limit in seconds (1 minute per question)
          time_limit: formattedQuestions.length * 60, 
          created_by: user.id
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