import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Exam {
  name: string;
}

interface SyllabusItem {
  subcategory: string;
  topic: string | null;
}

const ExamSyllabusPage = () => {
  const { category, examId } = useParams();
  const [exam, setExam] = useState<Exam | null>(null);
  const [syllabusItems, setSyllabusItems] = useState<SyllabusItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamAndSyllabus();
  }, [examId]);

  const fetchExamAndSyllabus = async () => {
    try {
      // Fetch exam details
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('name')
        .eq('id', examId)
        .single();

      if (examError) throw examError;
      setExam(examData);

      // Fetch syllabus mappings
      const { data: syllabusData, error: syllabusError } = await supabase
        .from('exam_syllabus_mappings')
        .select('subcategory, topic')
        .eq('exam_id', examId)
        .order('subcategory');

      if (syllabusError) throw syllabusError;
      setSyllabusItems(syllabusData || []);
    } catch (error) {
      console.error('Error fetching exam syllabus:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group items by subcategory
  const groupedSyllabus = syllabusItems.reduce((acc, item) => {
    if (!acc[item.subcategory]) {
      acc[item.subcategory] = [];
    }
    if (item.topic) {
      acc[item.subcategory].push(item.topic);
    }
    return acc;
  }, {} as Record<string, string[]>);

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
            <p className="text-muted-foreground">Select a topic to start practicing</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading syllabus...</p>
          </div>
        ) : Object.keys(groupedSyllabus).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedSyllabus).map(([subcategory, topics], index) => (
              <Card 
                key={subcategory}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    {subcategory}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {topics.map((topic) => (
                      <Link 
                        key={topic}
                        to={`/category/Static GK/${subcategory}/${topic}`}
                        className="block"
                      >
                        <Button 
                          variant="outline" 
                          className="w-full justify-start hover:bg-primary/10"
                        >
                          {topic}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No syllabus topics found for this exam.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExamSyllabusPage;
