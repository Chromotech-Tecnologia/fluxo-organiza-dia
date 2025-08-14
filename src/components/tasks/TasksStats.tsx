import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  Users, 
  ArrowRight, 
  AlertCircle,
  Calendar,
  Briefcase 
} from "lucide-react";
import { Task } from "@/types";

interface TasksStatsProps {
  tasks: Task[];
}

export function TasksStats({ tasks }: TasksStatsProps) {
  // Calcular estatísticas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const notDoneTasks = tasks.filter(task => task.status === 'not-done').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const forwardedTasks = tasks.filter(task => 
    task.status === 'forwarded-date' || task.status === 'forwarded-person'
  ).length;
  const meetingTasks = tasks.filter(task => task.type === 'meeting').length;
  const delegatedTasks = tasks.filter(task => task.type === 'delegated-task').length;

  const stats = [
    {
      label: "Total",
      value: totalTasks,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-200"
    },
    {
      label: "Feitas",
      value: completedTasks,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100", 
      borderColor: "border-green-200"
    },
    {
      label: "Não Feitas",
      value: notDoneTasks,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      borderColor: "border-red-200"
    },
    {
      label: "Pendentes",
      value: pendingTasks,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-200"
    },
    {
      label: "Repassadas",
      value: forwardedTasks,
      icon: ArrowRight,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-200"
    },
    {
      label: "Reuniões",
      value: meetingTasks,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      borderColor: "border-orange-200"
    },
    {
      label: "Delegadas",
      value: delegatedTasks,
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      borderColor: "border-indigo-200"
    }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor} ${stat.borderColor} border mb-2`}>
                  <IconComponent className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
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