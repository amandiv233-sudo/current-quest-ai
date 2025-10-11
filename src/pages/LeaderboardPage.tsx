import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Shield, Percent } from "lucide-react";

type LeaderboardPeriod = "daily" | "weekly" | "all-time";

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  average_score: number;
  tests_taken: number;
}

const fetchLeaderboard = async (period: LeaderboardPeriod) => {
  const { data, error } = await supabase.rpc("get_leaderboard", { period });
  if (error) {
    throw new Error(error.message);
  }
  return data as LeaderboardEntry[];
};

const LeaderboardPage = () => {
  const [period, setPeriod] = useState<LeaderboardPeriod>("all-time");

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard", period],
    queryFn: () => fetchLeaderboard(period),
  });

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-400";
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
                <CardDescription>Rankings are based on average mock test scores.</CardDescription>
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
                      <TableCell><div className="h-6 bg-muted rounded"></div></TableCell>
                      <TableCell><div className="h-6 bg-muted rounded"></div></TableCell>
                      <TableCell><div className="h-6 bg-muted rounded"></div></TableCell>
                      <TableCell><div className="h-6 bg-muted rounded"></div></TableCell>
                    </TableRow>
                  ))
                ) : leaderboard && leaderboard.length > 0 ? (
                  leaderboard.map((entry) => (
                    <TableRow key={entry.user_id}>
                      <TableCell className="text-center">
                        <span className={`text-lg font-bold ${getRankColor(entry.rank)}`}>
                          {entry.rank}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={entry.avatar_url || undefined} />
                            <AvatarFallback>{entry.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{entry.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 font-semibold text-primary">
                          <Percent className="h-4 w-4" />
                          {entry.average_score.toFixed(2)}
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