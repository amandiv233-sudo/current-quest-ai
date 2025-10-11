import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ManualMCQCard } from "@/components/ManualMCQCard"; // Import our new component
import { Loader2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

const MyBookmarksPage = () => {
  const { user } = useAuth();

  const { data: bookmarkedMCQs, isLoading } = useQuery({
    queryKey: ["bookmarkedMCQs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_bookmarked_mcqs", { p_user_id: user!.id });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Bookmark className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">My Bookmarks</h1>
            <p className="text-muted-foreground">All your saved questions for review.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading your bookmarks...</p>
          </div>
        ) : bookmarkedMCQs && bookmarkedMCQs.length > 0 ? (
          <div className="space-y-6">
            {bookmarkedMCQs.map((mcq) => (
              <ManualMCQCard key={mcq.id} mcq={mcq} isReviewMode={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No Bookmarks Found</h2>
            <p className="text-muted-foreground mt-2 mb-4">You haven't saved any questions yet.</p>
            <Link to="/">
              <Button>Start Practicing</Button>
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyBookmarksPage;