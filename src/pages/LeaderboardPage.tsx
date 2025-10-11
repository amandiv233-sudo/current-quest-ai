import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Shield, Percent } from "lucide-react";
import { Database } from "@/integrations/supabase/types"; // --- 1. IMPORT Database TYPE ---

// --- 2. THIS IS THE CORRECTED TYPE DEFINITION ---
type LeaderboardEntry = Database["public"]["Functions"]["get_leaderboard"]["Returns"][number];

type LeaderboardPeriod = "daily" | "weekly" | "all-time";

const fetchLeaderboard = async (period: LeaderboardPeriod) => {
  const { data, error } = await supabase.rpc("get_leaderboard", { period });
  if (error) {
    throw new Error(error.message);
  }
  // The 'data' is now correctly typed, no 'as' casting needed.
  return data;
};

const LeaderboardPage = () => {
  const [period, setPeriod] = useState<LeaderboardPeriod>("all-time");

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard", period],
    queryFn: () => fetchLeaderboard(period),
  });

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-slate-400";
    if (rank === 3) return "text-orange-400";
    return "text-foreground";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Trophy className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="text-4xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground mt-2">See how you rank against the top players.</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Top 50 Players</CardTitle>
                <CardDescription>Rankings are based on weighted average mock test scores.</CardDescription>
              </div>
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <Button size="sm" variant={period === "daily" ? "default" : "ghost"} onClick={() => setPeriod("daily")}>Daily</Button>
                <Button size="sm" variant={period === "weekly" ? "default" : "ghost"} onClick={() => setPeriod("weekly")}>Weekly</Button>
                <Button size="sm" variant={period === "all-time" ? "default" : "ghost"} onClick={() => setPeriod("all-time")}>All-Time</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Avg. Score</TableHead>
                  <TableHead className="text-right">Tests Taken</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell><div className="h-6 bg-muted rounded w-1/2 mx-auto"></div></TableCell>
                      <TableCell><div className="h-6 bg-muted rounded"></div></TableCell>
                      <TableCell><div className="h-6 bg-muted rounded"></div></TableCell>
                      <TableCell><div className="h-6 bg-muted rounded"></div></TableCell>
                    </TableRow>
                  ))
                ) : leaderboard && leaderboard.length > 0 ? (
                  leaderboard.map((entry) => (
                    <TableRow key={entry.user_id}>
                      <TableCell className="text-center">
                        <span className={`text-lg font-bold ${getRankColor(entry.rank || 0)}`}>
                          {entry.rank}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link to={`/profile/${entry.user_id}`} className="flex items-center gap-3 hover:underline">
                          <Avatar>
                            <AvatarImage src={entry.avatar_url || undefined} />
                            <AvatarFallback>{entry.username?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{entry.username}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 font-semibold text-primary">
                          <Percent className="h-4 w-4" />
                          {entry.average_score?.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                         <div className="flex items-center justify-end gap-1.5 font-medium text-muted-foreground">
                          <Shield className="h-4 w-4" />
                          {entry.tests_taken}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No data available for this period. Be the first to take a test!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default LeaderboardPage;