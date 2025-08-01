import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, ArrowRight, Trash2 } from "lucide-react";
import { Task } from "@/types";
import { useTasks } from "@/hooks/useTasks";
import { useModalStore } from "@/stores/useModalStore";
import { useToast } from "@/hooks/use-toast";

interface BulkActionsBarProps {
  selectedTasks: Task[];
  onClearSelection: () => void;
}

export function BulkActionsBar({ selectedTasks, onClearSelection }: BulkActionsBarProps) {
  const { updateTask } = useTasks();
  const { openForwardTaskModal } = useModalStore();
  const { toast } = useToast();

  const handleBulkStatusChange = (status: Task['status']) => {
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

        updateTask(task.id, { 
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

  const handleBulkForward = () => {
    // Para ações em lote de repasse, abrir modal para cada tarefa
    // ou criar um modal específico para ações em lote
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Repasse em lote será implementado em breve",
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
          Repassar
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