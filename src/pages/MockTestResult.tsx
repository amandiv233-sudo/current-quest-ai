// src/pages/MockTestResult.tsx

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, CheckCircle2, XCircle, Home, SkipForward } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Confetti from "@/components/Confetti";

const MockTestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId } = useParams();
  const [test, setTest] = useState<any>(null);
  
  const { score, total, answers, correctCount, incorrectCount, unansweredCount } = location.state || {};

  useEffect(() => {
    if (!location.state) {
      navigate("/mock-test-generator");
      return;
    }
    if (testId) {
      fetchTest();
    }
  }, [testId, location.state, navigate]);

  const fetchTest = async () => {
    const { data } = await supabase
      .from("mock_tests")
      .select("*")
      .eq("id", testId)
      .single();
    if (data) {
      setTest(data);
    }
  };

  if (score === undefined || total === undefined) {
    return null; // or a loading state while redirecting
  }

  const percentage = total > 0 ? (score / total) * 100 : 0;
  const passed = percentage >= 40;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {passed && <Confetti onComplete={() => {}} />}
      <Header />
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className={`h-16 w-16 ${passed ? 'text-yellow-500' : 'text-muted-foreground'}`} />
            </div>
            <CardTitle className="text-3xl">Test Completed!</CardTitle>
            <CardDescription>Here is a summary of your performance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Your Score</p>
              <div className="text-6xl font-bold mb-2">
                {score.toFixed(2)} / {total.toFixed(0)}
              </div>
              <div className="text-2xl text-muted-foreground">
                {percentage.toFixed(1)}%
              </div>
            </div>

            <Progress value={percentage} className="h-4" />

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-500/10 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2"><CheckCircle2 className="h-5 w-5 text-green-500" /><span>Correct</span></div>
                <div className="text-3xl font-bold">{correctCount}</div>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2"><XCircle className="h-5 w-5 text-red-500" /><span>Incorrect</span></div>
                <div className="text-3xl font-bold">{incorrectCount}</div>
              </div>
              <div className="p-4 bg-slate-500/10 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2"><SkipForward className="h-5 w-5 text-slate-500" /><span>Unanswered</span></div>
                <div className="text-3xl font-bold">{unansweredCount}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => navigate("/")} variant="outline" className="flex-1"><Home className="mr-2 h-4 w-4" />Home</Button>
              <Button onClick={() => navigate("/mock-test-generator")} className="flex-1">New Test</Button>
            </div>
          </CardContent>
        </Card>

        {test && (
          <Card>
            <CardHeader>
              <CardTitle>Answer Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {test.questions.map((q: any, idx: number) => {
                const userAnswer = answers[idx];
                const isCorrect = userAnswer === q.correct_answer;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                      ) : (
                        <XCircle className="h-5 w-s5 text-red-500 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold mb-2">
                          Q{idx + 1}. {q.question}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-semibold">Your answer:</span>{" "}
                            {userAnswer || "Not answered"} - {userAnswer ? q.options[userAnswer] : ""}
                          </p>
                          <p className="text-green-600">
                            <span className="font-semibold">Correct answer:</span>{" "}
                            {q.correct_answer} - {q.options[q.correct_answer]}
                          </p>
                          {q.explanation && (
                            <p className="text-muted-foreground mt-2">
                              <span className="font-semibold">Explanation:</span> {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MockTestResult;