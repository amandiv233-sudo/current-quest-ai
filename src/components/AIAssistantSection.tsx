import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAIAssistant, useMockTestGenerator } from "@/hooks/useAIAssistant";
import { 
  MessageCircle, 
  Brain, 
  Send, 
  Sparkles, 
  BookOpen, 
  HelpCircle,
  TestTube,
  Zap,
  Loader2
} from "lucide-react";

interface ChatMessage {
  type: 'user' | 'assistant';
  message: string;
  time: string;
}

const sampleQuestions = [
  "Explain the significance of India's G20 presidency",
  "What are the key features of the new National Education Policy?", 
  "Summarize the latest RBI monetary policy changes",
  "What is the impact of Digital India initiative?"
];

const AIAssistantSection = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [showMockTestOptions, setShowMockTestOptions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState("10");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [selectedExamType, setSelectedExamType] = useState("");
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { sendMessage: sendAIMessage, loading: aiLoading } = useAIAssistant();
  const { generateTest, loading: testLoading } = useMockTestGenerator();

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (message.trim() && !aiLoading) {
      const userMessage = message.trim();
      setMessage("");
      
      // Add user message to chat
      const newUserMessage: ChatMessage = {
        type: 'user',
        message: userMessage,
        time: new Date().toLocaleTimeString()
      };
      
      setChatHistory(prev => [...prev, newUserMessage]);

      try {
        const response = await sendAIMessage(userMessage, sessionId, 'general');
        
        // Update session ID if new
        if (response.sessionId && !sessionId) {
          setSessionId(response.sessionId);
        }
        
        // Add assistant response to chat
        const assistantMessage: ChatMessage = {
          type: 'assistant',
          message: response.response,
          time: new Date().toLocaleTimeString()
        };
        
        setChatHistory(prev => [...prev, assistantMessage]);
        
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to get response from AI assistant. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
  };

  const handleGenerateMockTest = async () => {
    if (!selectedCategory) {
      toast({
        title: "Category Required",
        description: "Please select a category for the mock test.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await generateTest(
        selectedCategory,
        parseInt(selectedQuestions),
        selectedDifficulty as 'easy' | 'medium' | 'hard',
        selectedExamType || undefined
      );

      toast({
        title: "Mock Test Generated!",
        description: `${result.title} has been created with ${result.totalQuestions} questions.`,
      });

      // Add message to chat about test generation
      const testMessage: ChatMessage = {
        type: 'assistant',
        message: `🎯 Great! I've generated a mock test for you:\n\n**${result.title}**\n- ${result.totalQuestions} questions\n- Time limit: ${result.timeLimit} minutes\n- Difficulty: ${selectedDifficulty}\n\nThe test has been saved and you can access it anytime. Good luck with your preparation!`,
        time: new Date().toLocaleTimeString()
      };
      
      setChatHistory(prev => [...prev, testMessage]);
      setShowMockTestOptions(false);
      
      // Reset form
      setSelectedCategory("");
      setSelectedQuestions("10");
      setSelectedDifficulty("medium");
      setSelectedExamType("");

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate mock test. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="ai-assistant" className="py-16 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            AI-Powered Learning Assistant
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get instant explanations, generate custom mock tests, and clarify doubts with our intelligent assistant
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chat Interface */}
          <Card className="h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <span>Ask AI Assistant</span>
                <Badge variant="secondary" className="ml-auto bg-accent text-accent-foreground">
                  Online
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Chat History */}
              <div 
                ref={chatContainerRef}
                className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[300px]"
              >
                {chatHistory.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Ask me anything about current affairs!</p>
                  </div>
                )}
                
                {chatHistory.map((chat, index) => (
                  <div
                    key={index}
                    className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        chat.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                      <span className="text-xs opacity-70 mt-1 block">{chat.time}</span>
                    </div>
                  </div>
                ))}
                
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask any question about current affairs..."
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={aiLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="icon"
                  disabled={aiLoading || !message.trim()}
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features Panel */}
          <div className="space-y-6">
            {/* Quick Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <span>Quick Questions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sampleQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto p-3 whitespace-normal"
                      onClick={() => handleQuickQuestion(question)}
                      disabled={aiLoading}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mock Test Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5 text-primary" />
                  <span>Generate Mock Test</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Create personalized quizzes based on recent current affairs
                  </p>
                  
                  {!showMockTestOptions ? (
                    <Button 
                      variant="hero" 
                      className="w-full"
                      onClick={() => setShowMockTestOptions(true)}
                      disabled={testLoading}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Mock Test
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Category *</label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Defense">Defense</SelectItem>
                            <SelectItem value="Banking">Banking</SelectItem>
                            <SelectItem value="Railway">Railway</SelectItem>
                            <SelectItem value="Science & Tech">Science & Tech</SelectItem>
                            <SelectItem value="International">International</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="General">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Exam Type</label>
                        <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select exam (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SSC CGL">SSC CGL</SelectItem>
                            <SelectItem value="Banking">Banking Exams</SelectItem>
                            <SelectItem value="Railway">Railway Exams</SelectItem>
                            <SelectItem value="Defense">Defense Exams</SelectItem>
                            <SelectItem value="UPSC">UPSC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Number of Questions</label>
                        <Select value={selectedQuestions} onValueChange={setSelectedQuestions}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 Questions</SelectItem>
                            <SelectItem value="10">10 Questions</SelectItem>
                            <SelectItem value="15">15 Questions</SelectItem>
                            <SelectItem value="25">25 Questions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Difficulty</label>
                        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
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

                      <div className="flex space-x-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1"
                          onClick={handleGenerateMockTest}
                          disabled={testLoading || !selectedCategory}
                        >
                          {testLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Generate Test
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowMockTestOptions(false)}
                          disabled={testLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span>AI Capabilities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-accent" />
                    <div>
                      <h4 className="font-medium text-sm">Detailed Explanations</h4>
                      <p className="text-xs text-muted-foreground">Get clear explanations for complex topics</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <TestTube className="h-5 w-5 text-accent" />
                    <div>
                      <h4 className="font-medium text-sm">Custom Quizzes</h4>
                      <p className="text-xs text-muted-foreground">Generate tests based on recent current affairs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Sparkles className="h-5 w-5 text-accent" />
                    <div>
                      <h4 className="font-medium text-sm">Smart Learning</h4>
                      <p className="text-xs text-muted-foreground">Personalized content based on your exam goals</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistantSection;