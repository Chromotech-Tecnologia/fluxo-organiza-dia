import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useModalStore } from "@/stores/useModalStore";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useTasks } from "@/hooks/useTasks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { calendarDateToString, getCurrentDateInSaoPaulo } from "@/lib/utils";

export function ForwardTaskModal() {
  const { isForwardTaskModalOpen, taskToForward, closeForwardTaskModal } = useModalStore();
  const { teamMembers } = useTeamMembers();
  const { updateTask, addTask } = useTasks();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>("none");

  const handleForward = () => {
    if (!taskToForward || !selectedDate) return;

    try {
      const forwardRecord = {
        forwardedAt: new Date().toISOString(),
        forwardedTo: selectedTeamMember && selectedTeamMember !== "none" ? selectedTeamMember : null,
        newDate: calendarDateToString(selectedDate),
        originalDate: taskToForward.scheduledDate,
        statusAtForward: taskToForward.status,
        reason: selectedTeamMember && selectedTeamMember !== "none" ? 'Repassada para equipe' : 'Reagendada'
      };

      // Atualizar a tarefa original com histórico de repasse
      updateTask(taskToForward.id, {
        forwardHistory: [...(taskToForward.forwardHistory || []), forwardRecord],
        updatedAt: new Date().toISOString()
      });

      // Criar nova tarefa duplicada para a nova data
      const newTask = {
        ...taskToForward,
        id: crypto.randomUUID(),
        status: 'pending' as const,
        scheduledDate: calendarDateToString(selectedDate),
        assignedPersonId: selectedTeamMember && selectedTeamMember !== "none" ? selectedTeamMember : taskToForward.assignedPersonId,
        forwardCount: taskToForward.forwardCount + 1,
        forwardHistory: [
          {
            forwardedAt: new Date().toISOString(),
            forwardedTo: null,
            newDate: calendarDateToString(selectedDate),
            originalDate: taskToForward.scheduledDate,
            statusAtForward: 'pending' as const,
            reason: `Recebido repasse de ${format(new Date(taskToForward.scheduledDate), "dd/MM/yyyy", { locale: ptBR })}`
          }
        ],
        completionHistory: [], // Nova tarefa começa sem histórico de conclusão
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Adicionar a nova tarefa
      addTask(newTask);

      toast({
        title: "Tarefa repassada",
        description: `Nova tarefa criada para ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}`,
      });

      closeForwardTaskModal();
      setSelectedDate(undefined);
      setSelectedTeamMember("none");
    } catch (error) {
      console.error('Erro ao repassar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao repassar tarefa",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isForwardTaskModalOpen} onOpenChange={(open) => !open && closeForwardTaskModal()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Repassar Tarefa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mostrar status atual da tarefa */}
          {taskToForward && (
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Tarefa atual:</Label>
              <p className="text-sm">{taskToForward.title}</p>
              <p className="text-xs text-muted-foreground">
                Data: {format(new Date(taskToForward.scheduledDate), "dd/MM/yyyy", { locale: ptBR })} - 
                Status: <span className={
                  taskToForward.status === 'completed' ? 'text-green-600' : 
                  taskToForward.status === 'not-done' ? 'text-red-600' : 
                  'text-yellow-600'
                }>
                  {taskToForward.status === 'completed' ? 'Feito' : 
                   taskToForward.status === 'not-done' ? 'Não feito' : 
                   'Pendente'}
                </span>
              </p>
            </div>
          )}

          <div>
            <Label>Nova Data de Execução</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  console.log('Data selecionada para reagendamento:', date, 'String:', calendarDateToString(date));
                  setSelectedDate(date);
                }
              }}
              className="rounded-md border mt-2 pointer-events-auto"
              disabled={(date) => {
                const dateString = calendarDateToString(date);
                const today = getCurrentDateInSaoPaulo();
                return dateString < today;
              }}
            />
          </div>


          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={closeForwardTaskModal}>
              Cancelar
            </Button>
            <Button onClick={handleForward} disabled={!selectedDate}>
              Repassar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}