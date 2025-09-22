import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckSquare, 
  Users, 
  Calendar, 
  BarChart3, 
  Repeat, 
  Award, 
  Bell, 
  Zap,
  Shield,
  Smartphone,
  Clock,
  Target
} from "lucide-react";

const features = [
  {
    icon: CheckSquare,
    title: "Gestão de Tarefas",
    description: "Crie, organize e acompanhe tarefas com facilidade. Defina prioridades, prazos e responsáveis.",
    highlight: "Organize tudo"
  },
  {
    icon: Users,
    title: "Equipes Colaborativas",
    description: "Gerencie membros da equipe, defina permissões e acompanhe o progresso de cada pessoa.",
    highlight: "Trabalhe em equipe"
  },
  {
    icon: Calendar,
    title: "Calendário Integrado",
    description: "Visualize tarefas e prazos em um calendário intuitivo. Nunca perca um deadline importante.",
    highlight: "Nunca atrase"
  },
  {
    icon: BarChart3,
    title: "Relatórios e Analytics",
    description: "Métricas detalhadas sobre produtividade, tempo gasto e performance da equipe.",
    highlight: "Dados que importam"
  },
  {
    icon: Repeat,
    title: "Tarefas Recorrentes",
    description: "Automatize tarefas que se repetem. Configure rotinas diárias, semanais ou mensais.",
    highlight: "Automatize rotinas"
  },
  {
    icon: Award,
    title: "Sistema de Habilidades",
    description: "Categorize membros por habilidades e otimize a distribuição de tarefas.",
    highlight: "Maximize talentos"
  },
  {
    icon: Bell,
    title: "Notificações Inteligentes",
    description: "Receba alertas sobre prazos, atualizações e mudanças importantes em tempo real.",
    highlight: "Fique por dentro"
  },
  {
    icon: Zap,
    title: "Interface Intuitiva",
    description: "Design moderno e responsivo que funciona perfeitamente em qualquer dispositivo.",
    highlight: "Fácil de usar"
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Seus dados protegidos com criptografia avançada e backups automáticos.",
    highlight: "100% seguro"
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Acesse e gerencie suas tarefas de qualquer lugar, a qualquer momento.",
    highlight: "Sempre disponível"
  },
  {
    icon: Clock,
    title: "Controle de Tempo",
    description: "Monitore tempo gasto em tarefas e otimize a produtividade da sua equipe.",
    highlight: "Otimize tempo"
  },
  {
    icon: Target,
    title: "Metas e Objetivos",
    description: "Defina objetivos claros e acompanhe o progresso rumo às suas metas.",
    highlight: "Alcance objetivos"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Tudo que você precisa em <span className="text-primary">um só lugar</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ferramentas poderosas e intuitivas que transformam a forma como sua equipe trabalha. 
            Descubra recursos que vão revolucionar sua produtividade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="px-2 py-1 bg-primary/10 rounded-full">
                    <span className="text-xs font-medium text-primary">{feature.highlight}</span>
                  </div>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Feature highlight */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            E muito mais recursos sendo adicionados constantemente!
          </h3>
          <p className="text-muted-foreground mb-6">
            Nossa equipe está sempre trabalhando para trazer novas funcionalidades que vão 
            potencializar ainda mais sua produtividade.
          </p>
          <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Atualizações semanais</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Sugestões da comunidade</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Sem custo adicional</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}