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
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";

interface TaskCardProps {
  task: Task;
  people: Person[];
}

export function TaskCardImproved({ task, people }: TaskCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { onOpen } = useModal();
  const [isTaskDone, setIsTaskDone] = useState(task.done);

  const responsible = people.find(person => person.id === task.person_id);

  const { mutate: updateTask, isLoading: isUpdating } = useMutation({
    mutationFn: async (done: boolean) => {
      return api.put(`/tasks/${task.id}`, { done });
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
      setIsTaskDone(task.done);
    },
  });

  const handleTaskDone = (checked: boolean) => {
    setIsTaskDone(checked);
    updateTask(checked);
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'extreme': return 'bg-red-500 text-white';
      case 'priority': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'no-priority':
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
              <DropdownMenuItem onClick={() => onOpen('editTask', { taskId: task.id })}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpen('forwardTask', { taskId: task.id })}>
                Encaminhar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onOpen('deleteTask', { taskId: task.id })}>
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
              {task.team ? task.team : 'Nenhum Time'}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar>
            {responsible?.image ? (
              <AvatarImage src={responsible.image} alt={responsible.name} />
            ) : (
              <AvatarFallback>{responsible?.name ? responsible.name[0] : 'TF'}</AvatarFallback>
            )}
          </Avatar>
          <span className="text-sm text-muted-foreground">
            Criado em {format(new Date(task.created_at), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
          </span>
        </div>
        {task.deadline && (
          <span className="text-sm text-muted-foreground">
            Deadline: {format(new Date(task.deadline), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
