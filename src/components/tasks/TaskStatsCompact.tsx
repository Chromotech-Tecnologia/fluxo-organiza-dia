import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/types";
import { Clock, CheckCircle, XCircle, Hourglass, RotateCcw, User, Calendar, Timer, Hash, Building2 } from "lucide-react";
import { getTimeInMinutes, formatTime } from "@/lib/taskUtils";
interface TaskStatsCompactProps {
  tasks: Task[];
}
export function TaskStatsCompact({
  tasks
}: TaskStatsCompactProps) {
  const totalTasks = tasks.length;

  // Status das Tarefas
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  // Tarefas "não feitas" = tarefas que foram clicadas como "não feitas" (têm histórico de not-done)
  const notDoneTasks = tasks.filter(task => task.completionHistory?.some(completion => completion.status === 'not-done')).length;

  // Tarefas definitivas = feitas e não reagendadas (verde sem laranja)
  const definitiveTasks = tasks.filter(task => {
    if (task.status !== 'completed') return false;
    // Verificar se NÃO foi reagendada desta data (não tem botão laranja)
    const wasRescheduledFromThisDate = task.forwardHistory && task.forwardHistory.length > 0 && task.forwardHistory.some(forward => forward.originalDate === task.scheduledDate);
    return !wasRescheduledFromThisDate;
  }).length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;

  // Tarefas não concluídas = total - concluídas
  const notCompletedTasks = totalTasks - completedTasks;

  // Reagendamentos - usando a mesma lógica do botão laranja das tarefas
  const rescheduledTasks = tasks.filter(task => {
    if (!task.forwardHistory || task.forwardHistory.length === 0) return false;
    // Verificar se algum reagendamento tem a data original igual à data agendada atual da tarefa
    return task.forwardHistory.some(forward => {
      const originalDate = forward.originalDate; // Data original no histórico
      return originalDate === task.scheduledDate; // Se corresponde à data atual da tarefa
    });
  }).length;

  // Não reagendadas - tarefas que NÃO mostram o botão laranja
  const notRescheduledTasks = tasks.filter(task => {
    if (!task.forwardHistory || task.forwardHistory.length === 0) return true;
    // Se não tem histórico onde a data original é igual à data atual, não está reagendada
    return !task.forwardHistory.some(forward => {
      const originalDate = forward.originalDate;
      return originalDate === task.scheduledDate;
    });
  }).length;
  const rescheduledCompletedTasks = tasks.filter(task => {
    // Usar a mesma lógica do botão laranja
    const wasRescheduledFromThisDate = task.forwardHistory && task.forwardHistory.length > 0 && task.forwardHistory.some(forward => forward.originalDate === task.scheduledDate);
    // Contar tarefas reagendadas E que foram concluídas (clicaram em concluir)
    return wasRescheduledFromThisDate && task.isConcluded === true;
  }).length;
  const rescheduledNotCompletedTasks = tasks.filter(task => {
    // Usar a mesma lógica do botão laranja
    const wasRescheduledFromThisDate = task.forwardHistory && task.forwardHistory.length > 0 && task.forwardHistory.some(forward => forward.originalDate === task.scheduledDate);
    // Contar tarefas reagendadas mas NÃO concluídas
    return wasRescheduledFromThisDate && task.isConcluded !== true;
  }).length;

  // Total de tarefas concluídas (clicaram em concluir) - todas as tarefas da data atual
  const totalConcludedTasks = tasks.filter(task => task.isConcluded === true).length;

  // Total de tarefas NÃO concluídas (NÃO clicaram em concluir) - todas as tarefas da data atual
  const totalNotConcludedTasks = tasks.filter(task => task.isConcluded !== true).length;

  // Tipos de Tarefas - ajustado conforme solicitado
  const personalTasks = tasks.filter(task => task.category === 'personal').length;
  const meetingTasks = tasks.filter(task => task.type === 'meeting').length;
  const delegatedTasks = tasks.filter(task => task.type === 'delegated-task').length;
  const professionalTasks = tasks.filter(task => task.category !== 'personal').length;

  // Tempo Estimado - usando a função correta do taskUtils.ts
  const totalEstimatedMinutes = tasks.reduce((total, task) => {
    return total + getTimeInMinutes(task.timeInvestment, task.customTimeMinutes);
  }, 0);
  const completedEstimatedMinutes = tasks.filter(task => task.status === 'completed').reduce((total, task) => total + getTimeInMinutes(task.timeInvestment, task.customTimeMinutes), 0);
  const notDoneEstimatedMinutes = tasks.filter(task => task.completionHistory?.some(completion => completion.status === 'not-done')).reduce((total, task) => total + getTimeInMinutes(task.timeInvestment, task.customTimeMinutes), 0);
  const pendingEstimatedMinutes = tasks.filter(task => task.status === 'pending').reduce((total, task) => total + getTimeInMinutes(task.timeInvestment, task.customTimeMinutes), 0);
  const calculatePercentage = (value: number) => {
    return totalTasks > 0 ? Math.round(value / totalTasks * 100) : 0;
  };
  return <div className="grid grid-cols-4 gap-4">
      {/* Status das Tarefas */}
      <Card className="border-l-4 border-l-blue-500">
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
            <span className="text-xs text-blue-900">Definitivo</span>
            <span className="text-sm font-medium text-emerald-600">
              {definitiveTasks} ({calculatePercentage(definitiveTasks)}%)
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
      <Card className="border-l-4 border-l-orange-500">
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
            <span className="text-xs text-orange-600">Reagendadas</span>
            <span className="text-sm font-medium text-orange-600">
              {rescheduledTasks} ({calculatePercentage(rescheduledTasks)}%)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-green-600">Concluídas</span>
            <span className="text-sm font-medium text-green-600">
              {totalConcludedTasks} ({calculatePercentage(totalConcludedTasks)}%)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-red-600">Não Concluídas</span>
            <span className="text-sm font-medium text-red-600">
              {totalNotConcludedTasks} ({calculatePercentage(totalNotConcludedTasks)}%)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Tarefas */}
      <Card className="border-l-4 border-l-purple-500">
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
      <Card className="border-l-4 border-l-indigo-500">
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
    </div>;
}