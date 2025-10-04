import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Define topics for each subcategory
const topicsBySubcategory: Record<string, string[]> = {
  "Indian Polity & Constitution": [
    "Fundamental Rights & Duties",
    "Parliament & Legislature",
    "Judiciary System",
    "Constitutional Amendments",
    "Federal Structure",
    "Emergency Provisions",
    "Local Governance"
  ],
  "Indian History": [
    "Ancient History",
    "Medieval History",
    "Modern History",
    "Freedom Movement",
    "Post-Independence India"
  ],
  "Geography": [
    "Physical Geography",
    "Indian Geography",
    "World Geography",
    "Economic Geography",
    "Environmental Geography"
  ],
  "Indian Economy": [
    "Five-Year Plans",
    "Banking & RBI",
    "Budget & Taxation",
    "Economic Policies",
    "Agriculture & Industry",
    "International Trade"
  ],
  "Important Organizations": [
    "Indian Organizations",
    "International Organizations",
    "Space & Defense Organizations",
    "Financial Institutions",
    "Health & Education Bodies"
  ],
  "Science & Technology (Basic)": [
    "Physics Basics",
    "Chemistry Basics",
    "Biology Basics",
    "Information Technology",
    "Recent Innovations"
  ],
  "Awards & Honours": [
    "Civilian Awards",
    "Gallantry Awards",
    "International Awards",
    "Sports Awards",
    "Literary Awards"
  ],
  "Books & Authors": [
    "Indian Authors",
    "International Authors",
    "Biographies & Autobiographies",
    "Famous Books"
  ],
  "Important Days & Events": [
    "National Days",
    "International Days",
    "Historical Events",
    "Observances & Celebrations"
  ],
  "Sports": [
    "Olympics",
    "Cricket",
    "Football",
    "Other Sports",
    "Sports Trophies & Tournaments"
  ],
  "Culture & Arts": [
    "Classical & Folk Dances",
    "Music & Musical Forms",
    "Temples & Monuments",
    "Festivals",
    "Art & Architecture",
    "Indian Cinema"
  ],
  "Miscellaneous": [
    "First in India",
    "First in World",
    "International Boundaries",
    "Famous Personalities",
    "Inventions & Discoveries"
  ]
};

const TopicsPage = () => {
  const { category, subcategory } = useParams();
  const topics = subcategory ? topicsBySubcategory[subcategory] || [] : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/static-gk-subcategories`}>
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Sub-Categories
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{subcategory} Topics</h1>
            <p className="text-muted-foreground">Choose a specific topic to practice</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => (
            <Card 
              key={topic}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50 hover:border-primary/20 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {topic}
                </h3>
                <Link to={`/category/${category}/${subcategory}/${topic}`} className="w-full block">
                  <Button 
                    variant="category" 
                    size="sm" 
                    className="w-full"
                  >
                    Start Practice
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicsPage;
