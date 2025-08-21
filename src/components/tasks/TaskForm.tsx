import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Task, TaskFormValues } from '@/types';
import { getCurrentDateInSaoPaulo } from '@/lib/utils';
import { Trash2, Plus, GripVertical, Info } from 'lucide-react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { useSupabaseTeamMembers } from '@/hooks/useSupabaseTeamMembers';
import { calculateInsertReordering, calculateMoveReordering, getNextAvailableOrder } from '@/lib/taskOrderUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';

const taskFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  type: z.enum(['own-task', 'meeting', 'delegated-task']),
  priority: z.enum(['none', 'priority', 'extreme']),
  timeInvestment: z.enum(['low', 'medium', 'high']),
  category: z.enum(['personal', 'business']),
  scheduledDate: z.string(),
  assignedPersonId: z.string().optional(),
  observations: z.string().optional(),
  order: z.number().min(1, 'Ordem deve ser maior que 0'),
  isRoutine: z.boolean().default(false),
  routineCycle: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual']).optional(),
  routineStartDate: z.string().optional(),
  routineEndDate: z.string().optional(),
  subItems: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, 'Item não pode estar vazio'),
    completed: z.boolean(),
    order: z.number()
  })),
});

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskFormValues) => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const { tasks } = useSupabaseTasks({
    dateRange: task ? {
      start: task.scheduledDate,
      end: task.scheduledDate
    } : {
      start: getCurrentDateInSaoPaulo(),
      end: getCurrentDateInSaoPaulo()
    }
  });

  const { teamMembers } = useSupabaseTeamMembers();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      type: task?.type || 'own-task',
      priority: task?.priority || 'none',
      timeInvestment: task?.timeInvestment || 'low',
      category: task?.category || 'personal',
      scheduledDate: task?.scheduledDate || getCurrentDateInSaoPaulo(),
      assignedPersonId: task?.assignedPersonId || '',
      observations: task?.observations || '',
      order: task?.order || getNextAvailableOrder(tasks, task?.scheduledDate || getCurrentDateInSaoPaulo()),
      isRoutine: task?.isRoutine || false,
      routineCycle: task?.routineCycle,
      routineStartDate: task?.routineStartDate,
      routineEndDate: task?.routineEndDate,
      subItems: task?.subItems || [],
    },
  });

  const watchedScheduledDate = useWatch({ control: form.control, name: 'scheduledDate' });
  const watchedOrder = useWatch({ control: form.control, name: 'order' });
  const watchedType = useWatch({ control: form.control, name: 'type' });

  // Calcular previsão de reordenamento
  const getReorderPreview = () => {
    if (!watchedOrder || !watchedScheduledDate) return null;

    const tasksForDate = tasks.filter(t => 
      t.scheduledDate === watchedScheduledDate && (!task || t.id !== task.id)
    );

    if (task && task.scheduledDate === watchedScheduledDate && task.order === watchedOrder) {
      return null; // Sem mudança
    }

    if (task) {
      // Editando tarefa existente
      const reorderResult = calculateMoveReordering(
        tasks,
        watchedScheduledDate,
        task.id,
        watchedOrder
      );
      return reorderResult.adjustments.length > 0 ? reorderResult.message : null;
    } else {
      // Nova tarefa
      const reorderResult = calculateInsertReordering(
        tasks,
        watchedScheduledDate,
        watchedOrder
      );
      return reorderResult.adjustments.length > 0 ? reorderResult.message : null;
    }
  };

  const reorderPreview = getReorderPreview();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subItems',
  });

  const addSubItem = () => {
    append({
      id: crypto.randomUUID(),
      text: '',
      completed: false,
      order: fields.length + 1,
    });
  };

  const handleSubmit = (data: TaskFormValues) => {
    onSubmit(data);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações da Tarefa</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="own-task">Tarefa Própria</SelectItem>
                        <SelectItem value="meeting">Reunião</SelectItem>
                        <SelectItem value="delegated-task">Tarefa Delegada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Normal</SelectItem>
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
                name="timeInvestment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixo (5min)</SelectItem>
                        <SelectItem value="medium">Médio (1h)</SelectItem>
                        <SelectItem value="high">Alto (2h)</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data *</FormLabel>
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
                      <FormLabel>Posição</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          placeholder="Ex: 3"
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {watchedType === 'delegated-task' && (
                <FormField
                  control={form.control}
                  name="assignedPersonId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipe Delegada</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === 'no-team' ? '' : value)} 
                        defaultValue={field.value || 'no-team'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar equipe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no-team">Nenhuma equipe</SelectItem>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Preview de reordenamento */}
            {reorderPreview && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Reordenamento automático:</strong> {reorderPreview}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Checklist */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Checklist</h3>
              <Button type="button" onClick={addSubItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Item
              </Button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <FormField
                    control={form.control}
                    name={`subItems.${index}.completed`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`subItems.${index}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...field} placeholder="Item do checklist" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {task ? 'Atualizar' : 'Criar'} Tarefa
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
