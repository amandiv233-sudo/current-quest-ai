// src/components/Footer.tsx

import { Link } from "react-router-dom";
import { BookOpen, Trophy, Brain } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole"; // <-- Import the new hook

const Footer = () => {
  const { role } = useUserRole(); // <-- Use the new hook to get the role

  return (
    <footer className="bg-muted py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">MCQ Master</span>
            </div>
            <p className="text-foreground/80 text-sm leading-relaxed">
              Your complete platform for MCQ practice and competitive exam preparation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/#categories" className="text-muted-foreground hover:text-foreground transition-colors">Categories</Link></li>
              <li><Link to="/#practice" className="text-muted-foreground hover:text-foreground transition-colors">Practice Questions</Link></li>
              {role === 'admin' && (
                <li><Link to="/admin/mcqs" className="text-muted-foreground hover:text-foreground transition-colors">Manage MCQs</Link></li>
              )}
            </ul>
          </div>

          {/* Popular Exams */}
          <div>
            <h3 className="font-semibold mb-4">Popular Exams</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/exam-types/SSC Exams" className="text-muted-foreground hover:text-foreground transition-colors">SSC CGL</Link></li>
              <li><Link to="/banking-current-affairs" className="text-muted-foreground hover:text-foreground transition-colors">Banking Exams</Link></li>
              <li><Link to="/exam-types/Railway Exams" className="text-muted-foreground hover:text-foreground transition-colors">Railway Exams</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span className="text-muted-foreground">Multiple Categories</span>
              </li>
              <li className="flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span className="text-muted-foreground">Mock Tests</span>
              </li>
              <li className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span className="text-muted-foreground">Detailed Explanations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/20 mt-8 pt-8 text-center">
          <p className="text-muted-foreground/80 text-sm">
            © 2025 MCQ Master. All rights reserved. Your complete MCQ practice platform.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;