
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar, 
  User, 
  Clock,
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Edit,
  Trash2,
  History,
  GripVertical,
  Target,
  Zap,
  Timer
} from "lucide-react";
import { Task } from "@/types";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskCardImprovedProps {
  task: Task;
  taskIndex?: number;
  maxOrder?: number;
  onStatusChange: (status: Task['status']) => void;
  onConclude: () => void;
  onUnconclude: () => void;
  onForward: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onHistory: () => void;
  currentViewDate?: string;
}

export function TaskCardImproved({
  task,
  taskIndex,
  maxOrder = 1,
  onStatusChange,
  onConclude,
  onUnconclude,
  onForward,
  onEdit,
  onDelete,
  onHistory,
  currentViewDate
}: TaskCardImprovedProps) {
  const { people } = useSupabasePeople();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assignedPerson = task.assignedPersonId ? people.find(p => p.id === task.assignedPersonId) : null;
  
  // Verificar se a tarefa tem histórico de conclusão
  const lastCompletion = task.completionHistory && task.completionHistory.length > 0 
    ? task.completionHistory[task.completionHistory.length - 1] 
    : null;

  // Cor baseada na ordem da tarefa
  const getOrderColor = () => {
    if (taskIndex === undefined || maxOrder <= 1) return 'bg-primary';
    
    const percentage = ((taskIndex + 1) / maxOrder) * 100;
    if (percentage <= 20) return 'bg-green-500';
    if (percentage <= 40) return 'bg-blue-500';
    if (percentage <= 60) return 'bg-yellow-500';
    if (percentage <= 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'extreme': return 'bg-red-500 text-white';
      case 'priority': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'no-priority':
      case 'none': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTimeInvestmentInfo = (timeInvestment: string) => {
    switch (timeInvestment) {
      case 'low': return { icon: Clock, label: 'Baixo', color: 'text-green-600' };
      case 'medium': return { icon: Timer, label: 'Médio', color: 'text-yellow-600' };
      case 'high': return { icon: Zap, label: 'Alto', color: 'text-red-600' };
      default: return { icon: Clock, label: 'Baixo', color: 'text-green-600' };
    }
  };

  const timeInfo = getTimeInvestmentInfo(task.timeInvestment);
  const TimeIcon = timeInfo.icon;

  const getTaskButtonStyle = (status: Task['status']) => {
    const isActive = task.status === status || lastCompletion?.status === status;
    const isForwarded = task.forwardHistory && task.forwardHistory.length > 0;

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
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-all duration-200",
        isDragging && "opacity-50 rotate-2 scale-105"
      )}
    >
      <Card className={cn(
        "w-full transition-all duration-200 hover:shadow-md",
        task.isConcluded && "border-green-200 bg-green-50/50",
        task.isForwarded && "border-yellow-200 bg-yellow-50/50"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab hover:cursor-grabbing p-1"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              
              {taskIndex !== undefined && (
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold",
                  getOrderColor()
                )}>
                  {task.order || taskIndex + 1}
                </div>
              )}
              
              <h3 className={cn(
                "font-semibold text-foreground line-clamp-2 text-base flex-1",
                task.isConcluded && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              {task.isForwarded && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Repassada
                </Badge>
              )}
              
              {task.isConcluded && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  <Target className="h-3 w-3 mr-1" />
                  Definitiva
                </Badge>
              )}
              
              <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                {task.priority === 'extreme' ? 'Extrema' : 
                 task.priority === 'priority' ? 'Alta' : 
                 task.priority === 'medium' ? 'Média' : 'Baixa'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {task.description && (
            <p className="text-sm text-muted-foreground">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {currentViewDate && task.scheduledDate !== currentViewDate ? (
                <span className="text-orange-600 font-medium">
                  {format(new Date(task.scheduledDate), "dd/MM", { locale: ptBR })}
                </span>
              ) : (
                <span>{format(new Date(task.scheduledDate), "dd/MM", { locale: ptBR })}</span>
              )}
            </div>
            
            <div className={cn("flex items-center gap-1", timeInfo.color)}>
              <TimeIcon className="h-4 w-4" />
              <span>{timeInfo.label}</span>
            </div>
            
            {assignedPerson && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{assignedPerson.name}</span>
              </div>
            )}
            
            {task.subItems && task.subItems.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {task.subItems.filter(item => item.completed).length}/{task.subItems.length} itens
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {!task.isConcluded ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => onStatusChange('completed')}
                    variant={task.status === 'completed' || lastCompletion?.status === 'completed' ? "default" : "outline"}
                    className={getTaskButtonStyle('completed')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Feito
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => onStatusChange('not-done')}
                    variant={task.status === 'not-done' || lastCompletion?.status === 'not-done' ? "default" : "outline"}
                    className={getTaskButtonStyle('not-done')}
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Não feito
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onForward}
                    className={getTaskButtonStyle('forwarded-date')}
                  >
                    <ArrowRight className="h-4 w-4 mr-1" />
                    Repassar
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-medium">✓ Tarefa Concluída</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onUnconclude}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    Reabrir
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={onHistory}
                className="h-8 w-8 p-0"
              >
                <History className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onEdit}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {lastCompletion && (
            <div className="text-xs text-right">
              <span className={lastCompletion.status === 'completed' ? 'text-green-600' : 'text-red-600'}>
                {lastCompletion.status === 'completed' ? '✓ Última: Concluída' : '✗ Última: Não feita'}
                {lastCompletion.completedAt && (
                  <span className="ml-1">em {format(new Date(lastCompletion.completedAt), "dd/MM HH:mm", { locale: ptBR })}</span>
                )}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
