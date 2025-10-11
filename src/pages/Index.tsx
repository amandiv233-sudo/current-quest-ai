// src/pages/Index.tsx
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import AnalyticsDashboard from "@/components/AnalyticsDashboard"; // <-- Import
import { RecentMCQsSection } from "@/components/RecentMCQsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CategoryGrid />
      <AnalyticsDashboard /> {/* <-- Add it here */}
      <RecentMCQsSection />
      <Footer />
    </div>
  );
};

export default Index;