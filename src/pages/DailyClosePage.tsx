import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  Calendar,
  ArrowRight,
  AlertCircle,
  User
} from "lucide-react";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { Task } from "@/types";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";
import { cn } from "@/lib/utils";

const DailyClosePage = () => {
  const [selectedDate] = useState(getCurrentDateInSaoPaulo());
  const { tasks, updateTask } = useSupabaseTasks({
    dateRange: {
      start: selectedDate,
      end: selectedDate
    }
  });
  const { getPersonById } = useSupabasePeople();

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const completionRecord = {
        completedAt: getCurrentDateInSaoPaulo(),
        status: status as 'completed' | 'not-done',
        date: task.scheduledDate,
        wasForwarded: false
      };

      const updatedCompletionHistory = [
        ...(task.completionHistory || []),
        completionRecord
      ];

      await updateTask(taskId, { 
        status,
        completionHistory: updatedCompletionHistory,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
    }
  };

  const getTaskButtonStyle = (task: Task, status: Task['status']) => {
    const isForwarded = task.forwardHistory && task.forwardHistory.length > 0;
    const lastCompletion = task.completionHistory && task.completionHistory.length > 0 
      ? task.completionHistory[task.completionHistory.length - 1] 
      : null;
    
    const isActive = task.status === status || lastCompletion?.status === status;

    if (status === 'completed') {
      return cn(
        "h-8 px-3 text-sm transition-all",
        isActive
          ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
          : "border-green-300 text-green-600 hover:bg-green-50",
        isForwarded && "ring-2 ring-yellow-400 ring-offset-1"
      );
    }
    
    if (status === 'not-done') {
      return cn(
        "h-8 px-3 text-sm transition-all",
        isActive
          ? "bg-red-600 hover:bg-red-700 text-white border-red-600" 
          : "border-red-300 text-red-600 hover:bg-red-50",
        isForwarded && "ring-2 ring-yellow-400 ring-offset-1"
      );
    }

    return cn(
      "h-8 px-3 text-sm transition-all",
      isForwarded 
        ? "bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600" 
        : "border-yellow-300 text-yellow-600 hover:bg-yellow-50"
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fechamento Diário</h1>
          <p className="text-muted-foreground">
            Revise e feche o dia de trabalho - {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        <Button className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Fechar Dia
        </Button>
      </div>

      {/* Lista de Tarefas do Dia */}
      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma tarefa para hoje
                </h3>
                <p className="text-muted-foreground">
                  Não há tarefas programadas para {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => {
            const assignedPerson = task.assignedPersonId ? getPersonById(task.assignedPersonId) : null;
            const lastCompletion = task.completionHistory && task.completionHistory.length > 0 
              ? task.completionHistory[task.completionHistory.length - 1] 
              : null;
            const isForwarded = task.forwardHistory && task.forwardHistory.length > 0;
            
            return (
              <Card key={task.id} className="w-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {task.order || 0}
                      </div>
                      <h3 className="font-semibold text-foreground line-clamp-1 text-base flex-1">
                        {task.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isForwarded && (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          Repassada
                        </Badge>
                      )}
                      {assignedPerson && (
                        <Badge variant="outline" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          {assignedPerson.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {task.description && (
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(task.id, 'completed')}
                        variant={task.status === 'completed' || lastCompletion?.status === 'completed' ? "default" : "outline"}
                        className={getTaskButtonStyle(task, 'completed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Feito
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(task.id, 'not-done')}
                        variant={task.status === 'not-done' || lastCompletion?.status === 'not-done' ? "default" : "outline"}
                        className={getTaskButtonStyle(task, 'not-done')}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Não feito
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className={getTaskButtonStyle(task, 'forwarded-date')}
                        disabled
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Repassar
                      </Button>
                    </div>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      {lastCompletion && (
                        <span className={lastCompletion.status === 'completed' ? 'text-green-600' : 'text-red-600'}>
                          {lastCompletion.status === 'completed' ? '✓ Concluída' : '✗ Não feita'}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DailyClosePage;