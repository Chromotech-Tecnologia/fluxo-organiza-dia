
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModalStore } from "@/stores/useModalStore";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { SubItem, TaskFormValues } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function TaskModal() {
  const { isTaskModalOpen, taskToEdit, closeTaskModal } = useModalStore();
  const { addTask, updateTask, refetch } = useSupabaseTasks();
  const { toast } = useToast();

  const handleSubmit = async (data: TaskFormValues & { subItems: SubItem[] }) => {
    try {
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
          description: "A tarefa foi atualizada com sucesso.",
        });
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
          description: "A nova tarefa foi criada com sucesso.",
        });
      }
      closeTaskModal();
      // Forçar atualização da lista
      setTimeout(() => refetch(), 200);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a tarefa.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isTaskModalOpen} onOpenChange={(open) => !open && closeTaskModal()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
