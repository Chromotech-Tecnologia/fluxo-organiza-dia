import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Check, Star, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Gratuito",
    description: "Perfeito para começar",
    price: "R$ 0",
    period: "/mês",
    features: [
      "Até 5 usuários",
      "Tarefas ilimitadas",
      "Calendário básico",
      "Relatórios simples",
      "Suporte por email",
      "2GB de armazenamento"
    ],
    buttonText: "Comece Grátis",
    highlighted: false,
    icon: Star,
    badge: "Mais Popular"
  },
  {
    name: "Profissional",
    description: "Para equipes que crescem",
    price: "R$ 29",
    period: "/usuário/mês",
    features: [
      "Usuários ilimitados",
      "Todas as funcionalidades",
      "Relatórios avançados",
      "Tarefas recorrentes",
      "Sistema de habilidades",
      "Suporte prioritário",
      "50GB de armazenamento",
      "Integrações avançadas",
      "Backup automático",
      "Personalização completa"
    ],
    buttonText: "Experimentar Grátis",
    highlighted: true,
    icon: Zap,
    badge: "Melhor Valor"
  },
  {
    name: "Enterprise",
    description: "Para grandes organizações",
    price: "Sob consulta",
    period: "",
    features: [
      "Tudo do Profissional",
      "Suporte dedicado",
      "Onboarding personalizado",
      "Treinamento da equipe",
      "SLA garantido",
      "Armazenamento ilimitado",
      "API personalizada",
      "Auditoria de segurança",
      "Compliance LGPD",
      "Implementação assistida"
    ],
    buttonText: "Falar com Vendas",
    highlighted: false,
    icon: Crown,
    badge: "Enterprise"
  }
];

const faqs = [
  {
    question: "Posso mudar de plano a qualquer momento?",
    answer: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças são aplicadas imediatamente."
  },
  {
    question: "O que acontece quando o período gratuito acaba?",
    answer: "Você pode continuar usando o plano gratuito indefinidamente ou fazer upgrade para desbloquear recursos avançados."
  },
  {
    question: "Os dados ficam seguros?",
    answer: "Absolutamente. Usamos criptografia de ponta e fazemos backups automáticos. Seus dados são protegidos com os mais altos padrões de segurança."
  },
  {
    question: "Há desconto para pagamento anual?",
    answer: "Sim! Oferecemos 2 meses gratuitos para quem opta pelo pagamento anual. Entre em contato para mais detalhes."
  }
];

export function PricingSection() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handlePlanSelect = (planName: string) => {
    if (planName === "Enterprise") {
      // Scroll to contact or open contact modal
      window.open("mailto:contato@organizese.chromotech.com.br?subject=Interesse no Plano Enterprise", "_blank");
    } else {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/auth');
      }
    }
  };

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Planos que <span className="text-primary">cabem no seu bolso</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comece gratuitamente e cresça no seu ritmo. Sem surpresas, sem taxas ocultas. 
            Apenas o que você precisa para impulsionar sua produtividade.
          </p>
          
          {/* Garantees */}
          <div className="flex justify-center items-center space-x-8 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-primary" />
              <span>30 dias grátis</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Sem compromisso</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Cancele a qualquer momento</span>
            </div>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.highlighted 
                  ? 'border-2 border-primary shadow-lg scale-105' 
                  : 'hover:scale-105'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                    {plan.badge}
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-xl ${plan.highlighted ? 'bg-primary/20' : 'bg-muted'}`}>
                    <plan.icon className={`w-8 h-8 ${plan.highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                </div>
                
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                
                <div className="py-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handlePlanSelect(plan.name)}
                  className={`w-full ${
                    plan.highlighted 
                      ? 'bg-primary hover:bg-primary/90' 
                      : ''
                  }`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Money back guarantee */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 text-center mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            💝 Garantia de 30 dias ou seu dinheiro de volta
          </h3>
          <p className="text-muted-foreground mb-6">
            Experimente todos os recursos premium por 30 dias. Se não ficar 100% satisfeito, 
            devolvemos seu dinheiro sem perguntas.
          </p>
          <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground">
            <div>✅ Sem risco</div>
            <div>✅ Sem pegadinhas</div>
            <div>✅ Reembolso total</div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-foreground mb-8">
            Perguntas Frequentes
          </h3>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card p-6 rounded-lg border">
                <h4 className="font-semibold text-foreground mb-2">{faq.question}</h4>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}