import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Train, 
  Building2, 
  GraduationCap, 
  Shield, 
  BookOpen, 
  Trophy, 
  Globe, 
  Lightbulb,
  Award,
  Users,
  Calendar,
  Newspaper
} from "lucide-react";

const categories = [
  {
    title: "Railway Exams",
    name: "Railway Exams",
    icon: Train,
    description: "RRB NTPC, Group D, ALP",
    color: "bg-blue-500",
    count: "150+ Updates"
  },
  {
    title: "SSC Exams", 
    name: "SSC Exams",
    icon: Building2,
    description: "CGL, CHSL, CPO, GD",
    color: "bg-green-500",
    count: "200+ Updates"
  },
  {
    title: "Banking Exams",
    name: "Banking Exams",
    icon: GraduationCap,
    description: "IBPS, SBI, RBI, RRB",
    color: "bg-purple-500", 
    count: "180+ Updates"
  },
  {
    title: "Defense Exams",
    name: "Defense Exams",
    icon: Shield,
    description: "NDA, CDS, AFCAT",
    color: "bg-red-500",
    count: "120+ Updates"
  },
  {
    title: "Books & Authors",
    name: "Books & Authors",
    icon: BookOpen,
    description: "Latest publications",
    color: "bg-orange-500",
    count: "50+ Updates"
  },
  {
    title: "Sports",
    name: "Sports",
    icon: Trophy,
    description: "Cricket, Football, Olympics",
    color: "bg-yellow-500",
    count: "80+ Updates"
  },
  {
    title: "International",
    name: "International",
    icon: Globe,
    description: "Global affairs & treaties",
    color: "bg-teal-500",
    count: "100+ Updates"
  },
  {
    title: "Science & Tech",
    name: "Science & Tech",
    icon: Lightbulb,
    description: "Innovation & discoveries",
    color: "bg-indigo-500",
    count: "90+ Updates"
  },
  {
    title: "Awards",
    name: "Awards",
    icon: Award,
    description: "Nobel, Padma, National",
    color: "bg-pink-500",
    count: "40+ Updates"
  },
  {
    title: "Appointments",
    name: "Appointments",
    icon: Users,
    description: "Government & corporate",
    color: "bg-cyan-500",
    count: "70+ Updates"
  },
  {
    title: "Important Days",
    name: "Important Days",
    icon: Calendar,
    description: "National & international",
    color: "bg-violet-500",
    count: "60+ Updates"
  },
  {
    title: "General News",
    name: "General News",
    icon: Newspaper,
    description: "Miscellaneous updates",
    color: "bg-emerald-500",
    count: "120+ Updates"
  },
  {
    title: "Static GK",
    name: "Static GK",
    icon: BookOpen,
    description: "Static General Knowledge",
    color: "bg-rose-500",
    count: "500+ Updates"
  }
];

const CategoryGrid = () => {
  return (
    <section id="categories" className="py-16 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Explore by Categories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your exam category or topic of interest to get targeted current affairs updates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Card 
              key={category.title} 
              className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50 hover:border-primary/20 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`${category.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {category.description}
                    </p>
                    <span className="text-xs text-accent font-medium">
                      {category.count}
                    </span>
                  </div>
                </div>
                <Link 
                  to={category.name === "Static GK" ? "/static-gk" : `/category/${category.name}`} 
                  className="w-full mt-4 block"
                >
                  <Button 
                    variant="category" 
                    size="sm" 
                    className="w-full"
                  >
                    View Updates
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategoryGrid;