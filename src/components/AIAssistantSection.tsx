import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Brain, 
  Send, 
  Sparkles, 
  BookOpen, 
  HelpCircle,
  TestTube,
  Zap
} from "lucide-react";

const sampleQuestions = [
  "Explain the significance of India's G20 presidency",
  "What are the key features of the new National Education Policy?",
  "Generate a quiz on recent space missions by ISRO",
  "Summarize the latest RBI monetary policy changes"
];

const chatHistory = [
  {
    type: "user",
    message: "Can you explain the Digital India initiative?",
    time: "2 mins ago"
  },
  {
    type: "assistant", 
    message: "Digital India is a comprehensive program launched by the Government of India to transform the country into a digitally empowered society. The initiative focuses on three key areas: Digital Infrastructure, Digital Services, and Digital Literacy. Key components include broadband connectivity, mobile connectivity, e-governance services, and digital payment systems.",
    time: "2 mins ago"
  }
];

const AIAssistantSection = () => {
  const [message, setMessage] = useState("");
  const [showMockTestOptions, setShowMockTestOptions] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
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
              <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
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
                      <p className="text-sm">{chat.message}</p>
                      <span className="text-xs opacity-70 mt-1 block">{chat.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask any question about current affairs..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="h-4 w-4" />
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
                    Create personalized quizzes based on your preferred topics and difficulty level
                  </p>
                  
                  {!showMockTestOptions ? (
                    <Button 
                      variant="hero" 
                      className="w-full"
                      onClick={() => setShowMockTestOptions(true)}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Mock Test
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Select Category</label>
                        <select className="w-full p-2 border border-border rounded-md text-sm">
                          <option>Banking Exams</option>
                          <option>SSC Exams</option>
                          <option>Railway Exams</option>
                          <option>Defense Exams</option>
                          <option>General Awareness</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Number of Questions</label>
                        <select className="w-full p-2 border border-border rounded-md text-sm">
                          <option>10 Questions</option>
                          <option>25 Questions</option>
                          <option>50 Questions</option>
                          <option>100 Questions</option>
                        </select>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="default" size="sm" className="flex-1">
                          <Zap className="h-4 w-4 mr-2" />
                          Generate Test
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowMockTestOptions(false)}
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
                      <p className="text-xs text-muted-foreground">Get clear, simple explanations for complex topics</p>
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