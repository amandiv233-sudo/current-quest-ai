// src/components/AnalyticsDashboard.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, TrendingUp, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CategoryCount {
  category: string;
  visit_count: number;
}

const AnalyticsDashboard = () => {
  const [dailyTests, setDailyTests] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [categoryVisits, setCategoryVisits] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch all three stats at once
        const [dailyTestsResult, totalTestsResult, visitsResult] = await Promise.all([
          supabase.rpc('get_daily_mock_test_count'),
          supabase.rpc('get_total_mock_test_count'),
          supabase.rpc('get_daily_category_visit_counts')
        ]);

        if (dailyTestsResult.error) throw dailyTestsResult.error;
        setDailyTests(dailyTestsResult.data || 0);
        
        if (totalTestsResult.error) throw totalTestsResult.error;
        setTotalTests(totalTestsResult.data || 0);

        if (visitsResult.error) throw visitsResult.error;
        setCategoryVisits(visitsResult.data || []);

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Calculate derived stats
  const totalVisitsToday = categoryVisits.reduce((sum, item) => sum + item.visit_count, 0);
  const topCategory = categoryVisits.sort((a, b) => b.visit_count - a.visit_count)[0];

  if (loading) {
    // A more compact loading state
    return <section id="analytics" className="py-16 px-4 bg-muted/30"><div className="container mx-auto text-center"><p className="text-muted-foreground">Loading Analytics...</p></div></section>;
  }

  return (
    <section id="analytics" className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Live Platform Statistics</h2>
            <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-none">Real-time</Badge>
          </div>
          <p className="text-lg text-muted-foreground">Activity in the last 24 hours</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Visits Today Card */}
          <Card className="hover:shadow-lg hover:-translate-y-1 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold">{totalVisitsToday}</p>
                  <p className="text-sm text-muted-foreground">Page Visits Today</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg"><Users className="h-6 w-6 text-blue-500" /></div>
              </div>
            </CardContent>
          </Card>
          
          {/* Mock Tests Taken Today Card */}
          <Card className="hover:shadow-lg hover:-translate-y-1 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold">{dailyTests}</p>
                  <p className="text-sm text-muted-foreground">Tests Taken Today</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg"><FileText className="h-6 w-6 text-purple-500" /></div>
              </div>
            </CardContent>
          </Card>
          
          {/* Top Category Card */}
          <Card className="hover:shadow-lg hover:-translate-y-1 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{topCategory ? topCategory.category : 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">Today's Top Category</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg"><TrendingUp className="h-6 w-6 text-green-500" /></div>
              </div>
            </CardContent>
          </Card>
          
          {/* All-Time Tests Card */}
          <Card className="hover:shadow-lg hover:-translate-y-1 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold">{totalTests}</p>
                  <p className="text-sm text-muted-foreground">All-Time Tests Taken</p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-lg"><History className="h-6 w-6 text-orange-500" /></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsDashboard;