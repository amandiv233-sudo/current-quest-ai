import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Trophy, TrendingUp } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 px-4">
      <div className="container mx-auto text-center">
        {/* Main Content */}
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Master Current Affairs with
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              AI-Powered Learning
            </span>
          </h1>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Stay updated with daily current affairs, practice with AI-generated mock tests, 
            and get instant doubt resolution for competitive exams.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4">
              <BookOpen className="h-5 w-5 mr-2" />
              Start Learning Today
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Brain className="h-5 w-5 mr-2" />
              Try AI Assistant
            </Button>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <TrendingUp className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Daily Updates</h3>
              <p className="text-white/80 text-sm">Fresh current affairs from multiple reliable sources</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Brain className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">AI Assistant</h3>
              <p className="text-white/80 text-sm">Smart doubt solving and personalized explanations</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Mock Tests</h3>
              <p className="text-white/80 text-sm">AI-generated quizzes tailored to your exam needs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default HeroSection;