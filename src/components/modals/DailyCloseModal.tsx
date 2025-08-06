import { useState } from "react";
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
import { Check, X, RotateCcw, Users, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { toSaoPauloDate } from "@/lib/utils";
import { formatDateToYMDInSaoPaulo } from "@/lib/utils";


export function DailyCloseModal() {
  const { isDailyCloseModalOpen, selectedCloseDate, closeDailyCloseModal } = useModalStore();
  const { tasks, updateTask } = useTasks();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [closeDate, setCloseDate] = useState<Date>(selectedCloseDate ? new Date(selectedCloseDate) : new Date());

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

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    await updateTask(taskId, { ...task, status });
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
              <h3 className="text-lg font-semibold">Revisar Status das Tarefas</h3>
              
              {todayTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={task.type === 'meeting' ? 'default' : task.type === 'own-task' ? 'secondary' : 'outline'}>
                            {task.type === 'meeting' ? 'Reunião' : task.type === 'own-task' ? 'Própria' : 'Repassada'}
                          </Badge>
                          <Badge variant={task.priority === 'extreme' ? 'destructive' : task.priority === 'priority' ? 'default' : 'secondary'}>
                            {task.priority === 'extreme' ? 'Extrema' : task.priority === 'priority' ? 'Prioridade' : 'Sem Prioridade'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={task.status === 'completed' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(task.id, 'completed')}
                          className="gap-1"
                        >
                          <Check className="h-4 w-4" />
                          Feito
                        </Button>
                        <Button
                          size="sm"
                          variant={task.status === 'not-done' ? 'destructive' : 'outline'}
                          onClick={() => handleStatusChange(task.id, 'not-done')}
                          className="gap-1"
                        >
                          <X className="h-4 w-4" />
                          Não feito
                        </Button>
                        <Button
                          size="sm"
                          variant={task.status === 'forwarded-date' || task.status === 'forwarded-person' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(task.id, 'forwarded-date')}
                          className="gap-1"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Repassar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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