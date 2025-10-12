import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Plus, Edit, Trash2, Save, X, ChevronsLeft, ChevronLeftIcon, ChevronRight, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BulkMCQUpload } from "@/components/BulkMCQUpload";

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
  topic?: string;
  difficulty: string;
  question_type: string;
  mcq_type?: string;
  exam_year?: number;
  tags?: string[];
  is_active: boolean;
  created_at: string;
  mcq_date?: string;
}

const categories = [
  "Railway Exams",
  "SSC Exams",
  "Banking Exams",
  "Books & Authors",
  "Sports",
  "International",
  "Science & Tech",
  "Awards",
  "Appointments",
  "Important Days",
  "General News",
  "Static GK"
];

const staticGKSubcategories = [
  "Indian Polity & Constitution",
  "Indian History",
  "Geography",
  "Indian Economy",
  "Important Organizations",
  "Science & Technology (Basic)",
  "Awards & Honours",
  "Books & Authors",
  "Important Days & Events",
  "Sports",
  "Culture & Arts",
  "Miscellaneous"
];

const topicsBySubcategory: Record<string, string[]> = {
  "Indian Polity & Constitution": [
    "Fundamental Rights & Duties",
    "Parliament & Legislature",
    "Judiciary System",
    "Constitutional Amendments",
    "Federal Structure",
    "Emergency Provisions",
    "Local Governance"
  ],
  "Indian History": [
    "Ancient History",
    "Medieval History",
    "Modern History",
    "Freedom Movement",
    "Post-Independence India"
  ],
  "Geography": [
    "Physical Geography",
    "Indian Geography",
    "World Geography",
    "Economic Geography",
    "Environmental Geography"
  ],
  "Indian Economy": [
    "Five-Year Plans",
    "Banking & RBI",
    "Budget & Taxation",
    "Economic Policies",
    "Agriculture & Industry",
    "International Trade"
  ],
  "Important Organizations": [
    "Indian Organizations",
    "International Organizations",
    "Space & Defense Organizations",
    "Financial Institutions",
    "Health & Education Bodies"
  ],
  "Science & Technology (Basic)": [
    "Physics Basics",
    "Chemistry Basics",
    "Biology Basics",
    "Information Technology",
    "Recent Innovations"
  ],
  "Awards & Honours": [
    "Civilian Awards",
    "Gallantry Awards",
    "International Awards",
    "Sports Awards",
    "Literary Awards"
  ],
  "Books & Authors": [
    "Indian Authors",
    "International Authors",
    "Biographies & Autobiographies",
    "Famous Books"
  ],
  "Important Days & Events": [
    "National Days",
    "International Days",
    "Historical Events",
    "Observances & Celebrations"
  ],
  "Sports": [
    "Olympics",
    "Cricket",
    "Football",
    "Other Sports",
    "Sports Trophies & Tournaments"
  ],
  "Culture & Arts": [
    "Classical & Folk Dances",
    "Music & Musical Forms",
    "Temples & Monuments",
    "Festivals",
    "Art & Architecture",
    "Indian Cinema"
  ],
  "Miscellaneous": [
    "First in India",
    "First in World",
    "International Boundaries",
    "Famous Personalities",
    "Inventions & Discoveries"
  ]
};

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
    topic: "",
    difficulty: "medium",
    mcq_type: "General",
    mcq_date: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();
// --- 1. ADD STATE FOR PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 10;
  // --- 2. UPDATE useEffect TO RE-FETCH ON PAGE CHANGE ---
  useEffect(() => {
    fetchMCQs();
  }, [currentPage]); // Re-run when currentPage changes

  // --- 3. UPDATE fetchMCQs TO HANDLE PAGINATION ---
  const fetchMCQs = async () => {
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // First, get the total count of MCQs
      const { count, error: countError } = await supabase
        .from('manual_mcqs')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalCount(count || 0);

      // Then, fetch the data for the current page
      const { data, error } = await supabase
        .from('manual_mcqs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

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
const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get current user, but allow null for demo purposes
      const { data: { user } } = await supabase.auth.getUser();
      
      const mcqData = {
        question: formData.question,
        option_a: formData.option_a,
        option_b: formData.option_b,
        option_c: formData.option_c,
        option_d: formData.option_d,
        correct_answer: formData.correct_answer,
        explanation: formData.explanation,
        category: formData.category,
        subcategory: formData.category === "Static GK" ? formData.subcategory : null,
        topic: formData.category === "Static GK" && formData.subcategory ? formData.topic || null : null,
        difficulty: formData.difficulty,
        mcq_type: formData.mcq_type,
        mcq_date: formData.mcq_date,
        created_by: user?.id || null,
        is_active: true
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
        topic: "",
        difficulty: "medium",
        mcq_type: "General",
        mcq_date: new Date().toISOString().split('T')[0]
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
      topic: mcq.topic || "",
      difficulty: mcq.difficulty,
      mcq_type: mcq.mcq_type || "General",
      mcq_date: mcq.mcq_date || new Date().toISOString().split('T')[0]
    });
    setEditingId(mcq.id);
    // Switch to add tab when editing
    const addTab = document.querySelector('[value="add"]') as HTMLElement;
    if (addTab) addTab.click();
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
      topic: "",
      difficulty: "medium",
      mcq_type: "General",
      mcq_date: new Date().toISOString().split('T')[0]
    });
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
            <h1 className="text-3xl font-bold">Admin MCQ Management</h1>
            <p className="text-muted-foreground">Add and manage MCQs for all categories</p>
          </div>
        </div>

        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Banking Current Affairs Management</h3>
                <p className="text-sm text-muted-foreground">
                  For Banking exams, use the specialized monthly current affairs manager with context-aware bulk upload
                </p>
              </div>
              <Link to="/admin/banking-current-affairs">
                <Button variant="default">
                  Go to Banking Manager
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

