import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, Clock, Calendar, Trophy, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentAffairs } from "@/hooks/useCurrentAffairs";
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
  exam_year?: number;
  tags?: string[];
  created_at: string;
}

interface AIGeneratedMCQ {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: string;
  explanation: string;
  topic: string;
  difficulty: string;
  source_article: string;
}

const CategoryMCQs = () => {
  const { category } = useParams();
  const [manualMCQs, setManualMCQs] = useState<ManualMCQ[]>([]);
  const [aiMCQs, setAiMCQs] = useState<AIGeneratedMCQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  
  const { articles } = useCurrentAffairs(category);

  useEffect(() => {
    fetchManualMCQs();
    generateAIMCQs();
  }, [category]);

  const fetchManualMCQs = async () => {
    try {
      const { data, error } = await supabase
        .from('manual_mcqs')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setManualMCQs(data || []);
    } catch (error) {
      console.error('Error fetching manual MCQs:', error);
    }
  };

  const generateAIMCQs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-mock-test', {
        body: {
          category,
          numberOfQuestions: 10,
          difficulty: 'medium',
          examType: category
        }
      });

      if (error) throw error;
      if (data?.test?.questions) {
        setAiMCQs(data.test.questions);
      }
    } catch (error) {
      console.error('Error generating AI MCQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const toggleAnswer = (questionId: string) => {
    setShowAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const getAnswerClass = (questionId: string, option: string, correctAnswer: string) => {
    const selected = selectedAnswers[questionId];
    const showAnswer = showAnswers[questionId];
    
    if (!showAnswer) {
      return selected === option ? 'bg-primary/20 border-primary' : 'border-border hover:bg-accent';
    }
    
    if (option === correctAnswer) {
      return 'bg-green-100 border-green-500 text-green-800';
    }
    
    if (selected === option && option !== correctAnswer) {
      return 'bg-red-100 border-red-500 text-red-800';
    }
    
    return 'border-border';
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
        {mcq.subcategory && (
          <CardDescription>{mcq.subcategory}</CardDescription>
        )}
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
              onClick={() => handleAnswerSelect(mcq.id, option.key)}
              className={`w-full p-3 text-left border-2 rounded-lg transition-colors ${getAnswerClass(mcq.id, option.key, mcq.correct_answer)}`}
            >
              <span className="font-semibold">{option.key}. </span>
              {option.text}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 mb-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toggleAnswer(mcq.id)}
          >
            {showAnswers[mcq.id] ? 'Hide Answer' : 'Show Answer'}
          </Button>
        </div>

        {showAnswers[mcq.id] && (
          <div className="mt-4 p-4 bg-accent rounded-lg">
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

  const AIMCQCard = ({ mcq }: { mcq: AIGeneratedMCQ }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">{mcq.question}</CardTitle>
        <CardDescription>
          <div className="flex gap-2 mt-2">
            <Badge variant="default">{mcq.difficulty}</Badge>
            <Badge variant="outline">AI Generated</Badge>
          </div>
          <p className="text-xs mt-2 text-muted-foreground">Source: {mcq.source_article}</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          {Object.entries(mcq.options).map(([key, text]) => (
            <button
              key={key}
              onClick={() => handleAnswerSelect(`ai-${mcq.id}`, key)}
              className={`w-full p-3 text-left border-2 rounded-lg transition-colors ${getAnswerClass(`ai-${mcq.id}`, key, mcq.correct_answer)}`}
            >
              <span className="font-semibold">{key}. </span>
              {text}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 mb-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toggleAnswer(`ai-${mcq.id}`)}
          >
            {showAnswers[`ai-${mcq.id}`] ? 'Hide Answer' : 'Show Answer'}
          </Button>
        </div>

        {showAnswers[`ai-${mcq.id}`] && (
          <div className="mt-4 p-4 bg-accent rounded-lg">
            <p className="font-semibold text-green-600 mb-2">
              Correct Answer: {mcq.correct_answer}
            </p>
            <p className="text-sm">{mcq.explanation}</p>
            <p className="text-xs mt-2 text-muted-foreground">Topic: {mcq.topic}</p>
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
            <h1 className="text-3xl font-bold">{category} MCQs</h1>
            <p className="text-muted-foreground">Practice questions and current affairs MCQs</p>
          </div>
        </div>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Manual MCQs ({manualMCQs.length})
            </TabsTrigger>
            <TabsTrigger value="current-affairs" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Current Affairs MCQs ({aiMCQs.length})
            </TabsTrigger>
            <TabsTrigger value="pyqs" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Previous Year Questions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-6">
            <div className="space-y-6">
              {manualMCQs.length > 0 ? (
                manualMCQs.map((mcq) => (
                  <ManualMCQCard key={mcq.id} mcq={mcq} />
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No manual MCQs available for {category} category.</p>
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
                    <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-spin" />
                    <p className="text-muted-foreground">Generating current affairs MCQs...</p>
                  </CardContent>
                </Card>
              ) : aiMCQs.length > 0 ? (
                aiMCQs.map((mcq) => (
                  <AIMCQCard key={mcq.id} mcq={mcq} />
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No current affairs available for {category} category.</p>
                    <Button onClick={generateAIMCQs} className="mt-4">
                      Refresh MCQs
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pyqs" className="mt-6">
            <div className="space-y-6">
              {manualMCQs.filter(mcq => mcq.question_type === 'pyq').length > 0 ? (
                manualMCQs
                  .filter(mcq => mcq.question_type === 'pyq')
                  .map((mcq) => (
                    <ManualMCQCard key={mcq.id} mcq={mcq} />
                  ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No previous year questions available for {category} category.</p>
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