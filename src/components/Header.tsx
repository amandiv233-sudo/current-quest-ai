import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BookOpen, MessageCircle, User, Menu, X, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <Link to="/">
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                MCQ Master
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#current-affairs" className="text-foreground hover:text-primary transition-colors">
              Current Affairs
            </a>
            <a href="#categories" className="text-foreground hover:text-primary transition-colors">
              Categories
            </a>
            <a href="#mock-tests" className="text-foreground hover:text-primary transition-colors">
              Mock Tests
            </a>
            <a href="#ai-assistant" className="text-foreground hover:text-primary transition-colors">
              AI Assistant
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              AI Chat
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user.email?.split('@')[0] || 'User'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <Link to="/admin/mcqs">
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Admin MCQs
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <nav className="flex flex-col space-y-3">
              <a href="#current-affairs" className="text-foreground hover:text-primary transition-colors px-2 py-1">
                Current Affairs
              </a>
              <a href="#categories" className="text-foreground hover:text-primary transition-colors px-2 py-1">
                Categories
              </a>
              <a href="#mock-tests" className="text-foreground hover:text-primary transition-colors px-2 py-1">
                Mock Tests
              </a>
              <a href="#ai-assistant" className="text-foreground hover:text-primary transition-colors px-2 py-1">
                AI Assistant
              </a>
              <div className="flex flex-col space-y-2 pt-2">
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  AI Chat
                </Button>
                
                {user ? (
                  <>
                    <Link to="/admin/mcqs">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Admin MCQs
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link to="/auth">
                    <Button variant="default" size="sm" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;