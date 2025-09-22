import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Users, Trophy, Zap } from "lucide-react";

export function CTASection() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleMainCTA = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const stats = [
    { icon: Users, label: "Empresas", value: "500+", description: "confiam no OrganizeSe" },
    { icon: Trophy, label: "Produtividade", value: "+40%", description: "aumento médio" },
    { icon: Zap, label: "Tempo", value: "5h", description: "economizadas por semana" },
    { icon: Sparkles, label: "Satisfação", value: "95%", description: "dos usuários recomendam" }
  ];

  return (
    <section className="py-20 bg-gradient-footer text-white">
      <div className="container mx-auto px-4">
        {/* Main CTA */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Pronto para <span className="text-white">revolucionar</span><br />
            sua produtividade?
          </h2>
          <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
            Junte-se a milhares de equipes que já transformaram seu jeito de trabalhar. 
            Comece hoje mesmo e veja a diferença em <strong>apenas 5 minutos</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              onClick={handleMainCTA} 
              className="bg-white text-primary hover:bg-white/90 text-xl px-10 py-4 h-auto flex items-center space-x-3 shadow-xl"
            >
              <span>{isAuthenticated ? 'Ir para Dashboard' : 'Começar Grátis Agora'}</span>
              <ArrowRight className="w-6 h-6" />
            </Button>
            {!isAuthenticated && (
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => window.open('mailto:contato@organizese.chromotech.com.br', '_blank')}
                className="text-xl px-10 py-4 h-auto border-2 border-white text-white hover:bg-white hover:text-primary"
              >
                Falar com Especialista
              </Button>
            )}
          </div>

          <p className="text-sm text-white/80">
            ✨ Configuração em 2 minutos • 🔒 Sem cartão de crédito • 📞 Suporte em português
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-white/10 rounded-xl">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-white mb-1">{stat.label}</div>
              <div className="text-xs text-white/70">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Final value proposition */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-white/20 shadow-xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                A transformação que sua empresa precisa está a um clique de distância
              </h3>
              <ul className="space-y-4 mb-8">
                {[
                  "Setup completo em menos de 5 minutos",
                  "Equipe produtiva desde o primeiro dia",
                  "ROI positivo em menos de 30 dias",
                  "Suporte especializado em português"
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-white/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <div className="bg-white/10 p-6 rounded-xl border border-white/20">
                <h4 className="font-bold text-xl mb-2 text-white">🚀 Oferta de Lançamento</h4>
                <p className="text-white/90 mb-4">
                  Primeiros 1000 usuários ganham <strong>3 meses grátis</strong> no plano Profissional
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white/80">Restam apenas 347 vagas</span>
                </div>
              </div>

              <Button 
                onClick={handleMainCTA} 
                size="lg" 
                className="w-full text-lg py-6 flex items-center justify-center space-x-3 bg-white text-primary hover:bg-white/90 shadow-xl"
              >
                <span>Garantir Minha Vaga</span>
                <ArrowRight className="w-5 h-5" />
              </Button>

              <p className="text-center text-xs text-white/70">
                Cancele a qualquer momento • Sem compromisso • Dados 100% seguros
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}