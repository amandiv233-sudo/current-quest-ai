import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Exam {
  id: string;
  name: string;
  content_model: string;
}

const BankingCurrentAffairsManager = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBankingExams();
  }, []);

  const fetchBankingExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('content_model', 'monthly_current_affairs')
        .order('name');

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error fetching banking exams:', error);
      toast({
        title: "Error",
        description: "Failed to load banking exams",
        variant: "destructive",
      });
    }
  };

  const generateMonths = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        value: date.toISOString().slice(0, 10), // YYYY-MM-DD format for database
        displayValue: date.toISOString().slice(0, 7) // YYYY-MM for display
      });
    }
    
    return months;
  };

  const months = generateMonths();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, monthYear: string) => {
    const file = event.target.files?.[0];
    if (!file || !selectedExam) return;

    const selectedExamObj = exams.find(e => e.id === selectedExam);
    if (!selectedExamObj) return;

    setLoading(true);

    try {
      const text = await file.text();
      const questions = text.split('---').filter(q => q.trim());

      let successCount = 0;
      let failCount = 0;

      for (const questionText of questions) {
        try {
          const lines = questionText.trim().split('\n');
          const data: any = {
            category: 'Banking',
            subcategory: selectedExamObj.name,
            month_year: monthYear,
          };

          for (const line of lines) {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim();

            switch (key.trim()) {
              case 'Difficulty':
                data.difficulty = value.toLowerCase();
                break;
              case 'Type':
                data.mcq_type = value;
                break;
              case 'Question':
                data.question = value;
                break;
              case 'Options':
                const optionsIndex = lines.indexOf(line);
                data.option_a = lines[optionsIndex + 1]?.replace(/^A\)\s*/, '').trim();
                data.option_b = lines[optionsIndex + 2]?.replace(/^B\)\s*/, '').trim();
                data.option_c = lines[optionsIndex + 3]?.replace(/^C\)\s*/, '').trim();
                data.option_d = lines[optionsIndex + 4]?.replace(/^D\)\s*/, '').trim();
                break;
              case 'Correct Answer':
                data.correct_answer = value;
                break;
              case 'Explanation':
                data.explanation = value;
                break;
            }
          }

          if (data.question && data.option_a && data.correct_answer && data.explanation) {
            const { error } = await supabase.from('manual_mcqs').insert([data]);
            
            if (error) {
              console.error('Error inserting question:', error);
              failCount++;
            } else {
              successCount++;
            }
          } else {
            failCount++;
          }
        } catch (err) {
          console.error('Error processing question:', err);
          failCount++;
        }
      }

      toast({
        title: "Upload Complete",
        description: `Successfully added ${successCount} questions. ${failCount} questions failed.`,
        variant: successCount > 0 ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to process the file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Banking Current Affairs Manager</CardTitle>
            <p className="text-muted-foreground">
              Upload monthly current affairs MCQs for banking exams. Select an exam and upload questions for specific months.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Banking Exam</label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an exam..." />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedExam && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Upload MCQs by Month</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {months.map((month) => (
                    <Card key={month.value} className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">{month.label}</span>
                          </div>
                        </div>
                        <label htmlFor={`upload-${month.value}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled={loading}
                            asChild
                          >
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Bulk Upload
                            </span>
                          </Button>
                          <input
                            id={`upload-${month.value}`}
                            type="file"
                            accept=".txt,.docx"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, month.value)}
                            disabled={loading}
                          />
                        </label>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {!selectedExam && (
              <div className="text-center py-12 text-muted-foreground">
                Select a banking exam to start uploading monthly current affairs
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Simplified File Format</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <pre>{`Difficulty: Medium
Type: Current Affairs
Question: The RBI's '100 Days 100 Pays' campaign is aimed at addressing what issue?
Options:
A) Rising instances of digital fraud
B) Low credit offtake in rural areas
C) Large amounts of unclaimed deposits
D) Delays in loan processing
Correct Answer: C
Explanation: The '100 Days 100 Pays' campaign was launched to trace and settle the top 100 unclaimed deposits of every bank in every district within 100 days.
---`}</pre>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Note: Category, Sub-Category, and Month are automatically assigned based on your selection.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankingCurrentAffairsManager;
