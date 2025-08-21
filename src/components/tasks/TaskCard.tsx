import React from 'react';
import { Task } from '@/types';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  Circle, 
  XCircle, 
  AlertCircle,
  RotateCcw,
  User,
  Building2,
  Hash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isTaskRescheduledToday } from "@/lib/taskUtils";

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function TaskCard({ task, onEdit, onComplete, onDelete, className }: TaskCardProps) {
  // Calcular progresso dos subitens
  const completedSubItems = task.subItems?.filter(item => item.completed).length || 0;
  const totalSubItems = task.subItems?.length || 0;
  const progress = totalSubItems > 0 ? (completedSubItems / totalSubItems) * 100 : 0;

  // Verificar se a tarefa foi reagendada hoje (clicou reagendar hoje)
  const wasRescheduledToday = isTaskRescheduledToday(task);

  // Contar reagendamentos totais para mostrar número
  const totalReschedules = task.forwardHistory?.length || 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'extreme':
        return 'bg-black text-white border-black';
      case 'priority':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'not-done':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Circle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Users className="h-3 w-3" />;
      case 'delegated-task':
        return <User className="h-3 w-3" />;
      default:
        return <Building2 className="h-3 w-3" />;
    }
  };

  const getTimeInvestmentLabel = (timeInvestment: string) => {
    switch (timeInvestment) {
      case 'low':
        return '5min';
      case 'medium':
        return '1h';
      case 'high':
        return '2h';
      default:
        return '5min';
    }
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            {/* Número da ordem */}
            {task.order && (
              <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center text-xs font-mono">
                <Hash className="h-2 w-2 mr-0.5" />
                {task.order}
              </Badge>
            )}
            
            {/* Status Icon */}
            {getStatusIcon(task.status)}
            
            {/* Título */}
            <h3 className="font-semibold text-sm truncate flex-1">{task.title}</h3>
          </div>
          
          {/* Badges de Prioridade e Tipo */}
          <div className="flex gap-1">
            {task.priority !== 'none' && (
              <Badge className={cn("text-xs h-5", getPriorityColor(task.priority))}>
                {task.priority === 'extreme' ? 'Extrema' : 'Prioridade'}
              </Badge>
            )}
            
            <Badge variant="outline" className="text-xs h-5 gap-1">
              {getTypeIcon(task.type)}
              {task.type === 'meeting' ? 'Reunião' : 
               task.type === 'delegated-task' ? 'Delegada' : 'Própria'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Descrição */}
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
        )}
        
        {/* Progresso dos Subitens */}
        {totalSubItems > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progresso</span>
              <span>{completedSubItems}/{totalSubItems}</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
        
        {/* Informações adicionais */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getTimeInvestmentLabel(task.timeInvestment)}
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(task.scheduledDate).toLocaleDateString('pt-BR')}
            </div>
          </div>
          
          {/* Tags especiais */}
          <div className="flex gap-1">
            {/* Mostrar "Reagendada" apenas se foi clicado reagendar hoje */}
            {wasRescheduledToday && (
              <Badge variant="secondary" className="text-xs h-4 px-1">
                <RotateCcw className="h-2 w-2 mr-0.5" />
                Reagendada
              </Badge>
            )}
            
            {/* Mostrar contador de reagendamentos se não foi reagendada hoje mas tem histórico */}
            {!wasRescheduledToday && totalReschedules > 0 && (
              <Badge variant="outline" className="text-xs h-4 px-1">
                {totalReschedules}x
              </Badge>
            )}
            
            {task.isRoutine && (
              <Badge variant="secondary" className="text-xs h-4 px-1">
                Rotina
              </Badge>
            )}
          </div>
        </div>
        
        {/* Ações */}
        <div className="flex gap-2 pt-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
              Editar
            </Button>
          )}
          {onComplete && task.status === 'pending' && (
            <Button variant="default" size="sm" onClick={onComplete} className="flex-1">
              Concluir
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
