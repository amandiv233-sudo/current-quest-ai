import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, Calendar, Trophy, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { XPBar } from "@/components/XPBar";
import Confetti from "@/components/Confetti"; // Import the Confetti component

interface ManualMCQ {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  category: string;
  subcategory?: string;
  topic?: string;
  difficulty: string;
  question_type: string;
  mcq_type?: string;
  exam_year?: number;
  tags?: string[];
  created_at: string;
  mcq_date?: string;
}


const CategoryMCQs = () => {
  const { category, subcategory, topic } = useParams();
  const navigate = useNavigate();
  const [manualMCQs, setManualMCQs] = useState<ManualMCQ[]>([]);
  const [filteredMCQs, setFilteredMCQs] = useState<ManualMCQ[]>([]);
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [disabledQuestions, setDisabledQuestions] = useState<Record<string, boolean>>({});
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  
  // XP Bar and Confetti state
  const [currentXP, setCurrentXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const maxXP = 100;
  
  // Check if this is a month-based view
  const monthParam = topic && /^\d{4}-\d{2}$/.test(topic) ? topic : 
                   subcategory && /^\d{4}-\d{2}$/.test(subcategory) ? subcategory : null;
  const isMonthBasedView = monthParam !== null;
  
  // For Banking Exams, if subcategory is a month, there's no actual subcategory
  const actualSubcategory = subcategory && /^\d{4}-\d{2}$/.test(subcategory) ? undefined : subcategory;
  
  // Format month for display (2025-09 → September 2025)
  const formatMonthDisplay = (monthStr: string) => {
    if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) return monthStr;
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  useEffect(() => {
    if (category && !isMonthBasedView) {
      fetchAvailableDates();
    }
  }, [category, isMonthBasedView]);

  useEffect(() => {
    if (isMonthBasedView) {
      // For month-based views (Banking exams), fetch directly without date selection
      fetchManualMCQs();
    } else if (category && selectedDate) {
      fetchManualMCQsByDate();
    } else if (category && availableDates.length === 0) {
      fetchManualMCQs();
    }
  }, [category, subcategory, topic, selectedDate, availableDates, isMonthBasedView]);

  useEffect(() => {
    if (isMonthBasedView) {
      // For monthly views, always show current affairs only
      setCurrentTab("current-affairs");
      setFilteredMCQs(manualMCQs.filter(mcq => mcq.mcq_type === "Current Affairs"));
    } else if (currentTab === "all") {
      setFilteredMCQs(manualMCQs.filter(mcq => !mcq.mcq_type || mcq.mcq_type === "General"));
    } else if (currentTab === "current-affairs") {
      setFilteredMCQs(manualMCQs.filter(mcq => mcq.mcq_type === "Current Affairs"));
    }
  }, [currentTab, manualMCQs, isMonthBasedView]);

  const fetchManualMCQs = async () => {
    try {
      let query = supabase
        .from('manual_mcqs')
        .select('*')
        .eq('is_active', true);
      
      // Handle category matching - "Banking Exams" in URL should match "Banking" in DB
      if (category === 'Banking Exams') {
        query = query.eq('category', 'Banking');
      } else {
        query = query.eq('category', category);
      }
      
      if (actualSubcategory) {
        query = query.eq('subcategory', actualSubcategory);
      }
      
      // Handle month-based view for Banking exams (YYYY-MM format)
      if (isMonthBasedView && monthParam) {
        // Query for any date within the target month (handles any day of month)
        const [year, month] = monthParam.split('-');
        const startDate = `${year}-${month}-01`;
        const nextMonth = parseInt(month) === 12 ? '01' : String(parseInt(month) + 1).padStart(2, '0');
        const nextYear = parseInt(month) === 12 ? String(parseInt(year) + 1) : year;
        const endDate = `${nextYear}-${nextMonth}-01`;
        
        query = query.gte('month_year', startDate).lt('month_year', endDate);
      } else if (topic && !isMonthBasedView) {
        query = query.eq('topic', topic);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setManualMCQs(data || []);
    } catch (error) {
      console.error('Error fetching manual MCQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDates = async () => {
    try {
      let query = supabase
        .from('manual_mcqs')
        .select('mcq_date')
        .eq('is_active', true)
        .order('mcq_date', { ascending: false });

      // Handle category matching - "Banking Exams" in URL should match "Banking" in DB
      if (category === 'Banking Exams') {
        query = query.eq('category', 'Banking');
      } else {
        query = query.eq('category', category);
      }
      
      // Don't filter by subcategory for Banking Current Affairs date query
      if (actualSubcategory && category !== 'Banking Exams') {
        query = query.eq('subcategory', actualSubcategory);
      }

      const { data, error } = await query;
      
      const uniqueDates = [...new Set(data?.map(item => item.mcq_date).filter(Boolean))];
      setAvailableDates(uniqueDates);
      if (uniqueDates.length > 0 && !selectedDate) {
        setSelectedDate(uniqueDates[0]);
      }
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  };

  const fetchManualMCQsByDate = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('manual_mcqs')
        .select('*')
        .eq('is_active', true)
        .eq('mcq_date', selectedDate);
      
      // Handle category matching - "Banking Exams" in URL should match "Banking" in DB
      if (category === 'Banking Exams') {
        query = query.eq('category', 'Banking');
      } else {
        query = query.eq('category', category);
      }
      
      if (actualSubcategory) {
        query = query.eq('subcategory', actualSubcategory);
      }
      
      if (topic && !isMonthBasedView) {
        query = query.eq('topic', topic);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setManualMCQs(data || []);
    } catch (error) {
      console.error('Error fetching MCQs by date:', error);
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
      // Positive sound: ascending notes
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else {
      // Negative sound: descending note
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
      oscillator.type = 'sawtooth';
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string, correctAnswer: string) => {
    if (disabledQuestions[questionId]) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    setDisabledQuestions(prev => ({
      ...prev,
      [questionId]: true
    }));
    
    const isCorrect = answer === correctAnswer;
    
    if (isCorrect) {
      // Correct answer: increase XP and streak
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCurrentXP(prev => Math.min(prev + 10, maxXP));
      playSound(true);

      // Trigger confetti on a 10-question streak or multiples of 10
      if (newStreak >= 10 && newStreak % 10 === 0) {
        setShowConfetti(true);
      }
    } else {
      // Incorrect answer: reset XP and streak
      setCurrentXP(0);
      setStreak(0);
      playSound(false);
    }
  };

  const getAnswerClass = (questionId: string, option: string, correctAnswer: string) => {
    const selected = selectedAnswers[questionId];
    const isDisabled = disabledQuestions[questionId];
    
    if (!isDisabled) {
      return 'border-border hover:bg-accent cursor-pointer';
    }
    
    if (option === correctAnswer) {
      return 'bg-green-100 border-green-500 text-green-800 cursor-not-allowed';
    }
    
    if (selected === option && option !== correctAnswer) {
      return 'bg-red-100 border-red-500 text-red-800 cursor-not-allowed';
    }
    
    return 'border-border cursor-not-allowed opacity-50';
  };

  const ManualMCQCard = ({ mcq }: { mcq: ManualMCQ }) => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{mcq.question}</CardTitle>
          {/* <div className="flex gap-2">
            <Badge variant={mcq.difficulty === 'easy' ? 'secondary' : mcq.difficulty === 'hard' ? 'destructive' : 'default'}>
              {mcq.difficulty}
            </Badge>
            <Badge variant="outline">{mcq.question_type.toUpperCase()}</Badge>
            {mcq.exam_year && <Badge variant="outline">{mcq.exam_year}</Badge>}
          </div> */}
        </div>
        <CardDescription className="flex items-center gap-2">
          {mcq.subcategory && <span>{mcq.subcategory}</span>}
          {mcq.mcq_date && (
            <>
              {mcq.subcategory && <span>•</span>}
              <Calendar className="w-4 h-4" />
              <span>{new Date(mcq.mcq_date).toLocaleDateString()}</span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          {[
            { key: 'A', text: mcq.option_a },
            { key: 'B', text: mcq.option_b },
            { key: 'C', text: mcq.option_c },
            { key: 'D', text: mcq.option_d }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => handleAnswerSelect(mcq.id, option.key, mcq.correct_answer)}
              disabled={disabledQuestions[mcq.id]}
              className={`w-full p-3 text-left border-2 rounded-lg transition-all duration-300 ${getAnswerClass(mcq.id, option.key, mcq.correct_answer)}`}
            >
              <span className="font-semibold">{option.key}. </span>
              {option.text}
            </button>
          ))}
        </div>
        
        {disabledQuestions[mcq.id] && (
          <div className="mt-4 space-y-3 animate-fade-in">
            {selectedAnswers[mcq.id] !== mcq.correct_answer && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                <p className="font-bold text-destructive text-lg">Streak Broken!</p>
              </div>
            )}
            {selectedAnswers[mcq.id] === mcq.correct_answer && (
              <div className="p-3 bg-green-100 dark:bg-green-900/20 border border-green-500/20 rounded-lg text-center">
                <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                  {streak > 0 && streak % 10 === 0 ? `Awesome! ${streak} Streak! +10 XP` : '+10 XP'}
                </p>
              </div>
            )}
            <div className="p-4 bg-accent rounded-lg">
              <p className="font-semibold text-green-600 mb-2">
                Correct Answer: {mcq.correct_answer}
              </p>
              <p className="text-sm">{mcq.explanation}</p>
              {mcq.tags && mcq.tags.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {mcq.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );


  return (
    <div className="min-h-screen bg-background pb-24">
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      <XPBar currentXP={currentXP} maxXP={maxXP} streak={streak} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isMonthBasedView && category === 'Banking Exams') {
                  navigate('/banking-current-affairs');
                } else {
                  window.history.back();
                }
              }}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {isMonthBasedView ? "Back to Months" : "Back"}
            </Button>
            {!isMonthBasedView && (
              <div>
                <h1 className="text-3xl font-bold">
                  {topic ? topic : actualSubcategory ? `${actualSubcategory}` : `${category} MCQs`}
                </h1>
                <p className="text-muted-foreground">
                  {topic ? `Practice ${topic} questions` 
                    : actualSubcategory ? `Practice ${actualSubcategory} questions` 
                    : 'Practice questions and current affairs MCQs'}
                </p>
              </div>
            )}
          </div>
          
          {isMonthBasedView && category === 'Banking Exams' && (
            <Link to="/admin/banking-current-affairs">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                Manage MCQs
              </Button>
            </Link>
          )}
        </div>

        {!isMonthBasedView && availableDates.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <label className="text-sm font-medium">Filter by Date:</label>
                </div>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue placeholder="Select a date" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {manualMCQs.length} question{manualMCQs.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isMonthBasedView ? (
          <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                All MCQs ({manualMCQs.filter(mcq => !mcq.mcq_type || mcq.mcq_type === "General").length})
              </TabsTrigger>
              <TabsTrigger value="current-affairs" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Current Affairs ({manualMCQs.filter(mcq => mcq.mcq_type === "Current Affairs").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              
              <div className="space-y-6">
                {loading ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading MCQs...</p>
                    </CardContent>
                  </Card>
                ) : filteredMCQs.length > 0 ? (
                  filteredMCQs.map((mcq) => (
                    <ManualMCQCard key={mcq.id} mcq={mcq} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No MCQs Found</h3>
                      <p className="text-muted-foreground">
                        {selectedDate 
                          ? `No MCQs available for ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.` 
                          : `No MCQs available in ${category} category yet.`}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>


            <TabsContent value="current-affairs" className="mt-6">
              <div className="space-y-6">
                {loading ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading Current Affairs...</p>
                    </CardContent>
                  </Card>
                ) : filteredMCQs.length > 0 ? (
                  filteredMCQs.map((mcq) => (
                    <ManualMCQCard key={mcq.id} mcq={mcq} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No Current Affairs questions available for {category} category yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          /* For monthly views, show Current Affairs MCQs directly */
          <div className="space-y-6 mt-6">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Current Affairs MCQs ({filteredMCQs.length})</h2>
            </div>
            {loading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading Current Affairs...</p>
                </CardContent>
              </Card>
            ) : filteredMCQs.length > 0 ? (
              filteredMCQs.map((mcq) => (
                <ManualMCQCard key={mcq.id} mcq={mcq} />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Current Affairs MCQs Found</h3>
                  <p className="text-muted-foreground">
                    No Current Affairs questions available for {category} category yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryMCQs;