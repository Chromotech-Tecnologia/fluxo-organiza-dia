import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, ArrowRight, Trash2, Users, Check, Clock } from "lucide-react";
import { Task } from "@/types";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { useModalStore } from "@/stores/useModalStore";
import { useToast } from "@/hooks/use-toast";
import { getTimeInMinutes, formatTime } from "@/lib/taskUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { calendarDateToString, getCurrentDateInSaoPaulo } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PeopleSelectWithSearch } from "@/components/people/PeopleSelectWithSearch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface BulkActionsBarProps {
  selectedTasks: Task[];
  onClearSelection: () => void;
}

export function BulkActionsBar({ selectedTasks, onClearSelection }: BulkActionsBarProps) {
  const { updateTask, concludeTask, deleteTask, addTask, refetch } = useSupabaseTasks();
  const { openRescheduleModal } = useModalStore();
  const { toast } = useToast();
  
  // Estados para modais em lote
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  
  // Estados para reagendamento em lote
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [keepOrder, setKeepOrder] = useState(true);
  const [keepChecklistStatus, setKeepChecklistStatus] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para delegação em lote
  const [selectedPersonId, setSelectedPersonId] = useState<string>("");
  
  // Calcular tempo total estimado
  const totalEstimatedTime = selectedTasks.reduce((total, task) => {
    return total + getTimeInMinutes(task.timeInvestment, task.customTimeMinutes);
  }, 0);

  const handleBulkStatusChange = async (status: Task['status']) => {
    try {
      let updatedCount = 0;
      
      for (const task of selectedTasks) {
        // Verificar se já tem uma baixa
        const hasCompletion = task.completionHistory && task.completionHistory.length > 0;
        const lastCompletion = hasCompletion ? task.completionHistory[task.completionHistory.length - 1] : null;
        
        // Não permitir múltiplas baixas do mesmo tipo
        if (hasCompletion && lastCompletion?.status === status) {
          continue; // Pular esta tarefa
        }

        const completionRecord = {
          completedAt: new Date().toISOString(),
          status: status as 'completed' | 'not-done',
          date: task.scheduledDate,
          wasForwarded: false
        };

        const updatedCompletionHistory = [
          ...(task.completionHistory || []),
          completionRecord
        ];

        await updateTask(task.id, { 
          status,
          completionHistory: updatedCompletionHistory,
          updatedAt: new Date().toISOString()
        });
        
        updatedCount++;
      }
      
      if (updatedCount > 0) {
        toast({
          title: "Tarefas atualizadas",
          description: `${updatedCount} tarefa(s) marcada(s) como ${status === 'completed' ? 'feitas' : 'não feitas'}`,
        });
        refetch();
      } else {
        toast({
          title: "Nenhuma tarefa atualizada",
          description: "Todas as tarefas selecionadas já possuem essa baixa",
          variant: "default"
        });
      }
      
      onClearSelection();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefas",
        variant: "destructive"
      });
    }
  };

  const handleBulkConclude = async () => {
    try {
      let concludedCount = 0;
      
      for (const task of selectedTasks) {
        if (!task.isConcluded) {
          await concludeTask(task.id);
          concludedCount++;
        }
      }
      
      if (concludedCount > 0) {
        toast({
          title: "Tarefas concluídas",
          description: `${concludedCount} tarefa(s) concluída(s) com sucesso`,
        });
        refetch();
      } else {
        toast({
          title: "Nenhuma tarefa concluída",
          description: "Todas as tarefas selecionadas já estão concluídas",
        });
      }
      
      onClearSelection();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao concluir tarefas",
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsProcessing(true);
      
      for (const task of selectedTasks) {
        await deleteTask(task.id);
      }
      
      toast({
        title: "Tarefas deletadas",
        description: `${selectedTasks.length} tarefa(s) deletada(s) com sucesso`,
      });
      
      refetch();
      onClearSelection();
      setShowDeleteConfirm(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar tarefas",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getNextBusinessDay = () => {
    let nextDay = addDays(new Date(), 1);
    
    while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
      nextDay = addDays(nextDay, 1);
    }
    
    return nextDay;
  };

  const handleBulkReschedule = async () => {
    if (!selectedDate || isProcessing) return;
    
    try {
      setIsProcessing(true);

      const selectedDateStr = calendarDateToString(selectedDate);
      let successCount = 0;
      const failed: { id: string; title: string; reason?: string }[] = [];
      
      for (const task of selectedTasks) {
        try {
          const forwardRecord = {
            forwardedAt: new Date().toISOString(),
            forwardedTo: null,
            newDate: selectedDateStr,
            originalDate: task.scheduledDate,
            statusAtForward: task.status,
            reason: 'Reagendamento em lote'
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
        } catch (e: any) {
          console.error('Falha ao reagendar tarefa em lote:', task.id, e);
          failed.push({ id: task.id, title: task.title, reason: e?.message });
          // continua para as próximas tarefas
        }
      }

      if (successCount > 0) {
        toast({
          title: 'Tarefas reagendadas',
          description: `${successCount} de ${selectedTasks.length} tarefa(s) reagendada(s) para ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}`,
        });
      }

      if (failed.length > 0) {
        toast({
          title: 'Algumas tarefas falharam',
          description: `Falharam ${failed.length}. Ex.: ${failed.slice(0,3).map(f=>f.title).join(', ')}${failed.length>3?'...':''}`,
          variant: 'destructive'
        });
      }

      await refetch();
      onClearSelection();
      setShowRescheduleModal(false);
      setSelectedDate(undefined);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao reagendar tarefas',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelegate = async () => {
    if (!selectedPersonId || isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      for (const task of selectedTasks) {
        await updateTask(task.id, {
          assignedPersonId: selectedPersonId,
          updatedAt: new Date().toISOString()
        });
      }

      toast({
        title: "Tarefas delegadas",
        description: `${selectedTasks.length} tarefa(s) delegada(s) com sucesso`,
      });

      refetch();
      onClearSelection();
      setShowDelegateModal(false);
      setSelectedPersonId("");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao delegar tarefas",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedTasks.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4 z-50">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {selectedTasks.length} selecionada{selectedTasks.length > 1 ? 's' : ''}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(totalEstimatedTime)}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkStatusChange('completed')}
            className="gap-1 bg-green-500 text-white border-green-500 hover:bg-green-600"
          >
            <CheckCircle className="h-4 w-4" />
            Feito
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkStatusChange('not-done')}
            className="gap-1 bg-red-500 text-white border-red-500 hover:bg-red-600"
          >
            <X className="h-4 w-4" />
            Não feito
          </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                openRescheduleModal(selectedTasks);
              }}
              className="gap-1 text-orange-600 border-orange-600 hover:bg-orange-50"
            >
            <ArrowRight className="h-4 w-4" />
            Reagendar
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleBulkConclude}
            className="gap-1 text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <Check className="h-4 w-4" />
            Concluir
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="gap-1 text-red-600 border-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Deletar
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDelegateModal(true)}
            className="gap-1 text-purple-600 border-purple-600 hover:bg-purple-50"
          >
            <Users className="h-4 w-4" />
            Delegar
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

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar {selectedTasks.length} tarefa{selectedTasks.length > 1 ? 's' : ''}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      </>
    );
  }