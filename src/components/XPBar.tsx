import { useEffect, useState } from "react";
import { Trophy, Zap } from "lucide-react";

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  streak: number;
}

export const XPBar = ({ currentXP, maxXP, streak }: XPBarProps) => {
  const [animatedXP, setAnimatedXP] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedXP(currentXP);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentXP]);

  const percentage = (animatedXP / maxXP) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-50">
      <div className="container mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 min-w-fit">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">Practice Streak</span>
          </div>
          
          <div className="flex-1 relative">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out relative"
                style={{ width: `${percentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 min-w-fit">
            <span className="text-sm font-medium">
              {currentXP} / {maxXP} XP
            </span>
            <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary">{streak}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
