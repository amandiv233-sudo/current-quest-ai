import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Exam {
  id: string;
  name: string;
  content_model: string;
}

const MonthlyCurrentAffairsPage = () => {
  const { category, examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (error) throw error;
      setExam(data);
    } catch (error) {
      console.error('Error fetching exam:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate last 12 months
  const generateMonths = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        value: date.toISOString().slice(0, 7), // YYYY-MM format
        date: date
      });
    }
    
    return months;
  };

  const months = generateMonths();

  const handleMonthClick = (monthValue: string) => {
    navigate(`/category/${category}/${exam?.name}/${monthValue}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/exam-types/${category}`}>
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
               
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{exam?.name} - Current Affairs</h1>
            <p className="text-muted-foreground"> </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading months...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {months.map((month, index) => (
              <Card 
                key={month.value}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50 hover:border-primary/20 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => handleMonthClick(month.value)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg text-primary group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {month.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Current Affairs for {month.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyCurrentAffairsPage;
