
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Calendar, User, GripVertical, Forward, Edit2, Trash2, History, MoreVertical } from "lucide-react";
import { Task } from "@/types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onStatusChange: (status: Task['status']) => void;
  onConclude: () => void;
  onForward: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onHistory?: () => void;
  currentViewDate?: string;
  taskIndex?: number;
}

export function TaskCard({ 
  task, 
  onStatusChange, 
  onConclude, 
  onForward, 
  onEdit,
  onDelete,
  onHistory,
  currentViewDate,
  taskIndex 
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Determinar se a tarefa está repassada (cor amarelada)
  const isTaskForwarded = task.isForwarded || task.status === 'forwarded-date' || task.status === 'forwarded-person';

  // Corrigir a data para não mostrar um dia anterior
  const taskDate = new Date(task.scheduledDate + 'T00:00:00');

  // Calcular progresso do checklist
  const completedSubItems = task.subItems?.filter(item => item.completed).length || 0;
  const totalSubItems = task.subItems?.length || 0;
  const checklistProgress = totalSubItems > 0 ? (completedSubItems / totalSubItems) * 100 : 0;

  // Função para lidar com clique no card
  const handleCardClick = (e: React.MouseEvent) => {
    // Evitar trigger se clicar nos botões ou no drag handle
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

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        task.isConcluded ? 'border-green-500 bg-green-50' : 
        isTaskForwarded ? 'border-yellow-500 bg-yellow-50' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header com número da tarefa, título e ações */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab hover:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              
              {/* Número da tarefa */}
              {taskIndex !== undefined && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 min-w-[24px] text-center">
                  {taskIndex + 1}
                </Badge>
              )}
              
              <div className="text-lg font-semibold flex-1">{task.title}</div>
            </div>

            {/* Menu de ações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild data-dropdown-trigger>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onHistory && (
                  <DropdownMenuItem onClick={onHistory}>
                    <History className="h-4 w-4 mr-2" />
                    Histórico
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

          <div className="text-sm text-muted-foreground">
            {task.description}
          </div>

          {/* Barra de progresso do checklist */}
          {totalSubItems > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Checklist</span>
                <span>{completedSubItems}/{totalSubItems}</span>
              </div>
              <Progress value={checklistProgress} className="h-2" />
            </div>
          )}

          {/* Indicadores de Status */}
          <div className="flex gap-2 flex-wrap">
            {task.type === 'meeting' && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                <Calendar className="h-3 w-3 mr-1" />
                Reunião
              </Badge>
            )}
            
            {task.type === 'delegated-task' && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                <User className="h-3 w-3 mr-1" />
                Delegada
              </Badge>
            )}

            {task.type === 'own-task' && (
              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                Própria
              </Badge>
            )}

            {task.priority === 'priority' && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Prioridade
              </Badge>
            )}

            {task.priority === 'extreme' && (
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                Extrema
              </Badge>
            )}

            {task.timeInvestment && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                {task.timeInvestment === 'low' ? 'Baixo' : task.timeInvestment === 'medium' ? 'Médio' : 'Alto'}
              </Badge>
            )}

            {task.category && (
              <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">
                {task.category === 'personal' ? 'Pessoal' : 'Profissional'}
              </Badge>
            )}
            
            {task.forwardCount > 0 && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <ArrowRight className="h-3 w-3 mr-1" />
                {task.forwardCount} Repasses
              </Badge>
            )}
            
            <Badge variant="secondary">
              {format(taskDate, 'dd/MM/yyyy', { locale: ptBR })}
            </Badge>
            
            {task.isForwarded && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Repassada
              </Badge>
            )}
            
            {task.isConcluded && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                ✓ Concluída
              </Badge>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            {!task.isConcluded && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange('completed');
                  }}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  Feito
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange('not-done');
                  }}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Não Feito
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onForward();
                  }}
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  <Forward className="h-3 w-3 mr-1" />
                  Repassar
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConclude();
                  }}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  Concluir
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
