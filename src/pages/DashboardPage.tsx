import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Award, Target, Activity, BarChart2, List, Loader2, Footprints, Star, Medal } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

// Types for our data
type OverallStats = Database["public"]["Functions"]["get_user_overall_stats"]["Returns"];
type CategoryPerformance = Database["public"]["Functions"]["get_user_category_performance"]["Returns"];
type RecentAttempts = Database["public"]["Functions"]["get_user_recent_attempts"]["Returns"];
type UserBadges = Database["public"]["Functions"]["get_user_badges"]["Returns"];
type Badge = UserBadges[number];

// Helper to map icon names from the DB to actual components
const iconMap: { [key: string]: React.ElementType } = {
  Footprints,
  Star,
  Medal,
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const [
    overallStatsQuery,
    categoryPerformanceQuery,
    recentAttemptsQuery,
    userBadgesQuery
  ] = useQueries({
    queries: [
      {
        queryKey: ["userOverallStats", user?.id],
        queryFn: async () => {
          const { data, error } = await supabase.rpc("get_user_overall_stats", { p_user_id: user!.id }).single();
          if (error) throw error;
          return data;
        },
        enabled: !!user,
      },
      {
        queryKey: ["userCategoryPerformance", user?.id],
        queryFn: async () => {
          const { data, error } = await supabase.rpc("get_user_category_performance", { p_user_id: user!.id });
          if (error) throw error;
          return data;
        },
        enabled: !!user,
      },
      {
        queryKey: ["userRecentAttempts", user?.id],
        queryFn: async () => {
          const { data, error } = await supabase.rpc("get_user_recent_attempts", { p_user_id: user!.id });
          if (error) throw error;
          return data;
        },
        enabled: !!user,
      },
      {
        queryKey: ["userBadges", user?.id],
        queryFn: async () => {
          const { data, error } = await supabase.rpc("get_user_badges", { p_user_id: user!.id });
          if (error) throw error;
          return data;
        },
        enabled: !!user,
      }
    ] as const,
  });

  const isLoading = 
    overallStatsQuery.isLoading || 
    categoryPerformanceQuery.isLoading || 
    recentAttemptsQuery.isLoading ||
    userBadgesQuery.isLoading;

  const overallStats = overallStatsQuery.data;
  const categoryPerformance = categoryPerformanceQuery.data;
  const recentAttempts = recentAttemptsQuery.data;
  const userBadges = userBadgesQuery.data as UserBadges | null;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!overallStats || overallStats.total_tests === 0) {
    return (
       <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container max-w-5xl mx-auto px-4 py-8">
           <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-4">Your Dashboard</h1>
            <p className="text-xl text-muted-foreground mb-6">Start taking mock tests to see your performance analysis here.</p>
            <Link to="/mock-test-generator">
              <Button size="lg">Take Your First Test</Button>
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
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">My Performance Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests Taken</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{overallStats.total_tests}</div>
              <p className="text-xs text-muted-foreground">tests completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{overallStats.average_score?.toFixed(2) || 0}%</div>
              <p className="text-xs text-muted-foreground">across all tests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{overallStats.best_score?.toFixed(2) || 0}%</div>
              <p className="text-xs text-muted-foreground">your personal best</p>
            </CardContent>
          </Card>
        </div>

        {/* My Achievements Section */}
        {userBadges && userBadges.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />My Achievements
              </CardTitle>
              <CardDescription>Badges you've unlocked through your hard work. Click a badge to see details.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              {userBadges.map((badge) => {
                const IconComponent = iconMap[badge.icon] || Star;
                return (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center gap-2 p-4 border rounded-lg w-28 text-center bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <IconComponent className="h-8 w-8 text-yellow-400" />
                    <span className="text-xs font-semibold truncate w-full">{badge.name}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />Category Performance
            </CardTitle>
            <CardDescription>Your average score in different test categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryPerformance} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis unit="%" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                />
                <Legend />
                <Bar dataKey="average_score" name="Average Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />Recent Test History
            </CardTitle>
            <CardDescription>Your last 10 mock test attempts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAttempts?.map((attempt) => (
                  <TableRow key={attempt.test_id}>
                    <TableCell className="font-medium">{attempt.title}</TableCell>
                    <TableCell className="hidden sm:table-cell">{format(new Date(attempt.completed_at), "dd MMM yyyy, p")}</TableCell>
                    <TableCell className="text-right font-semibold">{attempt.score}/{attempt.total_questions}</TableCell>
                    <TableCell className="text-right">
                       <Link to={`/mock-test-result/${attempt.test_id}`}>
                         <Button variant="outline" size="sm">View Result</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />

      {/* Badge Details Dialog */}
      <Dialog open={!!selectedBadge} onOpenChange={(isOpen) => !isOpen && setSelectedBadge(null)}>
        <DialogContent>
          {selectedBadge && (
            <>
              <DialogHeader className="items-center text-center">
                {(() => {
                  const IconComponent = iconMap[selectedBadge.icon] || Star;
                  return <IconComponent className="h-16 w-16 text-yellow-400 mb-4" />;
                })()}
                <DialogTitle className="text-2xl">{selectedBadge.name}</DialogTitle>
                <DialogDescription className="pt-2">
                  {selectedBadge.description}
                </DialogDescription>
              </DialogHeader>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;