
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Target, 
  Calendar,
  RotateCcw,
  XCircle
} from "lucide-react";

interface TaskStatsImprovedProps {
  tasks: Task[];
  className?: string;
}

export function TaskStatsImproved({ tasks, className }: TaskStatsImprovedProps) {
  // Estatísticas básicas
  const totalTasks = tasks.length;
  const processedTasks = tasks.filter(task => task.isProcessed).length;
  const unprocessedTasks = totalTasks - processedTasks;
  
  // Tarefas feitas (completed)
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  
  // Tarefas não feitas (not-done)
  const notDoneTasks = tasks.filter(task => 
    task.completionHistory?.some(completion => completion.status === 'not-done')
  ).length;
  
  // Tarefas reagendadas
  const rescheduledTasks = tasks.filter(task => 
    task.forwardHistory && task.forwardHistory.length > 0
  ).length;
  
  // Tarefas definitivas (feitas e não reagendadas)
  const definitiveTasks = tasks.filter(task => 
    task.status === 'completed' && 
    (!task.forwardHistory || task.forwardHistory.length === 0) &&
    task.isProcessed
  ).length;

  // Taxa de processamento
  const processingRate = totalTasks > 0 ? Math.round((processedTasks / totalTasks) * 100) : 0;

  // Estatísticas de tempo
  const timeStats = {
    low: tasks.filter(t => t.timeInvestment === 'low').length,
    medium: tasks.filter(t => t.timeInvestment === 'medium').length,
    high: tasks.filter(t => t.timeInvestment === 'high').length
  };

  const stats = [
    {
      title: "Total",
      value: totalTasks,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Total de tarefas"
    },
    {
      title: "Processadas",
      value: processedTasks,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Tarefas processadas"
    },
    {
      title: "Não processadas",
      value: unprocessedTasks,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Aguardando decisão"
    },
    {
      title: "Feitas",
      value: completedTasks,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Tarefas concluídas"
    },
    {
      title: "Não feito",
      value: notDoneTasks,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Tarefas não executadas"
    },
    {
      title: "Reagendadas",
      value: rescheduledTasks,
      icon: RotateCcw,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Tarefas reagendadas"
    },
    {
      title: "Definitivo",
      value: definitiveTasks,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Feitas e finalizadas"
    }
  ];

  return (
    <div className={className}>
      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-full ${stat.bgColor} flex items-center justify-center mb-2`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm font-medium text-foreground">{stat.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.description}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progresso de processamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Taxa de Processamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processadas</span>
                <span>{processedTasks} de {totalTasks}</span>
              </div>
              <Progress value={processingRate} className="h-2" />
              <div className="text-center text-lg font-semibold text-primary">
                {processingRate}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por tempo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tempo Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">5min</Badge>
                  <span className="text-sm">Rápidas</span>
                </div>
                <span className="font-semibold">{timeStats.low}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">1h</Badge>
                  <span className="text-sm">Médias</span>
                </div>
                <span className="font-semibold">{timeStats.medium}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">2h</Badge>
                  <span className="text-sm">Longas</span>
                </div>
                <span className="font-semibold">{timeStats.high}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
