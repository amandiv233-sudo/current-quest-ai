// src/pages/AdminSyllabusManager.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Re-using the subcategories list from the user-facing page
const subcategories = [
  { name: "Indian Polity & Constitution" }, { name: "Indian History" }, { name: "Geography" },
  { name: "Indian Economy" }, { name: "Important Organizations" }, { name: "Science & Technology (Basic)" },
  { name: "Awards & Honours" }, { name: "Books & Authors" }, { name: "Important Days & Events" },
  { name: "Sports" }, { name: "Culture & Arts" }, { name: "Miscellaneous" }
];

interface Exam {
  id: string;
  name: string;
}

const AdminSyllabusManager = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [currentMappings, setCurrentMappings] = useState<string[]>([]);
  const [selectedMappings, setSelectedMappings] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchSyllabusMappings(selectedExamId);
    } else {
      setCurrentMappings([]);
      setSelectedMappings(new Set());
    }
  }, [selectedExamId]);

  const fetchExams = async () => {
    const { data, error } = await supabase.from('exams').select('id, name').order('name');
    if (data) setExams(data);
  };

  const fetchSyllabusMappings = async (examId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('exam_syllabus_mappings')
      .select('subcategory')
      .eq('exam_id', examId);

    if (data) {
      const mappings = data.map(item => item.subcategory);
      setCurrentMappings(mappings);
      setSelectedMappings(new Set(mappings));
    }
    setLoading(false);
  };

  const handleCheckboxChange = (subcategory: string, checked: boolean) => {
    setSelectedMappings(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(subcategory);
      } else {
        newSet.delete(subcategory);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!selectedExamId) return;

    setLoading(true);
    const selectedArray = Array.from(selectedMappings);

    const toAdd = selectedArray.filter(subcat => !currentMappings.includes(subcat));
    const toRemove = currentMappings.filter(subcat => !selectedArray.includes(subcat));

    try {
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('exam_syllabus_mappings')
          .delete()
          .eq('exam_id', selectedExamId)
          .in('subcategory', toRemove);
        if (deleteError) throw deleteError;
      }

      if (toAdd.length > 0) {
        const insertData = toAdd.map(subcategory => ({ exam_id: selectedExamId, subcategory }));
        const { error: insertError } = await supabase
          .from('exam_syllabus_mappings')
          .insert(insertData);
        if (insertError) throw insertError;
      }

      toast({ title: "Success", description: "Syllabus updated successfully." });
      fetchSyllabusMappings(selectedExamId); // Refresh current state
    } catch (error) {
      console.error("Error saving syllabus:", error);
      toast({ title: "Error", description: "Failed to update syllabus.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/mcqs">
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Syllabus Manager</h1>
            <p className="text-muted-foreground">Map Static GK subcategories to exams.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select an Exam</CardTitle>
            <CardDescription>Choose an exam to manage its syllabus.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an exam..." />
              </SelectTrigger>
              <SelectContent>
                {exams.map(exam => (
                  <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedExamId && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Map Subcategories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subcategories.map(subcat => (
                    <div key={subcat.name} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                      <Checkbox
                        id={subcat.name}
                        checked={selectedMappings.has(subcat.name)}
                        onCheckedChange={(checked) => handleCheckboxChange(subcat.name, !!checked)}
                      />
                      <Label htmlFor={subcat.name} className="flex-1 cursor-pointer">{subcat.name}</Label>
                    </div>
                  ))}
                </div>
                <Button onClick={handleSave} disabled={loading} className="mt-6">
                  <Save className="w-4 h-4 mr-2" />
                  Save Syllabus
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSyllabusManager;