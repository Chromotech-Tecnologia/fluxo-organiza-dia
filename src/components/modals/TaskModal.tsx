
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModalStore } from "@/stores/useModalStore";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { SubItem, TaskFormValues } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface TaskModalProps {
  onTaskSaved?: () => void;
}

export function TaskModal({ onTaskSaved }: TaskModalProps = {}) {
  const { isTaskModalOpen, taskToEdit, closeTaskModal } = useModalStore();
  const { addTask, updateTask } = useSupabaseTasks();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: TaskFormValues & { subItems: SubItem[] }) => {
    try {
      console.log('Salvando tarefa...', taskToEdit ? 'Edição' : 'Nova');
      
      // Limpar campos vazios para evitar problemas com UUID
      const cleanData = {
        ...data,
        assignedPersonId: data.assignedPersonId || null,
        description: data.description || null,
        observations: data.observations || null,
        routineEndDate: data.routineEndDate || null,
        routineStartDate: data.isRoutine ? data.routineStartDate : null,
        routineCycle: data.isRoutine ? data.routineCycle : null,
      };

      if (taskToEdit) {
        await updateTask(taskToEdit.id, {
          ...cleanData,
          deliveryDates: [],
          isRecurrent: false
        });
        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso. Outras tarefas foram reordenadas automaticamente se necessário.",
        });
        console.log('Tarefa atualizada com sucesso');
      } else {
        await addTask({
          ...cleanData,
          status: 'pending',
          order: data.order || 0,
          forwardHistory: [],
          forwardCount: 0,
          deliveryDates: [],
          isRecurrent: false,
          completionHistory: [],
          isForwarded: false,
          isConcluded: false
        });
        toast({
          title: "Tarefa criada",
          description: "A nova tarefa foi criada com sucesso. Outras tarefas foram reordenadas automaticamente se necessário.",
        });
        console.log('Nova tarefa criada com sucesso');
      }
      
      closeTaskModal();
      
      // Invalidar todas as queries de tarefas para forçar atualização
      console.log('Invalidando cache das tarefas...');
      await queryClient.invalidateQueries({ 
        queryKey: ['tasks'],
        refetchType: 'active'
      });
      console.log('Cache das tarefas invalidado com sucesso');
      
      // Notificar componente pai se fornecido
      if (onTaskSaved) {
        console.log('Executando callback após salvar tarefa...');
        try {
          await onTaskSaved();
          console.log('Callback após salvar tarefa executado com sucesso');
        } catch (callbackError) {
          console.error('Erro no callback após salvar tarefa:', callbackError);
        }
      }
      
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isTaskModalOpen} onOpenChange={(open) => !open && closeTaskModal()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {taskToEdit ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
        </DialogHeader>
        <TaskForm
          task={taskToEdit}
          onSubmit={handleSubmit}
          onCancel={closeTaskModal}
        />
      </DialogContent>
    </Dialog>
  );
}
