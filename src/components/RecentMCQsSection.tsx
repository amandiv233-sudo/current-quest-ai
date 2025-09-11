import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RecentMCQ {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  category: string;
  difficulty: string;
  mcq_date: string;
  created_at: string;
}

export const RecentMCQsSection = () => {
  const [recentMCQs, setRecentMCQs] = useState<RecentMCQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentMCQs();
  }, []);

  const fetchRecentMCQs = async () => {
    try {
      const { data, error } = await supabase
        .from('manual_mcqs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setRecentMCQs(data || []);
    } catch (error) {
      console.error('Error fetching recent MCQs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch recent MCQs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (mcqId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [mcqId]: answer
    }));
  };

  const toggleAnswer = (mcqId: string) => {
    setShowAnswers(prev => ({
      ...prev,
      [mcqId]: !prev[mcqId]
    }));
  };

  const getAnswerClass = (mcqId: string, option: string, isCorrect: boolean) => {
    const isSelected = selectedAnswers[mcqId] === option;
    const showAnswer = showAnswers[mcqId];
    
    if (!showAnswer) {
      return isSelected ? "bg-primary/20 border-primary" : "hover:bg-muted/50";
    }
    
    if (isCorrect) {
      return "bg-green-100 border-green-500 text-green-700";
    }
    
    if (isSelected && !isCorrect) {
      return "bg-red-100 border-red-500 text-red-700";
    }
    
    return "opacity-50";
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Practice Questions</h2>
            <p className="text-muted-foreground">Practice with recently added MCQs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Quick Practice Questions</h2>
          <p className="text-muted-foreground">Practice with recently added MCQs from various categories</p>
        </div>
        
        {recentMCQs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentMCQs.map((mcq) => (
              <Card key={mcq.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <Badge variant="secondary">{mcq.category}</Badge>
                      <Badge variant={mcq.difficulty === 'easy' ? 'secondary' : mcq.difficulty === 'hard' ? 'destructive' : 'default'}>
                        {mcq.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{mcq.question}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(mcq.mcq_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {[
                      { option: 'A', text: mcq.option_a },
                      { option: 'B', text: mcq.option_b },
                      { option: 'C', text: mcq.option_c },
                      { option: 'D', text: mcq.option_d }
                    ].map(({ option, text }) => (
                      <button
                        key={option}
                        onClick={() => handleAnswerSelect(mcq.id, option)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${getAnswerClass(mcq.id, option, mcq.correct_answer === option)}`}
                        disabled={showAnswers[mcq.id]}
                      >
                        <span className="font-semibold">{option}.</span> {text}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAnswer(mcq.id)}
                      className="flex-1"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      {showAnswers[mcq.id] ? 'Hide Answer' : 'Show Answer'}
                    </Button>
                  </div>
                  
                  {showAnswers[mcq.id] && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-green-600 mb-2">
                        Correct Answer: {mcq.correct_answer}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {mcq.explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No MCQs Available</h3>
            <p className="text-muted-foreground">Add some MCQs to see them here!</p>
          </div>
        )}
      </div>
    </section>
  );
};