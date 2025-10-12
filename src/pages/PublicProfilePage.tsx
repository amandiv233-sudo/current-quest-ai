import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Activity, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const PublicProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["publicProfile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_public_profile", { p_user_id: userId })
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4 text-muted-foreground">Loading Profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center text-center">
          <div>
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold">User Not Found</h1>
            <p className="text-muted-foreground mt-2">The profile you are looking for does not exist.</p>
            <Link to="/leaderboard">
              <Button variant="outline" className="mt-6">Back to Leaderboard</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader className="items-center text-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-3xl">
                {profile.username?.charAt(0).toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl">{profile.username || 'Anonymous User'}</CardTitle>
            {profile.full_name && <p className="text-muted-foreground">{profile.full_name}</p>}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Tests Taken</h3>
                </div>
                <p className="text-3xl font-bold">{profile.total_tests || 0}</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Average Score</h3>
                </div>
                <p className="text-3xl font-bold">
                  {profile.average_score?.toFixed(2) || '0.00'}%
                </p>
              </Card>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PublicProfilePage;