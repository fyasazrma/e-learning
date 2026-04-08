import HeroSection from "@/components/landing/HeroSection";
import MiniHighlightSection from "@/components/landing/MiniHighlightSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import LearningFlowSection from "@/components/landing/LearningFlowSection";
import PopularModulesSection from "@/components/landing/PopularModulesSection";
import RolesSection from "@/components/landing/RolesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="landing-root fade-in">
      <HeroSection />
      <MiniHighlightSection />
      <FeaturesSection />
      <LearningFlowSection />
      <PopularModulesSection />
      <RolesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}