import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, Users, Clock, TrendingUp } from "lucide-react";
import logoHorizontal from "@/assets/logo-horizontal.png";

export function HeroSection() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start mb-8">
              <img 
                src={logoHorizontal} 
                alt="OrganizeSe" 
                className="h-12 w-auto object-contain"
              />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Organize sua{" "}
                <span className="text-gradient">equipe</span> e 
                <span className="text-gradient block">multiplique sua produtividade</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                O sistema completo para gestão de tarefas e equipes que transforma caos em resultados. 
                Simplifique processos, aumente a produtividade e alcance seus objetivos.
              </p>
            </div>

            {/* Benefits highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Economize 5h por semana</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">+40% de produtividade</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">100% gratuito para começar</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={handleCTA} 
                className="bg-gradient-button hover:opacity-90 flex items-center space-x-2 text-lg px-8 py-3 shadow-lg text-white"
              >
                <span>{isAuthenticated ? 'Ir para Dashboard' : 'Comece Grátis Agora'}</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
              {!isAuthenticated && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Ver Demonstração
                </Button>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              ✨ Sem cartão de crédito • Configuração em 2 minutos • Suporte em português
            </p>
          </div>

          {/* Visual Elements */}
          <div className="relative">
            <div className="bg-gradient-card rounded-2xl border shadow-2xl p-8">
              <div className="space-y-6">
                {/* Mini dashboard preview */}
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Dashboard OrganizeSe</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                  </div>
                </div>
                
                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-primary p-3 rounded-lg text-white">
                    <Users className="w-6 h-6 mb-2" />
                    <p className="text-sm font-medium">24</p>
                    <p className="text-xs opacity-90">Membros</p>
                  </div>
                  <div className="bg-gradient-primary p-3 rounded-lg text-white">
                    <Clock className="w-6 h-6 mb-2" />
                    <p className="text-sm font-medium">156</p>
                    <p className="text-xs opacity-90">Tarefas</p>
                  </div>
                  <div className="bg-gradient-primary p-3 rounded-lg text-white">
                    <TrendingUp className="w-6 h-6 mb-2" />
                    <p className="text-sm font-medium">89%</p>
                    <p className="text-xs opacity-90">Concluídas</p>
                  </div>
                </div>

                {/* Task list preview */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Tarefas Recentes</h4>
                  {[
                    { title: 'Revisar proposta comercial', status: 'completed' },
                    { title: 'Preparar apresentação Q4', status: 'in-progress' },
                    { title: 'Reunião com equipe de design', status: 'pending' }
                  ].map((task, i) => (
                    <div key={i} className="flex items-center space-x-3 p-2 bg-muted/50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-primary' :
                        task.status === 'in-progress' ? 'bg-orange-500' : 'bg-muted-foreground'
                      }`}></div>
                      <span className="text-sm flex-1">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-gradient-primary text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              ⚡ Em tempo real
            </div>
            <div className="absolute -bottom-4 -left-4 bg-gradient-card border shadow-lg px-4 py-2 rounded-full text-sm font-medium">
              📊 Relatórios automáticos
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}