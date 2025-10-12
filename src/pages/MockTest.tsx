import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast as useShadcnToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { Loader2, Clock, CheckCircle2, Flag, ArrowRight, Footprints, Star, Medal } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { Database } from "@/integrations/supabase/types";

type Badge = Database['public']['Tables']['badges']['Row'];

interface Question {
  id: string;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
}

const iconMap: { [key: string]: React.ElementType } = {
  Footprints,
  Star,
  Medal,
};

const MockTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { toast } = useShadcnToast();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to take a mock test.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    if (testId && user) {
      fetchTest();
    }
  }, [testId, user]);

  useEffect(() => {
    if (timeRemaining > 0 && !submitted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, submitted]);

  const fetchTest = async () => {
    try {
      const { data, error } = await supabase
        .from("mock_tests")
        .select("*")
        .eq("id", testId)
        .single();

      if (error) throw error;

      setTest(data);
      const parsedQuestions = data.questions as unknown as Question[];
      setQuestions(Array.isArray(parsedQuestions) ? parsedQuestions : []);
      setTimeRemaining(data.time_limit);
    } catch (error) {
      console.error("Error fetching test:", error);
      toast({
        title: "Error",
        description: "Failed to load test",
        variant: "destructive",
      });
      navigate("/mock-test-generator");
    } finally {
      setLoading(false);
    }
  };
  
  const handleNext = () => {
    setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1));
  };
  
  const handlePrevious = () => {
    setCurrentQuestion((prev) => Math.max(0, prev - 1));
  };

  const handleMarkForReview = () => {
    setMarkedForReview(prev => ({ ...prev, [currentQuestion]: !prev[currentQuestion] }));
    if(currentQuestion < questions.length - 1) {
      handleNext();
    }
  };

  const handleSubmit = async () => {
    if (submitted || !user) return;
    setSubmitted(true);
    
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    const negativeMark = test?.negative_marking_value || 0.25;

    questions.forEach((q, idx) => {
      if (answers[idx]) {
        if (answers[idx] === q.correct_answer) {
          score += 1;
          correctCount++;
        } else {
          score -= negativeMark;
          incorrectCount++;
        }
      }
    });

    const unansweredCount = questions.length - (correctCount + incorrectCount);

    try {
      // Step A: Save the test attempt and get its ID back
      const { data: attemptData, error: attemptError } = await supabase
        .from("user_test_attempts")
        .insert({
          user_id: user.id,
          test_id: testId,
          answers,
          score,
          total_questions: questions.length,
          time_taken: test.time_limit - timeRemaining,
        })
        .select('id')
        .single();
      
      if (attemptError) throw attemptError;
      
      // Step B: Navigate to the result page immediately for good UX
      navigate(`/mock-test-result/${testId}`, {
        state: { score, total: questions.length, answers, correctCount, incorrectCount, unansweredCount },
      });

      // Step C: In the background, call the function to check for new badges
      const { data: newBadges, error: badgeError } = await supabase.rpc(
        'award_badges_on_test_completion',
        { p_test_attempt_id: attemptData.id }
      );

      if (badgeError) {
        console.error("Error awarding badges:", badgeError);
        return;
      }
      
      // Step D: If new badges were awarded, show a notification for each one
      if (newBadges && newBadges.length > 0) {
        newBadges.forEach((badge: Badge, index) => {
          setTimeout(() => {
            const IconComponent = iconMap[badge.icon] || Star;
            sonnerToast.success("Achievement Unlocked!", {
              description: (
                <div className="flex items-center gap-3">
                  <IconComponent className="h-6 w-6 text-yellow-400" />
                  <div className="flex flex-col">
                    <span className="font-semibold">{badge.name}</span>
                    <span className="text-xs">{badge.description}</span>
                  </div>
                </div>
              ),
              duration: 5000,
            });
          }, index * 1000);
        });
      }

    } catch (error) {
      console.error("Error submitting test:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error saving your test results.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getQuestionStatus = (index: number) => {
    if (answers[index]) return 'answered';
    if (markedForReview[index]) return 'review';
    return 'unanswered';
  };
  
  const answeredCount = Object.keys(answers).length;
  const reviewCount = Object.keys(markedForReview).filter(key => markedForReview[Number(key)] && !answers[Number(key)]).length;
  const unansweredCount = questions.length - answeredCount;

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Question Panel */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{test.title}</h1>
                <p className="text-muted-foreground">Question {currentQuestion + 1} of {questions.length}</p>
              </div>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5" />
                <span className={timeRemaining < 60 ? "text-destructive" : ""}>{formatTime(timeRemaining)}</span>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{questions[currentQuestion]?.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup 
                  value={answers[currentQuestion] || ""} 
                  onValueChange={(value) => {
                    setAnswers(prev => ({ ...prev, [currentQuestion]: value }));
                    if (markedForReview[currentQuestion]) {
                      setMarkedForReview(prev => {
                        const newReviewState = { ...prev };
                        delete newReviewState[currentQuestion];
                        return newReviewState;
                      });
                    }
                  }}
                >
                  {Object.entries(questions[currentQuestion]?.options || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2 p-3 rounded-md border has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
                      <RadioGroupItem value={key} id={`option-${key}`} />
                      <Label htmlFor={`option-${key}`} className="cursor-pointer flex-1 text-base">{value}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>Previous</Button>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleMarkForReview}>
                      <Flag className="mr-2 h-4 w-4" />Mark for Review
                    </Button>
                    {currentQuestion === questions.length - 1 ? (
                      <Button onClick={handleSubmit} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />Submit Test
                      </Button>
                    ) : (
                      <Button onClick={handleNext}>Next<ArrowRight className="ml-2 h-4 w-4" /></Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status & Navigation Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader><CardTitle>Test Status</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500"/>Answered
                    </div>
                    <span className="font-bold">{answeredCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-purple-500"/>Marked for Review
                    </div>
                    <span className="font-bold">{reviewCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-muted"/>Not Answered
                    </div>
                    <span className="font-bold">{unansweredCount}</span>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, idx) => {
                    const status = getQuestionStatus(idx);
                    let buttonClass = "border-border";
                    if (currentQuestion === idx) buttonClass = "bg-primary text-primary-foreground hover:bg-primary/90 border-primary";
                    else if (status === 'answered') buttonClass = "bg-green-500/20 border-green-500/50 text-foreground";
                    else if (status === 'review') buttonClass = "bg-purple-500/20 border-purple-500/50 text-foreground";

                    return (
                      <Button key={idx} variant="outline" size="icon" className={`w-10 h-10 ${buttonClass}`} onClick={() => setCurrentQuestion(idx)}>
                        {idx + 1}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MockTest;