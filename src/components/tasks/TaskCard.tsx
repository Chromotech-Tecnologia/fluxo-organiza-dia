import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  User, 
  CheckCircle, 
  Circle, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  MessageSquare,
  ArrowRight,
  History,
  Edit,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Task } from "@/types";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { useModalStore } from "@/stores/useModalStore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatDateForDisplay } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onStatusChange?: (status: Task['status']) => void;
  onForward?: () => void;
  onClick?: () => void;
  currentViewDate?: string;
}

export function TaskCard({ task, onStatusChange, onForward, onClick, currentViewDate }: TaskCardProps) {
  const { people, getPersonById } = useSupabasePeople();
  const { openTaskModal, openDeleteModal, openForwardTaskModal } = useModalStore();
  const assignedPerson = task.assignedPersonId ? getPersonById(task.assignedPersonId) : null;
  
  const completedSubItems = task.subItems.filter(item => item.completed).length;
  const totalSubItems = task.subItems.length;
  const progressPercentage = totalSubItems > 0 ? (completedSubItems / totalSubItems) * 100 : 0;

  // Buscar o último status registrado
  const lastCompletion = task.completionHistory && task.completionHistory.length > 0 
    ? task.completionHistory[task.completionHistory.length - 1] 
    : null;
  
  // Uma tarefa deve ficar amarela apenas se:
  // 1. Foi repassada (tem forwardHistory)
  // 2. A data agendada da tarefa corresponde à data atual sendo visualizada
  // 3. A tarefa é original (não é resultado de repasse)
  const hasBeenForwarded = task.forwardHistory && 
    task.forwardHistory.length > 0 && 
    currentViewDate && 
    task.scheduledDate === currentViewDate;

  const typeColors = {
    'meeting': 'bg-blue-100 text-blue-800 border-blue-200',
    'own-task': 'bg-green-100 text-green-800 border-green-200',
    'delegated-task': 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const priorityColors = {
    'simple': 'bg-gray-100 text-gray-800 border-gray-200',
    'urgent': 'bg-red-100 text-red-800 border-red-200',
    'complex': 'bg-orange-100 text-orange-800 border-orange-200'
  };

  const statusColors = {
    'pending': 'border-l-yellow-500',
    'completed': 'border-l-green-500',
    'not-done': 'border-l-red-500',
    'forwarded-date': 'border-l-blue-500',
    'forwarded-person': 'border-l-purple-500'
  };

  const getTypeLabel = (type: Task['type']) => {
    const labels = {
      'meeting': 'Reunião',
      'own-task': 'Própria',
      'delegated-task': 'Delegada'
    };
    return labels[type];
  };

  const getPriorityLabel = (priority: Task['priority']) => {
    const labels = {
      'none': 'Sem Prioridade',
      'priority': 'Prioridade', 
      'extreme': 'Extrema Prioridade'
    };
    return labels[priority] || 'Sem Prioridade';
  };

  const getTimeInvestmentLabel = (time: Task['timeInvestment']) => {
    const labels = {
      'low': 'Baixo (≤5m)',
      'medium': 'Médio (5-60m)',
      'high': 'Alto (>60m)'
    };
    return labels[time] || 'Baixo (≤5m)';
  };

  const getCategoryLabel = (category: Task['category']) => {
    const labels = {
      'personal': 'Pessoal',
      'business': 'Empresarial'
    };
    return labels[category] || 'Pessoal';
  };

  const getStatusLabel = (status: Task['status']) => {
    const labels = {
      'pending': 'Pendente',
      'completed': 'Concluída',
      'not-done': 'Não Feita',
      'forwarded-date': 'Repassada (Data)',
      'forwarded-person': 'Repassada (Pessoa)'
    };
    return labels[status];
  };

  return (
    <Card 
      className={cn("w-full border-l-4 hover:shadow-md transition-shadow cursor-pointer", statusColors[task.status])}
      onClick={() => onClick ? onClick() : openTaskModal(task)}
    >
      <CardHeader className="pb-1 pt-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {task.order || 0}
            </div>
            <h3 className="font-semibold text-foreground line-clamp-1 text-sm flex-1">
              {task.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                  <History className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Histórico da Tarefa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                  
                  <Separator />
                  
                  {(() => {
                    const historyByDay: Record<string, { completion?: any, forward?: any }> = {};
                    
                    task.completionHistory?.forEach(completion => {
                      const day = format(new Date(completion.completedAt), "yyyy-MM-dd");
                      if (!historyByDay[day]) historyByDay[day] = {};
                      historyByDay[day].completion = completion;
                    });
                    
                    task.forwardHistory?.forEach(forward => {
                      const day = format(new Date(forward.forwardedAt), "yyyy-MM-dd");
                      if (!historyByDay[day]) historyByDay[day] = {};
                      historyByDay[day].forward = forward;
                    });
                    
                    const sortedDays = Object.keys(historyByDay).sort().reverse();
                    
                    if (sortedDays.length === 0) {
                      return <p className="text-sm text-muted-foreground">Nenhum histórico disponível.</p>;
                    }
                    
                    return (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Histórico de Ações:</h5>
                        <div className="space-y-2">
                          {sortedDays.map(day => {
                            const dayData = historyByDay[day];
                            return (
                              <div key={day} className="border-l-2 border-gray-200 pl-3 py-2">
                                <div className="text-xs font-medium text-muted-foreground mb-1">
                                  {format(new Date(day), "dd/MM/yyyy", { locale: ptBR })}
                                </div>
                                
                                {dayData.completion && (
                                  <div className="text-xs mb-1">
                                    <span className={dayData.completion.status === 'completed' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                      {dayData.completion.status === 'completed' ? '✓ Feito' : '✗ Não feito'}
                                    </span>
                                    <span className="text-muted-foreground ml-2">
                                      às {format(new Date(dayData.completion.completedAt), "HH:mm", { locale: ptBR })}
                                    </span>
                                  </div>
                                )}
                                
                                {dayData.forward && (
                                  <div className="text-xs">
                                    <span className="text-yellow-600 font-medium">↗ Repassada</span>
                                    <span className="text-muted-foreground ml-2">
                                      às {format(new Date(dayData.forward.forwardedAt), "HH:mm", { locale: ptBR })}
                                    </span>
                                    <div className="ml-2 text-xs text-muted-foreground mt-1">
                                      De: {dayData.forward.originalDate} para: {dayData.forward.newDate}
                                      {dayData.forward.forwardedTo && (
                                        <div className="text-xs">
                                          Para: {people.find(p => p.id === dayData.forward.forwardedTo)?.name || 'Equipe'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                openTaskModal(task);
              }} 
              className="h-6 w-6 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                openDeleteModal('task', task);
              }} 
              className="h-6 w-6 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 py-2">
        <div className="flex items-center flex-wrap gap-1 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDateForDisplay(task.scheduledDate)}</span>
          </div>
          
          <Badge className={cn(typeColors[task.type], "text-xs py-0 px-1")}>
            {getTypeLabel(task.type)}
          </Badge>
          
          <Badge className={cn(priorityColors[task.priority], "text-xs py-0 px-1")}>
            {getPriorityLabel(task.priority)}
          </Badge>
          
          <Badge variant="outline" className="text-xs py-0 px-1">
            {getTimeInvestmentLabel(task.timeInvestment)}
          </Badge>
          
          <Badge variant="outline" className="text-xs py-0 px-1">
            {getCategoryLabel(task.category)}
          </Badge>
          
          {task.isRoutine && (
            <Badge variant="secondary" className="text-xs py-0 px-1">
              Rotina ({task.routineCycle})
            </Badge>
          )}
          
          {assignedPerson && (
            <Badge variant="outline" className="text-xs py-0 px-1">
              {assignedPerson.name}
            </Badge>
          )}
          
          {task.forwardCount > 0 && (
            <Badge variant="secondary" className="text-xs py-0 px-1">
              {task.forwardCount}x repasses
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange?.('completed');
              }}
              variant={task.status === 'completed' || lastCompletion?.status === 'completed' ? "default" : "outline"}
              className={cn(
                "h-6 px-2 text-xs",
                (task.status === 'completed' || lastCompletion?.status === 'completed') 
                  ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                  : "border-green-300 text-green-600 hover:bg-green-50"
              )}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Feito
            </Button>
            
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange?.('not-done');
              }}
              variant={task.status === 'not-done' || lastCompletion?.status === 'not-done' ? "default" : "outline"}
              className={cn(
                "h-6 px-2 text-xs",
                (task.status === 'not-done' || lastCompletion?.status === 'not-done')
                  ? "bg-red-600 hover:bg-red-700 text-white border-red-600" 
                  : "border-red-300 text-red-600 hover:bg-red-50"
              )}
            >
              <Circle className="h-3 w-3 mr-1" />
              Não feito
            </Button>
            
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                openForwardTaskModal(task);
              }}
              variant={hasBeenForwarded ? "default" : "outline"}
              className={cn(
                "h-6 px-2 text-xs",
                hasBeenForwarded
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600" 
                  : "border-yellow-300 text-yellow-600 hover:bg-yellow-50"
              )}
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              Repassar
            </Button>
          </div>
          
          {totalSubItems > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <span>{completedSubItems}/{totalSubItems}</span>
              </div>
              <Progress value={progressPercentage} className="h-2 w-16" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}