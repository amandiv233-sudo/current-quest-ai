import { Link } from "react-router-dom";
import { ChevronLeft, BookOpen, Landmark, History, MapPin, Building2, Users, Lightbulb, Award, Calendar, Trophy, Palette, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const subcategories = [
  {
    name: "Indian Polity & Constitution",
    icon: Landmark,
    description: "Fundamental Rights, Parliament, Judiciary",
    color: "bg-blue-500"
  },
  {
    name: "Indian History",
    icon: History,
    description: "Ancient, Medieval, Modern History",
    color: "bg-amber-500"
  },
  {
    name: "Geography",
    icon: MapPin,
    description: "Indian & World Geography",
    color: "bg-green-500"
  },
  {
    name: "Indian Economy",
    icon: Building2,
    description: "Five-Year Plans, Banking, RBI",
    color: "bg-emerald-500"
  },
  {
    name: "Important Organizations",
    icon: Users,
    description: "ISRO, DRDO, UNO, IMF, WHO",
    color: "bg-purple-500"
  },
  {
    name: "Science & Technology (Basic)",
    icon: Lightbulb,
    description: "Physics, Chemistry, Biology, IT",
    color: "bg-cyan-500"
  },
  {
    name: "Awards & Honours",
    icon: Award,
    description: "Civilian, Gallantry, International",
    color: "bg-yellow-500"
  },
  {
    name: "Books & Authors",
    icon: BookOpen,
    description: "Famous Authors & Biographies",
    color: "bg-orange-500"
  },
  {
    name: "Important Days & Events",
    icon: Calendar,
    description: "National & International Days",
    color: "bg-pink-500"
  },
  {
    name: "Sports",
    icon: Trophy,
    description: "Olympics, World Cups, Trophies",
    color: "bg-red-500"
  },
  {
    name: "Culture & Arts",
    icon: Palette,
    description: "Dance, Music, Temples, Festivals",
    color: "bg-violet-500"
  },
  {
    name: "Miscellaneous",
    icon: MoreHorizontal,
    description: "First in India/World, Boundaries",
    color: "bg-slate-500"
  }
];

const StaticGKSubcategories = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
               
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Sub-Categories</h1>
            <p className="text-muted-foreground"></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subcategories.map((subcategory, index) => (
            <Card 
              key={subcategory.name}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50 hover:border-primary/20 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`${subcategory.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                    <subcategory.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {subcategory.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {subcategory.description}
                    </p>
                  </div>
                </div>
                <Link to={`/topics/Static GK/${subcategory.name}`} className="w-full block">
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

export default StaticGKSubcategories;
