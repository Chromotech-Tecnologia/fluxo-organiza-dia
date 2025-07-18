import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModalStore } from "@/stores/useModalStore";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useTasks } from "@/hooks/useTasks";
import { TaskFormValues } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function TaskModal() {
  const { isTaskModalOpen, taskToEdit, closeTaskModal } = useModalStore();
  const { addTask, updateTask } = useTasks();
  const { toast } = useToast();

  const handleSubmit = async (data: TaskFormValues) => {
    try {
      if (taskToEdit) {
        await updateTask(taskToEdit.id, data);
        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso.",
        });
      } else {
        await addTask(data);
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