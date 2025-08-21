
// src/components/tasks/TaskCardImproved.tsx

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  AlertCircle,
  Circle,
  Clock,
  Building,
  User,
  Users,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Target,
  ListChecks,
  MoreVertical,
} from "lucide-react";
import { Task, TaskPriority, TaskTimeInvestment } from "@/types";

interface TaskCardImprovedProps {
  task: Task;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
}

export function TaskCardImproved({ task, onEdit, onDelete, onToggleComplete, onReorder }: TaskCardImprovedProps) {

  const getPriorityInfo = (priority: TaskPriority) => {
    switch (priority) {
      case 'extreme':
        return { 
          icon: AlertTriangle, 
          color: 'text-red-500 bg-red-50 border-red-200', 
          label: 'Extrema' 
        };
      case 'priority':
        return { 
          icon: AlertCircle, 
          color: 'text-orange-500 bg-orange-50 border-orange-200', 
          label: 'Alta' 
        };
      case 'none':
        return { 
          icon: Circle, 
          color: 'text-gray-400 bg-gray-50 border-gray-200', 
          label: 'Baixa' 
        };
      default:
        return { 
          icon: Circle, 
          color: 'text-gray-400 bg-gray-50 border-gray-200', 
          label: 'Baixa' 
        };
    }
  };

  const getTimeInvestmentInfo = (timeInvestment: TaskTimeInvestment) => {
    switch (timeInvestment) {
      case 'low':
        return { 
          icon: Clock, 
          color: 'text-green-600 bg-green-50 border-green-200', 
          label: '5min',
          time: '5 min'
        };
      case 'medium':
        return { 
          icon: Clock, 
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
          label: '1h',
          time: '1 hora'
        };
      case 'high':
        return { 
          icon: Clock, 
          color: 'text-red-600 bg-red-50 border-red-200', 
          label: '2h+',
          time: '2+ horas'
        };
      default:
        return { 
          icon: Clock, 
          color: 'text-gray-400 bg-gray-50 border-gray-200', 
          label: '?',
          time: 'Não definido'
        };
    }
  };

  const priorityInfo = getPriorityInfo(task.priority);
  const timeInfo = getTimeInvestmentInfo(task.timeInvestment);
  const PriorityIcon = priorityInfo.icon;
  const TimeIcon = timeInfo.icon;

  return (
    <Card className={cn(
      "group hover:shadow-md transition-all duration-200 border-l-4",
      task.status === 'completed' && "bg-green-50 border-l-green-500",
      task.status === 'not-done' && "bg-red-50 border-l-red-500",
      task.status === 'pending' && "border-l-blue-500",
      task.status === 'forwarded-date' && "bg-yellow-50 border-l-yellow-500",
      task.status === 'forwarded-person' && "bg-purple-50 border-l-purple-500"
    )}>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">{task.title}</CardTitle>
              {task.isRoutine && (
                <Badge variant="secondary" className="text-xs">
                  Rotina
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              {task.scheduledDate} • Ordem: {task.order}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(task.id)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)}>
                Excluir
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onReorder(task.id, 'up')}>
                Subir ordem
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onReorder(task.id, 'down')}>
                Descer ordem
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Tags principais */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* Prioridade */}
          <Badge variant="outline" className={cn("text-xs", priorityInfo.color)}>
            <PriorityIcon className="h-3 w-3 mr-1" />
            {priorityInfo.label}
          </Badge>

          {/* Tempo estimado */}
          <Badge variant="outline" className={cn("text-xs", timeInfo.color)}>
            <TimeIcon className="h-3 w-3 mr-1" />
            {timeInfo.label}
          </Badge>

          {/* Categoria */}
          <Badge variant="outline" className="text-xs">
            {task.category === 'business' ? (
              <>
                <Building className="h-3 w-3 mr-1" />
                Profissional
              </>
            ) : (
              <>
                <User className="h-3 w-3 mr-1" />
                Pessoal
              </>
            )}
          </Badge>

          {/* Tipo */}
          <Badge variant="outline" className="text-xs">
            {task.type === 'meeting' && (
              <>
                <Users className="h-3 w-3 mr-1" />
                Reunião
              </>
            )}
            {task.type === 'own-task' && (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Própria
              </>
            )}
            {task.type === 'delegated-task' && (
              <>
                <ArrowRight className="h-3 w-3 mr-1" />
                Delegada
              </>
            )}
          </Badge>

          {/* Tags especiais */}
          {task.isForwarded && (
            <Badge variant="secondary" className="text-xs">
              <RotateCcw className="h-3 w-3 mr-1" />
              Reagendada ({task.forwardCount}x)
            </Badge>
          )}

          {task.isProcessed && (
            <Badge variant="default" className="text-xs bg-green-600">
              <Target className="h-3 w-3 mr-1" />
              Definitivo
            </Badge>
          )}

          {task.subItems.length > 0 && (
            <Badge variant="outline" className="text-xs">
              <ListChecks className="h-3 w-3 mr-1" />
              Checklist ({task.subItems.filter(item => item.completed).length}/{task.subItems.length})
            </Badge>
          )}
        </div>

        {/* Descrição */}
        {task.description && (
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>
        )}

        {/* Subitems */}
        {task.subItems.length > 0 && (
          <div className="mb-3">
            <ul className="list-none pl-0 space-y-1">
              {task.subItems.map((subItem) => (
                <li key={subItem.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`subitem-${subItem.id}`}
                    checked={subItem.completed}
                    onCheckedChange={(checked) => onToggleComplete(task.id, checked as boolean)}
                  />
                  <label
                    htmlFor={`subitem-${subItem.id}`}
                    className="text-sm text-gray-700 line-clamp-1"
                  >
                    {subItem.text}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pessoa responsável */}
        {task.assignedPersonId && (
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">
              Responsável: {task.assignedPersonId}
            </p>
          </div>
        )}

        {/* Observações */}
        {task.observations && (
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">
              Observações: {task.observations}
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(task.id)}>
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(task.id)}>
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
