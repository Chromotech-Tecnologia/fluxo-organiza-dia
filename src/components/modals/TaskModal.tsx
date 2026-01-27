
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModalStore } from "@/stores/useModalStore";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { useTaskShares } from "@/hooks/useTaskShares";
import { SubItem, TaskFormValues, TaskAttachment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { generateRoutineTasks, validateRoutineConfig, RoutineTaskData } from "@/lib/routineUtils";

interface TaskModalProps {
  onTaskSaved?: () => void;
}

interface PendingShare {
  userId: string;
  userName: string;
}

export function TaskModal({ onTaskSaved }: TaskModalProps = {}) {
  const { isTaskModalOpen, taskToEdit, closeTaskModal } = useModalStore();
  const { addTask, updateTask } = useSupabaseTasks();
  const { shareTask } = useTaskShares();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: TaskFormValues & { subItems: SubItem[]; attachments?: TaskAttachment[]; pendingShares?: PendingShare[] }) => {
    try {
      console.log('Salvando tarefa...', taskToEdit ? 'Edição' : 'Nova', data);
      
      // Garantir que assignedPersonId seja tratado corretamente
      const cleanData: RoutineTaskData = {
        ...data,
        assignedPersonId: data.assignedPersonId && data.assignedPersonId !== '' ? data.assignedPersonId : undefined,
        description: data.description || '',
        observations: data.observations || '',
        routineEndDate: data.routineEndDate || undefined,
        routineStartDate: data.isRoutine ? data.routineStartDate : undefined,
        routineCycle: data.isRoutine ? data.routineCycle : undefined,
        meetingStartTime: data.meetingStartTime || undefined,
        meetingEndTime: data.meetingEndTime || undefined,
        attachments: data.attachments || [],
      };

      console.log('Dados limpos para salvar:', cleanData);

      // Validar configuração de rotina
      if (cleanData.isRoutine) {
        const validationError = validateRoutineConfig(cleanData);
        if (validationError) {
          toast({
            title: "Erro na configuração",
            description: validationError,
            variant: "destructive",
          });
          return;
        }
      }

      if (taskToEdit) {
        // Para tarefas editadas, manter comportamento original (não criar rotinas)
        await updateTask(taskToEdit.id, {
          ...cleanData,
          deliveryDates: [],
          isRecurrent: cleanData.isRoutine || false
        });
        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso.",
        });
        console.log('Tarefa atualizada com sucesso');
      } else {
        // Para novas tarefas, gerar rotinas se configurado
        const tasksToCreate = generateRoutineTasks(cleanData);
        
        console.log(`Criando ${tasksToCreate.length} tarefa(s) ${cleanData.isRoutine ? 'da rotina' : ''}...`);
        
        // Criar todas as tarefas da rotina
        const createdTaskIds: string[] = [];
        for (const taskData of tasksToCreate) {
          const createdTask = await addTask(taskData);
          if (createdTask?.id) {
            createdTaskIds.push(createdTask.id);
          }
        }

        // Se há compartilhamentos pendentes, aplicar às tarefas criadas
        if (data.pendingShares && data.pendingShares.length > 0 && createdTaskIds.length > 0) {
          console.log('Aplicando compartilhamentos pendentes...');
          for (const taskId of createdTaskIds) {
            for (const share of data.pendingShares) {
              try {
                await shareTask(taskId, share.userId);
              } catch (shareError) {
                console.error('Erro ao compartilhar tarefa:', shareError);
              }
            }
          }
        }
        
        const message = tasksToCreate.length > 1 
          ? `${tasksToCreate.length} tarefas da rotina foram criadas com sucesso.`
          : "A nova tarefa foi criada com sucesso.";
          
        toast({
          title: "Tarefa(s) criada(s)",
          description: message,
        });
        console.log('Tarefa(s) criada(s) com sucesso');
      }
      
      closeTaskModal();
      
      // Invalidar cache de forma mais robusta
      console.log('Invalidando cache das tarefas após salvar...');
      await queryClient.invalidateQueries({ 
        queryKey: ['tasks'],
        refetchType: 'all'
      });
      
      // Força um refetch imediato
      await queryClient.refetchQueries({ 
        queryKey: ['tasks'],
        type: 'active'
      });
      
      // Executar callback se fornecido
      if (onTaskSaved) {
        console.log('Executando callback após salvar tarefa...');
        await onTaskSaved();
      }
      
      // Aguardar um pouco e invalidar novamente
      setTimeout(async () => {
        await queryClient.invalidateQueries({ 
          queryKey: ['tasks'],
          refetchType: 'all'
        });
      }, 100);
      
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
