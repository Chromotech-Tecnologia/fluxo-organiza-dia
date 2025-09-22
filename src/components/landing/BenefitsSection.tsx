import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, DollarSign, Users, CheckCircle, Target, Zap, Award } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Economize 5 horas por semana",
    description: "Automatização de processos e organização eficiente reduzem drasticamente o tempo perdido.",
    metric: "5h",
    metricLabel: "economizadas por semana",
    before: "Reuniões intermináveis e tarefas perdidas",
    after: "Processos claros e automação inteligente"
  },
  {
    icon: TrendingUp,
    title: "Aumente a produtividade em 40%",
    description: "Equipes organizadas com ferramentas certas alcançam resultados extraordinários.",
    metric: "+40%",
    metricLabel: "de produtividade",
    before: "Trabalho disperso e sem foco",
    after: "Foco total nos objetivos importantes"
  },
  {
    icon: DollarSign,
    title: "Reduza custos operacionais",
    description: "Menor desperdício de tempo significa menor custo por projeto e maior rentabilidade.",
    metric: "30%",
    metricLabel: "redução de custos",
    before: "Retrabalho e processos ineficientes",
    after: "Execução precisa na primeira tentativa"
  },
  {
    icon: Users,
    title: "Melhore a comunicação da equipe",
    description: "Informações centralizadas eliminam ruídos e mantêm todos alinhados.",
    metric: "90%",
    metricLabel: "menos mal-entendidos",
    before: "Informações espalhadas em várias ferramentas",
    after: "Comunicação clara e centralizada"
  }
];

const testimonialStyle = [
  {
    icon: CheckCircle,
    title: "Entregas no Prazo",
    description: "Com prazos claros e acompanhamento em tempo real, sua equipe nunca mais perde um deadline.",
    color: "text-green-600"
  },
  {
    icon: Target,
    title: "Foco nos Objetivos",
    description: "Elimine distrações e concentre esforços no que realmente move o negócio para frente.",
    color: "text-blue-600"
  },
  {
    icon: Zap,
    title: "Agilidade Máxima",
    description: "Processos otimizados que aceleram a execução e reduzem tempo de ciclo.",
    color: "text-orange-600"
  },
  {
    icon: Award,
    title: "Qualidade Superior",
    description: "Padronização e controle garantem qualidade consistente em todas as entregas.",
    color: "text-purple-600"
  }
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Resultados que <span className="text-primary">você pode medir</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empresas que usam o OrganizeSe experimentam transformações reais e mensuráveis. 
            Veja o impacto que isso pode ter no seu negócio.
          </p>
        </div>

        {/* Main benefits with metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <benefit.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">{benefit.metric}</div>
                    <div className="text-sm text-muted-foreground">{benefit.metricLabel}</div>
                  </div>
                </div>
                <CardTitle className="text-2xl">{benefit.title}</CardTitle>
                <CardDescription className="text-base">
                  {benefit.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/10 rounded-lg border-l-4 border-l-destructive/50">
                    <div className="text-sm text-muted-foreground mb-1">❌ Antes:</div>
                    <div className="text-sm">{benefit.before}</div>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg border-l-4 border-l-primary">
                    <div className="text-sm text-muted-foreground mb-1">✅ Depois:</div>
                    <div className="text-sm">{benefit.after}</div>
                  </div>
                </div>
              </CardContent>
              
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16" />
            </Card>
          ))}
        </div>

        {/* Additional benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {testimonialStyle.map((item, index) => (
            <div key={index} className="text-center p-6 bg-card rounded-xl border hover:shadow-lg transition-all duration-300">
              <item.icon className={`w-12 h-12 ${item.color} mx-auto mb-4`} />
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Success story highlight */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                "Transformou completamente nossa operação"
              </h3>
              <p className="text-muted-foreground mb-6 text-lg">
                Em apenas 30 dias, conseguimos reduzir nosso tempo de entrega em 50% 
                e aumentar a satisfação do cliente para 95%. O OrganizeSe não é apenas 
                uma ferramenta, é uma mudança de paradigma.
              </p>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  <strong>Marina Silva</strong> - Diretora de Operações
                </div>
                <div className="text-sm text-muted-foreground">
                  TechCorp Solutions (120+ funcionários)
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-xl text-center border">
                <div className="text-2xl font-bold text-primary mb-1">50%</div>
                <div className="text-sm text-muted-foreground">Menos tempo de entrega</div>
              </div>
              <div className="bg-card p-4 rounded-xl text-center border">
                <div className="text-2xl font-bold text-primary mb-1">95%</div>
                <div className="text-sm text-muted-foreground">Satisfação do cliente</div>
              </div>
              <div className="bg-card p-4 rounded-xl text-center border">
                <div className="text-2xl font-bold text-primary mb-1">30</div>
                <div className="text-sm text-muted-foreground">Dias para resultados</div>
              </div>
              <div className="bg-card p-4 rounded-xl text-center border">
                <div className="text-2xl font-bold text-primary mb-1">120+</div>
                <div className="text-sm text-muted-foreground">Funcionários usando</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}