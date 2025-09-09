import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, Bookmark, Share2, RefreshCw } from "lucide-react";
import { useCurrentAffairs } from "@/hooks/useCurrentAffairs";
import { useToast } from "@/components/ui/use-toast";

const CurrentAffairsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const { articles, loading, error, refreshData, incrementViewCount } = useCurrentAffairs(selectedCategory);

  const categories = ["All", "Defense", "Banking", "Science & Tech", "Railway", "International", "Sports", "General"];

  const toggleBookmark = (id: string) => {
    setBookmarkedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      toast({
        title: "Success",
        description: "Current affairs updated successfully!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to refresh current affairs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleArticleClick = (articleId: string, sourceUrl?: string) => {
    incrementViewCount(articleId);
    if (sourceUrl) {
      window.open(sourceUrl, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (error && articles.length === 0) {
    return (
      <section id="current-affairs" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Today's Current Affairs
          </h2>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={handleRefreshData} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Fetch Current Affairs
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="current-affairs" className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Today's Current Affairs
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefreshData}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Exam-focused current affairs with MCQs and key points for competitive exams
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="transition-all duration-200"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {loading && articles.length === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Exam-Focused Content Grid */}
        {articles.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {articles.map((news, index) => (
              <Card 
                key={news.id} 
                className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-fade-in border-l-4 border-l-primary"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {news.category}
                      </Badge>
                      {news.exam_relevance && news.exam_relevance.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          {news.exam_relevance[0]}
                        </Badge>
                      )}
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(news.priority)}`} />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(news.id);
                      }}
                    >
                      <Bookmark 
                        className={`h-4 w-4 ${bookmarkedItems.includes(news.id) ? 'fill-current text-yellow-500' : ''}`} 
                      />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Quick Fact Box */}
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 rounded">
                    <h4 className="font-semibold text-blue-800 text-sm mb-1">📚 Exam Key Point</h4>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      {news.summary.length > 150 ? news.summary.substring(0, 150) + "..." : news.summary}
                    </p>
                  </div>

                  {/* Sample MCQ */}
                  <div className="bg-purple-50 border border-purple-200 p-3 mb-4 rounded">
                    <h4 className="font-semibold text-purple-800 text-sm mb-2">🎯 Likely Exam Question</h4>
                    <p className="text-purple-700 text-sm mb-2">
                      Which of the following statements about {news.title.split(' ').slice(0, 3).join(' ')} is correct?
                    </p>
                    <div className="text-xs text-purple-600 space-y-1">
                      <div>A) Related to {news.category} sector reforms</div>
                      <div>B) Announced in {formatDate(news.published_at)}</div>
                      <div>C) Both A and B are correct</div>
                      <div>D) None of the above</div>
                    </div>
                    <p className="text-xs text-purple-800 font-semibold mt-2">Answer: C</p>
                  </div>

                  {/* Key Facts */}
                  {news.tags && news.tags.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-foreground mb-2">🔑 Key Terms:</h5>
                      <div className="flex flex-wrap gap-1">
                        {news.tags.slice(0, 4).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs px-2 py-1 bg-yellow-50 text-yellow-800 border-yellow-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(news.published_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{news.view_count}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {news.source}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (news.source_url) {
                          window.open(news.source_url, '_blank');
                          incrementViewCount(news.id);
                        }
                      }}
                      className="text-xs"
                    >
                      Read Source
                    </Button>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (navigator.share) {
                            navigator.share({
                              title: `Exam Prep: ${news.title}`,
                              text: news.summary,
                              url: news.source_url || window.location.href
                            });
                          }
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              No current affairs found for {selectedCategory === "All" ? "any category" : selectedCategory}.
            </p>
            <Button onClick={handleRefreshData} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Fetching Latest News...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Fetch Current Affairs
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CurrentAffairsSection;