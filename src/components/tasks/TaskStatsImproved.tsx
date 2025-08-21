
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, Users, TrendingUp, Timer, Award } from "lucide-react";
import { Task } from "@/types";
import { calculateTotalEstimatedTime, formatTime } from "@/lib/taskUtils";

interface TaskStatsImprovedProps {
  tasks: Task[];
}

export function TaskStatsImproved({ tasks }: TaskStatsImprovedProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed' || task.isConcluded).length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const notDoneTasks = tasks.filter(task => task.completionHistory?.some(c => c.status === 'not-done')).length;
  const forwardedTasks = tasks.filter(task => task.isForwarded || task.forwardCount > 0).length;
  const delegatedTasks = tasks.filter(task => task.type === 'delegated-task').length;
  const meetingTasks = tasks.filter(task => task.type === 'meeting').length;
  const concludedTasks = tasks.filter(task => task.isConcluded).length;
  
  // Tarefas definitivas: feitas E não reagendadas E concluídas
  const definitiveTasks = tasks.filter(task => 
    task.status === 'completed' && 
    !task.isForwarded && 
    task.isConcluded
  ).length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalEstimatedTime = calculateTotalEstimatedTime(tasks);

  if (totalTasks === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTasks}</div>
          <p className="text-xs text-muted-foreground">
            tarefas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
          <p className="text-xs text-muted-foreground">
            aguardando
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concluído</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{concludedTasks}</div>
          <p className="text-xs text-muted-foreground">
            {completionRate}% do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Definitivo</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">{definitiveTasks}</div>
          <p className="text-xs text-muted-foreground">
            feito e finalizado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Não feito</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{notDoneTasks}</div>
          <p className="text-xs text-muted-foreground">
            não executado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reunião</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{meetingTasks}</div>
          <p className="text-xs text-muted-foreground">
            reuniões
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reagendadas</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{forwardedTasks}</div>
          <p className="text-xs text-muted-foreground">
            repassadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delegadas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{delegatedTasks}</div>
          <p className="text-xs text-muted-foreground">
            equipe
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Estimado</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-600">{formatTime(totalEstimatedTime)}</div>
          <p className="text-xs text-muted-foreground">
            total estimado
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
