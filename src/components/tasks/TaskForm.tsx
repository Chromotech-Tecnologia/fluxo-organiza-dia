import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Task, TaskFormValues, SubItem, TaskType, TaskPriority, TaskTimeInvestment, TaskCategory } from "@/types";
import { taskFormSchema } from "@/lib/validations/task";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";
import { useSupabaseTeamMembers } from "@/hooks/useSupabaseTeamMembers";
import { InteractiveSubItemList } from "./InteractiveSubItemList";
import { PeopleSelectWithSearch } from "@/components/people/PeopleSelectWithSearch";

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskFormValues & { subItems: SubItem[] }) => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const { teamMembers } = useSupabaseTeamMembers();
  const [subItems, setSubItems] = useState<SubItem[]>(task?.subItems || []);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      type: task?.type || "own-task",
      priority: task?.priority || "priority",
      timeInvestment: task?.timeInvestment || "custom-5",
      customTimeMinutes: task?.customTimeMinutes || undefined,
      category: task?.category || "business",
      assignedPersonId: task?.assignedPersonId || undefined,
      scheduledDate: task?.scheduledDate || getCurrentDateInSaoPaulo(),
      order: task?.order || 1,
      observations: task?.observations || "",
      isRoutine: task?.isRoutine || false,
      routineCycle: task?.routineCycle || undefined,
      routineStartDate: task?.routineStartDate || undefined,
      routineEndDate: task?.routineEndDate || undefined,
      includeWeekends: task?.includeWeekends || true,
      subItems: task?.subItems || [],
      meetingStartTime: undefined,
      meetingEndTime: undefined,
    },
  });

  const handleSubmit = (data: TaskFormValues) => {
    onSubmit({
      ...data,
      subItems,
    });
  };

  const timeInvestment = form.watch("timeInvestment");
  const isRoutine = form.watch("isRoutine");
  const taskType = form.watch("type");
  const meetingStartTime = form.watch("meetingStartTime");
  const meetingEndTime = form.watch("meetingEndTime");

  // Reset assignedPersonId when type changes to non-delegated
  useEffect(() => {
    if (taskType !== 'delegated-task') {
      form.setValue('assignedPersonId', null);
    }
  }, [taskType, form]);

  // Calculate meeting duration automatically
  useEffect(() => {
    if (taskType === 'meeting' && meetingStartTime && meetingEndTime && 
        typeof meetingStartTime === 'string' && typeof meetingEndTime === 'string') {
      const [startHour, startMin] = meetingStartTime.split(':').map(Number);
      const [endHour, endMin] = meetingEndTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const duration = endMinutes - startMinutes;
      
      if (duration > 0) {
        form.setValue('timeInvestment', 'custom');
        form.setValue('customTimeMinutes', duration);
      }
    }
  }, [taskType, meetingStartTime, meetingEndTime, form]);

  useEffect(() => {
    if (task) {
      setSubItems(task.subItems || []);
    }
  }, [task]);

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-1">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título da Tarefa</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Digite o título da tarefa" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Descrição opcional da tarefa" rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Agendada</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      min={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="meeting">Reunião</SelectItem>
                      <SelectItem value="own-task">Tarefa Própria</SelectItem>
                      <SelectItem value="delegated-task">Tarefa Delegada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedPersonId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pessoa Responsável</FormLabel>
                  <FormControl>
                    <PeopleSelectWithSearch
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecione uma pessoa"
                      disabled={taskType !== 'delegated-task'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="priority">Prioridade</SelectItem>
                      <SelectItem value="extreme">Extrema</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="personal">Pessoal</SelectItem>
                      <SelectItem value="business">Profissional</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {taskType === 'meeting' && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="meetingStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meetingEndTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Fim</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="timeInvestment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo de Investimento</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={taskType === 'meeting' && !!meetingStartTime && !!meetingEndTime}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tempo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="custom-5">5 minutos</SelectItem>
                      <SelectItem value="custom-30">30 minutos</SelectItem>
                      <SelectItem value="low">1 hora</SelectItem>
                      <SelectItem value="medium">2 horas</SelectItem>
                      <SelectItem value="high">4 horas</SelectItem>
                      <SelectItem value="custom-4h">4 horas</SelectItem>
                      <SelectItem value="custom-8h">8 horas</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {timeInvestment === "custom" && (
              <FormField
                control={form.control}
                name="customTimeMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo Personalizado (minutos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        placeholder="Ex: 90"
                        disabled={taskType === 'meeting' && !!meetingStartTime && !!meetingEndTime}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <InteractiveSubItemList 
            subItems={subItems}
            onSubItemsChange={setSubItems}
          />

          <FormField
            control={form.control}
            name="isRoutine"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">É uma rotina?</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Marque se esta tarefa se repete regularmente
                  </div>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {isRoutine && (
            <div className="space-y-4 border rounded-lg p-4">
              <h4 className="font-medium">Configurações de Rotina</h4>
              
              <FormField
                control={form.control}
                name="routineCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciclo da Rotina</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ciclo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="biannual">Semestral</SelectItem>
                        <SelectItem value="annual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="routineStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="routineEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Fim (opcional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="includeWeekends"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Incluir sábados e domingos?</FormLabel>
                      <div className="text-xs text-muted-foreground">
                        Marque para incluir finais de semana na rotina
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Observações adicionais" rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {task ? "Atualizar" : "Criar"} Tarefa
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
