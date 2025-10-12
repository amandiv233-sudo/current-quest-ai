import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { RecentMCQsSection } from "@/components/RecentMCQsSection";
import Footer from "@/components/Footer";
import DailyChallengeSection from "@/components/DailyChallengeSection"; // --- 1. IMPORT THE NEW COMPONENT ---

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CategoryGrid />
        <AnalyticsDashboard />
        <DailyChallengeSection /> {/* --- 2. ADD THE COMPONENT HERE --- */}
        <RecentMCQsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;