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
import { Task } from "@/types";

interface UnifiedRescheduleModalProps {
  onRescheduleComplete?: () => void;
}

export function UnifiedRescheduleModal({ onRescheduleComplete }: UnifiedRescheduleModalProps) {
  const { isRescheduleModalOpen, tasksToReschedule, closeRescheduleModal } = useModalStore();
  const { updateTask, addTask, refetch } = useSupabaseTasks();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [keepOrder, setKeepOrder] = useState(true);
  const [keepChecklistStatus, setKeepChecklistStatus] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const getNextBusinessDay = () => {
    if (!tasksToReschedule || tasksToReschedule.length === 0) return undefined;
    
    const taskDate = new Date(tasksToReschedule[0].scheduledDate + 'T00:00:00');
    let nextDay = addDays(taskDate, 1);
    
    while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
      nextDay = addDays(nextDay, 1);
    }
    
    return nextDay;
  };

  React.useEffect(() => {
    if (isRescheduleModalOpen && !selectedDate) {
      setSelectedDate(getNextBusinessDay());
    }
  }, [isRescheduleModalOpen, tasksToReschedule]);

  const formatTime = (minutes: number): string => {
    if (minutes === 0) return "0min";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) return `${remainingMinutes}min`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}min`;
  };

  const getTotalEstimatedTime = (): number => {
    if (!tasksToReschedule) return 0;
    return tasksToReschedule.reduce((total, task) => {
      // Calculate time based on timeInvestment and customTimeMinutes
      let timeInMinutes = 0;
      
      switch (task.timeInvestment) {
        case 'custom-5':
          timeInMinutes = 5;
          break;
        case 'custom-30':
          timeInMinutes = 30;
          break;
        case 'low':
          timeInMinutes = 15;
          break;
        case 'medium':
          timeInMinutes = 60;
          break;
        case 'high':
          timeInMinutes = 120;
          break;
        case 'custom-4h':
          timeInMinutes = 240;
          break;
        case 'custom-8h':
          timeInMinutes = 480;
          break;
        case 'custom':
          timeInMinutes = task.customTimeMinutes || 0;
          break;
        default:
          timeInMinutes = 0;
      }
      
      return total + timeInMinutes;
    }, 0);
  };

  const handleReschedule = async () => {
    if (!tasksToReschedule || tasksToReschedule.length === 0 || !selectedDate || isProcessing) return;

    setIsProcessing(true);

    try {
      const selectedDateStr = calendarDateToString(selectedDate);
      let successCount = 0;
      const failed: { id: string; title: string; reason?: string }[] = [];
      
      for (const task of tasksToReschedule) {
        try {
          const forwardRecord = {
            forwardedAt: new Date().toISOString(),
            forwardedTo: null,
            newDate: selectedDateStr,
            originalDate: task.scheduledDate,
            statusAtForward: task.status,
            reason: tasksToReschedule.length > 1 ? 'Reagendamento em lote' : 'Reagendada pelo usuário'
          };

          // Atualizar a tarefa original com histórico de reagendamento e auto-conclusão
          await updateTask(task.id, {
            forwardHistory: [...(task.forwardHistory || []), forwardRecord],
            isConcluded: true,
            concludedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          // Criar nova tarefa duplicada para a nova data
          const safeSubItems = Array.isArray(task.subItems) ? task.subItems : [];
          const newTask = {
            ...task,
            id: crypto.randomUUID(),
            status: 'pending' as const,
            scheduledDate: selectedDateStr,
            forwardCount: (task.forwardCount || 0) + 1,
            order: keepOrder ? (task.order || 0) : 0,
            subItems: keepChecklistStatus 
              ? safeSubItems 
              : safeSubItems.map(item => ({ ...item, completed: false })),
            forwardHistory: [
              {
                forwardedAt: new Date().toISOString(),
                forwardedTo: null,
                newDate: selectedDateStr,
                originalDate: task.scheduledDate,
                statusAtForward: 'pending' as const,
                reason: `Reagendamento recebido de ${format(new Date(task.scheduledDate), "dd/MM/yyyy", { locale: ptBR })}`
              }
            ],
            completionHistory: [],
            isConcluded: false,
            concludedAt: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await addTask(newTask);
          successCount++;
        } catch (taskError) {
          console.error(`Erro ao reagendar tarefa ${task.id}:`, taskError);
          failed.push({ 
            id: task.id, 
            title: task.title, 
            reason: taskError instanceof Error ? taskError.message : 'Erro desconhecido' 
          });
        }
      }

      if (successCount > 0) {
        const isPlural = tasksToReschedule.length > 1;
        toast({
          title: `Tarefa${isPlural ? 's' : ''} reagendada${isPlural ? 's' : ''}`,
          description: `${successCount} tarefa${successCount > 1 ? 's' : ''} reagendada${successCount > 1 ? 's' : ''} para ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} e tarefa${successCount > 1 ? 's' : ''} original${successCount > 1 ? 's' : ''} concluída${successCount > 1 ? 's' : ''} automaticamente.`,
        });
      }

      if (failed.length > 0) {
        toast({
          title: "Algumas tarefas falharam",
          description: `${failed.length} tarefa${failed.length > 1 ? 's' : ''} não puderam ser reagendadas.`,
          variant: "destructive"
        });
      }

      // Fechar modal e resetar estados
      closeRescheduleModal();
      setSelectedDate(undefined);
      setKeepOrder(true);
      setKeepChecklistStatus(true);
      
      // Invalidar queries para atualizar a UI
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      refetch();
      
      // Executar callback se fornecido
      if (onRescheduleComplete) {
        onRescheduleComplete();
      }

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao reagendar tarefas",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isPlural = tasksToReschedule && tasksToReschedule.length > 1;
  const totalEstimatedTime = getTotalEstimatedTime();

  return (
    <Dialog open={isRescheduleModalOpen} onOpenChange={(open) => !open && closeRescheduleModal()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isPlural ? "Reagendar Tarefas em Lote" : "Reagendar Tarefa"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {tasksToReschedule && tasksToReschedule.length > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">
                {isPlural 
                  ? `Reagendando ${tasksToReschedule.length} tarefas`
                  : `Tarefa atual: ${tasksToReschedule[0].title}`
                }
              </Label>
              <p className="text-xs text-muted-foreground">
                {isPlural 
                  ? `Tempo total estimado: ${formatTime(totalEstimatedTime)}`
                  : `Data: ${format(new Date(tasksToReschedule[0].scheduledDate), "dd/MM/yyyy", { locale: ptBR })}`
                }
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
              className="rounded-md border mt-2"
              disabled={(date) => {
                const dateString = calendarDateToString(date);
                const today = getCurrentDateInSaoPaulo();
                return dateString < today;
              }}
            />
          </div>

          <div className="space-y-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <Label htmlFor="keep-order" className="text-sm">
                {isPlural ? "Manter ordenação das tarefas?" : "Manter ordenação da tarefa?"}
              </Label>
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
              onClick={closeRescheduleModal}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleReschedule} 
              disabled={!selectedDate || isProcessing}
            >
              {isProcessing 
                ? "Reagendando..." 
                : isPlural ? "Reagendar Todas" : "Reagendar"
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}