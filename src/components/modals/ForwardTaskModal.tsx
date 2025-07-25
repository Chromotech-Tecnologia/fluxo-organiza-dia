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

export function ForwardTaskModal() {
  const { isForwardTaskModalOpen, taskToForward, closeForwardTaskModal } = useModalStore();
  const { teamMembers } = useTeamMembers();
  const { updateTask } = useTasks();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>("");

  const handleForward = async () => {
    if (!taskToForward || !selectedDate) return;

    try {
      await updateTask(taskToForward.id, {
        ...taskToForward,
        status: selectedTeamMember ? 'forwarded-person' : 'forwarded-date',
        scheduledDate: selectedDate.toISOString().split('T')[0],
        assignedPersonId: selectedTeamMember || taskToForward.assignedPersonId,
        forwardCount: taskToForward.forwardCount + 1,
        forwardHistory: [
          ...taskToForward.forwardHistory,
          {
            forwardedAt: new Date().toISOString(),
            forwardedTo: selectedTeamMember || null,
            newDate: selectedDate.toISOString().split('T')[0],
            reason: selectedTeamMember ? 'Repassada para equipe' : 'Reagendada'
          }
        ]
      });

      toast({
        title: "Tarefa repassada",
        description: `Tarefa repassada para ${selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : 'nova data'}`,
      });

      closeForwardTaskModal();
    } catch (error) {
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
          <div>
            <Label>Nova Data de Execução</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border mt-2 pointer-events-auto"
              disabled={(date) => date < new Date()}
            />
          </div>

          <div>
            <Label>Repassar para Equipe (Opcional)</Label>
            <Select value={selectedTeamMember} onValueChange={setSelectedTeamMember}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecionar membro da equipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Apenas reagendar</SelectItem>
                {teamMembers.filter(member => member.status === 'ativo').map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} - {member.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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