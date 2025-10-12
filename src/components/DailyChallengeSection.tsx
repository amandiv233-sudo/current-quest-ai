import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const DailyChallengeSection = () => {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `dailyChallengeCompleted_${today}`;

  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<{ score: number; total: number } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    const completedData = localStorage.getItem(storageKey);
    if (completedData) {
      setIsCompleted(true);
      setResults(JSON.parse(completedData));
    }
  }, [storageKey]);

  const { data: questions, isLoading } = useQuery({
    queryKey: ['dailyChallenge'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_daily_challenge');
      if (error) throw error;
      return data;
    },
    enabled: !isCompleted,
    staleTime: Infinity,
    // --- THIS IS THE FIX ---
    // Renamed 'cacheTime' to 'gcTime' for TanStack Query v5
    gcTime: Infinity,
  });

  const handleSelectAnswer = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmit = () => {
    if (!questions) return;
    const score = questions.reduce((acc, question, index) => {
      return selectedAnswers[index] === question.correct_answer ? acc + 1 : acc;
    }, 0);

    const resultData = { score, total: questions.length };
    setResults(resultData);
    setIsCompleted(true);
    localStorage.setItem(storageKey, JSON.stringify(resultData));
  };

  const currentQuestion = questions?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (questions?.length || 0) - 1;

  if (isLoading) {
    return (
      <section id="daily-challenge" className="py-16 px-4 bg-muted/30">
        <Card className="container mx-auto max-w-3xl text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading Daily Challenge...</p>
        </Card>
      </section>
    );
  }

  if (isCompleted && results) {
    return (
      <section id="daily-challenge" className="py-16 px-4 bg-primary/5">
        <Card className="container mx-auto max-w-3xl text-center p-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Daily Challenge Completed!
            </CardTitle>
            <CardDescription>You scored</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold mb-4">{results.score} / {results.total}</p>
            <p className="text-muted-foreground">Come back tomorrow for a new set of questions!</p>
          </CardContent>
        </Card>
      </section>
    );
  }
  
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <section id="daily-challenge" className="py-16 px-4 bg-primary/5">
      <Card className="container mx-auto max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Today's Daily Challenge
          </CardTitle>
          <CardDescription>Test your knowledge with these 5 quick questions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-lg text-center mb-4">{currentQuestion.question}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[ { key: 'A', text: currentQuestion.option_a }, { key: 'B', text: currentQuestion.option_b }, { key: 'C', text: currentQuestion.option_c }, { key: 'D', text: currentQuestion.option_d }
              ].map((option) => (
                <Button
                  key={option.key}
                  variant={selectedAnswers[currentQuestionIndex] === option.key ? "default" : "outline"}
                  className="h-auto py-3 justify-start text-left whitespace-normal"
                  onClick={() => handleSelectAnswer(currentQuestionIndex, option.key)}
                >
                  <span className="font-bold mr-2">{option.key}.</span> {option.text}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            {isLastQuestion ? (
              <Button onClick={handleSubmit} disabled={!selectedAnswers[currentQuestionIndex]}>
                Finish & See Score
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                disabled={!selectedAnswers[currentQuestionIndex]}
              >
                Next Question
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default DailyChallengeSection;