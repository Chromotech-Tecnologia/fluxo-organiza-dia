import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useModalStore } from "@/stores/useModalStore";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { calendarDateToString, getCurrentDateInSaoPaulo } from "@/lib/utils";

interface RescheduleModalProps {
  onRescheduleComplete?: () => void;
}

export function RescheduleModal({ onRescheduleComplete }: RescheduleModalProps) {
  const { isForwardTaskModalOpen, taskToForward, closeForwardTaskModal } = useModalStore();
  const { updateTask, addTask } = useSupabaseTasks();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [keepOrder, setKeepOrder] = useState(true);
  const [keepChecklistStatus, setKeepChecklistStatus] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const getNextBusinessDay = () => {
    if (!taskToForward) return undefined;
    
    const taskDate = new Date(taskToForward.scheduledDate + 'T00:00:00');
    let nextDay = addDays(taskDate, 1);
    
    // Se cair no fim de semana, mover para segunda
    while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
      nextDay = addDays(nextDay, 1);
    }
    
    return nextDay;
  };

  React.useEffect(() => {
    if (isForwardTaskModalOpen && !selectedDate) {
      setSelectedDate(getNextBusinessDay());
    }
  }, [isForwardTaskModalOpen, taskToForward]);

  const handleReschedule = async () => {
    if (!taskToForward || !selectedDate || isProcessing) return;

    setIsProcessing(true);

    try {
      console.log('Reagendando tarefa...', taskToForward.title);
      
      const forwardRecord = {
        forwardedAt: new Date().toISOString(),
        forwardedTo: null,
        newDate: calendarDateToString(selectedDate),
        originalDate: taskToForward.scheduledDate,
        statusAtForward: taskToForward.status,
        reason: 'Reagendada pelo usuário'
      };

      // Atualizar a tarefa original com histórico de reagendamento e auto-conclusão
      await updateTask(taskToForward.id, {
        forwardHistory: [...(taskToForward.forwardHistory || []), forwardRecord],
        isConcluded: true,
        concludedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Criar nova tarefa duplicada para a nova data
      const newTask = {
        ...taskToForward,
        id: crypto.randomUUID(),
        status: 'pending' as const,
        scheduledDate: calendarDateToString(selectedDate),
        forwardCount: taskToForward.forwardCount + 1,
        order: keepOrder ? taskToForward.order : 0,
        subItems: keepChecklistStatus ? taskToForward.subItems : taskToForward.subItems.map(item => ({ ...item, completed: false })),
        forwardHistory: [
          {
            forwardedAt: new Date().toISOString(),
            forwardedTo: null,
            newDate: calendarDateToString(selectedDate),
            originalDate: taskToForward.scheduledDate,
            statusAtForward: 'pending' as const,
            reason: `Recebido reagendamento de ${format(new Date(taskToForward.scheduledDate), "dd/MM/yyyy", { locale: ptBR })}`
          }
        ],
        completionHistory: [],
        isConcluded: false,
        concludedAt: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addTask(newTask);

      toast({
        title: "Tarefa reagendada",
        description: `Nova tarefa criada para ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} e tarefa original concluída automaticamente.`,
      });

      console.log('Tarefa reagendada com sucesso');

      // Fechar modal e resetar estados
      closeForwardTaskModal();
      setSelectedDate(undefined);
      setKeepOrder(true);
      setKeepChecklistStatus(true);
      
      // Invalidar cache mais agressivamente
      console.log('Invalidando cache das tarefas após reagendamento...');
      await queryClient.invalidateQueries({ 
        queryKey: ['tasks'],
        refetchType: 'all'
      });
      
      // Aguardar um pouco e invalidar novamente para garantir
      setTimeout(async () => {
        await queryClient.invalidateQueries({ 
          queryKey: ['tasks'],
          refetchType: 'all'
        });
      }, 100);
      
      // Executar callback se fornecido
      if (onRescheduleComplete) {
        console.log('Executando callback de reagendamento...');
        await onRescheduleComplete();
      }

    } catch (error) {
      console.error('Erro ao reagendar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao reagendar tarefa",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isForwardTaskModalOpen} onOpenChange={(open) => !open && closeForwardTaskModal()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reagendar Tarefa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {taskToForward && (
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Tarefa atual:</Label>
              <p className="text-sm">{taskToForward.title}</p>
              <p className="text-xs text-muted-foreground">
                Data: {format(new Date(taskToForward.scheduledDate), "dd/MM/yyyy", { locale: ptBR })}
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

          <div className="space-y-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <Label htmlFor="keep-order" className="text-sm">Manter ordenação da tarefa?</Label>
              <Switch
                id="keep-order"
                checked={keepOrder}
                onCheckedChange={setKeepOrder}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="keep-checklist" className="text-sm">Manter status dos itens do checklist?</Label>
              <Switch
                id="keep-checklist"
                checked={keepChecklistStatus}
                onCheckedChange={setKeepChecklistStatus}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={closeForwardTaskModal}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleReschedule} 
              disabled={!selectedDate || isProcessing}
            >
              {isProcessing ? "Reagendando..." : "Reagendar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
