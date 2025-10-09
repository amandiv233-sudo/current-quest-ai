// src/components/Header.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BookOpen, User, Menu, X, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useUserRole } from "@/hooks/useUserRole";
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { role } = useUserRole(); 
  const { toast } = useToast();

  const handleSignOut = async () => { /* ... (This function is unchanged) */ };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <Link to="/"><span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">MCQ Master</span></Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/static-gk-subcategories" className="text-foreground hover:text-primary transition-colors">Static GK</Link>
            <Link to="/mock-test-generator" className="text-foreground hover:text-primary transition-colors">Mock Tests</Link>
            {role === 'admin' && (
              <Link to="/admin/mcqs" className="text-foreground hover:text-primary transition-colors">Manage MCQs</Link>
            )}
          </nav>
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm"><User className="h-4 w-4 mr-2" />{user.email?.split('@')[0] || 'User'}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {role === 'admin' && (
                    <Link to="/admin/mcqs"><DropdownMenuItem><Settings className="h-4 w-4 mr-2" />Admin MCQs</DropdownMenuItem></Link>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" />Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth"><Button variant="default" size="sm"><User className="h-4 w-4 mr-2" />Sign In</Button></Link>
            )}
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <nav className="flex flex-col space-y-3 mb-4">
              <Link to="/" className="text-foreground hover:text-primary transition-colors px-2 py-1" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link to="/static-gk-subcategories" className="text-foreground hover:text-primary transition-colors px-2 py-1" onClick={() => setIsMobileMenuOpen(false)}>Static GK</Link>
              <Link to="/mock-test-generator" className="text-foreground hover:text-primary transition-colors px-2 py-1" onClick={() => setIsMobileMenuOpen(false)}>Mock Tests</Link>
            </nav>
            <div className="flex items-center justify-between pt-4 border-t">
              <ThemeToggle />
              <div className="flex space-x-2">
                {user ? (
                  <>
                    {role === 'admin' && (
                      <Link to="/admin/mcqs"><Button variant="outline" size="sm" className="justify-start"><Settings className="h-4 w-4 mr-2" />Admin</Button></Link>
                    )}
                    <Button variant="destructive" size="sm" onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" />Sign Out</Button>
                  </>
                ) : (
                  <Link to="/auth" className="w-full"><Button variant="default" size="sm" className="w-full"><User className="h-4 w-4 mr-2" />Sign In</Button></Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;