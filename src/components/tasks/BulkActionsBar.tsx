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

  const handleBulkStatusChange = async (status: Task['status']) => {
    try {
      for (const task of selectedTasks) {
        await updateTask(task.id, { ...task, status });
      }
      
      toast({
        title: "Tarefas atualizadas",
        description: `${selectedTasks.length} tarefas marcadas como ${status === 'completed' ? 'feitas' : 'não feitas'}`,
      });
      
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
          className="gap-1"
        >
          <CheckCircle className="h-4 w-4" />
          Marcar como Feito
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleBulkStatusChange('not-done')}
          className="gap-1"
        >
          <X className="h-4 w-4" />
          Marcar como Não Feito
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleBulkForward}
          className="gap-1"
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