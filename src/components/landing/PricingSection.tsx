import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Check, Star, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Individual",
    description: "Perfeito para profissionais",
    price: "R$ 29",
    period: "/mês",
    features: [
      "1 usuário",
      "Tarefas ilimitadas",
      "Calendário integrado",
      "Relatórios básicos",
      "Sistema de habilidades",
      "Suporte por WhatsApp",
      "Tarefas recorrentes",
      "Backup automático"
    ],
    buttonText: "7 Dias Grátis",
    highlighted: false,
    icon: Star,
    badge: "Para Você"
  },
  {
    name: "Profissional",
    description: "Para pequenas equipes",
    price: "R$ 79",
    period: "/mês",
    features: [
      "Até 10 usuários",
      "Todas as funcionalidades",
      "Relatórios avançados",
      "Tarefas recorrentes",
      "Sistema de habilidades",
      "Suporte prioritário",
      "Integrações avançadas",
      "Backup automático",
      "Dashboard completo"
    ],
    buttonText: "7 Dias Grátis",
    highlighted: true,
    icon: Zap,
    badge: "Melhor Valor"
  },
  {
    name: "Enterprise",
    description: "Para grandes equipes",
    price: "Sob consulta",
    period: "",
    features: [
      "Usuários ilimitados",
      "Tudo do Profissional",
      "Suporte dedicado",
      "Onboarding personalizado",
      "Treinamento da equipe",
      "SLA garantido",
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
    question: "Como funciona o período de teste?",
    answer: "Oferecemos 7 dias grátis para testar todos os recursos. Após esse período, você pode solicitar ao suporte uma prorrogação do teste se necessário."
  },
  {
    question: "Os dados ficam seguros?",
    answer: "Absolutamente. Usamos criptografia de ponta e fazemos backups automáticos. Seus dados são protegidos com os mais altos padrões de segurança."
  },
  {
    question: "E se minha equipe crescer?",
    answer: "No plano Individual você tem 1 usuário. Se a equipe crescer, pode fazer upgrade para o Profissional (até 10 usuários) ou consultar o suporte para adicionar novos membros."
  }
];

export function PricingSection() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handlePlanSelect = (planName: string) => {
    if (planName === "Enterprise") {
      // Abrir WhatsApp para contato sobre plano Enterprise
      const message = encodeURIComponent('Olá! Tenho interesse no plano Enterprise do OrganizeSe.');
      window.open(`https://wa.me/5511969169869?text=${message}`, "_blank");
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
            Teste grátis por 7 dias e cresça no seu ritmo. Sem surpresas, sem taxas ocultas. 
            Apenas o que você precisa para impulsionar sua produtividade.
          </p>
          
          {/* Garantees */}
          <div className="flex justify-center items-center space-x-8 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-primary" />
              <span>7 dias grátis</span>
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