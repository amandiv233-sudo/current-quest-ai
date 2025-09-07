import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, Bookmark, Share2 } from "lucide-react";

const sampleNews = [
  {
    id: 1,
    title: "India successfully tests Agni-V missile with MIRV technology",
    summary: "The Defence Research and Development Organisation (DRDO) successfully conducted the first flight test of indigenously developed Agni-V missile with Multiple Independently Targetable Re-entry Vehicle (MIRV) technology.",
    category: "Defense",
    subcategory: "DRDO",
    date: "2024-01-08",
    time: "10:30 AM",
    priority: "high",
    views: 1250,
    source: "PIB"
  },
  {
    id: 2,
    title: "RBI announces new digital payment guidelines for 2024",
    summary: "Reserve Bank of India releases comprehensive guidelines for digital payment systems, focusing on enhanced security measures and interoperability standards for financial institutions.",
    category: "Banking",
    subcategory: "RBI",
    date: "2024-01-08",
    time: "9:15 AM", 
    priority: "medium",
    views: 890,
    source: "RBI Official"
  },
  {
    id: 3,
    title: "Chandrayaan-3 mission data reveals water molecules in lunar soil",
    summary: "Indian Space Research Organisation (ISRO) publishes detailed analysis from Chandrayaan-3 mission, confirming presence of water molecules in lunar south pole region.",
    category: "Science & Tech",
    subcategory: "Space",
    date: "2024-01-08",
    time: "8:45 AM",
    priority: "high",
    views: 2100,
    source: "ISRO"
  },
  {
    id: 4,
    title: "Indian Railways announces new Vande Bharat routes for 2024",
    summary: "Ministry of Railways unveils expansion plan for Vande Bharat Express services, adding 15 new routes connecting major cities across different states.",
    category: "Railway",
    subcategory: "Infrastructure",
    date: "2024-01-08",
    time: "7:30 AM",
    priority: "medium",
    views: 1540,
    source: "Ministry of Railways"
  }
];

const CurrentAffairsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarkedItems, setBookmarkedItems] = useState<number[]>([]);

  const categories = ["All", "Defense", "Banking", "Science & Tech", "Railway", "International"];

  const filteredNews = selectedCategory === "All" 
    ? sampleNews 
    : sampleNews.filter(news => news.category === selectedCategory);

  const toggleBookmark = (id: number) => {
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

  return (
    <section id="current-affairs" className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Today's Current Affairs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest developments across all exam categories
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

        {/* News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {filteredNews.map((news, index) => (
            <Card 
              key={news.id} 
              className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {news.category}
                    </Badge>
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
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  {news.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {news.summary}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{news.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{news.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{news.views}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {news.source}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="default" size="sm">
                    Read Full Article
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CurrentAffairsSection;