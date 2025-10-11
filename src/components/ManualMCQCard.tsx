import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Calendar } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useState } from "react";

// We define the type here so the component is self-contained
export interface ManualMCQ {
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
  mcq_date?: string;
  tags?: string[];
}

interface ManualMCQCardProps {
  mcq: ManualMCQ;
  // This prop allows us to hide the quiz interaction on the bookmarks page
  isReviewMode?: boolean; 
}

export const ManualMCQCard = ({ mcq, isReviewMode = false }: ManualMCQCardProps) => {
  const { user } = useAuth();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const bookmarked = isBookmarked(mcq.id);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const isAnswered = selectedAnswer !== null;

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered || isReviewMode) return;
    setSelectedAnswer(answer);
  };

  const getAnswerClass = (option: string) => {
    if (isReviewMode) return 'border-border opacity-80';
    if (!isAnswered) return 'border-border hover:bg-accent cursor-pointer';
    
    if (option === mcq.correct_answer) return 'bg-green-100 border-green-500 text-green-800 cursor-not-allowed';
    if (selectedAnswer === option && option !== mcq.correct_answer) return 'bg-red-100 border-red-500 text-red-800 cursor-not-allowed';
    
    return 'border-border cursor-not-allowed opacity-50';
  };

  return (
    <Card className="mb-6 w-full">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-lg">{mcq.question}</CardTitle>
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => (bookmarked ? removeBookmark(mcq.id) : addBookmark(mcq.id))}
            >
              <Bookmark className={`h-5 w-5 transition-colors ${bookmarked ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
            </Button>
          )}
        </div>
        <CardDescription className="flex items-center gap-2 pt-1">
          {mcq.subcategory && <span>{mcq.subcategory}</span>}
          {mcq.mcq_date && ( <> {mcq.subcategory && <span>•</span>} <Calendar className="w-4 h-4" /> <span>{new Date(mcq.mcq_date).toLocaleDateString()}</span> </> )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          {[ { key: 'A', text: mcq.option_a }, { key: 'B', text: mcq.option_b }, { key: 'C', text: mcq.option_c }, { key: 'D', text: mcq.option_d } ].map((option) => (
            <button
              key={option.key}
              onClick={() => handleAnswerSelect(option.key)}
              disabled={isAnswered || isReviewMode}
              className={`w-full p-3 text-left border-2 rounded-lg transition-all duration-300 ${getAnswerClass(option.key)}`}
            >
              <span className="font-semibold">{option.key}. </span>
              {option.text}
            </button>
          ))}
        </div>
        
        {(isAnswered || isReviewMode) && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div className="p-4 bg-accent rounded-lg">
              <p className="font-semibold text-green-600 mb-2">Correct Answer: {mcq.correct_answer}</p>
              <p className="text-sm">{mcq.explanation}</p>
              {mcq.tags && mcq.tags.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {mcq.tags.map((tag, index) => (<Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};