import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useModalStore } from "@/stores/useModalStore";
import { useTasks } from "@/hooks/useTasks";
import { Task, TaskStatus } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, X, RotateCcw, CalendarIcon, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { toSaoPauloDate } from "@/lib/utils";

export function DailyCloseModal() {
  const { isDailyCloseModalOpen, selectedCloseDate, closeDailyCloseModal } = useModalStore();
  const { tasks, updateTask } = useTasks();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [closeDate, setCloseDate] = useState<Date>(selectedCloseDate ? new Date(selectedCloseDate) : new Date());
  // Estado para rastrear quais tarefas já tiveram seu status inicial definido (feito/não feito)
  const [tasksWithInitialStatus, setTasksWithInitialStatus] = useState<Set<string>>(new Set());

  const closeDateString = format(closeDate, 'yyyy-MM-dd');
  const todayTasks = tasks.filter(task => 
    task.deliveryDates.some(date => format(new Date(date), 'yyyy-MM-dd') === closeDateString) ||
    format(toSaoPauloDate(task.scheduledDate), 'yyyy-MM-dd') === closeDateString
  );

  const completedTasks = todayTasks.filter(task => task.status === 'completed');
  const pendingTasks = todayTasks.filter(task => task.status === 'pending');
  const forwardedTasks = todayTasks.filter(task => 
    task.status === 'forwarded-date' || task.status === 'forwarded-person'
  );
  const notDoneTasks = todayTasks.filter(task => task.status === 'not-done');

  // Resetar estado quando a data muda
  useEffect(() => {
    setTasksWithInitialStatus(new Set());
  }, [closeDateString]);

  // Handler para definir o status inicial (feito/não feito)
  const handleInitialStatus = async (taskId: string, status: 'completed' | 'not-done') => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    await updateTask(taskId, { ...task, status });
    setTasksWithInitialStatus(prev => new Set(prev).add(taskId));
  };

  // Handler para ações secundárias (reagendar/concluir) - só disponível após status inicial
  const handleSecondaryAction = async (taskId: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    await updateTask(taskId, { ...task, status });
  };

  // Verifica se a tarefa pode ter ações secundárias
  const canHaveSecondaryActions = (taskId: string): boolean => {
    return tasksWithInitialStatus.has(taskId);
  };

  // Retorna o status atual da tarefa para exibição
  const getTaskDisplayStatus = (task: Task) => {
    if (task.status === 'completed') return 'completed';
    if (task.status === 'not-done') return 'not-done';
    if (task.status === 'forwarded-date' || task.status === 'forwarded-person') return 'forwarded';
    return 'pending';
  };

  const handleFinishDay = () => {
    toast({
      title: "Dia fechado com sucesso!",
      description: `${completedTasks.length} tarefas concluídas de ${todayTasks.length} total.`,
    });
    closeDailyCloseModal();
  };

  const stats = {
    total: todayTasks.length,
    completed: completedTasks.length,
    pending: pendingTasks.length,
    forwarded: forwardedTasks.length,
    notDone: notDoneTasks.length,
    completionRate: todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0
  };

  return (
    <Dialog open={isDailyCloseModalOpen} onOpenChange={(open) => !open && closeDailyCloseModal()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Fechamento do Dia - {format(closeDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>

        {/* Seletor de Data */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Data do Fechamento:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !closeDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {closeDate ? format(closeDate, "PPP", { locale: ptBR }) : "Selecionar data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={closeDate}
                onSelect={(date) => date && setCloseDate(date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-sm text-muted-foreground">Concluídas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.forwarded}</div>
                  <div className="text-sm text-muted-foreground">Repassadas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.notDone}</div>
                  <div className="text-sm text-muted-foreground">Não Feitas</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Conclusão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.completionRate}%</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.completionRate}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeDailyCloseModal}>
                Cancelar
              </Button>
              <Button onClick={() => setStep(2)}>
                Revisar Tarefas
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Revisar Status das Tarefas</h3>
                <p className="text-sm text-muted-foreground">
                  Primeiro defina se a tarefa foi feita ou não, depois escolha reagendar ou concluir
                </p>
              </div>
              
              {todayTasks.map((task) => {
                const displayStatus = getTaskDisplayStatus(task);
                const hasInitialStatus = canHaveSecondaryActions(task.id);
                
                return (
                  <Card key={task.id} className={cn(
                    "transition-all",
                    hasInitialStatus && "border-primary/50"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{task.title}</h4>
                            {hasInitialStatus && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant={task.type === 'meeting' ? 'default' : task.type === 'own-task' ? 'secondary' : 'outline'}>
                              {task.type === 'meeting' ? 'Reunião' : task.type === 'own-task' ? 'Própria' : 'Repassada'}
                            </Badge>
                            <Badge variant={task.priority === 'extreme' ? 'destructive' : task.priority === 'priority' ? 'default' : 'secondary'}>
                              {task.priority === 'extreme' ? 'Extrema' : task.priority === 'priority' ? 'Prioridade' : 'Sem Prioridade'}
                            </Badge>
                            {displayStatus !== 'pending' && (
                              <Badge variant={
                                displayStatus === 'completed' ? 'default' : 
                                displayStatus === 'not-done' ? 'destructive' : 
                                'outline'
                              } className={displayStatus === 'completed' ? 'bg-green-600' : ''}>
                                {displayStatus === 'completed' ? 'Feito' : 
                                 displayStatus === 'not-done' ? 'Não Feito' : 
                                 'Reagendado'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {/* Primeira linha: Feito / Não Feito - sempre visíveis */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={task.status === 'completed' ? 'default' : 'outline'}
                              onClick={() => handleInitialStatus(task.id, 'completed')}
                              className={cn(
                                "gap-1",
                                task.status === 'completed' && "bg-green-600 hover:bg-green-700"
                              )}
                            >
                              <Check className="h-4 w-4" />
                              Feito
                            </Button>
                            <Button
                              size="sm"
                              variant={task.status === 'not-done' ? 'destructive' : 'outline'}
                              onClick={() => handleInitialStatus(task.id, 'not-done')}
                              className="gap-1"
                            >
                              <X className="h-4 w-4" />
                              Não feito
                            </Button>
                          </div>
                          
                          {/* Segunda linha: Reagendar / Concluir - só aparecem após status inicial */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={task.status === 'forwarded-date' || task.status === 'forwarded-person' ? 'default' : 'outline'}
                              onClick={() => handleSecondaryAction(task.id, 'forwarded-date')}
                              disabled={!hasInitialStatus}
                              className={cn(
                                "gap-1",
                                !hasInitialStatus && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <RotateCcw className="h-4 w-4" />
                              Reagendar
                            </Button>
                            <Button
                              size="sm"
                              variant={task.isConcluded ? 'default' : 'outline'}
                              onClick={() => {
                                const taskToUpdate = tasks.find(t => t.id === task.id);
                                if (taskToUpdate) {
                                  updateTask(task.id, { ...taskToUpdate, isConcluded: true, concludedAt: new Date().toISOString() });
                                }
                              }}
                              disabled={!hasInitialStatus}
                              className={cn(
                                "gap-1",
                                !hasInitialStatus && "opacity-50 cursor-not-allowed",
                                task.isConcluded && "bg-green-600 hover:bg-green-700"
                              )}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Concluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button onClick={handleFinishDay}>
                Finalizar Dia
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
