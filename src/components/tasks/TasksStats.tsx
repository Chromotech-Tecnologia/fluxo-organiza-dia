
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  Users, 
  ArrowRight, 
  AlertCircle,
  Calendar,
  Briefcase,
  Star,
  Shield
} from "lucide-react";
import { Task } from "@/types";
import { getTimeInMinutes, formatTime } from "@/lib/taskUtils";

interface TasksStatsProps {
  tasks: Task[];
}

export function TasksStats({ tasks }: TasksStatsProps) {
  // Calcular estatísticas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  
  // Tarefas "não feitas" = tarefas que foram clicadas como "não feitas" (têm histórico de not-done)
  const notDoneTasks = tasks.filter(task => 
    task.completionHistory?.some(completion => completion.status === 'not-done')
  ).length;
  
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  
  // Tarefas reagendadas = todas que foram clicadas em reagendar (isForwarded = true ou forwardCount > 0 ou forwardHistory > 0)
  const forwardedTasks = tasks.filter(task => 
    task.isForwarded || 
    task.forwardCount > 0 || 
    (task.forwardHistory && task.forwardHistory.length > 0)
  ).length;
  
  // Tarefas não reagendadas = o contrário das reagendadas
  const notForwardedTasks = tasks.filter(task => 
    !task.isForwarded && 
    task.forwardCount === 0 && 
    (!task.forwardHistory || task.forwardHistory.length === 0)
  ).length;
  
  const meetingTasks = tasks.filter(task => task.type === 'meeting').length;
  const delegatedTasks = tasks.filter(task => task.type === 'delegated-task').length;
  const personalTasks = tasks.filter(task => task.category === 'personal').length;
  const concludedTasks = tasks.filter(task => task.isConcluded).length;
  const notConcludedTasks = tasks.filter(task => !task.isConcluded).length;
  
  // Tarefas definitivas: completadas E não repassadas
  const definitiveTasks = tasks.filter(task => 
    task.status === 'completed' && 
    !task.isForwarded && 
    task.forwardCount === 0 &&
    (!task.forwardHistory || task.forwardHistory.length === 0)
  ).length;

  // Calcular tempos totais
  const totalEstimatedTime = tasks.reduce((total, task) => {
    return total + getTimeInMinutes(task.timeInvestment, task.customTimeMinutes);
  }, 0);

  const completedTime = tasks
    .filter(task => task.status === 'completed')
    .reduce((total, task) => {
      return total + getTimeInMinutes(task.timeInvestment, task.customTimeMinutes);
    }, 0);

  const notDoneTime = tasks
    .filter(task => task.completionHistory?.some(completion => completion.status === 'not-done'))
    .reduce((total, task) => {
      return total + getTimeInMinutes(task.timeInvestment, task.customTimeMinutes);
    }, 0);

  const pendingTime = totalEstimatedTime - completedTime - notDoneTime;

  const stats = [
    {
      label: "Total",
      value: totalTasks,
      time: formatTime(totalEstimatedTime),
      percentage: 100,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-200"
    },
    {
      label: "Feitas",
      value: completedTasks,
      time: formatTime(completedTime),
      percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100", 
      borderColor: "border-green-200"
    },
    {
      label: "Não Feitas",
      value: notDoneTasks,
      time: formatTime(notDoneTime),
      percentage: totalTasks > 0 ? Math.round((notDoneTasks / totalTasks) * 100) : 0,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      borderColor: "border-red-200"
    },
    {
      label: "Pendentes",
      value: pendingTasks,
      time: formatTime(pendingTime),
      percentage: totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0,
      icon: Clock,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
      borderColor: "border-slate-200",
      isAlert: pendingTasks > 0
    },
    {
      label: "Reagendadas",
      value: forwardedTasks,
      percentage: totalTasks > 0 ? Math.round((forwardedTasks / totalTasks) * 100) : 0,
      icon: ArrowRight,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-200"
    },
    {
      label: "Definitivas",
      value: definitiveTasks,
      percentage: totalTasks > 0 ? Math.round((definitiveTasks / totalTasks) * 100) : 0,
      icon: Star,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-200"
    },
    {
      label: "Não Reagendadas",
      value: notForwardedTasks,
      percentage: totalTasks > 0 ? Math.round((notForwardedTasks / totalTasks) * 100) : 0,
      icon: Shield,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      borderColor: "border-emerald-200"
    },
    {
      label: "Concluídas",
      value: concludedTasks,
      percentage: totalTasks > 0 ? Math.round((concludedTasks / totalTasks) * 100) : 0,
      icon: CheckCircle,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      borderColor: "border-indigo-200"
    },
    {
      label: "Não Concluídas",
      value: notConcludedTasks,
      percentage: totalTasks > 0 ? Math.round((notConcludedTasks / totalTasks) * 100) : 0,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      borderColor: "border-orange-200",
      isAlert: notConcludedTasks > 0
    },
    {
      label: "Reuniões",
      value: meetingTasks,
      percentage: totalTasks > 0 ? Math.round((meetingTasks / totalTasks) * 100) : 0,
      icon: Users,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
      borderColor: "border-cyan-200"
    }
  ];

  // Verificar se o dia está fechado (todas as tarefas concluídas)
  const isDayClosed = totalTasks > 0 && concludedTasks === totalTasks;

  return (
    <Card className={isDayClosed ? "border-green-500 bg-green-50" : ""}>
      <CardContent className="p-4">
        {isDayClosed && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">🎉 Dia Fechado! Todas as tarefas foram concluídas!</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor} ${stat.borderColor} border mb-2`}>
                  <IconComponent className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-bold ${stat.isAlert ? 'text-red-600' : 'text-foreground'}`}>
                  {stat.value}
                </div>
                {stat.time && (
                  <div className="text-xs text-muted-foreground opacity-70">
                    {stat.time}
                  </div>
                )}
                <div className="text-xs text-muted-foreground opacity-70">
                  {stat.percentage}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
