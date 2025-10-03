import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, Calendar, Trophy, BookOpen } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

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
  difficulty: string;
  question_type: string;
  mcq_type?: string;
  exam_year?: number;
  tags?: string[];
  created_at: string;
  mcq_date?: string;
}


const CategoryMCQs = () => {
  const { category, subcategory } = useParams();
  const [manualMCQs, setManualMCQs] = useState<ManualMCQ[]>([]);
  const [filteredMCQs, setFilteredMCQs] = useState<ManualMCQ[]>([]);
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [disabledQuestions, setDisabledQuestions] = useState<Record<string, boolean>>({});
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    if (category) {
      fetchAvailableDates();
    }
  }, [category]);

  useEffect(() => {
    if (category && selectedDate) {
      fetchManualMCQsByDate();
    } else if (category && availableDates.length === 0) {
      fetchManualMCQs();
    }
  }, [category, selectedDate, availableDates]);

  useEffect(() => {
    if (currentTab === "all") {
      setFilteredMCQs(manualMCQs.filter(mcq => !mcq.mcq_type || mcq.mcq_type === "General"));
    } else if (currentTab === "current-affairs") {
      setFilteredMCQs(manualMCQs.filter(mcq => mcq.mcq_type === "Current Affairs"));
    }
  }, [currentTab, manualMCQs]);

  const fetchManualMCQs = async () => {
    try {
      let query = supabase
        .from('manual_mcqs')
        .select('*')
        .eq('category', category)
        .eq('is_active', true);
      
      if (subcategory) {
        query = query.eq('subcategory', subcategory);
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
      const { data, error } = await supabase
        .from('manual_mcqs')
        .select('mcq_date')
        .eq('category', category)
        .eq('is_active', true)
        .order('mcq_date', { ascending: false });

      if (error) throw error;
      
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
        .eq('category', category)
        .eq('is_active', true)
        .eq('mcq_date', selectedDate);
      
      if (subcategory) {
        query = query.eq('subcategory', subcategory);
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

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#10b981', '#86efac']
    });
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
    
    if (answer === correctAnswer) {
      triggerConfetti();
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
          <div className="flex gap-2">
            <Badge variant={mcq.difficulty === 'easy' ? 'secondary' : mcq.difficulty === 'hard' ? 'destructive' : 'default'}>
              {mcq.difficulty}
            </Badge>
            <Badge variant="outline">{mcq.question_type.toUpperCase()}</Badge>
            {mcq.exam_year && <Badge variant="outline">{mcq.exam_year}</Badge>}
          </div>
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
          <div className="mt-4 p-4 bg-accent rounded-lg animate-fade-in">
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
        )}
      </CardContent>
    </Card>
  );


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {subcategory ? `${subcategory}` : `${category} MCQs`}
            </h1>
            <p className="text-muted-foreground">
              {subcategory ? `Practice ${subcategory} questions` : 'Practice questions and current affairs MCQs'}
            </p>
          </div>
        </div>

        {availableDates.length > 0 && (
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
      </div>
    </div>
  );
};

export default CategoryMCQs;