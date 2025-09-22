import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { LogIn, User, LayoutDashboard } from "lucide-react";

export function NavigationBar() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">O</span>
          </div>
          <span className="text-xl font-bold text-primary">OrganizeSe</span>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => scrollToSection('features')}
            className="text-foreground hover:text-primary transition-colors"
          >
            Funcionalidades
          </button>
          <button 
            onClick={() => scrollToSection('benefits')}
            className="text-foreground hover:text-primary transition-colors"
          >
            Benefícios
          </button>
          <button 
            onClick={() => scrollToSection('pricing')}
            className="text-foreground hover:text-primary transition-colors"
          >
            Preços
          </button>
          <button 
            onClick={() => scrollToSection('faq')}
            className="text-foreground hover:text-primary transition-colors"
          >
            FAQ
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm">
                <User className="w-4 h-4" />
                <span className="hidden md:inline">{user?.email}</span>
              </div>
              <Button onClick={() => navigate('/dashboard')} className="flex items-center space-x-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/auth')} className="flex items-center space-x-2">
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </Button>
              <Button onClick={() => navigate('/auth')} className="flex items-center space-x-2">
                <span>Cadastre-se Grátis</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}