<Card className="mb-6">
  <CardContent className="pt-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-lg mb-1">Exam Syllabus Manager</h3>
        <p className="text-sm text-muted-foreground">
          Define the syllabus for each exam by mapping Static GK subcategories.
        </p>
      </div>
      <Link to="/admin/syllabus-manager">
        <Button variant="outline">
          Manage Syllabi
        </Button>
      </Link>
    </div>
  </CardContent>
</Card>
        <Tabs defaultValue="manage" className="space-y-6">
          <TabsList>
            <TabsTrigger value="manage">Manage MCQs</TabsTrigger>
            <TabsTrigger value="add">Add Single MCQ</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? 'Edit MCQ' : 'Add New MCQ'}</CardTitle>
                <CardDescription>Fill in the details to add a new MCQ question</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category *</label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, category: value, subcategory: "" }));
                      }}
                      required
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
                  </div>

                  {formData.category === "Static GK" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Sub-Category *</label>
                        <Select 
                          value={formData.subcategory} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value, topic: "" }))}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select sub-category" />
                          </SelectTrigger>
                          <SelectContent>
                            {staticGKSubcategories.map(subcat => (
                              <SelectItem key={subcat} value={subcat}>{subcat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.subcategory && topicsBySubcategory[formData.subcategory] && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Topic</label>
                          <Select 
                            value={formData.topic} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, topic: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select topic (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {topicsBySubcategory[formData.subcategory].map(topic => (
                                <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty *</label>
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
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type *</label>
                    <Select 
                      value={formData.mcq_type} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, mcq_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Current Affairs">Current Affairs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">MCQ Date *</label>
                    <Input
                      type="date"
                      value={formData.mcq_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, mcq_date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Question *</label>
                  <Textarea
                    placeholder="Enter your question here"
                    value={formData.question}
                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Options *</label>
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Correct Answer *</label>
                  <Select 
                    value={formData.correct_answer} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, correct_answer: value }))}
                  >
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Option A</SelectItem>
                      <SelectItem value="B">Option B</SelectItem>
                      <SelectItem value="C">Option C</SelectItem>
                      <SelectItem value="D">Option D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Explanation *</label>
                  <Textarea
                    placeholder="Provide a detailed explanation for the correct answer"
                    value={formData.explanation}
                    onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                    required
                    rows={3}
                  />
                </div>

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
          </TabsContent>

          <TabsContent value="bulk">
            <BulkMCQUpload />
          </TabsContent>

          <TabsContent value="manage">
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
                <CardDescription className="flex items-center gap-2">
                  {mcq.category}
                  {mcq.subcategory && <><span>•</span><span>{mcq.subcategory}</span></>}
                  {mcq.mcq_date && (
                    <>
                      <span>•</span>
                      <span>{new Date(mcq.mcq_date).toLocaleDateString()}</span>
                    </>
                  )}
                  {mcq.mcq_type && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="ml-1">{mcq.mcq_type}</Badge>
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p><span className="font-semibold">A.</span> {mcq.option_a}</p>
                  <p><span className="font-semibold">B.</span> {mcq.option_b}</p>
                  <p><span className="font-semibold">C.</span> {mcq.option_c}</p>
                  <p><span className="font-semibold">D.</span> {mcq.option_d}</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-700 font-semibold mb-1">
                    Correct Answer: {mcq.correct_answer}
                  </p>
                  <p className="text-sm text-muted-foreground">{mcq.explanation}</p>
                </div>

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
        {/* --- 4. ADD PAGINATION CONTROLS --- */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
                 <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminMCQs;