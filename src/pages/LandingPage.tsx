import { useAuthStore } from "@/stores/useAuthStore";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { NavigationBar } from "@/components/landing/NavigationBar";

const LandingPage = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main>
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>

      <footer className="bg-gradient-footer py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                <img 
                  src="/logo-favicon.png" 
                  alt="OrganizeSe" 
                  className="w-8 h-8"
                />
                <h3 className="text-lg font-semibold text-gradient">OrganizeSe</h3>
              </div>
              <p className="text-white/80">Organize sua equipe e multiplique sua produtividade</p>
            </div>
            <div className="text-sm text-white/70">
              © 2024 OrganizeSe. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;