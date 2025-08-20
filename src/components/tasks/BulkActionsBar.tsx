
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, ArrowRight, Trash2, Users, Check } from "lucide-react";
import { Task } from "@/types";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { useModalStore } from "@/stores/useModalStore";
import { useToast } from "@/hooks/use-toast";

interface BulkActionsBarProps {
  selectedTasks: Task[];
  onClearSelection: () => void;
}

export function BulkActionsBar({ selectedTasks, onClearSelection }: BulkActionsBarProps) {
  const { updateTask, concludeTask, refetch } = useSupabaseTasks();
  const { openForwardTaskModal } = useModalStore();
  const { toast } = useToast();

  const handleBulkStatusChange = async (status: Task['status']) => {
    try {
      let updatedCount = 0;
      
      for (const task of selectedTasks) {
        // Verificar se já tem uma baixa
        const hasCompletion = task.completionHistory && task.completionHistory.length > 0;
        const lastCompletion = hasCompletion ? task.completionHistory[task.completionHistory.length - 1] : null;
        
        // Não permitir múltiplas baixas do mesmo tipo
        if (hasCompletion && lastCompletion?.status === status) {
          continue; // Pular esta tarefa
        }

        const completionRecord = {
          completedAt: new Date().toISOString(),
          status: status as 'completed' | 'not-done',
          date: task.scheduledDate,
          wasForwarded: false
        };

        const updatedCompletionHistory = [
          ...(task.completionHistory || []),
          completionRecord
        ];

        await updateTask(task.id, { 
          status,
          completionHistory: updatedCompletionHistory,
          updatedAt: new Date().toISOString()
        });
        
        updatedCount++;
      }
      
      if (updatedCount > 0) {
        toast({
          title: "Tarefas atualizadas",
          description: `${updatedCount} tarefa(s) marcada(s) como ${status === 'completed' ? 'feitas' : 'não feitas'}`,
        });
        refetch();
      } else {
        toast({
          title: "Nenhuma tarefa atualizada",
          description: "Todas as tarefas selecionadas já possuem essa baixa",
          variant: "default"
        });
      }
      
      onClearSelection();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefas",
        variant: "destructive"
      });
    }
  };

  const handleBulkConclude = async () => {
    try {
      let concludedCount = 0;
      
      for (const task of selectedTasks) {
        if (!task.isConcluded) {
          await concludeTask(task.id);
          concludedCount++;
        }
      }
      
      if (concludedCount > 0) {
        toast({
          title: "Tarefas concluídas",
          description: `${concludedCount} tarefa(s) concluída(s) com sucesso`,
        });
        refetch();
      } else {
        toast({
          title: "Nenhuma tarefa concluída",
          description: "Todas as tarefas selecionadas já estão concluídas",
        });
      }
      
      onClearSelection();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao concluir tarefas",
        variant: "destructive"
      });
    }
  };

  const handleBulkForward = () => {
    // Para ações em lote de reagendamento, abrir modal para cada tarefa
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Reagendamento em lote será implementado em breve",
    });
  };

  if (selectedTasks.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4 z-50">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {selectedTasks.length} selecionada{selectedTasks.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleBulkStatusChange('completed')}
          className="gap-1 border-green-500 text-green-700 hover:bg-green-50"
        >
          <CheckCircle className="h-4 w-4" />
          Feito
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleBulkStatusChange('not-done')}
          className="gap-1 border-red-500 text-red-700 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
          Não feito
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleBulkForward}
          className="gap-1 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
        >
          <ArrowRight className="h-4 w-4" />
          Reagendar
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleBulkConclude}
          className="gap-1 border-blue-500 text-blue-700 hover:bg-blue-50"
        >
          <Check className="h-4 w-4" />
          Concluir
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            toast({
              title: "Em desenvolvimento",
              description: "Funcionalidade de deletar em massa em desenvolvimento"
            });
          }}
          className="gap-1 border-red-500 text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Deletar
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            toast({
              title: "Em desenvolvimento",
              description: "Funcionalidade de delegar em massa em desenvolvimento"
            });
          }}
          className="gap-1 border-purple-500 text-purple-700 hover:bg-purple-50"
        >
          <Users className="h-4 w-4" />
          Delegar
        </Button>
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={onClearSelection}
      >
        Cancelar
      </Button>
    </div>
  );
}
