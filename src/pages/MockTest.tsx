import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clock, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Question {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: string;
  explanation: string;
}

const MockTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (testId) {
      fetchTest();
    }
  }, [testId]);

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

  const handleSubmit = async () => {
    setSubmitted(true);
    
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer) {
        score++;
      }
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from("user_test_attempts").insert({
          user_id: user.id,
          test_id: testId,
          answers,
          score,
          total_questions: questions.length,
          time_taken: test.time_limit - timeRemaining,
        });
      }

      navigate(`/mock-test-result/${testId}`, {
        state: { score, total: questions.length, answers },
      });
    } catch (error) {
      console.error("Error saving results:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{test.title}</h1>
            <p className="text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-5 w-5" />
            <span className={timeRemaining < 60 ? "text-destructive" : ""}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        <Progress value={progress} className="mb-6" />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {questions[currentQuestion]?.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={answers[currentQuestion] || ""}
              onValueChange={(value) =>
                setAnswers({ ...answers, [currentQuestion]: value })
              }
            >
              {Object.entries(questions[currentQuestion]?.options || {}).map(
                ([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={`option-${key}`} />
                    <Label htmlFor={`option-${key}`} className="cursor-pointer flex-1">
                      {key}. {value}
                    </Label>
                  </div>
                )
              )}
            </RadioGroup>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button onClick={handleSubmit} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Test
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    setCurrentQuestion((prev) =>
                      Math.min(questions.length - 1, prev + 1)
                    )
                  }
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-wrap gap-2">
          {questions.map((_, idx) => (
            <Button
              key={idx}
              variant={currentQuestion === idx ? "default" : "outline"}
              size="sm"
              className="w-10 h-10"
              onClick={() => setCurrentQuestion(idx)}
            >
              {answers[idx] ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                idx + 1
              )}
            </Button>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MockTest;
