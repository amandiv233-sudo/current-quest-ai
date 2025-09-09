import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  is_active: boolean;
  created_at: string;
}

const categories = [
  "SSC CGL", "Banking", "Railway", "Defense", "UPSC", "General",
  "Politics", "Economy", "Science", "Sports", "International"
];

const AdminMCQs = () => {
  const [mcqs, setMcqs] = useState<ManualMCQ[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
    explanation: "",
    category: "",
    subcategory: "",
    difficulty: "medium",
    question_type: "mcq",
    exam_year: "",
    tags: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMCQs();
  }, []);

  const fetchMCQs = async () => {
    try {
      const { data, error } = await supabase
        .from('manual_mcqs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMcqs(data || []);
    } catch (error) {
      console.error('Error fetching MCQs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch MCQs",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const mcqData = {
        ...formData,
        exam_year: formData.exam_year ? parseInt(formData.exam_year) : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      if (editingId) {
        const { error } = await supabase
          .from('manual_mcqs')
          .update(mcqData)
          .eq('id', editingId);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "MCQ updated successfully"
        });
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('manual_mcqs')
          .insert(mcqData);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "MCQ added successfully"
        });
        setShowAddForm(false);
      }

      setFormData({
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
        explanation: "",
        category: "",
        subcategory: "",
        difficulty: "medium",
        question_type: "mcq",
        exam_year: "",
        tags: ""
      });

      fetchMCQs();
    } catch (error) {
      console.error('Error saving MCQ:', error);
      toast({
        title: "Error",
        description: "Failed to save MCQ",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (mcq: ManualMCQ) => {
    setFormData({
      question: mcq.question,
      option_a: mcq.option_a,
      option_b: mcq.option_b,
      option_c: mcq.option_c,
      option_d: mcq.option_d,
      correct_answer: mcq.correct_answer,
      explanation: mcq.explanation,
      category: mcq.category,
      subcategory: mcq.subcategory || "",
      difficulty: mcq.difficulty,
      question_type: mcq.question_type,
      exam_year: mcq.exam_year?.toString() || "",
      tags: mcq.tags?.join(', ') || ""
    });
    setEditingId(mcq.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this MCQ?')) return;
    
    try {
      const { error } = await supabase
        .from('manual_mcqs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({
        title: "Success",
        description: "MCQ deleted successfully"
      });
      fetchMCQs();
    } catch (error) {
      console.error('Error deleting MCQ:', error);
      toast({
        title: "Error",
        description: "Failed to delete MCQ",
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('manual_mcqs')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      toast({
        title: "Success",
        description: `MCQ ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
      fetchMCQs();
    } catch (error) {
      console.error('Error updating MCQ status:', error);
      toast({
        title: "Error",
        description: "Failed to update MCQ status",
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "A",
      explanation: "",
      category: "",
      subcategory: "",
      difficulty: "medium",
      question_type: "mcq",
      exam_year: "",
      tags: ""
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Admin MCQ Management</h1>
              <p className="text-muted-foreground">Add and manage MCQs for all categories</p>
            </div>
          </div>
          <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
            <Plus className="w-4 h-4 mr-2" />
            Add New MCQ
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit MCQ' : 'Add New MCQ'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Subcategory (optional)"
                    value={formData.subcategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  />

                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={formData.question_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, question_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">MCQ</SelectItem>
                      <SelectItem value="pyq">Previous Year Question</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Exam Year (for PYQs)"
                    type="number"
                    value={formData.exam_year}
                    onChange={(e) => setFormData(prev => ({ ...prev, exam_year: e.target.value }))}
                  />

                  <Input
                    placeholder="Tags (comma separated)"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>

                <Textarea
                  placeholder="Question"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Option A"
                    value={formData.option_a}
                    onChange={(e) => setFormData(prev => ({ ...prev, option_a: e.target.value }))}
                    required
                  />
                  <Input
                    placeholder="Option B"
                    value={formData.option_b}
                    onChange={(e) => setFormData(prev => ({ ...prev, option_b: e.target.value }))}
                    required
                  />
                  <Input
                    placeholder="Option C"
                    value={formData.option_c}
                    onChange={(e) => setFormData(prev => ({ ...prev, option_c: e.target.value }))}
                    required
                  />
                  <Input
                    placeholder="Option D"
                    value={formData.option_d}
                    onChange={(e) => setFormData(prev => ({ ...prev, option_d: e.target.value }))}
                    required
                  />
                </div>

                <Select 
                  value={formData.correct_answer} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, correct_answer: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Explanation"
                  value={formData.explanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                  required
                />

                <div className="flex gap-2">
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    {editingId ? 'Update MCQ' : 'Save MCQ'}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {mcqs.map((mcq) => (
            <Card key={mcq.id} className={mcq.is_active ? '' : 'opacity-50'}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{mcq.question}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={mcq.difficulty === 'easy' ? 'secondary' : mcq.difficulty === 'hard' ? 'destructive' : 'default'}>
                      {mcq.difficulty}
                    </Badge>
                    <Badge variant="outline">{mcq.question_type.toUpperCase()}</Badge>
                    <Badge variant={mcq.is_active ? 'default' : 'secondary'}>
                      {mcq.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  {mcq.category} {mcq.subcategory && `• ${mcq.subcategory}`}
                  {mcq.exam_year && ` • Year: ${mcq.exam_year}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p><span className="font-semibold">A.</span> {mcq.option_a}</p>
                  <p><span className="font-semibold">B.</span> {mcq.option_b}</p>
                  <p><span className="font-semibold">C.</span> {mcq.option_c}</p>
                  <p><span className="font-semibold">D.</span> {mcq.option_d}</p>
                </div>
                
                <p className="text-green-600 font-semibold mb-2">
                  Correct Answer: {mcq.correct_answer}
                </p>
                <p className="text-sm mb-4">{mcq.explanation}</p>

                {mcq.tags && mcq.tags.length > 0 && (
                  <div className="flex gap-1 mb-4">
                    {mcq.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(mcq)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant={mcq.is_active ? "secondary" : "default"}
                    onClick={() => toggleActive(mcq.id, mcq.is_active)}
                  >
                    {mcq.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDelete(mcq.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {mcqs.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No MCQs found. Add your first MCQ!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMCQs;