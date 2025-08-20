
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/types";
import { Clock, CheckCircle, XCircle, Hourglass, RotateCcw, User, Calendar, Timer, Hash, Building2 } from "lucide-react";

interface TaskStatsCompactProps {
  tasks: Task[];
}

export function TaskStatsCompact({ tasks }: TaskStatsCompactProps) {
  const totalTasks = tasks.length;

  // Status das Tarefas
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const notDoneTasks = tasks.filter(task => task.status === 'not-done').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;

  // Reagendamentos
  const rescheduledTasks = tasks.filter(task => 
    task.forwardHistory && task.forwardHistory.length > 0
  ).length;
  const notRescheduledTasks = tasks.filter(task => 
    !task.forwardHistory || task.forwardHistory.length === 0
  ).length;
  const rescheduledCompletedTasks = tasks.filter(task => 
    task.forwardHistory && task.forwardHistory.length > 0 && task.status === 'completed'
  ).length;
  const rescheduledNotCompletedTasks = tasks.filter(task => 
    task.forwardHistory && task.forwardHistory.length > 0 && task.status !== 'completed'
  ).length;

  // Tipos de Tarefas
  const personalTasks = tasks.filter(task => task.type === 'own-task').length;
  const meetingTasks = tasks.filter(task => task.type === 'meeting').length;
  const delegatedTasks = tasks.filter(task => task.type === 'delegated-task').length;
  const professionalTasks = tasks.filter(task => task.category === 'business').length;

  // Tempo Estimado
  const getTimeInMinutes = (timeInvestment: string) => {
    switch (timeInvestment) {
      case 'low': return 5;
      case 'medium': return 60;
      case 'high': return 120;
      default: return 0;
    }
  };

  const totalEstimatedMinutes = tasks.reduce((total, task) => {
    return total + getTimeInMinutes(task.timeInvestment);
  }, 0);

  const completedEstimatedMinutes = tasks
    .filter(task => task.status === 'completed')
    .reduce((total, task) => total + getTimeInMinutes(task.timeInvestment), 0);

  const notDoneEstimatedMinutes = tasks
    .filter(task => task.status === 'not-done')
    .reduce((total, task) => total + getTimeInMinutes(task.timeInvestment), 0);

  const pendingEstimatedMinutes = tasks
    .filter(task => task.status === 'pending')
    .reduce((total, task) => total + getTimeInMinutes(task.timeInvestment), 0);

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const calculatePercentage = (value: number) => {
    return totalTasks > 0 ? Math.round((value / totalTasks) * 100) : 0;
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Status das Tarefas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Status das Tarefas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-blue-600">Total</span>
            <span className="text-sm font-medium text-blue-600">
              {totalTasks} (100%)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-green-600">Feitas</span>
            <span className="text-sm font-medium text-green-600">
              {completedTasks} ({calculatePercentage(completedTasks)}%)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-red-600">Não Feitas</span>
            <span className="text-sm font-medium text-red-600">
              {notDoneTasks} ({calculatePercentage(notDoneTasks)}%)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-yellow-600">Pendentes</span>
            <span className="text-sm font-medium text-yellow-600">
              {pendingTasks} ({calculatePercentage(pendingTasks)}%)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Reagendamentos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <RotateCcw className="h-4 w-4" />
            Reagendamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Não Reagendadas</span>
            <span className="text-sm font-medium text-gray-600">
              {notRescheduledTasks} ({calculatePercentage(notRescheduledTasks)}%)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-green-600">Concluídas</span>
            <span className="text-sm font-medium text-green-600">
              {rescheduledCompletedTasks} ({calculatePercentage(rescheduledCompletedTasks)}%)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-red-600">Não Concluídas</span>
            <span className="text-sm font-medium text-red-600">
              {rescheduledNotCompletedTasks} ({calculatePercentage(rescheduledNotCompletedTasks)}%)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Tarefas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <User className="h-4 w-4" />
            Tipos de Tarefas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-purple-600">Pessoais</span>
            <span className="text-sm font-medium text-purple-600">
              {personalTasks} ({calculatePercentage(personalTasks)}%)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-orange-600">Reuniões</span>
            <span className="text-sm font-medium text-orange-600">
              {meetingTasks} ({calculatePercentage(meetingTasks)}%)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-teal-600">Delegadas</span>
            <span className="text-sm font-medium text-teal-600">
              {delegatedTasks} ({calculatePercentage(delegatedTasks)}%)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-blue-600">Profissional</span>
            <span className="text-sm font-medium text-blue-600">
              {professionalTasks} ({calculatePercentage(professionalTasks)}%)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tempo Estimado */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <Timer className="h-4 w-4" />
            Tempo Estimado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-indigo-600">Total</span>
            <span className="text-sm font-medium text-indigo-600">
              {formatTime(totalEstimatedMinutes)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-green-600">Feitas</span>
            <span className="text-sm font-medium text-green-600">
              {formatTime(completedEstimatedMinutes)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-red-600">Não Feitas</span>
            <span className="text-sm font-medium text-red-600">
              {formatTime(notDoneEstimatedMinutes)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-yellow-600">Pendentes</span>
            <span className="text-sm font-medium text-yellow-600">
              {formatTime(pendingEstimatedMinutes)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
