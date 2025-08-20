
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Calendar, AlertCircle, ArrowRight, XCircle, User } from "lucide-react";
import { Task } from "@/types";
import { calculateTotalEstimatedTime, formatTime } from "@/lib/taskUtils";

interface TaskStatsCompactProps {
  tasks: Task[];
}

export function TaskStatsCompact({ tasks }: TaskStatsCompactProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => {
    const hasCompletion = t.completionHistory && t.completionHistory.length > 0;
    const lastCompletion = hasCompletion ? t.completionHistory[t.completionHistory.length - 1] : null;
    return lastCompletion?.status === 'completed' || t.isConcluded;
  }).length;
  
  const notDoneTasks = tasks.filter(t => {
    const hasCompletion = t.completionHistory && t.completionHistory.length > 0;
    const lastCompletion = hasCompletion ? t.completionHistory[t.completionHistory.length - 1] : null;
    return lastCompletion?.status === 'not-done';
  }).length;

  const pendingTasks = tasks.filter(t => {
    const hasCompletion = t.completionHistory && t.completionHistory.length > 0;
    const lastCompletion = hasCompletion ? t.completionHistory[t.completionHistory.length - 1] : null;
    return !lastCompletion && !t.isConcluded;
  }).length;

  const forwardedTasks = tasks.filter(t => t.forwardCount > 0).length;
  const personalTasks = tasks.filter(t => t.type === 'personal-task').length;
  const meetingTasks = tasks.filter(t => t.type === 'meeting').length;
  const delegatedTasks = tasks.filter(t => t.type === 'delegated-task').length;

  const totalEstimatedTime = calculateTotalEstimatedTime(tasks);
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const notDoneRate = totalTasks > 0 ? Math.round((notDoneTasks / totalTasks) * 100) : 0;
  const pendingRate = totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0;
  const forwardedRate = totalTasks > 0 ? Math.round((forwardedTasks / totalTasks) * 100) : 0;
  const personalRate = totalTasks > 0 ? Math.round((personalTasks / totalTasks) * 100) : 0;
  const meetingRate = totalTasks > 0 ? Math.round((meetingTasks / totalTasks) * 100) : 0;
  const delegatedRate = totalTasks > 0 ? Math.round((delegatedTasks / totalTasks) * 100) : 0;

  if (totalTasks === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Status das Tarefas */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm mb-3 text-center">Status das Tarefas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Total</span>
              </div>
              <Badge variant="outline">{totalTasks}</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Feitas</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-green-600">{completedTasks}</span>
                <Badge variant="secondary" className="text-xs">({completionRate}%)</Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm">Não feitas</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-red-600">{notDoneTasks}</span>
                <Badge variant="secondary" className="text-xs">({notDoneRate}%)</Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Pendentes</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-medium ${pendingTasks > 0 ? 'text-orange-600 bg-orange-100 px-2 py-1 rounded border border-orange-300' : 'text-orange-600'}`}>
                  {pendingTasks}
                </span>
                <Badge variant="secondary" className="text-xs">({pendingRate}%)</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reagendamentos */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm mb-3 text-center">Reagendamentos</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Reagendadas</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-yellow-600">{forwardedTasks}</span>
                <Badge variant="secondary" className="text-xs">({forwardedRate}%)</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Tarefas */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm mb-3 text-center">Tipos de Tarefas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Pessoais</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-blue-600">{personalTasks}</span>
                <Badge variant="secondary" className="text-xs">({personalRate}%)</Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Reuniões</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-purple-600">{meetingTasks}</span>
                <Badge variant="secondary" className="text-xs">({meetingRate}%)</Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" />
                <span className="text-sm">Delegadas</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-indigo-600">{delegatedTasks}</span>
                <Badge variant="secondary" className="text-xs">({delegatedRate}%)</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tempo Estimado */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm mb-3 text-center">Tempo Estimado</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Total</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{formatTime(totalEstimatedTime)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
