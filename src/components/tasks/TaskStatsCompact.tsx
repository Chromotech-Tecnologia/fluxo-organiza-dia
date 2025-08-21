
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/types";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  Shield,
  Star
} from "lucide-react";

interface TaskStatsCompactProps {
  tasks: Task[];
}

export function TaskStatsCompact({ tasks }: TaskStatsCompactProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  
  // Não feitas = tarefas que foram marcadas como "not-done"
  const notDoneTasks = tasks.filter(task => task.status === 'not-done').length;
  
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  
  // Reagendadas = tarefas que têm histórico de reagendamento
  const forwardedTasks = tasks.filter(task => 
    (task.forwardHistory && task.forwardHistory.length > 0) || 
    task.forwardCount > 0 ||
    task.isForwarded
  ).length;
  
  // Não reagendadas = tarefas que NÃO têm histórico de reagendamento
  const notForwardedTasks = tasks.filter(task => 
    !task.isForwarded && 
    task.forwardCount === 0 && 
    (!task.forwardHistory || task.forwardHistory.length === 0)
  ).length;

  // Tarefas definitivas: completadas E não reagendadas
  const definitiveTasks = tasks.filter(task => 
    task.status === 'completed' && 
    !task.isForwarded && 
    task.forwardCount === 0 && 
    (!task.forwardHistory || task.forwardHistory.length === 0)
  ).length;

  const stats = [
    {
      label: "Total",
      value: totalTasks,
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Feitas",
      value: completedTasks,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      label: "Não Feitas",
      value: notDoneTasks,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      label: "Pendentes",
      value: pendingTasks,
      icon: Clock,
      color: "text-slate-600",
      bgColor: "bg-slate-50"
    },
    {
      label: "Reagendadas",
      value: forwardedTasks,
      icon: ArrowRight,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      label: "Não Reagendadas",
      value: notForwardedTasks,
      icon: Shield,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      label: "Definitivas",
      value: definitiveTasks,
      icon: Star,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-4">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            const percentage = totalTasks > 0 ? Math.round((stat.value / totalTasks) * 100) : 0;
            
            return (
              <div key={stat.label} className="text-center">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.bgColor} mb-2`}>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="text-xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground opacity-70">
                  {percentage}%
                </div>
                <div className="text-xs text-muted-foreground font-medium">
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
