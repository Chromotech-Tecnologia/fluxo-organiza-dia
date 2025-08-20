
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Calendar, User, GripVertical, Forward } from "lucide-react";
import { Task } from "@/types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  onStatusChange: (status: Task['status']) => void;
  onConclude: () => void;
  onForward: () => void;
  currentViewDate?: string;
}

export function TaskCard({ task, onStatusChange, onConclude, onForward, currentViewDate }: TaskCardProps) {
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

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`${
        task.isConcluded ? 'border-green-500 bg-green-50' : 
        isTaskForwarded ? 'border-yellow-500 bg-yellow-50' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab hover:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-lg font-semibold">{task.title}</div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {task.description}
          </div>

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
                  onClick={() => onStatusChange('completed')}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  Feito
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange('not-done')}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Não Feito
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onForward}
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  <Forward className="h-3 w-3 mr-1" />
                  Repassar
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onConclude}
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
