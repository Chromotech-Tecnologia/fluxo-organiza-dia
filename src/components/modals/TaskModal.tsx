import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModalStore } from "@/stores/useModalStore";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useTasks } from "@/hooks/useTasks";
import { SubItem, TaskFormValues } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function TaskModal() {
  const { isTaskModalOpen, taskToEdit, closeTaskModal } = useModalStore();
  const { addTask, updateTask } = useTasks();
  const { toast } = useToast();

  const handleSubmit = async (data: TaskFormValues & { subItems: SubItem[] }) => {
    try {
      if (taskToEdit) {
        await updateTask(taskToEdit.id, {
          ...data,
          description: data.description || '',
          observations: data.observations || '',
          deliveryDates: [],
          isRecurrent: false
        });
        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso.",
        });
      } else {
        await addTask({
          ...data,
          description: data.description || '',
          observations: data.observations || '',
          status: 'pending',
          order: 0,
          forwardHistory: [],
          forwardCount: 0,
          deliveryDates: [],
          isRecurrent: false
        });
        toast({
          title: "Tarefa criada",
          description: "A nova tarefa foi criada com sucesso.",
        });
      }
      closeTaskModal();
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