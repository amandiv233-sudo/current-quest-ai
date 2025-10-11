import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { XPBar } from "@/components/XPBar";
import Confetti from "@/components/Confetti";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useBookmarks } from "@/hooks/useBookmarks";

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
  const { toast } = useToast();
  const { user } = useAuth();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [disabledQuestions, setDisabledQuestions] = useState<Record<string, boolean>>({});
  const [currentXP, setCurrentXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const maxXP = 60;

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

  const playSound = (isCorrect: boolean) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    if (isCorrect) {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    } else {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    }
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const handleAnswerSelect = (mcqId: string, answer: string, correctAnswer: string) => {
    if (disabledQuestions[mcqId]) return;

    setSelectedAnswers(prev => ({ ...prev, [mcqId]: answer }));
    setDisabledQuestions(prev => ({ ...prev, [mcqId]: true }));

    const isCorrect = answer === correctAnswer;
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCurrentXP(prev => Math.min(prev + 10, maxXP));
      playSound(true);

      if (newStreak === 6) {
        setShowConfetti(true);
      }
    } else {
      setStreak(0);
      playSound(false);
    }
  };

  const getAnswerClass = (mcqId: string, option: string, correctAnswer: string) => {
    const isSelected = selectedAnswers[mcqId] === option;
    const isDisabled = disabledQuestions[mcqId];

    if (!isDisabled) {
      return 'border-border hover:bg-accent cursor-pointer';
    }
    
    if (option === correctAnswer) {
      return 'bg-green-100 border-green-500 text-green-800 cursor-not-allowed';
    }
    
    if (isSelected && option !== correctAnswer) {
      return 'bg-red-100 border-red-500 text-red-800 cursor-not-allowed';
    }
    
    return 'border-border cursor-not-allowed opacity-50';
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
                <CardHeader><div className="h-4 bg-muted rounded w-3/4"></div></CardHeader>
                <CardContent><div className="space-y-2">
                    <div className="h-8 bg-muted rounded w-full"></div>
                    <div className="h-8 bg-muted rounded w-full"></div>
                    <div className="h-8 bg-muted rounded w-full"></div>
                    <div className="h-8 bg-muted rounded w-full"></div>
                </div></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="practice" className="py-16 bg-muted/30 relative pb-40">
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      {recentMCQs.length > 0 && <XPBar currentXP={currentXP} maxXP={maxXP} streak={streak} />}
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Quick Practice Questions</h2>
          <p className="text-muted-foreground">Practice with recently added MCQs from various categories</p>
        </div>
        
        {recentMCQs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentMCQs.map((mcq) => {
              const bookmarked = isBookmarked(mcq.id);
              
              return (
                <Card key={mcq.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">{mcq.category}</Badge>
                        <Badge variant={mcq.difficulty === 'easy' ? 'secondary' : mcq.difficulty === 'hard' ? 'destructive' : 'default'}>
                          {mcq.difficulty}
                        </Badge>
                      </div>
                      {user && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 -mt-1 -mr-1"
                          onClick={() => bookmarked ? removeBookmark(mcq.id) : addBookmark(mcq.id)}
                        >
                          <Bookmark className={`h-5 w-5 transition-colors ${bookmarked ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                        </Button>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight">{mcq.question}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-1">
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
                          onClick={() => handleAnswerSelect(mcq.id, option, mcq.correct_answer)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${getAnswerClass(mcq.id, option, mcq.correct_answer)}`}
                          disabled={disabledQuestions[mcq.id]}
                        >
                          <span className="font-semibold">{option}.</span> {text}
                        </button>
                      ))}
                    </div>
                    
                    {disabledQuestions[mcq.id] && (
                      <div className="mt-4 space-y-3 animate-fade-in">
                         {selectedAnswers[mcq.id] !== mcq.correct_answer && (
                           <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                             <p className="font-bold text-destructive text-md">Streak Broken!</p>
                           </div>
                         )}
                         {selectedAnswers[mcq.id] === mcq.correct_answer && (
                           <div className="p-2 bg-green-100 dark:bg-green-900/20 border border-green-500/20 rounded-lg text-center">
                             <p className="font-bold text-green-600 dark:text-green-400 text-md">
                               {streak === 6 ? 'Perfect Streak! +10 XP' : '+10 XP'}
                             </p>
                           </div>
                         )}
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium text-green-600 mb-2">
                            Correct Answer: {mcq.correct_answer}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {mcq.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
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