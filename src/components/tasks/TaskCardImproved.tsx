
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, User, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Task, Person } from "@/types"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/stores/useModalStore";

interface TaskCardProps {
  task: Task;
  people: Person[];
  taskIndex?: number;
  maxOrder?: number;
  onStatusChange?: (status: Task['status']) => void;
  onConclude?: () => void;
  onUnconclude?: () => void;
  onForward?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onHistory?: () => void;
  currentViewDate?: string;
}

export function TaskCardImproved({ 
  task, 
  people, 
  taskIndex,
  maxOrder,
  onStatusChange,
  onConclude,
  onUnconclude,
  onForward,
  onEdit,
  onDelete,
  onHistory,
  currentViewDate
}: TaskCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { openTaskModal, openForwardTaskModal, openDeleteModal } = useModalStore();
  const [isTaskDone, setIsTaskDone] = useState(task.status === 'completed');

  const responsible = people.find(person => person.id === task.assignedPersonId);

  const { mutate: updateTask, isPending: isUpdating } = useMutation({
    mutationFn: async (status: Task['status']) => {
      if (onStatusChange) {
        onStatusChange(status);
      }
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Sucesso',
        description: 'Tarefa atualizada com sucesso!',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar a tarefa.',
        variant: 'destructive',
      });
      setIsTaskDone(task.status === 'completed');
    },
  });

  const handleTaskDone = (checked: boolean) => {
    setIsTaskDone(checked);
    updateTask(checked ? 'completed' : 'pending');
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'extreme': return 'bg-red-500 text-white';
      case 'priority': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'none': 
      case 'low':
        return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card className="bg-card text-card-foreground shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit ? onEdit() : openTaskModal(task)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onForward ? onForward() : openForwardTaskModal(task)}>
                Encaminhar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete ? onDelete() : openDeleteModal('task', task)}>
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>
          {task.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`task-${task.id}`}
            checked={isTaskDone}
            onCheckedChange={handleTaskDone}
            disabled={isUpdating}
          />
          <label
            htmlFor={`task-${task.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {isTaskDone ? 'Tarefa Concluída' : 'Marcar como Concluída'}
          </label>
        </div>
        <div className="flex items-center">
          <Badge className={getPriorityBadgeClass(task.priority)}>
            {task.priority}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <User className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {responsible ? responsible.name : 'Ninguém'}
            </span>
          </div>
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {task.category === 'business' ? 'Negócio' : 'Pessoal'}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarFallback>{responsible?.name ? responsible.name[0] : 'TF'}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            Criado em {format(new Date(task.createdAt), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
          </span>
        </div>
        {task.scheduledDate && (
          <span className="text-sm text-muted-foreground">
            Agendado: {format(new Date(task.scheduledDate), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
