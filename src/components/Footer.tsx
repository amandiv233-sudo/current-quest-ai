import { BookOpen, MessageCircle, Trophy, Brain } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Current Quest AI</span>
            </div>
            <p className="text-background/80 text-sm leading-relaxed">
              Your comprehensive platform for current affairs and competitive exam preparation with AI-powered learning assistance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#current-affairs" className="text-background/80 hover:text-background transition-colors">Current Affairs</a></li>
              <li><a href="#categories" className="text-background/80 hover:text-background transition-colors">Categories</a></li>
              <li><a href="#mock-tests" className="text-background/80 hover:text-background transition-colors">Mock Tests</a></li>
              <li><a href="#ai-assistant" className="text-background/80 hover:text-background transition-colors">AI Assistant</a></li>
            </ul>
          </div>

          {/* Exam Categories */}
          <div>
            <h3 className="font-semibold mb-4">Popular Exams</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">SSC CGL</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Banking Exams</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Railway Exams</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Defense Exams</a></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span className="text-background/80">AI Doubt Solver</span>
              </li>
              <li className="flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span className="text-background/80">Mock Tests</span>
              </li>
              <li className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span className="text-background/80">Smart Learning</span>
              </li>
              <li className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span className="text-background/80">Daily Updates</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-background/20 mt-8 pt-8 text-center">
          <p className="text-background/60 text-sm">
            © 2024 Current Quest AI. All rights reserved. Empowering exam preparation with AI.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;