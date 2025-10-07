// src/components/CategoryGrid.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Train, 
  Building2, 
  GraduationCap, 
  Shield, 
  BookOpen
} from "lucide-react";

const staticCategories = [
  {
    title: "Railway Exams",
    name: "Railway Exams",
    dbCategory: "Railway",
    icon: Train,
    description: "RRB NTPC, Group D, ALP",
    color: "bg-blue-500",
  },
  {
    title: "SSC Exams", 
    name: "SSC Exams",
    dbCategory: "SSC",
    icon: Building2,
    description: "CGL, CHSL, CPO, GD",
    color: "bg-green-500",
  },
  {
    title: "Banking Exams",
    name: "Banking Exams",
    dbCategory: "Banking",
    icon: GraduationCap,
    description: "IBPS, SBI, RBI, RRB",
    color: "bg-purple-500", 
  },
  {
    title: "Static GK",
    name: "Static GK",
    dbCategory: "Static GK",
    icon: BookOpen,
    description: "Comprehensive Static Knowledge",
    color: "bg-rose-500",
  }
];

const CategoryGrid = () => {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      // UPDATED: Call the new, more powerful database function
      const { data, error } = await supabase.rpc('get_homepage_category_counts');

      if (error) {
        console.error("Error fetching MCQ counts:", error);
      } else if (data) {
        // UPDATED: The returned column is now 'category_name'
        const countsMap = data.reduce((acc: Record<string, number>, item) => {
          acc[item.category_name] = item.mcq_count;
          return acc;
        }, {});
        setCategoryCounts(countsMap);
      }
      setLoading(false);
    };

    fetchCounts();
  }, []);

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
          {staticCategories.map((category, index) => {
            const count = categoryCounts[category.dbCategory] || 0;

            return (
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
                      <span className="text-xs font-medium text-primary">
                        {loading ? '...' : `${count}+ MCQs`}
                      </span>
                    </div>
                  </div>
                  <Link 
                    to={
                      category.name === "Static GK" 
                        ? "/static-gk-subcategories"
                        : category.name === "Banking Exams"
                        ? `/banking-current-affairs`
                        : `/exam-types/${category.name}`
                    } 
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
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;