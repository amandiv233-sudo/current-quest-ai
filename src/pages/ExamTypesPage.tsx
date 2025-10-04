import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Exam {
  id: string;
  name: string;
  description: string;
  content_model: string;
}

const ExamTypesPage = () => {
  const { category } = useParams();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, [category]);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('category', category)
        .order('name');

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold">{category}</h1>
            <p className="text-muted-foreground">
              {category === 'Banking Exams' 
                ? 'Choose an exam to view monthly current affairs' 
                : 'Choose an exam to view its syllabus'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading exams...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam, index) => (
              <Card 
                key={exam.id}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50 hover:border-primary/20 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="bg-primary/10 p-3 rounded-lg text-primary group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {exam.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {exam.description}
                      </p>
                    </div>
                  </div>
                  <Link 
                    to={
                      exam.content_model === 'monthly_current_affairs'
                        ? `/exam/${category}/${exam.id}/monthly-current-affairs`
                        : `/exam/${category}/${exam.id}/syllabus`
                    } 
                    className="w-full block"
                  >
                    <Button 
                      variant="category" 
                      size="sm" 
                      className="w-full"
                    >
                      {exam.content_model === 'monthly_current_affairs' 
                        ? 'View Monthly Updates' 
                        : 'View Syllabus'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamTypesPage;
