import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import CurrentAffairsSection from "@/components/CurrentAffairsSection";
import AIAssistantSection from "@/components/AIAssistantSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CategoryGrid />
      <CurrentAffairsSection />
      <AIAssistantSection />
      <Footer />
    </div>
  );
};

export default Index;
