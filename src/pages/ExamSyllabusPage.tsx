// src/pages/ExamSyllabusPage.tsx

import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, BookOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Exam {
  name: string;
}

interface SyllabusMapping {
  subcategory: string;
}

const ExamSyllabusPage = () => {
  const { category, examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [syllabusSubcategories, setSyllabusSubcategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamAndSyllabus();
  }, [examId]);

  const fetchExamAndSyllabus = async () => {
    if (!examId) return;
    try {
      // Fetch exam details
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('name')
        .eq('id', examId)
        .single();
      if (examError) throw examError;
      setExam(examData);

      // Fetch mapped syllabus subcategories
      const { data: syllabusData, error: syllabusError } = await supabase
        .from('exam_syllabus_mappings')
        .select('subcategory')
        .eq('exam_id', examId)
        .order('subcategory');
      if (syllabusError) throw syllabusError;
      
      // Get a unique list of subcategories
      const uniqueSubcategories = [...new Set(syllabusData.map(item => item.subcategory))];
      setSyllabusSubcategories(uniqueSubcategories);

    } catch (error) {
      console.error('Error fetching exam syllabus:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/exam-types/${category}`}>
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Exams
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{exam?.name} Syllabus</h1>
            <p className="text-muted-foreground">Select a subcategory to start practicing.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading syllabus...</p>
          </div>
        ) : syllabusSubcategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {syllabusSubcategories.map((subcategory, index) => (
              <Card 
                key={subcategory}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50 hover:border-primary/20 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => navigate(`/topics/Static GK/${subcategory}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col justify-between h-full">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-3">
                      <Layers className="w-5 h-5 text-primary" />
                      {subcategory}
                    </h2>
                    <Button 
                      variant="category" 
                      size="sm" 
                      className="w-full mt-auto"
                    >
                      View Topics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No syllabus has been mapped for this exam yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExamSyllabusPage;