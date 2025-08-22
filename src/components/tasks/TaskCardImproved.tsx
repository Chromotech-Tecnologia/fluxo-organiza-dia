
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Calendar, User, GripVertical, Forward, Edit2, Trash2, History, MoreVertical, Undo, Clock } from "lucide-react";
import { Task } from "@/types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getOrderNumberColor, getPriorityColor } from '@/lib/taskUtils';
import { useSupabaseTeamMembers } from '@/hooks/useSupabaseTeamMembers';
import { getCurrentDateInSaoPaulo } from '@/lib/utils';

interface TaskCardImprovedProps {
  task: Task;
  onStatusChange: (status: Task['status']) => void;
  onConclude: () => void;
  onUnconclude: () => void;
  onForward: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onHistory?: () => void;
  currentViewDate?: string;
  taskIndex?: number;
  maxOrder?: number;
}

export function TaskCardImproved({ 
  task, 
  onStatusChange, 
  onConclude, 
  onUnconclude,
  onForward, 
  onEdit,
  onDelete,
  onHistory,
  currentViewDate,
  taskIndex,
  maxOrder = 100
}: TaskCardImprovedProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const { teamMembers } = useSupabaseTeamMembers();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Encontrar a equipe delegada
  const assignedTeam = task.assignedPersonId 
    ? teamMembers.find(team => team.id === task.assignedPersonId)
    : null;

  // Verificar se a tarefa foi reagendada (tem histórico de reagendamentos)
  const wasRescheduled = task.forwardHistory && task.forwardHistory.length > 0;

  // Determinar cores baseadas no status
  const getCardColor = () => {
    if (task.isConcluded) return 'border-green-500 bg-green-50';
    
    const hasCompletion = task.completionHistory && task.completionHistory.length > 0;
    const lastCompletion = hasCompletion ? task.completionHistory[task.completionHistory.length - 1] : null;
    
    if (lastCompletion?.status === 'completed') {
      return 'border-green-500 bg-green-50';
    }
    if (lastCompletion?.status === 'not-done') {
      return 'border-red-500 bg-red-50';
    }
    
    return 'border-border bg-background';
  };

  // Calcular progresso do checklist
  const completedSubItems = task.subItems?.filter(item => item.completed).length || 0;
  const totalSubItems = task.subItems?.length || 0;
  const checklistProgress = totalSubItems > 0 ? (completedSubItems / totalSubItems) * 100 : 0;

  // Verificar se tem baixa
  const hasCompletion = task.completionHistory && task.completionHistory.length > 0;
  const lastCompletion = hasCompletion ? task.completionHistory[task.completionHistory.length - 1] : null;
  const canReschedule = hasCompletion && (lastCompletion?.status === 'completed' || lastCompletion?.status === 'not-done');

  // LÓGICA MUITO MAIS RIGOROSA: só mostrar laranja se a tarefa foi processada HOJE
  // E se tem completion_history com data de HOJE
  const today = getCurrentDateInSaoPaulo();
  const wasRescheduledToday = canReschedule && lastCompletion && 
    lastCompletion.date === today && 
    task.scheduledDate === today && // Tarefa deve estar agendada para hoje
    (lastCompletion.status === 'completed' || lastCompletion.status === 'not-done');

  const taskDate = new Date(task.scheduledDate + 'T00:00:00');
  const historyCount = (task.completionHistory?.length || 0) + (task.forwardHistory?.length || 0);

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLElement && (
        e.target.closest('button') || 
        e.target.closest('[data-dropdown-trigger]') ||
        e.target.closest('.cursor-grab')
      )
    ) {
      return;
    }
    onEdit?.();
  };

  const handleStatusClick = (status: 'completed' | 'not-done') => {
    if (lastCompletion?.status === status) {
      onStatusChange('pending');
      return;
    }
    onStatusChange(status);
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer hover:shadow-md transition-all duration-200 ${getCardColor()}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab hover:cursor-grabbing flex-shrink-0"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              
              {/* Número da tarefa com cor dinâmica */}
              {taskIndex !== undefined && (
                <Badge 
                  variant="outline" 
                  className={`text-xs px-1.5 py-0.5 min-w-[24px] text-center flex-shrink-0 ${getOrderNumberColor(task.order || (taskIndex + 1), maxOrder)}`}
                >
                  {task.order || (taskIndex + 1)}
                </Badge>
              )}
              
              {/* Nome da equipe delegada (se houver) */}
              {assignedTeam && (
                <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-300 flex-shrink-0">
                  {assignedTeam.name}
                </Badge>
              )}
              
              <div className="font-semibold text-sm truncate flex-1">
                {task.title}
                {wasRescheduled && (
                  <Badge variant="outline" className="ml-2 text-xs bg-orange-100 text-orange-800 border-orange-300">
                    Reagendada
                  </Badge>
                )}
              </div>
            </div>

            {/* Menu de ações */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Histórico com contador */}
              {onHistory && historyCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHistory();
                  }}
                >
                  <History className="h-3 w-3" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center bg-blue-500 text-white">
                    {historyCount}
                  </Badge>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild data-dropdown-trigger>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Descrição */}
          {task.description && (
            <div className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </div>
          )}

          {/* Tags - data completa com ano + outras tags */}
          <div className="flex gap-1 flex-wrap">
            <Badge variant="secondary" className="text-xs h-5">
              {format(taskDate, 'dd/MM/yyyy', { locale: ptBR })}
            </Badge>

            {/* Prioridade */}
            {task.priority !== 'none' && (
              <Badge variant="outline" className={`text-xs h-5 ${getPriorityColor(task.priority)}`}>
                {task.priority === 'extreme' ? 'Extrema' : 'Prioridade'}
              </Badge>
            )}

            {/* Tipo */}
            {task.type === 'meeting' && (
              <Badge variant="outline" className="text-xs h-5 bg-blue-100 text-blue-800 border-blue-300">
                <Calendar className="h-2.5 w-2.5 mr-1" />
                Reunião
              </Badge>
            )}
            
            {task.type === 'delegated-task' && (
              <Badge variant="outline" className="text-xs h-5 bg-purple-100 text-purple-800 border-purple-300">
                <User className="h-2.5 w-2.5 mr-1" />
                Delegada
              </Badge>
            )}

            {/* Reagendamentos - apenas mostrar se foi reagendada */}
            {wasRescheduled && task.forwardCount > 0 && (
              <Badge variant="outline" className="text-xs h-5 bg-yellow-100 text-yellow-800 border-yellow-300">
                <ArrowRight className="h-2.5 w-2.5 mr-1" />
                {task.forwardCount}x
              </Badge>
            )}

            {/* Tempo */}
            {task.timeInvestment !== 'low' && (
              <Badge variant="outline" className="text-xs h-5 bg-indigo-100 text-indigo-800 border-indigo-300">
                <Clock className="h-2.5 w-2.5 mr-1" />
                {task.timeInvestment === 'medium' ? 'Médio' : 'Alto'}
              </Badge>
            )}
          </div>

          {/* Layout inferior: Botões de ação à esquerda, Checklist à direita */}
          <div className="flex justify-between items-end gap-4">
            {/* Botões de ação no rodapé esquerdo */}
            <div className="flex gap-1 flex-shrink-0">
              {!task.isConcluded && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusClick('completed');
                    }}
                    className={`h-7 px-2 text-xs min-w-[50px] ${
                      lastCompletion?.status === 'completed' 
                        ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
                        : 'text-green-600 border-green-600 hover:bg-green-50'
                    }`}
                  >
                    {lastCompletion?.status === 'completed' ? '✓ Feito' : 'Feito'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusClick('not-done');
                    }}
                    className={`h-7 px-2 text-xs min-w-[80px] ${
                      lastCompletion?.status === 'not-done' 
                        ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                        : 'text-red-600 border-red-600 hover:bg-red-50'
                    }`}
                  >
                    {lastCompletion?.status === 'not-done' ? '✓ Não feito' : 'Não feito'}
                  </Button>
                  
                  {canReschedule && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onForward();
                      }}
                      className={`h-7 px-2 text-xs min-w-[80px] ${
                        wasRescheduledToday
                          ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600'
                          : 'text-orange-600 border-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      {wasRescheduledToday ? '✓ Reagendar' : 'Reagendar'}
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onConclude();
                    }}
                    className="h-7 px-2 text-xs min-w-[60px] text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    Concluir
                  </Button>
                </>
              )}

              {task.isConcluded && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnconclude();
                  }}
                  className="h-7 px-2 text-xs text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  <Undo className="h-3 w-3 mr-1" />
                  Desfazer
                </Button>
              )}
            </div>

            {/* Checklist compacto no lado direito */}
            {totalSubItems > 0 && (
              <div className="flex-shrink-0 min-w-[120px] max-w-[200px]">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Checklist</span>
                  <span>{completedSubItems}/{totalSubItems}</span>
                </div>
                <Progress value={checklistProgress} className="h-1.5" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
