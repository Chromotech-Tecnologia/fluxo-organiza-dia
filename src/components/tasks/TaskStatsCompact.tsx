
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Calendar, AlertCircle, ArrowRight, XCircle } from "lucide-react";
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

  const unscheduledTasks = tasks.filter(t => !t.order || t.order === 0).length;
  const forwardedTasks = tasks.filter(t => t.forwardCount > 0).length;

  const totalEstimatedTime = calculateTotalEstimatedTime(tasks);
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const notDoneRate = totalTasks > 0 ? Math.round((notDoneTasks / totalTasks) * 100) : 0;

  if (totalTasks === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {/* Total */}
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{totalTasks}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3" />
              Total
            </div>
          </div>

          {/* Feitas */}
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{completedTasks}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Feitas ({completionRate}%)
            </div>
          </div>

          {/* Não Feitas */}
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{notDoneTasks}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <XCircle className="h-3 w-3" />
              Não feitas ({notDoneRate}%)
            </div>
          </div>

          {/* Não Concluídas | Não Agendadas */}
          <div className="text-center">
            <div className="flex flex-col">
              <div className="text-sm font-bold text-orange-600">{unscheduledTasks}</div>
              <div className="text-xs text-muted-foreground">Não agendadas</div>
            </div>
            <div className="flex flex-col mt-1">
              <div className={`text-sm font-bold ${pendingTasks > 0 ? 'text-orange-600 bg-orange-100 px-2 py-1 rounded border-2 border-orange-300' : 'text-orange-600'}`}>
                {pendingTasks}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Pendentes
              </div>
            </div>
          </div>

          {/* Reagendadas */}
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{forwardedTasks}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <ArrowRight className="h-3 w-3" />
              Reagendadas
            </div>
          </div>

          {/* Tempo Estimado */}
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{formatTime(totalEstimatedTime)}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              Tempo est.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
